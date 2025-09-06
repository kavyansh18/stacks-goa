import { OracleRequest } from '@/types';

export const mockRequests: OracleRequest[] = [
  {
    id: 'req_001',
    requester: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KX17ECJKR1S5',
    domain: 'token-price',
    question: 'What is the current price of BTC in USD?',
    proposedAnswer: '$43,250.00',
    status: 'proposed',
    deadline: Date.now() + 3600000, // 1 hour from now
    createdAt: Date.now() - 1800000, // 30 min ago
    solver: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF85EWD',
    bondAmount: '100'
  },
  {
    id: 'req_002',
    requester: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    domain: 'sports-score',
    question: 'What was the final score of Chiefs vs Bills on Jan 21, 2024?',
    proposedAnswer: 'Chiefs 28 - Bills 21',
    status: 'resolved',
    deadline: Date.now() - 7200000, // 2 hours ago
    createdAt: Date.now() - 10800000, // 3 hours ago
    resolvedAt: Date.now() - 3600000, // 1 hour ago
    solver: 'SP1WTA0YBPC5R6GDMPPJCEDEA6Z2ZEPNMQ4C39W6M',
    bondAmount: '50'
  },
  {
    id: 'req_003',
    requester: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    domain: 'token-price',
    question: 'What is the current price of ETH in USD?',
    status: 'pending',
    deadline: Date.now() + 7200000, // 2 hours from now
    createdAt: Date.now() - 900000, // 15 min ago
    bondAmount: '75'
  },
  {
    id: 'req_004',
    requester: 'SP1K5JZ7Z3VB7QQMX9YT3W8D4EFMNBGQS5N2FT8V',
    domain: 'sports-score',
    question: 'What is the current score of Lakers vs Celtics?',
    proposedAnswer: 'Lakers 95 - Celtics 102',
    status: 'disputed',
    deadline: Date.now() + 1800000, // 30 min from now
    createdAt: Date.now() - 2700000, // 45 min ago
    disputedAt: Date.now() - 900000, // 15 min ago
    solver: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF85EWD',
    bondAmount: '60'
  },
  {
    id: 'req_005',
    requester: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KX17ECJKR1S5',
    domain: 'token-price',
    question: 'What is the current price of STX in USD?',
    proposedAnswer: '$1.85',
    status: 'validated',
    deadline: Date.now() - 3600000, // 1 hour ago
    createdAt: Date.now() - 5400000, // 1.5 hours ago
    resolvedAt: Date.now() - 1800000, // 30 min ago
    validatedAt: Date.now() - 900000, // 15 min ago
    solver: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    validator: 'AI_GEMINI',
    bondAmount: '80',
    aiLogs: [{
      id: 'ai_001',
      timestamp: Date.now() - 900000,
      service: 'gemini',
      input: 'Q: What is the current price of STX in USD?\nA: $1.85',
      output: 'VALID',
      confidence: 0.95,
      status: 'success',
      reasoning: 'Price matches current market data from multiple sources.'
    }]
  }
];