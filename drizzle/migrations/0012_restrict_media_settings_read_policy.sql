DROP POLICY IF EXISTS media_settings_read ON public.media_settings;
CREATE POLICY media_settings_read
  ON public.media_settings
  FOR SELECT
  TO anon, authenticated
  USING (id = 'free');