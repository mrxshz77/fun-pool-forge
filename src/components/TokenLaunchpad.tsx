import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Image } from "lucide-react";
import { toast } from "sonner";

export const TokenLaunchpad = () => {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    supply: "",
    imageUrl: "",
  });

  const handleLaunch = () => {
    if (!formData.name || !formData.symbol || !formData.supply) {
      toast.error("لطفا تمام فیلدهای اجباری را پر کنید");
      return;
    }
    toast.success("توکن شما با موفقیت ایجاد شد!");
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

        <Button onClick={handleLaunch} variant="neon" className="w-full" size="lg">
          <Rocket className="h-4 w-4 mr-2" />
          راه‌اندازی توکن
        </Button>
      </CardContent>
    </Card>
  );
};
