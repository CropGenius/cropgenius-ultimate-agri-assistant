-- Create AI service logs table
CREATE TABLE IF NOT EXISTS public.ai_service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  service_type TEXT NOT NULL,
  request_data JSONB NOT NULL,
  response_data JSONB,
  tokens_used INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_service_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own logs
CREATE POLICY "Users can view their own AI service logs"
  ON public.ai_service_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create scans table for crop disease detection
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  field_id UUID REFERENCES public.fields(id),
  image_url TEXT NOT NULL,
  crop TEXT NOT NULL,
  disease TEXT NOT NULL,
  confidence DECIMAL NOT NULL,
  severity INTEGER NOT NULL,
  status TEXT DEFAULT 'analyzed',
  economic_impact DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Create policies for scans
CREATE POLICY "Users can view their own scans"
  ON public.scans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans"
  ON public.scans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create yield predictions table
CREATE TABLE IF NOT EXISTS public.yield_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  field_id UUID REFERENCES public.fields(id),
  crop_type TEXT NOT NULL,
  predicted_yield DECIMAL NOT NULL,
  predicted_revenue DECIMAL NOT NULL,
  confidence_score DECIMAL NOT NULL,
  factors JSONB NOT NULL,
  weather_data JSONB,
  soil_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for yield predictions
CREATE POLICY "Users can view their own yield predictions"
  ON public.yield_predictions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own yield predictions"
  ON public.yield_predictions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create AI chat conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for AI conversations
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.ai_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);