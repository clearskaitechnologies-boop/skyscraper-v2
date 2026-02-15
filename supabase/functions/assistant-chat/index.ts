import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecurityContext, requireAuth } from "../_shared/auth.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { sanitizeError } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication and rate limiting
    const ctx = await createSecurityContext(req);
    const authError = requireAuth(ctx);
    if (authError) return authError;

    const rateLimitKey = `assistant:${ctx.user!.id}:${ctx.ip}`;
    const rateCheck = checkRateLimit(rateLimitKey, 60, 60000); // 60 req/min
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          resetAt: rateCheck.resetAt,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Define available tools
    const toolDefinitions = [
      {
        type: "function",
        function: {
          name: "getStorm",
          description: "Get nearest storm/hail/wind data for an address",
          parameters: {
            type: "object",
            properties: {
              address: { type: "string", description: "Property address" },
            },
            required: ["address"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getJEAsset",
          description: "Retrieve JE Shaw asset data for a property",
          parameters: {
            type: "object",
            properties: {
              propertyId: { type: "string", description: "Property ID" },
            },
            required: ["propertyId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getCodeClause",
          description: "Look up building code citation",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string" },
              state: { type: "string" },
              topic: {
                type: "string",
                description: 'Code topic (e.g., "wind nailing", "flashing")',
              },
            },
            required: ["city", "state", "topic"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "makePdf",
          description: "Generate and export a PDF report",
          parameters: {
            type: "object",
            properties: {
              mode: { type: "string", enum: ["inspection", "insurance", "retail"] },
            },
            required: ["mode"],
          },
        },
      },
    ];

    // Call Lovable AI with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are ClearSKai's intelligent assistant for roofing inspections and claims. You have access to tools for storm data, JE Shaw assets, building codes, and PDF generation. Use them when relevant to provide accurate, actionable information.",
          },
          ...messages,
        ],
        tools: toolDefinitions,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "AI rate limit exceeded. Try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add credits.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error("AI service error");
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || line.startsWith(":")) continue;
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta;

                // Stream text content
                if (delta?.content) {
                  send({ delta: delta.content });
                }

                // Handle tool calls
                const toolCall = delta?.tool_calls?.[0];
                if (toolCall?.function?.name) {
                  const name = toolCall.function.name;
                  const args = JSON.parse(toolCall.function.arguments || "{}");

                  // Execute tool and send result
                  try {
                    const result = await executeTool(name, args, ctx);
                    send({ tool: name, result });
                  } catch (e: any) {
                    send({ tool: name, error: e.message });
                  }
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: any) {
    console.error("assistant-chat error:", sanitizeError(e));
    return new Response(
      JSON.stringify({
        error: e.message || "Assistant error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Tool execution functions
async function executeTool(name: string, args: any, ctx: any): Promise<any> {
  switch (name) {
    case "getStorm":
      return await getStormData(args.address, ctx);
    case "getJEAsset":
      return await getJEAssetData(args.propertyId, ctx);
    case "getCodeClause":
      return await getCodeClauseData(args.city, args.state, args.topic, ctx);
    case "makePdf":
      return { pdfUrl: `/reports/download?mode=${args.mode}`, mode: args.mode };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function getStormData(address: string, ctx: any) {
  // TODO: Wire to actual weather API when available
  // For now, return mock data
  return {
    address,
    nearestHail: {
      distanceMiles: 2.3,
      sizeInches: 1.25,
      date: "2024-08-12",
      severity: "moderate",
    },
    wind: {
      mph: 57,
      date: "2024-08-12",
    },
    source: "Weather Provider (demo)",
    retrievedAt: new Date().toISOString(),
  };
}

async function getJEAssetData(propertyId: string, ctx: any) {
  // TODO: Call je-layers function when live
  // For now, return mock data
  return {
    propertyId,
    layers: ["hail", "wind", "property-outline"],
    snapshotId: "snap_demo_" + Date.now(),
    source: "JE Shaw",
    retrievedAt: new Date().toISOString(),
  };
}

async function getCodeClauseData(city: string, state: string, topic: string, ctx: any) {
  // TODO: Implement code library lookup
  // For now, return mock data based on topic
  const mockCodes: Record<string, any> = {
    wind: {
      clause: "IRC R905.2.1",
      title: "Wind Resistance",
      text: "Asphalt shingles shall meet ASTM D7158 Class H wind resistance requirements.",
      jurisdiction: "IRC 2021",
    },
    flashing: {
      clause: "IRC R903.2",
      title: "Flashing",
      text: "Flashing shall be installed at wall and roof intersections, valleys, and around roof penetrations.",
      jurisdiction: "IRC 2021",
    },
    nailing: {
      clause: "IRC R905.2.5",
      title: "Attachment",
      text: "Asphalt shingles shall have minimum four fasteners per strip shingle or six fasteners per metric shingle.",
      jurisdiction: "IRC 2021",
    },
  };

  const key = Object.keys(mockCodes).find((k) => topic.toLowerCase().includes(k)) || "wind";
  const code = mockCodes[key];

  return {
    ...code,
    city,
    state,
    topic,
    source: "IRC Code Library",
    url: "https://codes.iccsafe.org/",
    retrievedAt: new Date().toISOString(),
  };
}
