// Debug utility to check wallet availability
export const debugWallets = () => {
  console.log('=== Wallet Debug Info ===');
  
  if (typeof window !== 'undefined') {
    // @ts-ignore
    console.log('window.aptos:', window.aptos);
    // @ts-ignore
    console.log('window.aptos?.isPetra:', window.aptos?.isPetra);
    // @ts-ignore
    console.log('window.martian:', window.martian);
    // @ts-ignore
    console.log('window.pontem:', window.pontem);
    
    // @ts-ignore
    if (window.pontem) {
      // @ts-ignore
      console.log('Pontem methods:', Object.keys(window.pontem));
    }
    
    // @ts-ignore
    if (window.aptos) {
      // @ts-ignore
      console.log('Aptos methods:', Object.keys(window.aptos));
    }
    
    // @ts-ignore
    if (window.martian) {
      // @ts-ignore
      console.log('Martian methods:', Object.keys(window.martian));
    }
  }
  
  console.log('=== End Debug Info ===');
};

// Alternative wallet detection
export const detectWallets = () => {
  const wallets: {type: string, available: boolean, provider: any}[] = [];
  
  if (typeof window !== 'undefined') {
    // Check Petra
    // @ts-ignore
    if (window.aptos?.isPetra) {
      wallets.push({
        type: 'petra',
        available: true,
        // @ts-ignore
        provider: window.aptos
      });
    }
    
    // Check Martian
    // @ts-ignore
    if (window.martian) {
      wallets.push({
        type: 'martian',
        available: true,
        // @ts-ignore
        provider: window.martian
      });
    }
    
    // Check Pontem
    // @ts-ignore
    if (window.pontem) {
      wallets.push({
        type: 'pontem',
        available: true,
        // @ts-ignore
        provider: window.pontem
      });
    }
  }
  
  return wallets;
};
