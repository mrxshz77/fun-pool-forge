import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Network } from "lucide-react";

type NetworkType = "devnet" | "testnet";

export const NetworkSelector = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("devnet");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Network className="h-4 w-4" />
          {selectedNetwork === "devnet" ? "Devnet" : "Testnet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuItem onClick={() => setSelectedNetwork("devnet")}>
          Devnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedNetwork("testnet")}>
          Testnet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
