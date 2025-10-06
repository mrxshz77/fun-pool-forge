import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Image } from "lucide-react";
import { toast } from "sonner";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";

export const TokenLaunchpad = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    supply: "",
    imageUrl: "",
  });

  // Wallet & Connection
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

    return () => subscription.unsubscribe();
  }, []);

  const handleLaunch = async () => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/auth");
      return;
    }

    if (!publicKey) {
      toast.error("لطفاً ابتدا کیف پول سولانا را متصل کنید");
      return;
    }

    if (!formData.name || !formData.symbol || !formData.supply) {
      toast.error("لطفا تمام فیلدهای اجباری را پر کنید");
      return;
    }

    // حداقل اعتبارسنجی نماد و تعداد
    const symbol = formData.symbol.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,10}$/.test(symbol)) {
      toast.error("نماد باید 2 تا 10 کاراکتر انگلیسی/عددی باشد");
      return;
    }

    const supplyStr = formData.supply.trim();
    if (!/^\d+$/.test(supplyStr)) {
      toast.error("تعداد کل باید عدد مثبت باشد");
      return;
    }

    setLoading(true);

    try {
      // 1) ساخت مینت واقعی روی شبکه انتخاب‌شده
      const decimals = 9;
      const mintKeypair = Keypair.generate();
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      const mint = mintKeypair.publicKey;
      const owner = publicKey;
      const ata = await getAssociatedTokenAddress(mint, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

      // مقدار برحسب کوچک‌ترین واحد
      const raw = BigInt(supplyStr);
      const amount = raw * (BigInt(10) ** BigInt(decimals));

      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: owner,
          newAccountPubkey: mint,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mint, decimals, owner, owner, TOKEN_PROGRAM_ID),
        createAssociatedTokenAccountInstruction(owner, ata, owner, mint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
        createMintToInstruction(mint, ata, owner, amount)
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = owner;

      // امضای محلی حساب مینت + امضای کیف‌پول کاربر
      tx.partialSign(mintKeypair);
      const signature = await sendTransaction(tx, connection, { skipPreflight: false });
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

      // 2) ذخیره در پایگاه‌داده
      const { data, error } = await supabase
        .from("tokens")
        .insert({
          creator_id: user.id,
          name: formData.name.trim(),
          symbol,
          description: formData.description.trim(),
          supply: parseInt(supplyStr, 10),
          image_url: formData.imageUrl.trim() || null,
          mint_address: mint.toBase58(),
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "launch",
        token_id: data.id,
        amount: parseInt(supplyStr, 10),
        status: "success",
        signature,
      });

      toast.success("توکن شما روی شبکه ایجاد شد و ثبت گردید!");

      setFormData({
        name: "",
        symbol: "",
        description: "",
        supply: "",
        imageUrl: "",
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "خطا در ایجاد توکن واقعی روی شبکه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card neon-border" id="launch">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          راه‌اندازی توکن جدید
        </CardTitle>
        <CardDescription>توکن خود را در چند دقیقه ایجاد و راه‌اندازی کنید</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">نام توکن</Label>
            <Input
              id="name"
              placeholder="My Token"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symbol">نماد</Label>
            <Input
              id="symbol"
              placeholder="TKN"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">توضیحات</Label>
          <Textarea
            id="description"
            placeholder="توضیحات توکن خود را وارد کنید..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-background/50 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supply">تعداد کل</Label>
            <Input
              id="supply"
              type="number"
              placeholder="1000000"
              value={formData.supply}
              onChange={(e) => setFormData({ ...formData, supply: e.target.value })}
              className="bg-background/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">آدرس تصویر</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="bg-background/50"
              />
              <Button variant="outline" size="icon">
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={handleLaunch} variant="neon" className="w-full" size="lg" disabled={loading}>
          <Rocket className="h-4 w-4 mr-2" />
          {loading ? "در حال ایجاد..." : "راه‌اندازی توکن"}
        </Button>
      </CardContent>
    </Card>
  );
};
