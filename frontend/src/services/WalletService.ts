import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Wallet Service for Aptos Integration
export class WalletService {
  private aptos: Aptos;
  private static instance: WalletService;
  private currentWalletType: 'petra' | 'martian' | 'pontem' | null = null;

  private constructor() {
    const config = new AptosConfig({ 
      network: (import.meta.env.VITE_APTOS_NETWORK as Network) || Network.TESTNET 
    });
    this.aptos = new Aptos(config);
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Detect available wallets
  private getAvailableWallets(): { type: 'petra' | 'martian' | 'pontem', provider: any }[] {
    const wallets: { type: 'petra' | 'martian' | 'pontem', provider: any }[] = [];
    
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window.aptos?.isPetra) {
        // @ts-ignore
        wallets.push({ type: 'petra', provider: window.aptos });
      }
      // @ts-ignore
      if (window.martian) {
        // @ts-ignore
        wallets.push({ type: 'martian', provider: window.martian });
      }
      // @ts-ignore
      if (window.pontem) {
        // @ts-ignore
        wallets.push({ type: 'pontem', provider: window.pontem });
      }
    }
    
    return wallets;
  }

    // Get wallet provider based on type
  private getWalletProvider(walletType: 'petra' | 'martian' | 'pontem'): any {
    // @ts-ignore
    const windowObj = window as any;

    switch (walletType) {
      case 'petra':
        // Check multiple ways Petra can be injected
        // Pattern 1: window.aptos?.isPetra (most common)
        if (windowObj.aptos?.isPetra) {
          return windowObj.aptos;
        }
        // Pattern 2: Direct window.petra
        if (windowObj.petra) {
          return windowObj.petra;
        }
        // Pattern 3: Check if window.aptos exists without other wallets
        if (windowObj.aptos && !windowObj.pontem && !windowObj.martian) {
          return windowObj.aptos;
        }
        // Pattern 4: Check for petra in aptos providers array
        if (windowObj.aptos?.providers?.length > 0) {
          const petraProvider = windowObj.aptos.providers.find((p: any) => p.name === 'Petra' || p.isPetra);
          if (petraProvider) {
            return petraProvider;
          }
        }
        return null;

      case 'pontem':
        return windowObj.pontem || null;

      case 'martian':
        return windowObj.martian || null;

      default:
        return null;
    }
  }

  // Connect to wallet with automatic detection
  async connectWallet(): Promise<string | null> {
    try {
      const availableWallets = this.getAvailableWallets();
      
      if (availableWallets.length === 0) {
        throw new Error('No Aptos wallet detected. Please install Petra, Martian, or Pontem wallet.');
      }

      // Use the first available wallet (can be enhanced for user choice)
      const { type, provider } = availableWallets[0];
      this.currentWalletType = type;

      // Request connection
      const response = await provider.connect();
      return response.address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  // Connect to specific wallet type
  async connectSpecificWallet(walletType: 'petra' | 'martian' | 'pontem'): Promise<string | null> {
    try {
      // Wait a bit for wallet to be injected (some wallets are slow to inject)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const provider = this.getWalletProvider(walletType);
      
      if (!provider) {
        throw new Error(`${walletType} wallet not detected. Please install ${walletType} wallet.`);
      }

      this.currentWalletType = walletType;

      // Request connection
      const response = await provider.connect();
      return response.address;
    } catch (error) {
      console.error(`Failed to connect ${walletType} wallet:`, error);
      throw error; // Re-throw to let the UI handle it
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    try {
      if (this.currentWalletType) {
        const provider = this.getWalletProvider(this.currentWalletType);
        if (provider) {
          await provider.disconnect();
        }
      }
      this.currentWalletType = null;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }

  // Get wallet account
  async getAccount(): Promise<any> {
    try {
      if (window.aptos) {
        return await window.aptos.account();
      }
      return null;
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  // Sign message for authentication
  async signMessage(message: string, nonce: string): Promise<string | null> {
    try {
      if (!window.aptos) {
        throw new Error('Wallet not connected');
      }

      const fullMessage = `${message}\nNonce: ${nonce}`;
      const response = await window.aptos.signMessage({
        message: fullMessage,
        nonce: nonce,
      });

      return response.signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  }

  // Submit transaction
  async signAndSubmitTransaction(transaction: any): Promise<string | null> {
    try {
      if (!window.aptos) {
        throw new Error('Wallet not connected');
      }

      const response = await window.aptos.signAndSubmitTransaction(transaction);
      return response.hash;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      return null;
    }
  }

  // Get account balance
  async getAccountBalance(address: string): Promise<number> {
    try {
      const resources = await this.aptos.getAccountResources({ accountAddress: address });
      const coinResource = resources.find((r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
      return coinResource ? parseInt((coinResource.data as any).coin.value) : 0;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  // Check if wallet is connected
  async isConnected(): Promise<boolean> {
    try {
      if (!window.aptos) return false;
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }
}

// Global wallet instance
export const walletService = WalletService.getInstance();

// Wallet types
declare global {
  interface Window {
    aptos?: {
      connect(): Promise<{ address: string; publicKey: string }>;
      disconnect(): Promise<void>;
      account(): Promise<{ address: string; publicKey: string }>;
      signMessage(options: { message: string; nonce: string }): Promise<{ signature: string }>;
      signAndSubmitTransaction(transaction: any): Promise<{ hash: string }>;
      isConnected(): Promise<boolean>;
    };
  }
}
