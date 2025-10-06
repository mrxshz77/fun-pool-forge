import { Header } from "@/components/Header";
import { TokenLaunchpad } from "@/components/TokenLaunchpad";
import { TokenList } from "@/components/TokenList";
import { TradingInterface } from "@/components/TradingInterface";
import { LiquidityPools } from "@/components/LiquidityPools";
import { LoansManager } from "@/components/LoansManager";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="gradient-text">پلتفرم DeFi نسل بعد</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            توکن بسازید، معامله کنید، نقدینگی مدیریت کنید و از وام‌های فلش و وثیقه‌ای استفاده کنید
          </p>
        </section>

        {/* Token Launchpad */}
        <TokenLaunchpad />

        {/* Token List */}
        <TokenList />

        {/* Trading Interface */}
        <TradingInterface />

        {/* Two Column Layout for Pools and Loans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiquidityPools />
          <LoansManager />
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
          <div className="text-center p-6 glass-card rounded-lg">
            <div className="text-3xl font-bold gradient-text mb-2">$12.5M</div>
            <div className="text-sm text-muted-foreground">حجم کل</div>
          </div>
          <div className="text-center p-6 glass-card rounded-lg">
            <div className="text-3xl font-bold gradient-text mb-2">245</div>
            <div className="text-sm text-muted-foreground">توکن‌های راه‌اندازی شده</div>
          </div>
          <div className="text-center p-6 glass-card rounded-lg">
            <div className="text-3xl font-bold gradient-text mb-2">$8.2M</div>
            <div className="text-sm text-muted-foreground">نقدینگی کل</div>
          </div>
          <div className="text-center p-6 glass-card rounded-lg">
            <div className="text-3xl font-bold gradient-text mb-2">1,234</div>
            <div className="text-sm text-muted-foreground">کاربران فعال</div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 mt-16">
        <div className="container px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 PumpDeFi. همه حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
