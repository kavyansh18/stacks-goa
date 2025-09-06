export class WalletService {
  private static instance: WalletService;
  private connection: any = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async connectLeather(): Promise<any> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      // Try both possible API names
      const leather = window.leather || window.LeatherProvider;
      
      if (!leather) {
        throw new Error('Leather wallet not found');
      }

      // Try different request methods that Leather might support
      let response;
      try {
        // Try the standard method first
        response = await leather.request('stx_requestAccounts', {});
      } catch (firstError) {
        try {
          // Try alternative method
          response = await leather.request('requestAccounts', {});
        } catch (secondError) {
          try {
            // Try direct method call
            response = await leather.request({ method: 'stx_requestAccounts' });
          } catch (thirdError) {
            throw new Error('Unable to connect to Leather wallet. Please make sure it is unlocked and try again.');
          }
        }
      }

      // Handle different response formats
      let address;
      if (response.result && response.result.addresses) {
        address = response.result.addresses[0];
      } else if (response.addresses) {
        address = response.addresses[0];
      } else if (response[0]) {
        address = response[0];
      } else {
        throw new Error('Invalid response from Leather wallet');
      }

      this.connection = {
        address: address,
        provider: 'leather',
        network: 'mainnet',
        isConnected: true,
      };

      return this.connection;
    } catch (error) {
      console.error('Failed to connect Leather wallet:', error);
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
    // Example: you can send tx or contract call here
    return `Request submitted: ${domain} - ${question} until ${deadline}`;
  }
}

 

  // async disconnect(): Promise<void> {
  //   this.connection = null;
  // }

  // getConnection() {
  //   return this.connection;
  // }

  // async requestData(domain: string, question: string, deadline: number): Promise<string> {
  //   if (!this.connection) throw new Error('Wallet not connected');
    
    // Mock Clarity contract call
//     const txId = `0x${Math.random().toString(16).substr(2, 64)}`;
//     console.log(`Calling requestData: domain=${domain}, question=${question}, deadline=${deadline}`);
//     return txId;
//   }

//   async resolveData(requestId: string, answer: string): Promise<string> {
//     if (!this.connection) throw new Error('Wallet not connected');
    
//     // Mock Clarity contract call
//     const txId = `0x${Math.random().toString(16).substr(2, 64)}`;
//     console.log(`Calling resolveData: requestId=${requestId}, answer=${answer}`);
//     return txId;
//   }

//   async validateData(requestId: string, isValid: boolean): Promise<string> {
//     if (!this.connection) throw new Error('Wallet not connected');
    
//     // Mock Clarity contract call
//     const txId = `0x${Math.random().toString(16).substr(2, 64)}`;
//     console.log(`Calling validateData: requestId=${requestId}, isValid=${isValid}`);
//     return txId;
//   }
// }