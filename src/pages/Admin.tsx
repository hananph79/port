import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioInfoForm } from '@/components/Admin/PortfolioInfoForm';
import { ProjectsManager } from '@/components/Admin/ProjectsManager';
import { ExperienceManager } from '@/components/Admin/ExperienceManager';
import { AchievementsManager } from '@/components/Admin/AchievementsManager';
import { SkillsManager } from '@/components/Admin/SkillsManager';
import { ToolsManager } from '@/components/Admin/ToolsManager';
import { ContactInfoForm } from '@/components/Admin/ContactInfoForm';
import {
  LogOut,
  Eye,
  LayoutDashboard,
  Briefcase,
  Award,
  Wrench,
  Sparkles,
  Mail,
  FolderKanban,
} from 'lucide-react';

const TABS = [
  { id: 'portfolio', label: 'Hero & About', icon: LayoutDashboard },
  { id: 'projects', label: 'Selected Work', icon: FolderKanban },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export default function Admin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Call this after every save to trigger portfolio refresh
  const triggerRefresh = () => {
    window.dispatchEvent(new CustomEvent('portfolioUpdated'));
    localStorage.setItem('portfolio-update-timestamp', Date.now().toString());
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] text-sm text-[#78716C]">
        Verifying administrator session...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Admin Header */}
      <header className="bg-white border-b border-[#E8DCC8] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
              />
              <h1 className="font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>
                Portfolio CMS Studio
              </h1>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">{user.email}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 py-2 px-4 text-xs font-semibold rounded-xl border border-[#E8DCC8] bg-white hover:bg-[#FAFAF7] text-[#1A1209] transition-all cursor-pointer"
            >
              <Eye size={15} className="text-[#F59E0B]" /> View Live Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 px-4 text-xs font-semibold rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Tab Navigation */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 mb-8 bg-white p-2 rounded-2xl border border-[#E8DCC8]"
          style={{ boxShadow: '0 4px 20px rgba(26,18,9,0.04)' }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'shadow-md text-[#1A1209]'
                    : 'text-[#78716C] hover:text-[#1A1209] hover:bg-[#FAFAF7]'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                        boxShadow: '0 4px 14px rgba(245,158,11,0.25)',
                      }
                    : {}
                }
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="transition-all">
          {activeTab === 'portfolio' && (
            <PortfolioInfoForm userId={user.id} onSaved={triggerRefresh} />
          )}
          {activeTab === 'projects' && (
            <ProjectsManager userId={user.id} onSaved={triggerRefresh} />
          )}
          {activeTab === 'experience' && (
            <ExperienceManager userId={user.id} onSaved={triggerRefresh} />
          )}
          {activeTab === 'achievements' && (
            <AchievementsManager userId={user.id} onSaved={triggerRefresh} />
          )}
          {activeTab === 'skills' && (
            <SkillsManager userId={user.id} onSaved={triggerRefresh} />
          )}
          {activeTab === 'tools' && (
            <ToolsManager userId={user.id} onSaved={triggerRefresh} />
          )}
          {activeTab === 'contact' && (
            <ContactInfoForm userId={user.id} onSaved={triggerRefresh} />
          )}
        </div>
      </main>
    </div>
  );
}
