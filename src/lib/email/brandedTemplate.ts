// src/lib/email/brandedTemplate.ts
import type { OrgBranding } from "@/lib/branding/fetchBranding";

export interface BrandedEmailOptions {
  branding: OrgBranding | null;
  recipientName?: string;
  subject: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footerText?: string;
}

/**
 * Generates a branded HTML email template using org branding
 */
export function buildBrandedEmailHTML(options: BrandedEmailOptions): string {
  const { branding, recipientName, subject, heading, body, ctaText, ctaUrl, footerText } = options;

  const companyName = branding?.companyName || "SkaiScraper";
  const primaryColor = branding?.colorPrimary || "#117CFF";
  const accentColor = branding?.colorAccent || "#FFC838";
  const logoUrl = branding?.logoUrl || null;
  const website = branding?.website || "https://skaiscrape.com";
  const phone = branding?.phone || "";
  const email = branding?.email || "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333333;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .email-logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    .email-company-name {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-body {
      padding: 40px 30px;
    }
    .email-greeting {
      font-size: 16px;
      color: #666666;
      margin-bottom: 20px;
    }
    .email-heading {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
      margin: 0 0 24px 0;
    }
    .email-content {
      font-size: 16px;
      color: #333333;
      margin-bottom: 30px;
      white-space: pre-line;
    }
    .email-cta {
      text-align: center;
      margin: 40px 0;
    }
    .email-cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
    }
    .email-cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .email-footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eeeeee;
    }
    .email-footer-company {
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
    }
    .email-footer-contact {
      font-size: 14px;
      color: #666666;
      margin: 4px 0;
    }
    .email-footer-legal {
      font-size: 12px;
      color: #999999;
      margin-top: 20px;
      line-height: 1.4;
    }
    .email-footer-link {
      color: ${primaryColor};
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-header {
        padding: 30px 20px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .email-heading {
        font-size: 20px;
      }
      .email-company-name {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      ${
        logoUrl
          ? `<img src="${logoUrl}" alt="${companyName}" class="email-logo" />`
          : `<h1 class="email-company-name">${companyName}</h1>`
      }
    </div>

    <!-- Body -->
    <div class="email-body">
      ${recipientName ? `<p class="email-greeting">Hi ${recipientName},</p>` : ""}
      
      <h2 class="email-heading">${heading}</h2>
      
      <div class="email-content">${body}</div>

      ${
        ctaText && ctaUrl
          ? `
      <div class="email-cta">
        <a href="${ctaUrl}" class="email-cta-button">${ctaText}</a>
      </div>
      `
          : ""
      }
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <div class="email-footer-company">${companyName}</div>
      ${phone ? `<div class="email-footer-contact">📞 ${phone}</div>` : ""}
      ${email ? `<div class="email-footer-contact">✉️ <a href="mailto:${email}" class="email-footer-link">${email}</a></div>` : ""}
      ${website ? `<div class="email-footer-contact">🌐 <a href="${website}" class="email-footer-link">${website}</a></div>` : ""}
      
      ${footerText ? `<div class="email-footer-legal">${footerText}</div>` : ""}
      
      <div class="email-footer-legal">
        You're receiving this email because you have an active claim with ${companyName}.
        <br/>
        © ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates plain text version of branded email
 */
export function buildBrandedEmailText(options: BrandedEmailOptions): string {
  const { branding, recipientName, heading, body, ctaText, ctaUrl, footerText } = options;

  const companyName = branding?.companyName || "SkaiScraper";
  const phone = branding?.phone || "";
  const email = branding?.email || "";
  const website = branding?.website || "";

  let text = "";

  if (recipientName) {
    text += `Hi ${recipientName},\n\n`;
  }

  text += `${heading}\n\n`;
  text += `${body}\n\n`;

  if (ctaText && ctaUrl) {
    text += `${ctaText}: ${ctaUrl}\n\n`;
  }

  text += `---\n`;
  text += `${companyName}\n`;
  if (phone) text += `Phone: ${phone}\n`;
  if (email) text += `Email: ${email}\n`;
  if (website) text += `Website: ${website}\n`;

  if (footerText) {
    text += `\n${footerText}\n`;
  }

  text += `\n© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

  return text;
}
