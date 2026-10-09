import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Save, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_PORTFOLIO_DATA } from '@/data/defaultPortfolioData';

interface Props {
  userId: string;
  onSaved: () => void;
}

const inputClass = `w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all outline-none`;
const inputStyle = { borderColor: '#E8DCC8', color: '#1A1209' };

export function PortfolioInfoForm({ userId, onSaved }: Props) {
  const defaults = DEFAULT_PORTFOLIO_DATA.portfolioInfo;
  const [form, setForm] = useState({
    website_name: defaults.website_name,
    hero_title: defaults.hero_title,
    hero_subtitle: defaults.hero_subtitle,
    hero_badge: defaults.hero_badge,
    about_title: defaults.about_title,
    about_content: defaults.about_content,
    about_paragraph_2: defaults.about_paragraph_2,
    profile_image_url: defaults.profile_image_url,
    hero_image_url: defaults.hero_image_url,
    about_image_url: defaults.about_image_url,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('portfolio_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) {
        setExistingId(data.id);
        setForm({
          website_name: data.website_name || defaults.website_name,
          hero_title: data.hero_title || defaults.hero_title,
          hero_subtitle: data.hero_subtitle || defaults.hero_subtitle,
          hero_badge: data.hero_badge || defaults.hero_badge,
          about_title: data.about_title || defaults.about_title,
          about_content: data.about_content || defaults.about_content,
          about_paragraph_2: data.about_paragraph_2 || defaults.about_paragraph_2,
          profile_image_url: data.profile_image_url || defaults.profile_image_url,
          hero_image_url: data.hero_image_url || data.profile_image_url || defaults.hero_image_url,
          about_image_url: data.about_image_url || data.profile_image_url || defaults.about_image_url,
        });
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        // keep profile_image_url synced with hero_image_url
        profile_image_url: form.hero_image_url || form.profile_image_url,
        user_id: userId,
        updated_at: new Date().toISOString(),
      };
      if (existingId) {
        await supabase.from('portfolio_info').update(payload).eq('id', existingId);
      } else {
        const { data } = await supabase.from('portfolio_info').insert(payload).select().single();
        if (data) setExistingId(data.id);
      }
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: string, placeholder = '', textarea = false) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>{label}</label>
      {textarea ? (
        <textarea
          rows={4}
          className={inputClass}
          style={inputStyle}
          value={(form as Record<string, string>)[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
        />
      ) : (
        <input
          type="text"
          className={inputClass}
          style={inputStyle}
          value={(form as Record<string, string>)[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Site & Hero */}
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
        <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>Site & Hero Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {field('Website / Brand Name', 'website_name', 'Hanan')}
          {field('Hero Badge Text', 'hero_badge', 'Open to Opportunities')}
          <div className="md:col-span-2">{field('Hero Headline', 'hero_title', 'Good stories. Real connections.')}</div>
          <div className="md:col-span-2">{field('Hero Subtitle / Tagline', 'hero_subtitle', 'Digital Marketing & Content Professional...', true)}</div>
        </div>

        <div className="pt-4 border-t border-[#E8DCC8]">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={18} className="text-amber-500" />
            <h3 className="font-semibold text-sm text-stone-900">Hero Main Portrait Image</h3>
          </div>
          <p className="text-xs text-stone-500 mb-3">
            Displays inside the main golden framed portrait on the hero landing view.
          </p>
          <ImageUpload
            label="Upload Hero Portrait"
            value={form.hero_image_url}
            onChange={url => set('hero_image_url', url)}
            folder="hero"
          />
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
        <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>About Section</h2>
        <div className="space-y-4 mb-4">
          {field('About Section Heading', 'about_title', 'Equal parts strategy & soul.')}
          {field('About Paragraph 1', 'about_content', 'Your about text here...', true)}
          {field('About Paragraph 2', 'about_paragraph_2', 'Second paragraph...', true)}
        </div>

        <div className="pt-4 border-t border-[#E8DCC8]">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={18} className="text-amber-500" />
            <h3 className="font-semibold text-sm text-stone-900">About Section Monogram Image</h3>
          </div>
          <p className="text-xs text-stone-500 mb-3">
            Displays in the "The Person Behind The Stories" visual card in the About section.
          </p>
          <ImageUpload
            label="Upload About Photo"
            value={form.about_image_url}
            onChange={url => set('about_image_url', url)}
            folder="about"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
        >
          <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Site & Hero'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle size={16} /> Saved & published to live portfolio!
          </span>
        )}
      </div>
    </form>
  );
}
