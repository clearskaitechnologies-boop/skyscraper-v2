/\*\*

- PHASE 41-42: API Documentation
- Complete API reference for Carrier Compliance and Auto-Supplement features
  \*/

# Carrier Compliance & Auto-Supplement API

## Overview

Phase 41-42 introduces carrier-aware compliance checking and automated supplement generation for insurance claims.

---

## 🛡️ Carrier Compliance API

### POST /api/carrier/compliance

Analyzes contractor scope against carrier-specific rules and guidelines.

**Authentication:** Required (Clerk)  
**Rate Limit:** 20 requests/hour  
**Token Cost:** 10 tokens

#### Request Body

```json
{
  "leadId": "string (required)",
  "scope": [
    {
      "code": "string (required, max 50 chars)",
      "description": "string (required, max 500 chars)",
      "quantity": "number (required, >= 0)",
      "unit": "string (required, max 20 chars)",
      "unitPrice": "number (required, >= 0)",
      "totalPrice": "number (required, >= 0)",
      "category": "string (optional)"
    }
  ],
  "adjusterEmail": "string (optional, email format)",
  "manualCarrier": "string (optional, max 100 chars)",
  "policyPDFText": "string (optional, max 50KB)"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "carrier": {
    "name": "State Farm",
    "confidence": 0.95,
    "detectedFrom": "email",
    "alternativePossibilities": []
  },
  "rules": {
    "allowsOP": true,
    "maxWasteFactor": 0.15,
    "requiredItems": ["Starter strip", "Drip edge"],
    "deniedItems": [],
    "maxPrices": {},
    "codeUpgradeRules": []
  },
  "conflicts": [
    {
      "type": "missing_required",
      "severity": "critical",
      "itemDescription": "Drip edge",
      "description": "Carrier requires drip edge on all roof edges",
      "suggestedFix": "Add line item: Drip edge - 120 LF"
    }
  ],
  "adjustments": [
    {
      "adjustmentType": "price_reduction",
      "reason": "Exceeds carrier price cap",
      "originalItem": {...},
      "adjustedItem": {...}
    }
  ],
  "summary": {
    "pass": false,
    "criticalIssues": 2,
    "warningIssues": 1,
    "infoIssues": 0,
    "approvalChance": 65
  },
  "recommendedScope": [...]
}
```

#### Error Responses

- `400 Bad Request` - Invalid input or carrier not detected
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Lead not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## 📄 Auto-Supplement API

### POST /api/claims/[claimId]/supplement

Generates AI-powered insurance supplement with arguments and negotiation scripts.

**Authentication:** Required (Clerk)  
**Rate Limit:** 10 requests/hour  
**Token Cost:** 20 tokens

#### Request Body

```json
{
  "claimId": "string (required)",
  "carrierScopePDF": "string (optional, base64 or text, max 100KB)",
  "carrierScopePDFUrl": "string (optional, URL format)",
  "contractorScope": [
    {
      "code": "string",
      "description": "string",
      "quantity": "number",
      "unit": "string",
      "unitPrice": "number",
      "totalPrice": "number"
    }
  ],
  "adjusterEmail": "string (optional)",
  "manualCarrier": "string (optional)",
  "zipCode": "string (optional, 5 digits)",
  "city": "string (default: Phoenix)",
  "state": "string (default: Arizona)",
  "tone": "professional|firm|legal (default: professional)"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "supplementId": "clxxx123",
  "carrier": {
    "name": "Allstate",
    "confidence": 0.88,
    "detectedFrom": "pdf"
  },
  "comparison": {
    "carrierScope": [...],
    "contractorScope": [...],
    "missingItems": [...],
    "underpaidItems": [
      {
        "item": {...},
        "contractorAmount": 450.00,
        "carrierAmount": 320.00,
        "difference": 130.00
      }
    ],
    "overpaidItems": [],
    "mismatchedCodes": []
  },
  "codeUpgrades": [
    {
      "itemCode": "RFG100",
      "description": "Ridge ventilation",
      "codeSection": "IRC 2021 R806.2",
      "jurisdiction": "Phoenix, AZ",
      "reasoning": "Minimum 1 sq ft per 150 sq ft required",
      "estimatedCost": 850.00,
      "required": true
    }
  ],
  "arguments": [
    {
      "itemCode": "RFG100",
      "itemDescription": "Ridge ventilation",
      "claimAmount": 850.00,
      "carrierAmount": 0,
      "difference": 850.00,
      "argument": "IRC 2021 Section R806.2 mandates...",
      "evidence": ["Required by IRC 2021 R806.2"],
      "codeReferences": ["IRC 2021 R806.2"],
      "photoReferences": []
    }
  ],
  "negotiationScript": "Opening: Thank you for taking the time...",
  "financials": {
    "subtotal": 3250.50,
    "tax": 289.29,
    "total": 3539.79
  },
  "emailDraft": "Subject: Supplement Request - Claim ABC123...",
  "downloadUrls": {
    "pdf": "/api/claims/ABC123/supplement/clxxx123/download",
    "excel": "/api/claims/ABC123/supplement/clxxx123/excel"
  }
}
```

