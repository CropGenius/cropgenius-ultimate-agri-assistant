-- Table to track referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_issued BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rewarded_at TIMESTAMPTZ
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Only service role inserts/updates

-- Stored procedure to process a referral and issue credits
CREATE OR REPLACE FUNCTION public.process_referral(
  p_referrer UUID,
  p_referred UUID
) RETURNS void AS $$
DECLARE
  exists_referral BOOLEAN;
BEGIN
  -- Prevent duplicate processing
  SELECT TRUE INTO exists_referral FROM public.referrals WHERE referred_id = p_referred;
  IF exists_referral THEN
    RETURN;
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, reward_issued)
  VALUES (p_referrer, p_referred, TRUE);

  -- Issue credits to referrer
  PERFORM public.restore_user_credits(p_referrer, 10, 'Referral reward');

  -- Issue starter credits to referred user (extra)
  PERFORM public.restore_user_credits(p_referred, 10, 'Referral signup bonus');

  UPDATE public.referrals SET rewarded_at = NOW() WHERE referred_id = p_referred;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 