/**
 * PHASE 41-42: E2E Tests for Carrier Compliance & Auto-Supplement
 * 
 * Test coverage:
 * 1. Carrier detection from multiple sources
 * 2. Compliance conflict identification
 * 3. Supplement generation with AI
 * 4. Download endpoints (PDF/Excel)
 * 5. Rate limiting
 * 6. Error handling
 */

import { afterAll,beforeAll, describe, expect, it } from '@jest/globals';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';
let testLeadId: string;
let testClaimId: string;
let testSupplementId: string;
let authToken: string;

// Mock data
const mockScope = [
  {
    code: 'RFG100',
    description: 'Architectural shingles',
    quantity: 35,
    unit: 'SQ',
    unitPrice: 120,
    totalPrice: 4200,
    category: 'Roofing'
  },
  {
    code: 'RFG200',
    description: 'Ice and water shield',
    quantity: 8,
    unit: 'SQ',
    unitPrice: 45,
    totalPrice: 360,
    category: 'Roofing'
  },
  {
    code: 'RFG300',
    description: 'Ridge cap shingles',
    quantity: 120,
    unit: 'LF',
    unitPrice: 6.50,
    totalPrice: 780,
    category: 'Roofing'
  }
];

describe('Phase 41: Carrier Compliance API', () => {
  
  describe('POST /api/carrier/compliance', () => {
    
    it('should detect carrier from adjuster email', async () => {
      const response = await fetch(`${BASE_URL}/api/carrier/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          leadId: testLeadId,
          scope: mockScope,
          adjusterEmail: 'john.smith@statefarm.com',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.carrier.name).toBe('State Farm');
      expect(data.carrier.detectedFrom).toBe('email');
      expect(data.carrier.confidence).toBeGreaterThan(0.8);
    });

    it('should identify missing required items', async () => {
      const response = await fetch(`${BASE_URL}/api/carrier/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          leadId: testLeadId,
          scope: mockScope,
          manualCarrier: 'State Farm',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.conflicts).toBeInstanceOf(Array);
      
      // State Farm requires starter strip and drip edge
      const missingRequired = data.conflicts.filter(
        (c: any) => c.type === 'missing_required'
      );
      expect(missingRequired.length).toBeGreaterThan(0);
    });

    it('should detect O&P denial for strict carriers', async () => {
      const scopeWithOP = [
        ...mockScope,
        {
          code: 'OP',
          description: 'Overhead & Profit',
          quantity: 1,
          unit: 'EA',
          unitPrice: 1068,
          totalPrice: 1068,
          category: 'General'
        }
      ];

      const response = await fetch(`${BASE_URL}/api/carrier/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          leadId: testLeadId,
          scope: scopeWithOP,
          manualCarrier: 'Farmers',
        }),
      });

      const data = await response.json();
      
      const opConflict = data.conflicts.find(
        (c: any) => c.type === 'op_denied'
      );
      expect(opConflict).toBeDefined();
      expect(opConflict.severity).toBe('critical');
    });

    it('should calculate approval chance correctly', async () => {
      const response = await fetch(`${BASE_URL}/api/carrier/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          leadId: testLeadId,
          scope: mockScope,
          manualCarrier: 'Allstate', // Very strict
        }),
      });

      const data = await response.json();
      
      expect(data.summary.approvalChance).toBeGreaterThanOrEqual(0);
      expect(data.summary.approvalChance).toBeLessThanOrEqual(100);
      expect(data.summary.criticalIssues).toBeGreaterThanOrEqual(0);
    });

    it('should reject invalid input', async () => {
      const response = await fetch(`${BASE_URL}/api/carrier/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          leadId: testLeadId,
          scope: [], // Empty scope
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should enforce rate limiting', async () => {
      // Make 21 requests rapidly (limit is 20/hour)
      const promises = Array.from({ length: 21 }, () =>
        fetch(`${BASE_URL}/api/carrier/compliance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            leadId: testLeadId,
            scope: mockScope,
            manualCarrier: 'State Farm',
          }),
        })
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});

