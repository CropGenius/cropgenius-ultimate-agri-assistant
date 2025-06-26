-- Create farms table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'farms') THEN
        CREATE TABLE public.farms (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            name TEXT NOT NULL,
            total_area NUMERIC NOT NULL,
            crops TEXT[] NOT NULL,
            planting_date DATE NOT NULL,
            harvest_date DATE NOT NULL,
            primary_goal TEXT NOT NULL,
            primary_pain_point TEXT NOT NULL,
            has_irrigation BOOLEAN NOT NULL,
            has_machinery BOOLEAN NOT NULL,
            has_soil_test BOOLEAN NOT NULL,
            budget_band TEXT NOT NULL,
            preferred_language TEXT NOT NULL,
            whatsapp_number TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable Row Level Security
        ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

        -- Create policy for authenticated users
        CREATE POLICY "Users can view their own farms" ON public.farms
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own farms" ON public.farms
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own farms" ON public.farms
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);

        -- Create trigger to update updated_at
        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_farms_updated_at
            BEFORE UPDATE ON public.farms
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
