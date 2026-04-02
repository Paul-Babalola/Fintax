import { MONO_CONFIG, type MonoAccount, type MonoTransaction } from './config';

class MonoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MONO_SECRET_KEY!;
    this.baseUrl = `${MONO_CONFIG.baseUrl}/${MONO_CONFIG.version}`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Mono API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getAccount(accountId: string): Promise<MonoAccount> {
    return this.makeRequest(`/accounts/${accountId}`);
  }

  async getTransactions(accountId: string, options: {
    start?: string;
    end?: string;
    limit?: number;
  } = {}): Promise<MonoTransaction[]> {
    const queryParams = new URLSearchParams();
    
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
    if (options.limit) queryParams.append('limit', options.limit.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const data = await this.makeRequest(`/accounts/${accountId}/transactions${query}`);
    
    return data.data || [];
  }

  async getAccountStatement(accountId: string, options: {
    period?: 'last30days' | 'last3months' | 'last6months' | 'lastyear';
    output?: 'pdf' | 'json';
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (options.period) queryParams.append('period', options.period);
    if (options.output) queryParams.append('output', options.output);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.makeRequest(`/accounts/${accountId}/statement${query}`);
  }

  async unlinkAccount(accountId: string): Promise<void> {
    await this.makeRequest(`/accounts/${accountId}/unlink`, {
      method: 'POST',
    });
  }
}

export const monoClient = new MonoClient();