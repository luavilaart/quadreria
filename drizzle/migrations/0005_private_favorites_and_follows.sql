CREATE TABLE public.favorites (
 collector uuid NOT NULL,
 piece text NOT NULL CHECK (length(piece) > 0),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (collector, piece)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_favorites ON public.favorites FOR ALL TO authenticated USING (collector = auth.uid()) WITH CHECK (collector = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()));
CREATE INDEX favorites_piece_idx ON public.favorites(piece);
CREATE TABLE public.follows (
 collector uuid NOT NULL,
 artist text NOT NULL CHECK (length(artist) > 0),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (collector, artist)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_follows ON public.follows FOR ALL TO authenticated USING (collector = auth.uid()) WITH CHECK (collector = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()));
CREATE INDEX follows_artist_idx ON public.follows(artist);
CREATE FUNCTION public.my_artist_social_counts()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'artist'::public.app_role) THEN
  RAISE EXCEPTION 'Artist account required' USING ERRCODE = '42501';
 END IF;
 SELECT jsonb_build_object(
  'followers', (SELECT count(*) FROM public.follows f JOIN public.rooms r ON r.handle = f.artist WHERE r.id = auth.uid()),
  'pieces', COALESCE((SELECT jsonb_object_agg(p.id, (SELECT count(*) FROM public.favorites f WHERE f.piece = p.id)) FROM public.pieces p WHERE p.artist = auth.uid()), '{}'::jsonb)
 ) INTO result;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.my_artist_social_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_artist_social_counts() TO authenticated, service_role;
COMMENT ON COLUMN public.favorites.piece IS 'Canonical piece ID shared by the sample taxonomy gallery and Cloud pieces.';
COMMENT ON COLUMN public.follows.artist IS 'Canonical artist handle shared by the sample taxonomy gallery and Cloud rooms.';