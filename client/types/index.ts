export interface OracleRequest {
  id: string;
  requester: string;
  domain: 'token-price' | 'sports-score';
  question: string;
  proposedAnswer?: string;
  status: 'pending' | 'proposed' | 'resolved' | 'disputed' | 'validated';
  deadline: number;
  createdAt: number;
  resolvedAt?: number;
  disputedAt?: number;
  validatedAt?: number;
  solver?: string;
  validator?: string;
  aiLogs?: AIValidationLog[];
  bondAmount?: string;
}

export interface AIValidationLog {
  id: string;
  timestamp: number;
  service: 'gemini' | 'openai';
  input: string;
  output: string;
  confidence: number;
  status: 'success' | 'error';
  reasoning?: string;
}

export interface TokenPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdated: number;
  source: 'coingecko' | 'binance';
}

export interface SportsMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'completed';
  startTime: number;
  league: string;
  sport: string;
}

export interface WalletConnection {
  address: string;
  network: 'mainnet' | 'testnet';
  provider: 'hiro' | 'xverse';
  isConnected: boolean;
}