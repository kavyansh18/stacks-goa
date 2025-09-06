'use client';

import { useState, useEffect } from 'react';
import { WalletService } from '@/lib/wallet';
import { Wallet, Zap, X } from 'lucide-react';

interface WalletConnection {
  address: string;
  provider: 'hiro' | 'xverse';
  isConnected: boolean;
}

export default function WalletConnect() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const walletService = WalletService.getInstance();

  useEffect(() => {
    // Check if already connected
    const existingConnection = walletService.getConnection();
    if (existingConnection) {
      setConnection(existingConnection);
    }
  }, []);

  const connectWallet = async (provider: 'hiro' | 'xverse') => {
    setIsConnecting(true);
    try {
      let result;
      if (provider === 'hiro') {
        result = await walletService.connectHiro();
      } else {
        result = await walletService.connectXverse();
      }
      setConnection(result);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`Failed to connect ${provider} wallet. Please make sure it's installed.`);
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
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-80 flex items-center justify-center z-50">
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
                onClick={() => connectWallet('hiro')}
                disabled={isConnecting}
                className="w-full retro-button flex items-center justify-center space-x-2 py-4"
              >
                {isConnecting ? (
                  <span className="blinking">CONNECTING...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>HIRO WALLET</span>
                  </>
                )}
              </button>

              <button
                onClick={() => connectWallet('xverse')}
                disabled={isConnecting}
                className="w-full retro-button flex items-center justify-center space-x-2 py-4"
              >
                {isConnecting ? (
                  <span className="blinking">CONNECTING...</span>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>XVERSE WALLET</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              <p>// Connect your Stacks wallet to interact with the oracle</p>
              <p>// Make sure your wallet is installed and unlocked</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}