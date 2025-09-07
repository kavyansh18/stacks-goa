'use client';

import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import RequestBoard from '@/components/RequestBoard';
import TokenPriceModule from '@/components/TokenPriceModule';
import SportsScoreModule from '@/components/SportsScoreModule';
import ThemeToggle from '@/components/ThemeToggle';
import { Database, TrendingUp, Trophy, List, CheckSquare } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'ALL REQUESTS', icon: Database },
    { id: 'token-prices', label: 'TOKEN PRICES', icon: TrendingUp },
    { id: 'sports-scores', label: 'SPORTS SCORES', icon: Trophy },
    { id: 'unresolved', label: 'UNRESOLVED', icon: List },
    { id: 'resolved', label: 'RESOLVED', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="terminal-box mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold terminal-glow mb-2">
              ╔═══════════════════════════════════════╗
            </h1>
            <h1 className="text-4xl font-bold terminal-glow mb-2">
              ║     OPTIMISTIC ORACLE v2.1          ║
            </h1>
            <h1 className="text-4xl font-bold terminal-glow mb-4">
              ╚═══════════════════════════════════════╝
            </h1>
            <div className="text-sm text-gray-400">
              // Decentralized Oracle Network on Stacks Blockchain
              <br />
              // Request data • Propose answers • Validate with AI
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="terminal-box mb-6">
        <div className="flex border-b border-green-500">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-r border-green-500 transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-black font-bold'
                    : 'hover:bg-green-500 hover:bg-opacity-20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'token-prices' && <TokenPriceModule />}
          {activeTab === 'sports-scores' && <SportsScoreModule />}
          {(activeTab === 'all' || activeTab === 'unresolved' || activeTab === 'resolved') && (
            <RequestBoard activeTab={activeTab} />
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="terminal-box p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span>SYSTEM STATUS:</span>
            <span className="text-green-500 blinking">● ONLINE</span>
          </div>
          
          <div className="flex items-center space-x-4 text-gray-400">
            <span>NETWORK: STACKS MAINNET</span>
            <span>BLOCK: 147,892</span>
            <span>UPTIME: 99.9%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>// POWERED BY STACKS BLOCKCHAIN • CLARITY SMART CONTRACTS</p>
        <p>// AI VALIDATION: GEMINI & OPENAI • DATA SOURCES: COINGECKO, BINANCE, SPORTSRADAR</p>
      </div>
    </div>
  );
}