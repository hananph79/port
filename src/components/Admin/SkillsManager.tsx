import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  sort_order: number;
}

const CATEGORIES = [
  { value: 'core', label: 'Core Skills' },
  { value: 'tools', label: 'Tools & Platforms' },
  { value: 'soft', label: 'Soft Skills' },
];

const inputClass = 'px-3 py-2.5 rounded-xl border bg-white text-sm transition-all outline-none';
const inputStyle = { borderColor: '#E8DCC8', color: '#1A1209' };

interface Props {
  userId: string;
  onSaved: () => void;
}

export function SkillsManager({ userId, onSaved }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('core');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadSkills(); }, [userId]);

  const loadSkills = async () => {
    const { data } = await supabase.from('skills').select('*').eq('user_id', userId).order('sort_order');
    setSkills(data || []);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: newName.trim(),
        category: newCat,
        user_id: userId,
        sort_order: skills.length,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('skills').insert(payload);
      await loadSkills();
      setNewName('');
      setSaved(true); onSaved();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    setSkills(prev => prev.filter(s => s.id !== id));
    onSaved();
  };

  const grouped = CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat.value] = skills.filter(s => s.category === cat.value);
    return acc;
  }, {});

  // Also catch any skills with categories not in our predefined list
  const otherCategories = [...new Set(skills.map(s => s.category).filter(c => !CATEGORIES.find(cat => cat.value === c)))];

  return (
    <div className="space-y-6">
      {/* Add skill form */}
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>Skills</h2>
          {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle size={16} /> Saved!</span>}
        </div>
        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <input
            type="text"
            className={inputClass + ' flex-1 min-w-48'}
            style={inputStyle}
            placeholder="Skill name (e.g. Digital Marketing Strategy)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
          />
          <select
            className={inputClass}
            style={{ ...inputStyle, minWidth: '160px' }}
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209' }}
          >
            <Plus size={15} /> Add Skill
          </button>
        </form>
      </div>

      {/* Skills grouped by category */}
      {[...CATEGORIES, ...otherCategories.map(c => ({ value: c, label: c }))].map(cat => {
        const catSkills = grouped[cat.value] || skills.filter(s => s.category === cat.value);
        if (!catSkills.length) return null;
        return (
          <div key={cat.value} className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
            <h3 className="font-semibold text-base mb-4" style={{ color: '#1A1209' }}>{cat.label}</h3>
            <div className="flex flex-wrap gap-2">
              {catSkills.map(skill => (
                <div
                  key={skill.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border group"
                  style={{ borderColor: '#E8DCC8', background: '#FAFAF7', color: '#1A1209' }}
                >
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(skill.id)}
                    className="opacity-40 hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {skills.length === 0 && (
        <div className="bg-white rounded-2xl p-6 border text-center" style={{ borderColor: '#E8DCC8', color: '#78716C' }}>
          <p className="text-sm">No skills yet. Add your first skill above.</p>
        </div>
      )}
    </div>
  );
}
