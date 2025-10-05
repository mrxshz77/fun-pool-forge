import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton = () => {
  return (
    <WalletMultiButton className="!bg-gradient-to-r !from-primary !to-accent !text-primary-foreground hover:!opacity-90 !shadow-[0_0_30px_hsl(280_90%_65%/0.4)] hover:!shadow-[0_0_40px_hsl(280_90%_65%/0.6)] !transition-all !rounded-md !h-10 !px-4 !py-2 !text-sm !font-medium !border-0" />
  );
};
