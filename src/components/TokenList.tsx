import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

export const TokenList = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokens();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("tokens-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
        },
        () => {
          fetchTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card" id="trade">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          توکن‌های راه‌اندازی شده
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">در حال بارگذاری...</div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            هنوز توکنی راه‌اندازی نشده است
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
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
                    <p className="text-muted-foreground">عرضه</p>
                    <p className="font-semibold">{token.supply.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">تاریخ</p>
                    <p className="font-semibold">
                      {new Date(token.created_at).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">وضعیت</p>
                    <p className="font-semibold flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      فعال
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="gap-2">
                  مشاهده
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
