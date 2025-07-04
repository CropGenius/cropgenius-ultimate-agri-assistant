-- Add INSERT policy for growth_log table
CREATE POLICY "Allow users to insert their own growth logs"
ON public.growth_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);