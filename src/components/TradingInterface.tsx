import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export const TradingInterface = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [fromToken, setFromToken] = useState("SOL");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState("");
  const [priceImpact, setPriceImpact] = useState("0");

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
    const { data } = await supabase
      .from("tokens")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setTokens(data);
      if (data.length > 0 && !toToken) {
        setToToken(data[0].mint_address || "");
      }
    }
  };

  // دریافت کوت از Jupiter Aggregator
  const fetchQuote = async () => {
    if (!fromAmount || !toToken) return;

    try {
      const inputMint = fromToken === "SOL" 
        ? "So11111111111111111111111111111111111111112" 
        : fromToken;
      
      const amount = Math.floor(parseFloat(fromAmount) * 1e9); // SOL has 9 decimals
      
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${toToken}&amount=${amount}&slippageBps=50`
      );
      
      if (!response.ok) throw new Error("خطا در دریافت قیمت");
      
      const data = await response.json();
      
      if (data.outAmount) {
        const outputAmount = (parseInt(data.outAmount) / 1e9).toFixed(6);
        setEstimatedOutput(outputAmount);
        
        if (data.priceImpactPct) {
          setPriceImpact(Math.abs(parseFloat(data.priceImpactPct)).toFixed(2));
        }
      }
    } catch (error) {
      console.error("خطا در دریافت قیمت:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount && toToken) {
        fetchQuote();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fromAmount, toToken, fromToken]);

  const handleSwap = async () => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/auth");
      return;
    }

    if (!publicKey) {
      toast.error("لطفاً کیف پول را متصل کنید");
      return;
    }

    if (!fromAmount || !toToken) {
      toast.error("لطفا تمام فیلدها را پر کنید");
      return;
    }

    setLoading(true);

    try {
      const inputMint = fromToken === "SOL" 
        ? "So11111111111111111111111111111111111111112" 
        : fromToken;
      
      const amount = Math.floor(parseFloat(fromAmount) * 1e9);

      // 1) دریافت کوت
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${toToken}&amount=${amount}&slippageBps=50`
      );
      const quoteData = await quoteResponse.json();

      // 2) دریافت تراکنش swap
      const swapResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
        }),
      });

      const { swapTransaction } = await swapResponse.json();

      // 3) دیسیریالایز و ارسال تراکنش
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const signature = await sendTransaction(transaction, connection);
      
      // 4) تایید تراکنش
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      }, "confirmed");

      // 5) ثبت در دیتابیس
      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "swap",
        amount: parseFloat(fromAmount),
        status: "success",
        signature,
      });

      toast.success("معامله با موفقیت انجام شد!");
      
      setFromAmount("");
      setEstimatedOutput("");
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "خطا در انجام معامله");
    } finally {
      setLoading(false);
    }
  };

  const handleFlipTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(estimatedOutput);
    setEstimatedOutput("");
  };

  return (
    <Card className="glass-card neon-border" id="trade">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          معاملات واقعی
        </CardTitle>
        <CardDescription>
          معامله توکن‌ها با بهترین نرخ از طریق Jupiter Aggregator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <Label>از</Label>
          <div className="flex gap-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL">SOL</SelectItem>
                {tokens.map((token) => (
                  <SelectItem key={token.id} value={token.mint_address || token.id}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFlipTokens}
            className="rounded-full"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label>به</Label>
          <div className="flex gap-2">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="انتخاب توکن" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL">SOL</SelectItem>
                {tokens.map((token) => (
                  <SelectItem key={token.id} value={token.mint_address || token.id}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="0.0"
              value={estimatedOutput}
              readOnly
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Info Box */}
        {estimatedOutput && (
          <div className="p-4 rounded-lg bg-background/30 border border-border/40">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">نرخ تبدیل:</span>
              <span className="font-semibold text-sm">
                1 {fromToken === "SOL" ? "SOL" : tokens.find(t => t.mint_address === fromToken)?.symbol} ≈{" "}
                {estimatedOutput && fromAmount 
                  ? (parseFloat(estimatedOutput) / parseFloat(fromAmount)).toFixed(6)
                  : "0"}{" "}
                {tokens.find(t => t.mint_address === toToken)?.symbol || ""}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">تاثیر قیمت:</span>
              <span className={`font-semibold text-sm ${parseFloat(priceImpact) > 1 ? "text-destructive" : "text-green-500"}`}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Slippage:</span>
              <span className="font-semibold text-sm">0.5%</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSwap} 
          variant="neon" 
          className="w-full gap-2" 
          disabled={loading || !estimatedOutput}
        >
          <ArrowDownUp className="h-4 w-4" />
          {loading ? "در حال معامله..." : "معامله کن"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          قدرت گرفته از Jupiter Aggregator - بهترین نرخ‌ها در سولانا
        </p>
      </CardContent>
    </Card>
  );
};
