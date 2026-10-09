// src/hooks/usePortfolioData.ts
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PORTFOLIO_DATA } from '@/data/defaultPortfolioData';

const CACHE_KEY = 'portfolio_cached_data_v2';
// Fast timeout (1 second): if database is unreachable or offline, immediately fallback
const CONNECTION_TIMEOUT_MS = 1000;

// Check if Supabase env vars are configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return (
    Boolean(url) &&
    Boolean(key) &&
    url !== 'your_supabase_project_url' &&
    key !== 'your_supabase_anon_key' &&
    url.startsWith('https://')
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

const getCachedData = (): AnyData | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage errors
  }
  return null;
};

export function usePortfolioData() {
  const initialCache = getCachedData();

  const [portfolioInfo, setPortfolioInfo] = useState<AnyData>(
    initialCache?.portfolioInfo || DEFAULT_PORTFOLIO_DATA.portfolioInfo
  );
  const [projects, setProjects] = useState<AnyData[]>(
    initialCache?.projects || DEFAULT_PORTFOLIO_DATA.projects
  );
  const [experience, setExperience] = useState<AnyData[]>(
    initialCache?.experience || DEFAULT_PORTFOLIO_DATA.experience
  );
  const [achievements, setAchievements] = useState<AnyData[]>(
    initialCache?.achievements || DEFAULT_PORTFOLIO_DATA.achievements
  );
  const [skills, setSkills] = useState<AnyData[]>(
    initialCache?.skills || DEFAULT_PORTFOLIO_DATA.skills
  );
  const [tools, setTools] = useState<AnyData[]>(
    initialCache?.tools || DEFAULT_PORTFOLIO_DATA.tools
  );
  const [contactInfo, setContactInfo] = useState<AnyData>(
    initialCache?.contactInfo || DEFAULT_PORTFOLIO_DATA.contactInfo
  );

  // If cache exists, show it immediately without skeleton
  const [loading, setLoading] = useState<boolean>(!initialCache);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Helper to merge database info with default fallback values and images
  const mergeInfo = (info: AnyData) => {
    if (!info) return DEFAULT_PORTFOLIO_DATA.portfolioInfo;
    const def = DEFAULT_PORTFOLIO_DATA.portfolioInfo;
    return {
      ...def,
      ...info,
      hero_image_url: info.hero_image_url || info.profile_image_url || def.hero_image_url,
      about_image_url: info.about_image_url || info.profile_image_url || def.about_image_url,
      profile_image_url: info.profile_image_url || def.profile_image_url,
    };
  };

  // Load fallback data immediately so the page is never blank
  const loadFallback = useCallback(() => {
    setPortfolioInfo(DEFAULT_PORTFOLIO_DATA.portfolioInfo);
    setProjects(DEFAULT_PORTFOLIO_DATA.projects);
    setExperience(DEFAULT_PORTFOLIO_DATA.experience);
    setAchievements(DEFAULT_PORTFOLIO_DATA.achievements);
    setSkills(DEFAULT_PORTFOLIO_DATA.skills);
    setTools(DEFAULT_PORTFOLIO_DATA.tools);
    setContactInfo(DEFAULT_PORTFOLIO_DATA.contactInfo);
    setUsingFallback(true);
    setLoading(false);
  }, []);

  const fetchPortfolioData = useCallback(async (supabase: AnyData) => {
    try {
      // 1-second timeout race: prevents hanging on disconnected/paused database
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timed out')), CONNECTION_TIMEOUT_MS)
      );

      const [infoRes, projRes, expRes, achRes, skRes, tlRes, ctRes] = (await Promise.race([
        Promise.all([
          supabase.from('portfolio_info').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('projects').select('*').order('sort_order'),
          supabase.from('experience').select('*').order('sort_order'),
          supabase.from('achievements').select('*').order('sort_order'),
          supabase.from('skills').select('*').order('sort_order'),
          supabase.from('tools').select('*').order('sort_order'),
          supabase.from('contact_info').select('*').limit(1).maybeSingle(),
        ]),
        timeoutPromise,
      ])) as AnyData;

      const hasAnyData =
        Boolean(infoRes.data) ||
        Boolean(projRes.data?.length) ||
        Boolean(expRes.data?.length) ||
        Boolean(achRes.data?.length) ||
        Boolean(skRes.data?.length) ||
        Boolean(tlRes.data?.length) ||
        Boolean(ctRes.data);

      const freshInfo = mergeInfo(infoRes.data);
      const freshProjects = projRes.data && projRes.data.length > 0 ? projRes.data : DEFAULT_PORTFOLIO_DATA.projects;
      const freshExp = expRes.data && expRes.data.length > 0 ? expRes.data : DEFAULT_PORTFOLIO_DATA.experience;
      const freshAch = achRes.data && achRes.data.length > 0 ? achRes.data : DEFAULT_PORTFOLIO_DATA.achievements;
      const freshSkills = skRes.data && skRes.data.length > 0 ? skRes.data : DEFAULT_PORTFOLIO_DATA.skills;
      const freshTools = tlRes.data && tlRes.data.length > 0 ? tlRes.data : DEFAULT_PORTFOLIO_DATA.tools;
      const freshContact = ctRes.data || DEFAULT_PORTFOLIO_DATA.contactInfo;

      setPortfolioInfo(freshInfo);
      setProjects(freshProjects);
      setExperience(freshExp);
      setAchievements(freshAch);
      setSkills(freshSkills);
      setTools(freshTools);
      setContactInfo(freshContact);
      setUsingFallback(!hasAnyData);

      // Save to cache for instant sub-millisecond future visits
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          portfolioInfo: freshInfo,
          projects: freshProjects,
          experience: freshExp,
          achievements: freshAch,
          skills: freshSkills,
          tools: freshTools,
          contactInfo: freshContact,
        }));
      } catch {
        // ignore cache write error
      }
    } catch (err) {
      console.warn('Database offline or timed out, loading default portfolio:', err);
      loadFallback();
    } finally {
      setLoading(false);
    }
  }, [loadFallback]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      loadFallback();
      return;
    }

    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUserId(session?.user?.id ?? null);
      }).catch(() => {});

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setCurrentUserId(session?.user?.id ?? null);
      });

      // Initial fetch
      fetchPortfolioData(supabase);

      // Listen for local updates dispatched from admin panel in same window
      const handleUpdate = () => {
        fetchPortfolioData(supabase);
      };

      // Listen for cross-tab updates via localStorage
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'portfolio-update-timestamp' || e.key === 'portfolio_last_updated') {
          fetchPortfolioData(supabase);
        }
      };

      window.addEventListener('portfolioUpdated', handleUpdate);
      window.addEventListener('storage', handleStorage);

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('portfolioUpdated', handleUpdate);
        window.removeEventListener('storage', handleStorage);
      };
    }).catch(() => {
      loadFallback();
    });
  }, [fetchPortfolioData, loadFallback]);

  return {
    portfolioInfo,
    projects,
    experience,
    achievements,
    skills,
    tools,
    contactInfo,
    loading,
    usingFallback,
    currentUserId,
    refetch: () => {
      if (isSupabaseConfigured()) {
        import('@/integrations/supabase/client').then(({ supabase }) => fetchPortfolioData(supabase));
      } else {
        loadFallback();
      }
    },
  };
}
