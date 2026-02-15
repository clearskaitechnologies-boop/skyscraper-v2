/**
 * TASK 120: DEVELOPER DOCUMENTATION
 *
 * Auto-generated API documentation with interactive examples and code snippets.
 */

import { ApiVersion } from "../api/versioning";

export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  description?: string;
  version: ApiVersion;
  tags: string[];
  authentication: "required" | "optional" | "none";
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: Record<number, ApiResponse>;
  examples?: ApiExample[];
  deprecated?: boolean;
  rateLimit?: {
    requests: number;
    window: string;
  };
}

export interface ApiParameter {
  name: string;
  in: "path" | "query" | "header";
  required: boolean;
  type: string;
  description: string;
  default?: any;
  enum?: any[];
  example?: any;
}

export interface ApiRequestBody {
  required: boolean;
  contentType: string;
  schema: any;
  examples?: Record<string, any>;
}

export interface ApiResponse {
  description: string;
  contentType: string;
  schema: any;
  examples?: Record<string, any>;
}

export interface ApiExample {
  name: string;
  description?: string;
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    headers?: Record<string, string>;
    body: any;
  };
}

export interface CodeSnippet {
  language: "curl" | "javascript" | "typescript" | "python" | "php" | "ruby" | "go";
  code: string;
}

/**
 * Get all API endpoints
 */
export function getApiEndpoints(): ApiEndpoint[] {
  return [
    {
      id: "list-claims",
      method: "GET",
      path: "/api/v2/claims",
      summary: "List all claims",
      description: "Retrieve a paginated list of claims for your organization",
      version: "v2",
      tags: ["Claims"],
      authentication: "required",
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          type: "integer",
          description: "Page number",
          default: 1,
          example: 1,
        },
        {
          name: "limit",
          in: "query",
          required: false,
          type: "integer",
          description: "Items per page",
          default: 25,
          example: 25,
        },
        {
          name: "status",
          in: "query",
          required: false,
          type: "string",
          description: "Filter by status",
          enum: ["OPEN", "IN_PROGRESS", "CLOSED"],
          example: "OPEN",
        },
      ],
      responses: {
        200: {
          description: "Success",
          contentType: "application/json",
          schema: {
            type: "object",
            properties: {
              data: { type: "array" },
              meta: { type: "object" },
            },
          },
        },
      },
      rateLimit: {
        requests: 100,
        window: "1m",
      },
    },
    {
      id: "create-claim",
      method: "POST",
      path: "/api/v2/claims",
      summary: "Create a new claim",
      description: "Create a new insurance claim",
      version: "v2",
      tags: ["Claims"],
      authentication: "required",
      requestBody: {
        required: true,
        contentType: "application/json",
        schema: {
          type: "object",
          required: ["claimNumber", "homeowner", "address"],
          properties: {
            claimNumber: { type: "string" },
            homeowner: { type: "string" },
            address: { type: "string" },
            dateOfLoss: { type: "string", format: "date" },
          },
        },
      },
      responses: {
        201: {
          description: "Created",
          contentType: "application/json",
          schema: {
            type: "object",
            properties: {
              id: { type: "string" },
              claimNumber: { type: "string" },
            },
          },
        },
        400: {
          description: "Bad Request",
          contentType: "application/json",
          schema: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
      rateLimit: {
        requests: 50,
        window: "1m",
      },
    },
  ];
}

/**
 * Get endpoint by ID
 */
export function getEndpoint(id: string): ApiEndpoint | null {
  const endpoints = getApiEndpoints();
  return endpoints.find((e) => e.id === id) || null;
}

/**
 * Get endpoints by tag
 */
export function getEndpointsByTag(tag: string): ApiEndpoint[] {
  const endpoints = getApiEndpoints();
  return endpoints.filter((e) => e.tags.includes(tag));
}

/**
 * Generate code snippet for endpoint
 */
