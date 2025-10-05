import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Shield } from "lucide-react";
import { toast } from "sonner";

export const LoansManager = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flashLoanAmount, setFlashLoanAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFlashLoan = async () => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/auth");
      return;
    }

    if (!flashLoanAmount) {
      toast.error("مقدار وام فلش را وارد کنید");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("loans").insert({
        borrower_id: user.id,
        loan_type: "flash",
        amount: parseFloat(flashLoanAmount),
        status: "active",
      });

      if (error) throw error;

      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "borrow",
        amount: parseFloat(flashLoanAmount),
        status: "success",
      });

      toast.success("وام فلش با موفقیت دریافت شد!");
      setFlashLoanAmount("");
    } catch (error: any) {
      toast.error(error.message || "خطا در دریافت وام");
    } finally {
      setLoading(false);
    }
  };

  const handleCollateralLoan = async () => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/auth");
      return;
    }

    if (!collateralAmount || !borrowAmount) {
      toast.error("تمام فیلدها را پر کنید");
      return;
    }

    const ltv = (parseFloat(borrowAmount) / parseFloat(collateralAmount)) * 100;
    if (ltv > 75) {
      toast.error("نسبت LTV نباید بیشتر از 75% باشد");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("loans").insert({
        borrower_id: user.id,
        loan_type: "collateralized",
        amount: parseFloat(borrowAmount),
        collateral_amount: parseFloat(collateralAmount),
        status: "active",
      });

      if (error) throw error;

      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "borrow",
        amount: parseFloat(borrowAmount),
        status: "success",
      });

      toast.success("وام وثیقه‌ای با موفقیت دریافت شد!");
      setCollateralAmount("");
      setBorrowAmount("");
    } catch (error: any) {
      toast.error(error.message || "خطا در دریافت وام");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card neon-border" id="loans">
      <CardHeader>
        <CardTitle className="text-2xl">سیستم وام‌دهی</CardTitle>
        <CardDescription>
          از وام‌های فلش یا وثیقه‌ای برای معاملات خود استفاده کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="flash" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flash" className="gap-2">
              <Zap className="h-4 w-4" />
              وام فلش
            </TabsTrigger>
            <TabsTrigger value="collateral" className="gap-2">
              <Shield className="h-4 w-4" />
              وام وثیقه‌ای
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flash" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h4 className="font-semibold mb-2 text-accent">وام فلش چیست؟</h4>
              <p className="text-sm text-muted-foreground">
                وام‌های فلش بدون نیاز به وثیقه ارائه می‌شوند و باید در همان تراکنش بازپرداخت شوند. برای آربیتراژ و معاملات پیشرفته مناسب است.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>مقدار وام (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={flashLoanAmount}
                  onChange={(e) => setFlashLoanAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-background/30 border border-border/40 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">کارمزد:</span>
                  <span className="font-semibold">0.09%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مبلغ بازپرداخت:</span>
                  <span className="font-semibold">
                    {flashLoanAmount ? (parseFloat(flashLoanAmount) * 1.0009).toFixed(4) : "0.0"} SOL
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleFlashLoan} variant="neon" className="w-full gap-2" disabled={loading}>
              <Zap className="h-4 w-4" />
              {loading ? "در حال دریافت..." : "دریافت وام فلش"}
            </Button>
          </TabsContent>

          <TabsContent value="collateral" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
              <h4 className="font-semibold mb-2 text-secondary">وام وثیقه‌ای</h4>
              <p className="text-sm text-muted-foreground">
                با قرار دادن دارایی خود به عنوان وثیقه، وام دریافت کنید. نسبت LTV حداکثر 75% است.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>مقدار وثیقه (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>مقدار وام (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-background/30 border border-border/40 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">نسبت LTV:</span>
                  <span className="font-semibold">
                    {collateralAmount && borrowAmount
                      ? ((parseFloat(borrowAmount) / parseFloat(collateralAmount)) * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">نرخ بهره سالانه:</span>
                  <span className="font-semibold">8.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">قیمت لیکویید:</span>
                  <span className="font-semibold text-destructive">
                    {collateralAmount ? (parseFloat(collateralAmount) * 0.85).toFixed(2) : "0.0"} SOL
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleCollateralLoan} className="w-full gap-2" disabled={loading}>
              <Shield className="h-4 w-4" />
              {loading ? "در حال دریافت..." : "دریافت وام وثیقه‌ای"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
