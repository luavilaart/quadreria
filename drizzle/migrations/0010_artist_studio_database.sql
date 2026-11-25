ALTER TABLE public.pieces
  ADD COLUMN description text NOT NULL DEFAULT '',
  ADD COLUMN compare_at_price numeric DEFAULT NULL CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  ADD COLUMN currency text NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
  ADD COLUMN quantity integer DEFAULT NULL CHECK (quantity IS NULL OR quantity >= 0),
  ADD COLUMN edition_size integer DEFAULT NULL CHECK (edition_size IS NULL OR edition_size > 0),
  ADD COLUMN year integer DEFAULT NULL CHECK (year IS NULL OR year BETWEEN 1900 AND 2100),
  ADD COLUMN sku text NOT NULL DEFAULT '',
  ADD COLUMN width_cm numeric DEFAULT NULL CHECK (width_cm IS NULL OR width_cm >= 0),
  ADD COLUMN height_cm numeric DEFAULT NULL CHECK (height_cm IS NULL OR height_cm >= 0),
  ADD COLUMN depth_cm numeric DEFAULT NULL CHECK (depth_cm IS NULL OR depth_cm >= 0),
  ADD COLUMN weight_kg numeric DEFAULT NULL CHECK (weight_kg IS NULL OR weight_kg >= 0),
  ADD COLUMN ships_from text NOT NULL DEFAULT '',
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.pieces DROP CONSTRAINT pieces_status_check;
ALTER TABLE public.pieces ADD CONSTRAINT pieces_status_check CHECK (status IN ('available','sold','hidden','draft'));
ALTER POLICY public_pieces ON public.pieces USING (
  status NOT IN ('hidden','draft') AND EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = pieces.artist AND r.published)
);
-- This definer bypasses RLS, so apply the same draft privacy as the public piece policy.
CREATE OR REPLACE FUNCTION public.public_piece_favorite_counts()
RETURNS TABLE(piece_id text, favorite_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.id, count(f.piece) FROM public.pieces p
  JOIN public.rooms r ON r.id = p.artist AND r.published
  LEFT JOIN public.favorites f ON f.piece = p.id
  WHERE p.status NOT IN ('hidden','draft') GROUP BY p.id
  UNION ALL
  SELECT s.id, count(f.piece) FROM (VALUES ('p13'::text),('p14'::text)) s(id)
  LEFT JOIN public.favorites f ON f.piece = s.id GROUP BY s.id
$$;
REVOKE ALL ON FUNCTION public.public_piece_favorite_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_piece_favorite_counts() TO anon, authenticated, service_role;

CREATE TABLE public.artist_shipping_zones (
  artist uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone text NOT NULL CHECK (zone IN ('honduras','central_america','us_canada','world')),
  ships boolean NOT NULL DEFAULT true,
  rate numeric DEFAULT NULL CHECK (rate IS NULL OR rate >= 0),
  currency text NOT NULL DEFAULT 'USD',
  PRIMARY KEY (artist, zone)
);
GRANT SELECT ON public.artist_shipping_zones TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.artist_shipping_zones TO authenticated;
GRANT ALL ON public.artist_shipping_zones TO service_role;
ALTER TABLE public.artist_shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY shipping_zones_public_read ON public.artist_shipping_zones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY shipping_zones_owner_insert ON public.artist_shipping_zones FOR INSERT TO authenticated WITH CHECK (artist = auth.uid() AND public.has_role(auth.uid(),'artist'));
CREATE POLICY shipping_zones_owner_update ON public.artist_shipping_zones FOR UPDATE TO authenticated USING (artist = auth.uid() AND public.has_role(auth.uid(),'artist')) WITH CHECK (artist = auth.uid() AND public.has_role(auth.uid(),'artist'));
CREATE POLICY shipping_zones_owner_delete ON public.artist_shipping_zones FOR DELETE TO authenticated USING (artist = auth.uid() AND public.has_role(auth.uid(),'artist'));
COMMENT ON COLUMN public.artist_shipping_zones.rate IS 'NULL with ships = true means free shipping.';
COMMENT ON COLUMN public.pieces.quantity IS 'NULL means made to order or no stock limit.';

ALTER TABLE public.events
  ADD COLUMN venue_name text NOT NULL DEFAULT '',
  ADD COLUMN end_date date DEFAULT NULL CHECK (end_date IS NULL OR end_date >= date),
  ADD COLUMN timezone text NOT NULL DEFAULT 'America/Tegucigalpa',
  ADD COLUMN category text NOT NULL DEFAULT '',
  ADD COLUMN visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','unlisted')),
  ADD COLUMN invite_theme jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.events DROP CONSTRAINT events_status_check;
ALTER TABLE public.events ADD CONSTRAINT events_status_check CHECK (status IN ('published','cancelled','draft'));
COMMENT ON COLUMN public.events.category IS 'Optional taxonomy medium ID; empty string means no category.';
COMMENT ON COLUMN public.events.visibility IS 'Unlisted published events remain publicly readable by ID; listing queries must filter visibility = public.';
-- Ticket readback must not override draft privacy. Preserve cancelled-event readback.
ALTER POLICY ticket_event_details ON public.events USING (
  status <> 'draft' AND EXISTS (SELECT 1 FROM public.tickets t WHERE t.event = events.id AND t.collector = auth.uid())
);

CREATE FUNCTION public.studio_set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.studio_set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.studio_set_updated_at() TO service_role;
CREATE TRIGGER pieces_set_updated_at BEFORE UPDATE ON public.pieces FOR EACH ROW EXECUTE FUNCTION public.studio_set_updated_at();
CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.studio_set_updated_at();

CREATE OR REPLACE FUNCTION public.event_spots(event_id text) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT greatest(0,e.capacity-(SELECT count(*)::integer FROM public.tickets t WHERE t.event=e.id AND t.status IN ('reserved','checked in')))
  FROM public.events e JOIN public.rooms r ON r.id=e.artist
  WHERE e.id=event_id AND e.status <> 'draft' AND ((e.status='published' AND r.published) OR e.artist=auth.uid())
$$;
REVOKE ALL ON FUNCTION public.event_spots(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.event_spots(text) TO anon, authenticated, service_role;
-- Keep the existing collector-only, locked reservation semantics and explicitly require publication.
CREATE OR REPLACE FUNCTION public.reserve_ticket(event_id text) RETURNS public.tickets
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE e public.events; t public.tickets; n integer;
BEGIN
  IF NOT public.has_role(auth.uid(),'collector') THEN RAISE EXCEPTION 'Collector account required'; END IF;
  SELECT * INTO e FROM public.events WHERE id=event_id FOR UPDATE;
  IF NOT FOUND OR e.status<>'published' OR NOT EXISTS(SELECT 1 FROM public.rooms WHERE id=e.artist AND published) THEN RAISE EXCEPTION 'Event unavailable'; END IF;
  IF e.price<>0 THEN RAISE EXCEPTION 'Paid tickets are coming soon'; END IF;
  SELECT * INTO t FROM public.tickets WHERE event=event_id AND collector=auth.uid();
  IF FOUND AND t.status<>'cancelled' THEN RETURN t; END IF;
  SELECT count(*) INTO n FROM public.tickets WHERE event=event_id AND status IN ('reserved','checked in');
  INSERT INTO public.tickets(event,collector,status) VALUES(event_id,auth.uid(),CASE WHEN n>=e.capacity THEN 'waitlist' ELSE 'reserved' END)
  ON CONFLICT(event,collector) DO UPDATE SET status=excluded.status RETURNING * INTO t;
  RETURN t;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_ticket(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_ticket(text) TO authenticated, service_role;

CREATE TABLE public.event_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  visitor text NOT NULL,
  viewed_on date NOT NULL DEFAULT current_date,
  UNIQUE (event, visitor, viewed_on)
);
GRANT ALL ON public.event_views TO service_role;
ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.event_views FROM PUBLIC, anon, authenticated;
CREATE FUNCTION public.record_event_view(event_id text, visitor text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF visitor IS NULL OR visitor !~ '^[A-Za-z0-9_-]{8,64}$' THEN
    RAISE EXCEPTION 'Invalid visitor ID' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.event_views(event,visitor)
  SELECT e.id, record_event_view.visitor FROM public.events e
  JOIN public.rooms r ON r.id = e.artist AND r.published
  WHERE e.id = event_id AND e.status = 'published'
  ON CONFLICT ON CONSTRAINT event_views_event_visitor_viewed_on_key DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.record_event_view(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_event_view(text,text) TO anon, authenticated, service_role;
CREATE FUNCTION public.my_event_stats(event_id text)
RETURNS TABLE(views bigint, unique_visitors bigint, reserved bigint, waitlist bigint, checked_in bigint, cancelled bigint, capacity integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT v.views, v.unique_visitors, t.reserved, t.waitlist, t.checked_in, t.cancelled, e.capacity
  FROM public.events e
  CROSS JOIN LATERAL (
    SELECT count(*) AS views, count(DISTINCT ev.visitor) AS unique_visitors FROM public.event_views ev WHERE ev.event = e.id
  ) v
  CROSS JOIN LATERAL (
    SELECT count(*) FILTER (WHERE tk.status = 'reserved') AS reserved,
      count(*) FILTER (WHERE tk.status = 'waitlist') AS waitlist,
      count(*) FILTER (WHERE tk.status = 'checked in') AS checked_in,
      count(*) FILTER (WHERE tk.status = 'cancelled') AS cancelled
    FROM public.tickets tk WHERE tk.event = e.id
  ) t
  WHERE e.id = event_id AND e.artist = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.my_event_stats(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_event_stats(text) TO authenticated, service_role;

CREATE TABLE public.artist_plans (
  artist uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.artist_plans TO authenticated;
GRANT ALL ON public.artist_plans TO service_role;
ALTER TABLE public.artist_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.artist_plans FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.artist_plans FROM authenticated;
CREATE POLICY artist_plans_owner_read ON public.artist_plans FOR SELECT TO authenticated USING (artist = auth.uid());
-- There is no admin role in this project's two-role model; privileged plan changes use service_role only.
CREATE FUNCTION public.artist_plan(artist_id uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT coalesce((SELECT p.plan FROM public.artist_plans p WHERE p.artist = artist_id),'free')
$$;
REVOKE ALL ON FUNCTION public.artist_plan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.artist_plan(uuid) TO anon, authenticated, service_role;

CREATE FUNCTION public.rooms_keep_about_visible() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NOT ('about' = ANY(coalesce(NEW.visible_sections, ARRAY[]::text[]))) THEN
    NEW.visible_sections := array_append(coalesce(NEW.visible_sections, ARRAY[]::text[]), 'about');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.rooms_keep_about_visible() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rooms_keep_about_visible() TO service_role;
CREATE TRIGGER rooms_keep_about_visible BEFORE INSERT OR UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.rooms_keep_about_visible();

-- Migration-local regression assertions keep this change limited to schema and generated types.
DO $$
BEGIN
  IF public.artist_plan('00000000-0000-0000-0000-000000000000'::uuid) <> 'free' THEN RAISE EXCEPTION 'Missing plans must return free'; END IF;
  IF has_table_privilege('anon','public.event_views','SELECT') OR has_table_privilege('authenticated','public.event_views','SELECT') THEN RAISE EXCEPTION 'Event views must not be directly readable'; END IF;
  IF has_table_privilege('authenticated','public.artist_plans','INSERT') OR has_table_privilege('authenticated','public.artist_plans','UPDATE') OR has_table_privilege('authenticated','public.artist_plans','DELETE') THEN RAISE EXCEPTION 'Browser callers must not change plans'; END IF;
  IF has_function_privilege('anon','public.my_event_stats(text)','EXECUTE') THEN RAISE EXCEPTION 'Event stats must be authenticated'; END IF;
  IF NOT has_function_privilege('anon','public.record_event_view(text,text)','EXECUTE') OR NOT has_function_privilege('authenticated','public.record_event_view(text,text)','EXECUTE') THEN RAISE EXCEPTION 'Visitors must be allowed to record views'; END IF;
END;
$$;