export function generateCodeSnippet(
  endpoint: ApiEndpoint,
  language: CodeSnippet["language"],
  example?: ApiExample
): string {
  const exampleData = example || endpoint.examples?.[0];

  switch (language) {
    case "curl":
      return generateCurlSnippet(endpoint, exampleData);
    case "javascript":
      return generateJavaScriptSnippet(endpoint, exampleData);
    case "typescript":
      return generateTypeScriptSnippet(endpoint, exampleData);
    case "python":
      return generatePythonSnippet(endpoint, exampleData);
    case "php":
      return generatePhpSnippet(endpoint, exampleData);
    case "ruby":
      return generateRubySnippet(endpoint, exampleData);
    case "go":
      return generateGoSnippet(endpoint, exampleData);
    default:
      return "";
  }
}

/**
 * Generate cURL snippet
 */
function generateCurlSnippet(endpoint: ApiEndpoint, example?: ApiExample): string {
  const url = `https://api.skaiscrape.com${endpoint.path}`;
  let snippet = `curl -X ${endpoint.method} "${url}"`;

  if (endpoint.authentication === "required") {
    snippet += ' \\\n  -H "Authorization: Bearer YOUR_API_KEY"';
  }

  if (endpoint.requestBody) {
    snippet += ' \\\n  -H "Content-Type: application/json"';
    if (example?.request.body) {
      snippet += ` \\\n  -d '${JSON.stringify(example.request.body, null, 2)}'`;
    }
  }

  return snippet;
}

/**
 * Generate JavaScript snippet
 */
function generateJavaScriptSnippet(endpoint: ApiEndpoint, example?: ApiExample): string {
  const url = `https://api.skaiscrape.com${endpoint.path}`;

  let snippet = `const response = await fetch('${url}', {\n`;
  snippet += `  method: '${endpoint.method}',\n`;
  snippet += `  headers: {\n`;

  if (endpoint.authentication === "required") {
    snippet += `    'Authorization': 'Bearer YOUR_API_KEY',\n`;
  }

  if (endpoint.requestBody) {
    snippet += `    'Content-Type': 'application/json',\n`;
  }

  snippet += `  },\n`;

  if (endpoint.requestBody && example?.request.body) {
    snippet += `  body: JSON.stringify(${JSON.stringify(example.request.body, null, 4)}),\n`;
  }

  snippet += `});\n\n`;
  snippet += `const data = await response.json();\n`;
  snippet += `console.log(data);`;

  return snippet;
}

/**
 * Generate TypeScript snippet
 */
function generateTypeScriptSnippet(endpoint: ApiEndpoint, example?: ApiExample): string {
  let snippet = generateJavaScriptSnippet(endpoint, example);

  // Add type annotations
  snippet = `interface Response {\n  // Add response type here\n}\n\n` + snippet;
  snippet = snippet.replace("const data =", "const data: Response =");

  return snippet;
}

/**
 * Generate Python snippet
 */
function generatePythonSnippet(endpoint: ApiEndpoint, example?: ApiExample): string {
  const url = `https://api.skaiscrape.com${endpoint.path}`;

  let snippet = `import requests\n\n`;
  snippet += `url = "${url}"\n`;
  snippet += `headers = {\n`;

  if (endpoint.authentication === "required") {
    snippet += `    "Authorization": "Bearer YOUR_API_KEY",\n`;
  }

  if (endpoint.requestBody) {
    snippet += `    "Content-Type": "application/json",\n`;
  }

  snippet += `}\n\n`;

  if (endpoint.requestBody && example?.request.body) {
    snippet += `data = ${JSON.stringify(example.request.body, null, 4)}\n\n`;
    snippet += `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=data)\n`;
  } else {
    snippet += `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)\n`;
  }

  snippet += `print(response.json())`;

  return snippet;
}

/**
 * Generate PHP snippet
 */
