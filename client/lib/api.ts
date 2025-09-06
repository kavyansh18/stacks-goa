import { TokenPrice, SportsMatch, AIValidationLog } from '@/types';

export class APIService {
  private static instance: APIService;

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  async getTokenPrices(symbols: string[]): Promise<TokenPrice[]> {
    // Mock CoinGecko API call
    const mockPrices: TokenPrice[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 43250.00,
        change24h: 2.5,
        lastUpdated: Date.now(),
        source: 'coingecko'
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 2650.00,
        change24h: -1.2,
        lastUpdated: Date.now(),
        source: 'coingecko'
      },
      {
        symbol: 'STX',
        name: 'Stacks',
        price: 1.85,
        change24h: 5.8,
        lastUpdated: Date.now(),
        source: 'binance'
      }
    ];

    return mockPrices.filter(price => symbols.includes(price.symbol));
  }

  async getSportsScores(sport: string, league: string): Promise<SportsMatch[]> {
    // Mock SportsRadar API call
    const mockMatches: SportsMatch[] = [
      {
        id: 'nfl_001',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        homeScore: 28,
        awayScore: 21,
        status: 'completed',
        startTime: Date.now() - 3600000, // 1 hour ago
        league: 'NFL',
        sport: 'football'
      },
      {
        id: 'nba_001',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Boston Celtics',
        homeScore: 95,
        awayScore: 102,
        status: 'live',
        startTime: Date.now() - 1800000, // 30 min ago
        league: 'NBA',
        sport: 'basketball'
      }
    ];

    return mockMatches.filter(match => 
      match.sport === sport && match.league === league
    );
  }

  async validateWithAI(
    question: string, 
    proposedAnswer: string, 
    service: 'gemini' | 'openai'
  ): Promise<AIValidationLog> {
    // Mock AI validation
    const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
    const isValid = confidence > 0.75;

    return {
      id: `ai_${Date.now()}`,
      timestamp: Date.now(),
      service,
      input: `Q: ${question}\nA: ${proposedAnswer}`,
      output: isValid ? 'VALID' : 'INVALID',
      confidence,
      status: 'success',
      reasoning: `AI analysis shows ${Math.round(confidence * 100)}% confidence. ` +
        (isValid ? 'Answer appears correct based on available data.' : 'Answer may be incorrect or outdated.')
    };
  }
}