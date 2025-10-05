import { Button } from "@/components/ui/button";
import { NetworkSelector } from "@/components/NetworkSelector";
import { Wallet, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleConnectWallet = async () => {
    try {
      // Simulate wallet connection
      toast.loading("در حال اتصال به کیف پول...");
      
      // In a real implementation, this would connect to an actual wallet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 8);
      setWalletAddress(mockAddress);
      setIsConnected(true);
      
      toast.success("کیف پول با موفقیت متصل شد!");
    } catch (error) {
      toast.error("خطا در اتصال به کیف پول");
    }
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
    toast.success("کیف پول قطع شد");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold gradient-text">PumpDeFi</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#launch" className="text-sm font-medium hover:text-primary transition-colors">
            Launch Token
          </a>
          <a href="#trade" className="text-sm font-medium hover:text-primary transition-colors">
            Trade
          </a>
          <a href="#pools" className="text-sm font-medium hover:text-primary transition-colors">
            Liquidity Pools
          </a>
          <a href="#loans" className="text-sm font-medium hover:text-primary transition-colors">
            Loans
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <NetworkSelector />
          {isConnected ? (
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleDisconnectWallet}
            >
              <Wallet className="h-4 w-4" />
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </Button>
          ) : (
            <Button 
              variant="neon" 
              className="gap-2"
              onClick={handleConnectWallet}
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