describe('Phase 42: Auto-Supplement API', () => {
  
  describe('POST /api/claims/[claimId]/supplement', () => {
    
    it('should generate supplement with AI arguments', async () => {
      const response = await fetch(`${BASE_URL}/api/claims/${testClaimId}/supplement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          claimId: testClaimId,
          carrierScopePDF: 'Mock carrier scope text...',
          contractorScope: mockScope,
          adjusterEmail: 'adjuster@allstate.com',
          city: 'Phoenix',
          tone: 'professional',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.supplementId).toBeDefined();
      expect(data.financials.total).toBeGreaterThan(0);
      expect(data.arguments).toBeInstanceOf(Array);
      expect(data.arguments.length).toBeGreaterThan(0);
      
      testSupplementId = data.supplementId;
    });

    it('should detect code upgrades for Arizona', async () => {
      const response = await fetch(`${BASE_URL}/api/claims/${testClaimId}/supplement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          claimId: testClaimId,
          carrierScopePDF: 'Mock carrier scope...',
          contractorScope: mockScope,
          city: 'Prescott', // High wind zone
          state: 'Arizona',
          tone: 'firm',
        }),
      });

      const data = await response.json();
      
      expect(data.codeUpgrades).toBeInstanceOf(Array);
      
      // Should detect ventilation requirement
      const ventUpgrade = data.codeUpgrades.find(
        (u: any) => u.codeSection.includes('R806.2')
      );
      expect(ventUpgrade).toBeDefined();
    });

    it('should generate negotiation scripts in different tones', async () => {
      const tones = ['professional', 'firm', 'legal'] as const;
      
      for (const tone of tones) {
        const response = await fetch(`${BASE_URL}/api/claims/${testClaimId}/supplement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            claimId: testClaimId,
            carrierScopePDF: 'Mock carrier scope...',
            contractorScope: mockScope,
            tone,
          }),
        });

        const data = await response.json();
        
        expect(data.negotiationScript).toBeDefined();
        expect(data.negotiationScript.length).toBeGreaterThan(100);
        expect(data.tone).toBe(tone);
      }
    });

    it('should generate email draft', async () => {
      const response = await fetch(`${BASE_URL}/api/claims/${testClaimId}/supplement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          claimId: testClaimId,
          carrierScopePDF: 'Mock carrier scope...',
          contractorScope: mockScope,
          tone: 'professional',
        }),
      });

      const data = await response.json();
      
      expect(data.emailDraft).toBeDefined();
      expect(data.emailDraft).toContain('Subject:');
      expect(data.emailDraft).toContain(testClaimId);
    });

    it('should reject missing required fields', async () => {
      const response = await fetch(`${BASE_URL}/api/claims/${testClaimId}/supplement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          claimId: testClaimId,
          // Missing carrier scope PDF
          contractorScope: mockScope,
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/claims/[claimId]/supplement', () => {
    
    it('should retrieve all supplements for claim', async () => {
      const response = await fetch(`${BASE_URL}/api/claims/${testClaimId}/supplement`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.supplements).toBeInstanceOf(Array);
      expect(data.supplements.length).toBeGreaterThan(0);
    });
  });

  describe('Download Endpoints', () => {
    
    it('should download supplement as PDF', async () => {
      const response = await fetch(
        `${BASE_URL}/api/claims/${testClaimId}/supplement/${testSupplementId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/pdf');
      
      const blob = await response.blob();
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should download supplement as CSV', async () => {
      const response = await fetch(
        `${BASE_URL}/api/claims/${testClaimId}/supplement/${testSupplementId}/excel`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/csv');
      
      const text = await response.text();
      expect(text).toContain('Type,Item Code,Description');
      expect(text).toContain('Total Supplement');
    });

    it('should enforce download rate limiting', async () => {
      // Make 51 download requests (limit is 50/hour)
      const promises = Array.from({ length: 51 }, () =>
        fetch(
          `${BASE_URL}/api/claims/${testClaimId}/supplement/${testSupplementId}/download`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          }
        )
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration Tests', () => {
  
  it('should complete full workflow: compliance → supplement → download', async () => {
    // Step 1: Check compliance
    const complianceResponse = await fetch(`${BASE_URL}/api/carrier/compliance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        leadId: testLeadId,
        scope: mockScope,
        adjusterEmail: 'adj@statefarm.com',
      }),
    });

    const complianceData = await complianceResponse.json();
    expect(complianceData.success).toBe(true);

    // Step 2: Generate supplement
    const supplementResponse = await fetch(`${BASE_URL}/api/claims/${testClaimId}/supplement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        claimId: testClaimId,
        carrierScopePDF: 'Mock carrier scope...',
        contractorScope: complianceData.recommendedScope,
        manualCarrier: complianceData.carrier.name,
        tone: 'professional',
      }),
    });

    const supplementData = await supplementResponse.json();
    expect(supplementData.success).toBe(true);

    // Step 3: Download PDF
    const downloadResponse = await fetch(
      `${BASE_URL}/api/claims/${testClaimId}/supplement/${supplementData.supplementId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers.get('content-type')).toBe('application/pdf');
  });
});

// Test utilities
function generateMockPDF(): string {
  return `
    INSURANCE CARRIER SCOPE OF WORK
    Claim Number: ${testClaimId}
    
    LINE ITEMS:
    1. Tear off existing shingles - 35 SQ @ $25.00 = $875.00
    2. Install 30-year shingles - 35 SQ @ $95.00 = $3,325.00
    3. Install starter strip - 120 LF @ $2.50 = $300.00
    
    TOTAL: $4,500.00
  `;
}
