import { createContext, useContext, useState, ReactNode } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

type NetworkType = "mainnet" | "devnet" | "testnet";

interface NetworkContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  getSolanaNetwork: () => WalletAdapterNetwork;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetwork] = useState<NetworkType>("mainnet");

  const getSolanaNetwork = (): WalletAdapterNetwork => {
    switch (network) {
      case "mainnet":
        return WalletAdapterNetwork.Mainnet;
      case "devnet":
        return WalletAdapterNetwork.Devnet;
      case "testnet":
        return WalletAdapterNetwork.Testnet;
      default:
        return WalletAdapterNetwork.Mainnet;
    }
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork, getSolanaNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};
