ALTER TABLE public.taxonomy DROP CONSTRAINT taxonomy_kind_check;
ALTER TABLE public.taxonomy ADD CONSTRAINT taxonomy_kind_check CHECK (kind IN ('medium','specialty','service'));
ALTER TABLE public.services ADD COLUMN service_type_id text DEFAULT NULL REFERENCES public.taxonomy(id);
CREATE OR REPLACE FUNCTION public.validate_service_type() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.service_type_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.taxonomy WHERE id = NEW.service_type_id AND kind = 'service') THEN
    RAISE EXCEPTION 'Choose a service type';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER services_validate_type BEFORE INSERT OR UPDATE OF service_type_id ON public.services FOR EACH ROW EXECUTE FUNCTION public.validate_service_type();
COMMENT ON COLUMN public.services.service_type_id IS 'Canonical service taxonomy entry; its parent links to the relevant medium or specialty.';