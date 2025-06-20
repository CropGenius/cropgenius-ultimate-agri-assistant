-- Create user_credits table to store credit balances
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 100 CHECK (balance >= 0),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create credit_transactions table for auditing
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  related_entity_id UUID
);

-- Secure the tables with Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own credit balance
CREATE POLICY "Allow users to read their own credit balance"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to read their own transactions
CREATE POLICY "Allow users to read their own credit transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Function to add credits to a new user
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (new.id, 100); -- Start new users with 100 credits
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created_add_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_credits();

-- Stored procedure for atomically deducting credits
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS void AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Check user's current balance
  SELECT balance INTO current_balance FROM public.user_credits WHERE user_id = p_user_id;

  -- Throw an error if the user has insufficient credits
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Update the user's balance
  UPDATE public.user_credits
  SET balance = balance - p_amount, last_updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record the transaction
  INSERT INTO public.credit_transactions (user_id, amount, description)
  VALUES (p_user_id, -p_amount, p_description);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stored procedure for atomically restoring credits
CREATE OR REPLACE FUNCTION public.restore_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS void AS $$
BEGIN
  -- Update the user's balance
  UPDATE public.user_credits
  SET balance = balance + p_amount, last_updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record the transaction
  INSERT INTO public.credit_transactions (user_id, amount, description)
  VALUES (p_user_id, p_amount, p_description);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 