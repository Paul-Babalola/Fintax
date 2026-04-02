// Mono API Configuration
export const MONO_CONFIG = {
  baseUrl: 'https://api.withmono.com',
  version: 'v1',
  connectUrl: 'https://connect.mono.co',
};

export interface MonoAccount {
  id: string;
  name: string;
  bank: {
    name: string;
    code: string;
  };
  type: string;
  balance: {
    available: number;
    current: number;
    currency: string;
  };
  bvn: string;
  accountNumber: string;
}

export interface MonoTransaction {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  date: string;
  category: string;
  balance: number;
}