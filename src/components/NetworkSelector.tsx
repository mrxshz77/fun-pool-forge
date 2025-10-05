import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Network } from "lucide-react";
import { useNetwork } from "@/contexts/NetworkContext";

type NetworkType = "mainnet" | "devnet" | "testnet";

const getNetworkLabel = (network: NetworkType) => {
  switch (network) {
    case "mainnet":
      return "Mainnet";
    case "devnet":
      return "Devnet";
    case "testnet":
      return "Testnet";
  }
};

export const NetworkSelector = () => {
  const { network, setNetwork } = useNetwork();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Network className="h-4 w-4" />
          {getNetworkLabel(network)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuItem onClick={() => setNetwork("mainnet")}>
          Mainnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setNetwork("devnet")}>
          Devnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setNetwork("testnet")}>
          Testnet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
