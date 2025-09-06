export class WalletService {
  private static instance: WalletService;
  private connection: any = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async connectHiro(): Promise<any> {
    try {
      // @ts-ignore - Hiro wallet API
      if (typeof window !== 'undefined' && window.StacksProvider) {
        // @ts-ignore
        const stacks = window.StacksProvider;
        const userData = await stacks.connect();
        this.connection = {
          address: userData.profile.stxAddress.mainnet,
          provider: 'hiro',
          network: 'mainnet',
          isConnected: true
        };
        return this.connection;
      }
      throw new Error('Hiro wallet not found');
    } catch (error) {
      console.error('Failed to connect Hiro wallet:', error);
      throw error;
    }
  }

  async connectXverse(): Promise<any> {
    try {
      // @ts-ignore - Xverse wallet API
      if (typeof window !== 'undefined' && window.XverseProviders) {
        // @ts-ignore
        const xverse = window.XverseProviders.StacksProvider;
        const response = await xverse.request('stx_requestAccounts', {});
        this.connection = {
          address: response.result.addresses[0],
          provider: 'xverse',
          network: 'mainnet',
          isConnected: true
        };
        return this.connection;
      }
      throw new Error('Xverse wallet not found');
    } catch (error) {
      console.error('Failed to connect Xverse wallet:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connection = null;
  }

  getConnection() {
    return this.connection;
  }

  async requestData(domain: string, question: string, deadline: number): Promise<string> {
    if (!this.connection) throw new Error('Wallet not connected');
    
    // Mock Clarity contract call
    const txId = `0x${Math.random().toString(16).substr(2, 64)}`;
    console.log(`Calling requestData: domain=${domain}, question=${question}, deadline=${deadline}`);
    return txId;
  }

  async resolveData(requestId: string, answer: string): Promise<string> {
    if (!this.connection) throw new Error('Wallet not connected');
    
    // Mock Clarity contract call
    const txId = `0x${Math.random().toString(16).substr(2, 64)}`;
    console.log(`Calling resolveData: requestId=${requestId}, answer=${answer}`);
    return txId;
  }

  async validateData(requestId: string, isValid: boolean): Promise<string> {
    if (!this.connection) throw new Error('Wallet not connected');
    
    // Mock Clarity contract call
    const txId = `0x${Math.random().toString(16).substr(2, 64)}`;
    console.log(`Calling validateData: requestId=${requestId}, isValid=${isValid}`);
    return txId;
  }
}