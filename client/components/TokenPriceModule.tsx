'use client';

import { useState, useEffect } from 'react';
import { TokenPrice } from '@/types';
import { APIService } from '@/lib/api';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from 'lucide-react';

export default function TokenPriceModule() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const apiService = APIService.getInstance();

  useEffect(() => {
    fetchPrices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      const symbols = ['BTC', 'ETH', 'STX'];
      const tokenPrices = await apiService.getTokenPrices(symbols);
      setPrices(tokenPrices);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Failed to fetch token prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatChange = (change: number) => {
    const formatted = Math.abs(change).toFixed(2);
    return change >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  return (
    <div className="terminal-box p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-6 h-6 terminal-glow" />
          <h3 className="text-xl font-bold terminal-glow">TOKEN PRICES</h3>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
          <button
            onClick={fetchPrices}
            disabled={isLoading}
            className="retro-button text-xs px-2 py-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {prices.map((token) => (
          <div key={token.symbol} className="terminal-box p-4 scan-line">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{token.symbol}</span>
              <span className="text-xs text-gray-400 uppercase">{token.source}</span>
            </div>
            
            <div className="mb-2">
              <div className="text-2xl font-bold terminal-glow">
                {formatPrice(token.price)}
              </div>
            </div>
            
            <div className={`flex items-center space-x-1 ${
              token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {token.change24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {formatChange(token.change24h)}
              </span>
              <span className="text-xs text-gray-400">24h</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-green-500 p-4">
        <h4 className="text-lg font-bold mb-3 terminal-glow">RECENT PRICE REQUESTS</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-600">
            <span>BTC/USD Price Request</span>
            <span className="text-yellow-500">PENDING</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-600">
            <span>ETH/USD Price Request</span>
            <span className="text-green-500">RESOLVED</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>STX/USD Price Request</span>
            <span className="text-blue-500">VALIDATED</span>
          </div>
        </div>
      </div>
    </div>
  );
}