
-- Create table for storing user memory data
CREATE TABLE IF NOT EXISTS public.user_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_memory UNIQUE (user_id)
);

-- Add RLS policies to protect memory data
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own memory
CREATE POLICY "Users can read their own memory" ON public.user_memory
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert only their own memory
CREATE POLICY "Users can insert their own memory" ON public.user_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own memory
CREATE POLICY "Users can update their own memory" ON public.user_memory
    FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_memory_user_id ON public.user_memory(user_id);

-- Add this table to realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_memory;
