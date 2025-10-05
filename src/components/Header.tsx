import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkSelector } from "@/components/NetworkSelector";
import { WalletButton } from "@/components/WalletButton";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "خروج موفق",
      description: "با موفقیت از حساب خود خارج شدید",
    });
    navigate("/auth");
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
          {user ? (
            <>
              <WalletButton />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 ml-2" />
                خروج
              </Button>
            </>
          ) : (
            <Button variant="neon" onClick={() => navigate("/auth")}>
              ورود / ثبت‌نام
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
