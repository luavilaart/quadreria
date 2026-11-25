CREATE OR REPLACE FUNCTION public.rooms_keep_about_visible() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF array_position(NEW.visible_sections, 'about') IS NULL THEN
    NEW.visible_sections := array_append(coalesce(NEW.visible_sections, ARRAY[]::text[]), 'about');
  END IF;
  RETURN NEW;
END;
$$;
-- Regression checks for missing, already present, and nullable section entries.
DO $$
BEGIN
  IF array_position(ARRAY['work',NULL]::text[], 'about') IS NOT NULL THEN RAISE EXCEPTION 'About must be detected as missing with null entries'; END IF;
  IF array_append(ARRAY['work',NULL]::text[], 'about') IS DISTINCT FROM ARRAY['work',NULL,'about']::text[] THEN RAISE EXCEPTION 'About must be appended without dropping other sections'; END IF;
  IF array_position(ARRAY['work','about','reviews']::text[], 'about') IS DISTINCT FROM 2 THEN RAISE EXCEPTION 'Existing About must not be duplicated'; END IF;
END;
$$;