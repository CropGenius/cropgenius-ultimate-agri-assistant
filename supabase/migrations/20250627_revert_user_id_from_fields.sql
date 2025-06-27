-- Revert changes from 20250627_add_user_id_to_fields.sql

-- Drop the trigger
DROP TRIGGER IF EXISTS before_field_insert_populate_user_id ON public.fields;

-- Drop the function
DROP FUNCTION IF EXISTS public.populate_field_user_id();

-- Drop the user_id column from fields table
ALTER TABLE public.fields
DROP COLUMN user_id;

-- Revert policies to use farm_id and auth.uid() for RLS
DROP POLICY IF EXISTS "Fields are viewable by their owners." ON public.fields;
CREATE POLICY "Fields are viewable by users who can view the farm." ON public.fields
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.id = fields.farm_id
    AND (farms.user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can manage their own fields." ON public.fields;
CREATE POLICY "Users can manage fields in their farms." ON public.fields
  USING (EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.id = fields.farm_id
    AND farms.user_id = auth.uid()
  ));