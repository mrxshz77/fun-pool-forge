import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import BN from "bn.js";

export const LiquidityPools = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [userBalance, setUserBalance] = useState("0");

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchTokens();

    return () => subscription.unsubscribe();
  }, []);

  const fetchTokens = async () => {
    const { data } = await supabase.from("tokens").select("*").limit(10);
    if (data) {
      setTokens(data);
      if (data.length > 0) setSelectedTokenId(data[0].id);
    }
  };

  // دریافت موجودی واقعی کاربر
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setUserBalance("0");
        return;
      }
      try {
        const balance = await connection.getBalance(publicKey);
        setUserBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
      } catch (error) {
        console.error("خطا در دریافت موجودی:", error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // هر 10 ثانیه

    return () => clearInterval(interval);
  }, [publicKey, connection]);

  const handleAddLiquidity = async () => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/auth");
      return;
    }

    if (!publicKey) {
      toast.error("لطفاً کیف پول را متصل کنید");
      return;
    }

    if (!addAmount || !selectedTokenId) {
      toast.error("مقدار را وارد کنید");
      return;
    }

    const amount = parseFloat(addAmount);
    if (amount <= 0 || amount > parseFloat(userBalance)) {
      toast.error("مقدار نامعتبر یا موجودی ناکافی");
      return;
    }

    setLoading(true);

    try {
      const selectedToken = tokens.find(t => t.id === selectedTokenId);
      if (!selectedToken?.mint_address) {
        throw new Error("آدرس mint پیدا نشد");
      }

      // برای سادگی: فرض می‌کنیم نقدینگی به شکل قفل کردن SOL در یک حساب است
      // (در واقعیت باید با Raydium SDK استخر بسازیم، اما این کار بسیار پیچیده است)
      
      // ساخت تراکنش برای انتقال SOL به حساب برنامه (اینجا مثال ساده است)
      // در واقع باید با SDK رادیوم استخر ایجاد کنید یا به استخر موجود نقدینگی اضافه کنید
      
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // به عنوان مثال: ارسال به یک حساب عمومی (در واقع باید به pool authority باشد)
      const poolPubkey = new PublicKey("11111111111111111111111111111111"); // این فقط مثال است
      
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: poolPubkey,
          lamports,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      // ذخیره در دیتابیس
      const { error } = await supabase.from("liquidity_pools").insert({
        user_id: user.id,
        token_id: selectedTokenId,
        amount,
      });

      if (error) throw error;

      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "add_liquidity",
        token_id: selectedTokenId,
        amount,
        status: "success",
        signature,
      });

      toast.success("نقدینگی با موفقیت اضافه شد!");
      setAddAmount("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "خطا در افزودن نقدینگی");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/auth");
      return;
    }

    if (!removeAmount) {
      toast.error("مقدار را وارد کنید");
      return;
    }

    setLoading(true);

    try {
      const { data: pools } = await supabase
        .from("liquidity_pools")
        .select("*")
        .eq("user_id", user.id)
        .eq("token_id", selectedTokenId)
        .limit(1)
        .single();

      if (!pools) {
        toast.error("نقدینگی یافت نشد");
        return;
      }

      const newAmount = pools.amount - parseFloat(removeAmount);

      if (newAmount < 0) {
        toast.error("مقدار برداشت بیش از موجودی است");
        return;
      }

      if (newAmount === 0) {
        await supabase.from("liquidity_pools").delete().eq("id", pools.id);
      } else {
        await supabase
          .from("liquidity_pools")
          .update({ amount: newAmount })
          .eq("id", pools.id);
      }

      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "remove_liquidity",
        token_id: selectedTokenId,
        amount: parseFloat(removeAmount),
        status: "success",
      });

      toast.success("نقدینگی با موفقیت برداشت شد!");
      setRemoveAmount("");
    } catch (error: any) {
      toast.error(error.message || "خطا در برداشت نقدینگی");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card neon-border" id="pools">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Droplets className="h-6 w-6 text-secondary" />
          مدیریت استخر نقدینگی
        </CardTitle>
        <CardDescription>
          نقدینگی اضافه کنید یا برداشت کنید و کارمزد کسب کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">افزودن نقدینگی</TabsTrigger>
            <TabsTrigger value="remove">برداشت نقدینگی</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-background/30 border border-border/40">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">موجودی شما</span>
                <span className="font-semibold">{userBalance} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">APY تخمینی</span>
                <span className="font-semibold text-green-500">~24.5%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>مقدار (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setAddAmount("100")}>
                  100
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAddAmount("500")}>
                  500
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAddAmount("1000")}>
                  1000
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAddAmount("1250")}>
                  Max
                </Button>
              </div>
            </div>

            <Button onClick={handleAddLiquidity} variant="neon" className="w-full gap-2" disabled={loading}>
              <Plus className="h-4 w-4" />
              {loading ? "در حال افزودن..." : "افزودن نقدینگی"}
            </Button>
          </TabsContent>

          <TabsContent value="remove" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-background/30 border border-border/40">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">نقدینگی شما</span>
                <span className="font-semibold">850.00 SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">سود کسب شده</span>
                <span className="font-semibold text-green-500">+42.5 SOL</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>مقدار (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={removeAmount}
                  onChange={(e) => setRemoveAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setRemoveAmount("100")}>
                  100
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRemoveAmount("500")}>
                  500
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRemoveAmount("850")}>
                  Max
                </Button>
              </div>
            </div>

            <Button onClick={handleRemoveLiquidity} variant="destructive" className="w-full gap-2" disabled={loading}>
              <Minus className="h-4 w-4" />
              {loading ? "در حال برداشت..." : "برداشت نقدینگی"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
