-- Add user_id to fields table

ALTER TABLE public.fields
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update policies to use user_id
DROP POLICY IF EXISTS "Fields are viewable by users who can view the farm." ON public.fields;
CREATE POLICY "Fields are viewable by their owners." ON public.fields
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage fields in their farms." ON public.fields;
CREATE POLICY "Users can manage their own fields." ON public.fields
  USING (auth.uid() = user_id);

-- Create a function to automatically populate user_id when a field is created
CREATE OR REPLACE FUNCTION public.populate_field_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = (
        SELECT user_id
        FROM public.farms
        WHERE id = NEW.farm_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_field_insert_populate_user_id
BEFORE INSERT ON public.fields
FOR EACH ROW
EXECUTE FUNCTION public.populate_field_user_id();
