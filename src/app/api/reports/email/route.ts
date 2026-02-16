export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

// Lazy-load Resend to avoid build-time errors if API key not set
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

type EmailRequest = {
  reportId: string;
  recipientEmail: string;
  recipientName?: string;
  pdfBlob?: string; // base64 encoded PDF
  reportData?: {
    flow: "insurance" | "retail";
    lossType?: string;
    financingType?: string;
    propertyAddress?: string;
    organizationName?: string;
  };
};

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body: EmailRequest = await req.json();
    const { reportId, recipientEmail, recipientName, pdfBlob, reportData } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { ok: false, error: "Recipient email is required" },
        { status: 400 }
      );
    }

    // Email subject based on flow type
    const subject =
      reportData?.flow === "insurance"
        ? `Property Damage Report - ${reportData.lossType || "Insurance Claim"}`
        : `Project Estimate - ${reportData?.propertyAddress || "Your Property"}`;

    // Email body (HTML)
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .info-row {
              margin: 10px 0;
              padding: 10px;
              background: white;
              border-radius: 5px;
              display: flex;
              justify-content: space-between;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
            }
            .info-value {
              color: #111827;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📄 ${reportData?.flow === "insurance" ? "Property Damage Report" : "Project Estimate"}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Generated with AI-powered analysis</p>
          </div>
          
          <div class="content">
            <p>Hello ${recipientName || "there"},</p>
            
            <p>Your ${reportData?.flow === "insurance" ? "insurance claim" : "project estimate"} report has been generated and is ready to download.</p>
            
            ${
              reportData
                ? `
            <div class="info-row">
              <span class="info-label">Report Type:</span>
              <span class="info-value">${reportData.flow === "insurance" ? "Insurance Claim" : "Retail Estimate"}</span>
            </div>
            
            ${
              reportData.flow === "insurance" && reportData.lossType
                ? `
            <div class="info-row">
              <span class="info-label">Loss Type:</span>
              <span class="info-value">${reportData.lossType.charAt(0).toUpperCase() + reportData.lossType.slice(1)}</span>
            </div>
            `
                : ""
            }
            
            ${
              reportData.flow === "retail" && reportData.financingType
                ? `
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value">${reportData.financingType === "financing" ? "Financing" : "Out of Pocket"}</span>
            </div>
            `
                : ""
            }
            
            ${
              reportData.propertyAddress
                ? `
            <div class="info-row">
              <span class="info-label">Property:</span>
              <span class="info-value">${reportData.propertyAddress}</span>
            </div>
            `
                : ""
            }
            
            ${
              reportData.organizationName
                ? `
            <div class="info-row">
              <span class="info-label">Prepared by:</span>
              <span class="info-value">${reportData.organizationName}</span>
            </div>
            `
                : ""
            }
            `
                : ""
            }
            
            <div class="info-row">
              <span class="info-label">Report ID:</span>
              <span class="info-value">${reportId}</span>
            </div>
            
            <p style="margin-top: 20px;">
              The attached PDF contains a comprehensive analysis including:
            </p>
            
            <ul>
              <li>Executive Summary</li>
              <li>Detailed Damage Assessment</li>
              <li>Itemized Material List</li>
              <li>Cost Breakdown</li>
              <li>Professional Recommendations</li>
            </ul>
            
            ${
              reportData?.flow === "retail"
                ? `
            <p>
              <strong>Ready to move forward?</strong> Contact us to discuss next steps and schedule your project.
            </p>
            `
                : `
            <p>
              <strong>For insurance claims:</strong> This report can be submitted directly to your insurance carrier.
            </p>
            `
            }
          </div>
          
          <div class="footer">
            <p>This report was generated using AI-powered analysis by SkaiScraper.</p>
            <p style="font-size: 12px; margin-top: 10px;">
              Questions? Reply to this email or contact our support team.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email with Resend
    const emailData: any = {
      from: "Skai Reports <reports@skaiscrape.com>",
      to: recipientEmail,
      subject,
      html: htmlBody,
    };

    // Attach PDF if provided
    if (pdfBlob) {
      emailData.attachments = [
        {
          filename: `${reportId}.pdf`,
          content: pdfBlob, // base64 string
        },
      ];
    }

    const resend = getResend();
    const result = await resend.emails.send(emailData);

    // Store email log in database
    try {
      await prisma.emailLog.create({
        data: {
          orgId: auth.orgId,
          toEmail: recipientEmail,
          subject: emailData.subject,
          templateId: "report_email",
          status: "sent",
          resendId: result.data?.id || null,
          reportId,
          metadata: { recipientName },
        },
      });
    } catch (logError) {
      console.error("[reports/email] EmailLog create failed:", logError);
    }

    return NextResponse.json({
      ok: true,
      emailId: result.data?.id,
      description: `Report sent to ${recipientEmail}`,
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
