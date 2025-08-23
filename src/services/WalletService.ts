import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Wallet Service for Aptos Integration
export class WalletService {
  private aptos: Aptos;
  private static instance: WalletService;

  private constructor() {
    const config = new AptosConfig({ 
      network: process.env.REACT_APP_APTOS_NETWORK as Network || Network.TESTNET 
    });
    this.aptos = new Aptos(config);
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Connect to wallet
  async connectWallet(): Promise<string | null> {
    try {
      // Check if wallet is available
      if (typeof window.aptos === 'undefined') {
        throw new Error('Aptos wallet not detected. Please install Petra or Martian wallet.');
      }

      // Request connection
      const response = await window.aptos.connect();
      return response.address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    try {
      if (window.aptos) {
        await window.aptos.disconnect();
      }
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
