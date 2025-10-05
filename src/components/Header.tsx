import { NetworkSelector } from "@/components/NetworkSelector";
import { WalletButton } from "@/components/WalletButton";
import { Sparkles } from "lucide-react";

export const Header = () => {
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
          <WalletButton />
        </div>
      </div>
    </header>
  );
};
