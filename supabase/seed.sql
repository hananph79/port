-- ==============================================================================
-- SUPABASE CMS SEED DATA FOR PORTFOLIO WEBSITE
-- ==============================================================================
-- Run this script in your Supabase SQL Editor AFTER running schema.sql and creating your user.
-- It automatically finds your admin user ID and populates all sections with real resume data.

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Grab your admin account ID automatically
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found in auth.users! Please create a user in Supabase Authentication first.';
    RETURN;
  END IF;

  -- 1. PORTFOLIO INFO (Hero, About, Images)
  DELETE FROM portfolio_info WHERE user_id = v_user_id;
  INSERT INTO portfolio_info (
    user_id,
    website_name,
    hero_title,
    hero_subtitle,
    hero_badge,
    about_title,
    about_content,
    about_paragraph_2,
    profile_image_url,
    hero_image_url,
    about_image_url
  ) VALUES (
    v_user_id,
    'Hanan',
    'Good stories. Real connections. Lasting impact.',
    'Digital Marketing & Content Professional — 3+ years driving 1.5M+ views and 1M+ impressions.',
    'Open to Opportunities',
    'Equal parts strategy & soul.',
    'Digital Marketing & Content Professional driving 1M+ impressions and 1.5M+ content views through strategy-led social media and storytelling.',
    'Over the past 3+ years, I’ve worked across education and global corporate environments, building high-engagement content, growing digital audiences, and executing campaigns that strengthen brand visibility and community engagement.',
    '/WhatsApp%20Image%202026-10-08%20at%2021.43.00.jpeg',
    '/WhatsApp%20Image%202026-10-08%20at%2021.31.24.jpeg',
    '/WhatsApp%20Image%202026-10-08%20at%2021.43.00.jpeg'
  );

  -- 2. PROJECTS (Selected Work & Case Studies)
  DELETE FROM projects WHERE user_id = v_user_id;
  INSERT INTO projects (
    user_id, title, subtitle, category, description, tags, metric_value, metric_label, metric2_value, metric2_label, sort_order
  ) VALUES
  (
    v_user_id,
    'Bringing a school’s stories to life.',
    'Inventure Academy',
    '01 / Education & storytelling',
    'Connecting the everyday energy of Inventure Academy with its digital community, from social strategy to live event coverage.',
    ARRAY['8–10 REELS / WEEK', 'INSTAGRAM & YOUTUBE', 'EVENT AMPLIFICATION'],
    '1M+',
    'Campaign & event views',
    '8–10',
    'Reels produced weekly',
    1
  ),
  (
    v_user_id,
    'Executive presence on a global stage.',
    'Schneider Electric',
    '02 / Corporate & thought leadership',
    'Crafting thought leadership content for senior leaders at Schneider Electric, turning complex ideas into high-reach LinkedIn content.',
    ARRAY['EXECUTIVE LINKEDIN', 'INTERNAL COMMS', 'GLOBAL TEAMS'],
    '1M+',
    'Executive impressions',
    '4,000+',
    'Followers gained',
    2
  );

  -- 3. EXPERIENCE (Timeline)
  DELETE FROM experience WHERE user_id = v_user_id;
  INSERT INTO experience (
    user_id, company, role, start_date, end_date, is_current, category, description, bullet_points, sort_order
  ) VALUES
  (
    v_user_id,
    'Inventure Academy',
    'Marketing Associate — Digital & Content',
    'Aug 2025',
    'Present',
    true,
    'EDUCATION · BRAND STORYTELLING',
    'Leading social media strategy across all platforms.',
    ARRAY[
      'Managed end-to-end social media strategy across Instagram, Facebook, LinkedIn, and YouTube, ensuring brand consistency and strategic messaging.',
      'Produced 8–10 weekly reels and high-frequency content, contributing to 1M+ views across campaigns and events.',
      'Planned and executed digital campaigns aligned with brand visibility goals.',
      'Led event marketing including pre-event, lives, and post-event content amplification.',
      'Developed content calendars and platform-specific strategies.',
      'Created high-impact copy for social media, advertisements, and marketing collateral.',
      'Supported community engagement and audience interaction across platforms.'
    ],
    1
  ),
  (
    v_user_id,
    'Schneider Electric Pvt Ltd',
    'Marketing Specialist — Global',
    'Mar 2024',
    'Jul 2025',
    false,
    'GLOBAL CORPORATE · COMMUNICATIONS',
    'Executive LinkedIn strategy and global communications.',
    ARRAY[
      'Managed executive LinkedIn content strategy, achieving 1M+ impressions and 4,000+ follower growth.',
      'Executed internal communication campaigns across global teams through newsletters and digital platforms.',
      'Planned and delivered internal and external events and product launches.',
      'Created digital content including articles, presentations, and social media content aligned with business objectives.',
      'Collaborated with PR teams and external agencies to deliver communication initiatives.'
    ],
    2
  ),
  (
    v_user_id,
    'Axis Bank Limited',
    'Business Development Intern',
    'Jul 2023',
    'Aug 2023',
    false,
    'BANKING · CLIENT ENGAGEMENT',
    'Generated and qualified leads through outreach.',
    ARRAY[
      'Generated and qualified leads through research and outreach.',
      'Supported onboarding and client engagement process.',
      'Maintained lead databases and assisted the sales team in tracking potential opportunities.'
    ],
    3
  ),
  (
    v_user_id,
    'Nurture Careers',
    'Marketing Executive — Social Media & Communications',
    'Jun 2021',
    'Apr 2022',
    false,
    'CAREER EDUCATION · SOCIAL MEDIA',
    'Social media campaigns and community management.',
    ARRAY[
      'Executed social media campaigns across Instagram, LinkedIn, Facebook, and YouTube.',
      'Increased engagement through structured content and community management.',
      'Monitored campaign performance and optimized strategies using analytics.'
    ],
    4
  );

  -- 4. ACHIEVEMENTS (Impact Stats)
  DELETE FROM achievements WHERE user_id = v_user_id;
  INSERT INTO achievements (user_id, number_value, label, description, sort_order) VALUES
  (v_user_id, '1.5M+', 'Total Content Views', 'Generated across all digital platforms', 1),
  (v_user_id, '1M+', 'Total Impressions', 'Through content strategy and campaigns', 2),
  (v_user_id, '7,000+', 'New Followers', 'Organic social media audience growth', 3),
  (v_user_id, '150+', 'Videos Produced', 'Managed and published across platforms', 4),
  (v_user_id, '300+', 'Digital Assets Created', 'Created across campaigns and brands', 5),
  (v_user_id, '63', 'Team Members Led', 'Graduate Engineering Trainees on content projects', 6);

  -- 5. SKILLS
  DELETE FROM skills WHERE user_id = v_user_id;
  INSERT INTO skills (user_id, name, category, sort_order) VALUES
  (v_user_id, 'Digital Marketing Strategy', 'core', 1),
  (v_user_id, 'Social Media Management', 'core', 2),
  (v_user_id, 'Content Marketing', 'core', 3),
  (v_user_id, 'Copywriting', 'core', 4),
  (v_user_id, 'Campaign Planning', 'core', 5),
  (v_user_id, 'Content Calendar Strategy', 'core', 6),
  (v_user_id, 'Performance Marketing', 'core', 7),
  (v_user_id, 'Community Management', 'core', 8),
  (v_user_id, 'Brand Communication', 'core', 9),
  (v_user_id, 'Meta Ads Manager', 'tools', 10),
  (v_user_id, 'A/B Testing', 'core', 11),
  (v_user_id, 'Campaign Optimization', 'core', 12),
  (v_user_id, 'Google Analytics', 'tools', 13),
  (v_user_id, 'Event Marketing', 'core', 14),
  (v_user_id, 'Stakeholder & Vendor Management', 'core', 15);

  -- 6. TOOLS
  DELETE FROM tools WHERE user_id = v_user_id;
  INSERT INTO tools (user_id, name, icon_emoji, category, sort_order) VALUES
  (v_user_id, 'Meta Ads Manager', '📣', 'marketing', 1),
  (v_user_id, 'Google Analytics', '📊', 'analytics', 2),
  (v_user_id, 'Canva', '🎨', 'design', 3),
  (v_user_id, 'Adobe Premiere Pro', '🎬', 'video', 4),
  (v_user_id, 'Camtasia', '🖥️', 'video', 5),
  (v_user_id, 'Filmora', '🎞️', 'video', 6),
  (v_user_id, 'Clipchamp', '✂️', 'video', 7),
  (v_user_id, 'Sprinklr & HootSuite', '🌐', 'social', 8),
  (v_user_id, 'Outlook & Sharepoint', '📧', 'productivity', 9),
  (v_user_id, 'Microsoft Excel', '📈', 'analytics', 10),
  (v_user_id, 'PowerPoint', '📋', 'productivity', 11),
  (v_user_id, 'MS Word', '📝', 'productivity', 12);

  -- 7. CONTACT INFO
  DELETE FROM contact_info WHERE user_id = v_user_id;
  INSERT INTO contact_info (
    user_id, email, phone, location, linkedin_url, github_url, twitter_url, website_url
  ) VALUES (
    v_user_id,
    'abhanan6262@gmail.com',
    '+91 9797085472',
    'Bengaluru, Karnataka',
    'https://www.linkedin.com/in/peerzada-abdul-hanan-8189aa306',
    '',
    '',
    ''
  );

  RAISE NOTICE 'Database successfully seeded with complete resume data for user %!', v_user_id;
END $$;
