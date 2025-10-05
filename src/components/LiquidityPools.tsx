import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export const LiquidityPools = () => {
  const [addAmount, setAddAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");

  const handleAddLiquidity = () => {
    if (!addAmount) {
      toast.error("مقدار را وارد کنید");
      return;
    }
    toast.success("نقدینگی با موفقیت اضافه شد!");
    setAddAmount("");
  };

  const handleRemoveLiquidity = () => {
    if (!removeAmount) {
      toast.error("مقدار را وارد کنید");
      return;
    }
    toast.success("نقدینگی با موفقیت برداشت شد!");
    setRemoveAmount("");
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
                <span className="font-semibold">1,250.00 SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">APY</span>
                <span className="font-semibold text-green-500">24.5%</span>
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

            <Button onClick={handleAddLiquidity} variant="neon" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              افزودن نقدینگی
            </Button>
          </TabsContent>

          <TabsContent value="remove" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-background/30 border border-border/40">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">نقدینگی شما</span>
                <span className="font-semibold">850.00 SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">سود کسب شده</span>
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

            <Button onClick={handleRemoveLiquidity} variant="destructive" className="w-full gap-2">
              <Minus className="h-4 w-4" />
              برداشت نقدینگی
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
