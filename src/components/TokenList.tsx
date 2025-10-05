import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

const mockTokens = [
  {
    id: 1,
    name: "PumpCoin",
    symbol: "PUMP",
    price: "0.00123",
    change: "+45.2%",
    marketCap: "1.2M",
    volume: "450K",
    trending: true,
  },
  {
    id: 2,
    name: "MoonToken",
    symbol: "MOON",
    price: "0.00089",
    change: "+32.8%",
    marketCap: "890K",
    volume: "320K",
    trending: true,
  },
  {
    id: 3,
    name: "DeFiMax",
    symbol: "DMAX",
    price: "0.00156",
    change: "-12.4%",
    marketCap: "2.1M",
    volume: "680K",
    trending: false,
  },
];

export const TokenList = () => {
  return (
    <Card className="glass-card" id="trade">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          توکن‌های ترند
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTokens.map((token) => (
            <div
              key={token.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-background/30 hover:bg-background/50 transition-all hover:border-primary/30"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold">
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold">{token.name}</h3>
                  <p className="text-sm text-muted-foreground">{token.symbol}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8 text-sm">
                <div>
                  <p className="text-muted-foreground">قیمت</p>
                  <p className="font-semibold">${token.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">تغییر</p>
                  <p className={`font-semibold flex items-center gap-1 ${token.trending ? 'text-green-500' : 'text-red-500'}`}>
                    {token.trending ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {token.change}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">حجم</p>
                  <p className="font-semibold">${token.volume}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="gap-2">
                معامله
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
