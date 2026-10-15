-- Run in the NEW Supabase project's SQL Editor.
-- Creates the backend required by this repository.
-- Existing database content, Auth users/passwords, and uploaded files are NOT
-- copied by this script. Transfer those separately to preserve existing content.
-- Create your admin user in Supabase Authentication > Users.
-- Disable public signups if only you should access the CMS.
-- Update VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then redeploy.
-- When importing old rows, map user_id to your NEW admin user's UUID.
-- Copy existing image files and update their URLs to the new project's URLs.

BEGIN;

CREATE TABLE IF NOT EXISTS public.portfolio_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_name TEXT NOT NULL DEFAULT 'Hanan',
  hero_title TEXT NOT NULL DEFAULT 'Good stories. Real connections. Lasting impact.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Digital Marketing & Content Professional — 3+ years driving 1.5M+ views and 1M+ impressions.',
  hero_badge TEXT DEFAULT 'Open to Opportunities',
  about_title TEXT NOT NULL DEFAULT 'Equal parts strategy & soul.',
  about_content TEXT NOT NULL DEFAULT '',
  about_paragraph_2 TEXT DEFAULT '',
  profile_image_url TEXT,
  hero_image_url TEXT,
  about_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT DEFAULT 'Selected Work',
  description TEXT DEFAULT '',
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  metric_value TEXT,
  metric_label TEXT,
  metric2_value TEXT,
  metric2_label TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT 'Present',
  is_current BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'DIGITAL & CONTENT',
  image_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  bullet_points TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number_value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'core',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_emoji TEXT DEFAULT '⚡',
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.portfolio_info
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS about_image_url TEXT;

ALTER TABLE public.experience
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'DIGITAL & CONTENT';

-- Public portfolio reads; authenticated users manage their own content.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'portfolio_info', 'projects', 'experience',
    'achievements', 'skills', 'tools', 'contact_info'
  ]
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      table_name
    );

    EXECUTE format(
      'GRANT SELECT ON TABLE public.%I TO anon, authenticated',
      table_name
    );

    EXECUTE format(
      'GRANT INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',
      table_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      'Public can read ' || table_name, table_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      'Owner can manage ' || table_name, table_name
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I
       FOR SELECT TO anon, authenticated USING (true)',
      'Public can read ' || table_name, table_name
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I
       FOR ALL TO authenticated
       USING ((SELECT auth.uid()) = user_id)
       WITH CHECK ((SELECT auth.uid()) = user_id)',
      'Owner can manage ' || table_name, table_name
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (user_id)',
      table_name || '_user_id_idx', table_name
    );
  END LOOP;
END;
$$;

-- ImageUpload.tsx uses this public bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images owner insert" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images owner update" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images owner delete" ON storage.objects;

CREATE POLICY "Portfolio images public read"
ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Portfolio images owner insert"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND owner_id = (SELECT auth.uid())::TEXT
);

CREATE POLICY "Portfolio images owner update"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND owner_id = (SELECT auth.uid())::TEXT
)
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND owner_id = (SELECT auth.uid())::TEXT
);

CREATE POLICY "Portfolio images owner delete"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND owner_id = (SELECT auth.uid())::TEXT
);

NOTIFY pgrst, 'reload schema';

COMMIT;
