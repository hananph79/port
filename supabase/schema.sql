-- ==============================================================================
-- SUPABASE CMS DATABASE SCHEMA & RLS POLICIES FOR PORTFOLIO WEBSITE
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. PORTFOLIO INFO (hero, about, images, website name)
CREATE TABLE IF NOT EXISTS portfolio_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Upgrade columns if table already exists
ALTER TABLE portfolio_info ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE portfolio_info ADD COLUMN IF NOT EXISTS about_image_url TEXT;

-- 2. PROJECTS (Selected Work & Case Studies)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- 3. EXPERIENCE (timeline jobs & company visual)
CREATE TABLE IF NOT EXISTS experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT 'Present',
  is_current BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'DIGITAL & CONTENT',
  image_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  bullet_points TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade columns if table already exists
ALTER TABLE experience ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE experience ADD COLUMN IF NOT EXISTS category TEXT;

-- 4. ACHIEVEMENTS (stat cards: 1.5M+ views etc.)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  number_value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SKILLS (pill tags, grouped by category)
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'core',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TOOLS (tool grid cards)
CREATE TABLE IF NOT EXISTS tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon_emoji TEXT DEFAULT '⚡',
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CONTACT INFO
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE portfolio_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they already exist (safe idempotent run)
DROP POLICY IF EXISTS "Public can read portfolio_info" ON portfolio_info;
DROP POLICY IF EXISTS "Public can read projects" ON projects;
DROP POLICY IF EXISTS "Public can read experience" ON experience;
DROP POLICY IF EXISTS "Public can read achievements" ON achievements;
DROP POLICY IF EXISTS "Public can read skills" ON skills;
DROP POLICY IF EXISTS "Public can read tools" ON tools;
DROP POLICY IF EXISTS "Public can read contact_info" ON contact_info;

DROP POLICY IF EXISTS "Owner can manage portfolio_info" ON portfolio_info;
DROP POLICY IF EXISTS "Owner can manage projects" ON projects;
DROP POLICY IF EXISTS "Owner can manage experience" ON experience;
DROP POLICY IF EXISTS "Owner can manage achievements" ON achievements;
DROP POLICY IF EXISTS "Owner can manage skills" ON skills;
DROP POLICY IF EXISTS "Owner can manage tools" ON tools;
DROP POLICY IF EXISTS "Owner can manage contact_info" ON contact_info;

-- Public READ policy (anyone can view portfolio data)
CREATE POLICY "Public can read portfolio_info" ON portfolio_info FOR SELECT USING (true);
CREATE POLICY "Public can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public can read experience" ON experience FOR SELECT USING (true);
CREATE POLICY "Public can read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public can read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public can read tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Public can read contact_info" ON contact_info FOR SELECT USING (true);

-- Authenticated user can INSERT/UPDATE/DELETE only their own rows
CREATE POLICY "Owner can manage portfolio_info" ON portfolio_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner can manage projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner can manage experience" ON experience FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner can manage achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner can manage skills" ON skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner can manage tools" ON tools FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner can manage contact_info" ON contact_info FOR ALL USING (auth.uid() = user_id);
