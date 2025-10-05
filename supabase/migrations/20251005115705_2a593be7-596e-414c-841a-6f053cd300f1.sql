-- Create tokens table for tracking launched tokens
CREATE TABLE public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  supply BIGINT NOT NULL,
  image_url TEXT,
  mint_address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create liquidity pools table
CREATE TABLE public.liquidity_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  pool_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('flash', 'collateralized')),
  amount DECIMAL(20, 8) NOT NULL,
  collateral_amount DECIMAL(20, 8),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'repaid', 'liquidated')),
  token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  repaid_at TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('launch', 'trade', 'add_liquidity', 'remove_liquidity', 'borrow', 'repay')),
  token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE,
  amount DECIMAL(20, 8),
  signature TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tokens (everyone can view, only creator can create)
CREATE POLICY "Tokens are viewable by everyone"
  ON public.tokens FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own tokens"
  ON public.tokens FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own tokens"
  ON public.tokens FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS Policies for liquidity pools
CREATE POLICY "Users can view all liquidity pools"
  ON public.liquidity_pools FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own liquidity"
  ON public.liquidity_pools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own liquidity"
  ON public.liquidity_pools FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own liquidity"
  ON public.liquidity_pools FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for loans
CREATE POLICY "Users can view their own loans"
  ON public.loans FOR SELECT
  USING (auth.uid() = borrower_id);

CREATE POLICY "Users can create their own loans"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Users can update their own loans"
  ON public.loans FOR UPDATE
  USING (auth.uid() = borrower_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_tokens_updated_at
  BEFORE UPDATE ON public.tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_liquidity_pools_updated_at
  BEFORE UPDATE ON public.liquidity_pools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();