### GET /api/claims/[claimId]/supplement

Retrieve all supplements for a claim.

**Authentication:** Required (Clerk)  
**Rate Limit:** 100 requests/hour

#### Response (200 OK)

```json
{
  "success": true,
  "supplements": [
    {
      "id": "clxxx123",
      "carrierName": "State Farm",
      "recommended": 3539.79,
      "tone": "professional",
      "createdAt": "2025-11-17T10:30:00Z",
      "missingItems": [...],
      "codeUpgrades": [...],
      "quantityFixes": [...]
    }
  ]
}
```

---

## 📥 Download Endpoints

### GET /api/claims/[claimId]/supplement/[supplementId]/download

Download supplement as PDF.

**Authentication:** Required (Clerk)  
**Rate Limit:** 50 requests/hour  
**Response:** PDF file

### GET /api/claims/[claimId]/supplement/[supplementId]/excel

Download supplement as CSV (Excel-compatible).

**Authentication:** Required (Clerk)  
**Rate Limit:** 50 requests/hour  
**Response:** CSV file

---

## 🔒 Security Features

1. **Authentication:** All endpoints require valid Clerk authentication
2. **Rate Limiting:** Upstash Redis-based rate limiting per endpoint
3. **Input Validation:** Comprehensive Zod schemas validate all inputs
4. **Token Consumption:** Automatic token tracking for usage billing
5. **Org Isolation:** All queries scoped to user's organization
6. **File Size Limits:** PDF uploads capped at 10MB
7. **SQL Injection Protection:** Prisma ORM with parameterized queries
8. **XSS Protection:** All user inputs sanitized
9. **CORS:** Strict same-origin policy
10. **Analytics:** All actions tracked for audit

---

## 🚀 Usage Examples

### Example 1: Check Compliance

```typescript
const response = await fetch("/api/carrier/compliance", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    leadId: "lead_123",
    scope: [
      {
        code: "RFG100",
        description: "Asphalt shingles",
        quantity: 35,
        unit: "SQ",
        unitPrice: 120,
        totalPrice: 4200,
      },
    ],
    adjusterEmail: "john@statefarm.com",
  }),
});
const data = await response.json();
console.log(`Carrier: ${data.carrier.name}, Approval Chance: ${data.summary.approvalChance}%`);
```

### Example 2: Generate Supplement

```typescript
const response = await fetch('/api/claims/CLAIM123/supplement', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    claimId: 'CLAIM123',
    carrierScopePDFUrl: 'https://storage.com/carrier-scope.pdf',
    contractorScope: [...],
    tone: 'firm',
    city: 'Prescott'
  })
});
const data = await response.json();
console.log(`Total Supplement: $${data.financials.total}`);
```

---

## 📊 Supported Carriers

1. **State Farm** - Strictness: 3/10 (Fair)
2. **Farmers** - Strictness: 9/10 (Very Strict)
3. **USAA** - Strictness: 5/10 (Reasonable)
4. **Allstate** - Strictness: 10/10 (Extremely Strict)
5. **Liberty Mutual** - Strictness: 6/10 (Moderate)
6. **Nationwide** - Strictness: 4/10 (Fair)

---

## 🏗️ Code Compliance

### Supported Jurisdictions

- **Arizona** (State-wide IRC 2021)
  - Phoenix (Cool roof requirements)
  - Prescott (High wind requirements)
  - Chino Valley (Standard IRC)

### Code Sections Enforced

- IRC 2021 R806.2 (Ventilation)
- IRC 2021 R905.2.8.5 (Drip edge)
- Local wind requirements (varies by city)
- Energy efficiency standards

---

## 🎯 Best Practices

1. **Always provide adjuster email** for best carrier detection
2. **Upload high-quality PDFs** for accurate scope parsing
3. **Use "professional" tone** for first supplement attempts
4. **Include photos** when available for stronger arguments
5. **Review AI arguments** before sending to adjuster
6. **Download both PDF and Excel** for complete documentation
7. **Track supplement history** to identify carrier patterns

---

## 🐛 Troubleshooting

**Issue:** Carrier not detected  
**Solution:** Provide adjuster email OR manual carrier selection

**Issue:** Missing items not found  
**Solution:** Ensure contractor scope is complete and formatted correctly

**Issue:** Rate limit exceeded  
**Solution:** Wait for rate limit window to reset (shown in error message)

**Issue:** PDF parsing failed  
**Solution:** Ensure PDF is text-based (not scanned image) and under 10MB

---

## 📞 Support

For technical issues or questions, contact your system administrator or refer to the main API documentation.
