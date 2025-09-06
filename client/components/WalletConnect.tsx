'use client';

import { useState, useEffect } from 'react';
import { WalletService } from '@/lib/wallet';
import { Wallet, Zap, X } from 'lucide-react';

interface WalletConnection {
  address: string;
  provider: 'leather';
  isConnected: boolean;
}

export default function WalletConnect() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const walletService = WalletService.getInstance();

  useEffect(() => {
    // Check if already connected on component mount
    const existingConnection = walletService.getConnection();
    if (existingConnection) setConnection(existingConnection);
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      // Debug: Log what's available on window
      console.log('Available wallet objects:', {
        leather: !!window.leather,
        LeatherProvider: !!window.LeatherProvider,
        ethereum: !!window.ethereum,
        web3: !!window.web3,
        allKeys: Object.keys(window).filter(key => 
          key.toLowerCase().includes('wallet') || 
          key.toLowerCase().includes('leather') || 
          key.toLowerCase().includes('stacks') ||
          key.toLowerCase().includes('ethereum')
        )
      });

      // Wait a bit for wallet to inject if it's still loading
      let attempts = 0;
      while (!window.leather && !window.LeatherProvider && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.leather && !window.LeatherProvider) {
        throw new Error('Leather wallet not detected. Please install the Leather wallet extension from the Chrome Web Store or Firefox Add-ons.');
      }

      const result = await walletService.connectLeather();
      setConnection(result);
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      alert(error?.message || 'Failed to connect Leather wallet. Please make sure it is installed and unlocked.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    await walletService.disconnect();
    setConnection(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {/* Wallet Button */}
      {connection ? (
        <div className="flex items-center space-x-4">
          <div className="terminal-box px-3 py-2 flex items-center space-x-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">{formatAddress(connection.address)}</span>
            <span className="text-xs text-yellow-500 uppercase">{connection.provider}</span>
          </div>
          <button
            onClick={disconnect}
            className="retro-button-danger text-sm px-3 py-1"
          >
            DISCONNECT
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="retro-button flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>CONNECT WALLET</span>
        </button>
      )}

      {/* Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="terminal-box p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold terminal-glow">CONNECT WALLET</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full retro-button flex items-center justify-center space-x-2 py-4"
              >
                {isConnecting ? (
                  <span className="blinking">CONNECTING...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>LEATHER WALLET</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              <p>Connect your Leather wallet to interact with the oracle.</p>
              <p>Make sure your wallet is installed and unlocked.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
