import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, CheckCircle, Mail, Phone, MapPin, Linkedin, Globe, Twitter, Github } from 'lucide-react';
import { DEFAULT_PORTFOLIO_DATA } from '@/data/defaultPortfolioData';

interface Props {
  userId: string;
  onSaved: () => void;
}

const inputClass = `w-full px-4 py-3 rounded-xl border bg-white text-sm transition-all outline-none`;
const inputStyle = { borderColor: '#E8DCC8', color: '#1A1209' };

export function ContactInfoForm({ userId, onSaved }: Props) {
  const defaults = DEFAULT_PORTFOLIO_DATA.contactInfo;
  const [form, setForm] = useState({
    email: defaults.email || '',
    phone: defaults.phone || '',
    location: defaults.location || '',
    linkedin_url: defaults.linkedin_url || '',
    github_url: defaults.github_url || '',
    twitter_url: defaults.twitter_url || '',
    website_url: defaults.website_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('contact_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setExistingId(data.id);
        setForm({
          email: data.email || defaults.email,
          phone: data.phone || defaults.phone,
          location: data.location || defaults.location,
          linkedin_url: data.linkedin_url || defaults.linkedin_url,
          github_url: data.github_url || defaults.github_url,
          twitter_url: data.twitter_url || defaults.twitter_url,
          website_url: data.website_url || defaults.website_url,
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
      const payload = { ...form, user_id: userId, updated_at: new Date().toISOString() };
      if (existingId) {
        await supabase.from('contact_info').update(payload).eq('id', existingId);
      } else {
        const { data } = await supabase.from('contact_info').insert(payload).select().single();
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

  const field = (label: string, key: string, placeholder = '', icon: React.ReactNode, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium mb-1.5 flex items-center gap-2" style={{ color: '#1A1209' }}>
        <span className="text-gray-400">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        className={inputClass}
        style={inputStyle}
        value={(form as Record<string, string>)[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        onFocus={e => {
          e.target.style.borderColor = '#F59E0B';
          e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#E8DCC8';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      <div
        className="rounded-2xl border p-6 bg-white space-y-5"
        style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,0.06)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#E8DCC8' }}>
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>
              Contact & Social Channels
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Updates your contact information, resume links, and social channel handles across the entire portfolio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Email Address', 'email', 'abhanan6262@gmail.com', <Mail size={16} />, 'email', true)}
          {field('Phone Number', 'phone', '+91 9797085472', <Phone size={16} />, 'tel')}
        </div>

        {field('Location', 'location', 'Bengaluru, Karnataka', <MapPin size={16} />)}

        <div className="pt-2">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Online Profiles & Links</h3>
          <div className="space-y-4">
            {field('LinkedIn Profile URL', 'linkedin_url', 'https://linkedin.com/in/...', <Linkedin size={16} />, 'url')}
            {field('GitHub Profile URL (Optional)', 'github_url', 'https://github.com/...', <Github size={16} />, 'url')}
            {field('Twitter / X URL (Optional)', 'twitter_url', 'https://x.com/...', <Twitter size={16} />, 'url')}
            {field('Personal Website URL (Optional)', 'website_url', 'https://...', <Globe size={16} />, 'url')}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #F97316)',
            color: '#1A1209',
            boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
          }}
        >
          <Save size={16} />
          {saving ? 'Saving Changes...' : 'Save Contact Info'}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle size={16} /> Saved & published to live portfolio!
          </span>
        )}
      </div>
    </form>
  );
}
