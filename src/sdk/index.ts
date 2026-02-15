// Minimal client SDK (browser/node) for external integrations
export class PreLossVisionClient {
  constructor(private baseUrl: string, private apiKey?: string) {}
  private headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.apiKey ? { 'x-api-key': this.apiKey } : {})
    };
  }
  async getClaim(id: string) {
    return fetch(`${this.baseUrl}/api/claims/${id}`, { headers: this.headers() }).then(r => r.json());
  }
  async listReports() {
    return fetch(`${this.baseUrl}/api/reports/history`, { headers: this.headers() }).then(r => r.json());
  }
}
