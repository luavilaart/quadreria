REVOKE ALL ON public.favorites, public.follows FROM PUBLIC, anon;
REVOKE UPDATE, TRUNCATE, REFERENCES, TRIGGER ON public.favorites, public.follows FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.favorites, public.follows TO authenticated;
GRANT ALL ON public.favorites, public.follows TO service_role;