function generatePhpSnippet(endpoint: ApiEndpoint, example?: ApiExample): string {
  const url = `https://api.skaiscrape.com${endpoint.path}`;

  let snippet = `<?php\n\n`;
  snippet += `$ch = curl_init("${url}");\n\n`;
  snippet += `$headers = [\n`;

  if (endpoint.authentication === "required") {
    snippet += `    "Authorization: Bearer YOUR_API_KEY",\n`;
  }

  if (endpoint.requestBody) {
    snippet += `    "Content-Type: application/json",\n`;
  }

  snippet += `];\n\n`;
  snippet += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
  snippet += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;

  if (endpoint.method !== "GET") {
    snippet += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${endpoint.method}");\n`;
  }

  if (endpoint.requestBody && example?.request.body) {
    snippet += `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${JSON.stringify(example.request.body)}));\n`;
  }

  snippet += `\n$response = curl_exec($ch);\n`;
  snippet += `curl_close($ch);\n\n`;
  snippet += `print_r(json_decode($response));`;

  return snippet;
}

/**
 * Generate Ruby snippet
 */
function generateRubySnippet(endpoint: ApiEndpoint, example?: ApiExample): string {
  const url = `https://api.skaiscrape.com${endpoint.path}`;

  let snippet = `require 'net/http'\nrequire 'json'\n\n`;
  snippet += `uri = URI("${url}")\n`;
  snippet += `http = Net::HTTP.new(uri.host, uri.port)\n`;
  snippet += `http.use_ssl = true\n\n`;
  snippet += `request = Net::HTTP::${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}.new(uri)\n`;

  if (endpoint.authentication === "required") {
    snippet += `request["Authorization"] = "Bearer YOUR_API_KEY"\n`;
  }

  if (endpoint.requestBody) {
    snippet += `request["Content-Type"] = "application/json"\n`;
    if (example?.request.body) {
      snippet += `request.body = ${JSON.stringify(example.request.body)}.to_json\n`;
    }
  }

  snippet += `\nresponse = http.request(request)\n`;
  snippet += `puts JSON.parse(response.body)`;

  return snippet;
}

/**
 * Generate Go snippet
 */
function generateGoSnippet(endpoint: ApiEndpoint, example?: ApiExample): string {
  const url = `https://api.skaiscrape.com${endpoint.path}`;

  let snippet = `package main\n\nimport (\n    "fmt"\n    "net/http"\n    "io/ioutil"\n`;

  if (endpoint.requestBody) {
    snippet += `    "bytes"\n    "encoding/json"\n`;
  }

  snippet += `)\n\nfunc main() {\n`;
  snippet += `    url := "${url}"\n\n`;

  if (endpoint.requestBody && example?.request.body) {
    snippet += `    data := map[string]interface{}${JSON.stringify(example.request.body)}\n`;
    snippet += `    jsonData, _ := json.Marshal(data)\n\n`;
    snippet += `    req, _ := http.NewRequest("${endpoint.method}", url, bytes.NewBuffer(jsonData))\n`;
  } else {
    snippet += `    req, _ := http.NewRequest("${endpoint.method}", url, nil)\n`;
  }

  if (endpoint.authentication === "required") {
    snippet += `    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")\n`;
  }

  if (endpoint.requestBody) {
    snippet += `    req.Header.Set("Content-Type", "application/json")\n`;
  }

  snippet += `\n    client := &http.Client{}\n`;
  snippet += `    resp, _ := client.Do(req)\n`;
  snippet += `    defer resp.Body.Close()\n\n`;
  snippet += `    body, _ := ioutil.ReadAll(resp.Body)\n`;
  snippet += `    fmt.Println(string(body))\n`;
  snippet += `}`;

  return snippet;
}

/**
 * Get all API tags
 */
export function getApiTags(): string[] {
  const endpoints = getApiEndpoints();
  const tags = new Set<string>();

  endpoints.forEach((endpoint) => {
    endpoint.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Generate OpenAPI specification
 */
export function generateOpenApiSpec(): any {
  const endpoints = getApiEndpoints();

  const spec = {
    openapi: "3.0.0",
    info: {
      title: "SkaiScraper API",
      version: "2.0.0",
      description: "Restoration contractor platform API",
    },
    servers: [
      {
        url: "https://api.skaiscrape.com",
        description: "Production",
      },
    ],
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  };

  // Convert endpoints to OpenAPI paths
  endpoints.forEach((endpoint) => {
    if (!spec.paths[endpoint.path]) {
      spec.paths[endpoint.path] = {};
    }

    spec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses,
    };
  });

  return spec;
}
