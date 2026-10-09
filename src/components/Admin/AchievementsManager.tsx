import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Edit3, Save, X, GripVertical, CheckCircle } from 'lucide-react';

interface Achievement {
  id: string;
  number_value: string;
  label: string;
  description: string;
  sort_order: number;
}

const emptyAchievement = (): Omit<Achievement, 'id' | 'sort_order'> => ({
  number_value: '',
  label: '',
  description: '',
});

const inputClass = 'w-full px-3 py-2.5 rounded-xl border bg-white text-sm transition-all outline-none';
const inputStyle = { borderColor: '#E8DCC8', color: '#1A1209' };

function SortableCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Achievement;
  onEdit: (item: Achievement) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={{ ...style, borderColor: '#E8DCC8', background: 'white' }} className="rounded-xl border p-4 flex items-center gap-3">
      <button {...attributes} {...listeners} type="button" className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
        <GripVertical size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <span className="font-bold text-lg" style={{ color: '#F59E0B' }}>{item.number_value}</span>
        <p className="text-sm font-medium" style={{ color: '#1A1209' }}>{item.label}</p>
        {item.description && <p className="text-xs" style={{ color: '#78716C' }}>{item.description}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onEdit(item)} className="p-2 rounded-lg border transition-all hover:bg-amber-50" style={{ borderColor: '#E8DCC8' }}>
          <Edit3 size={14} style={{ color: '#F59E0B' }} />
        </button>
        <button type="button" onClick={() => onDelete(item.id)} className="p-2 rounded-lg border border-red-100 hover:bg-red-50 transition-all">
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

interface Props {
  userId: string;
  onSaved: () => void;
}

export function AchievementsManager({ userId, onSaved }: Props) {
  const [items, setItems] = useState<Achievement[]>([]);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editForm, setEditForm] = useState(emptyAchievement());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { loadItems(); }, [userId]);

  const loadItems = async () => {
    const { data } = await supabase.from('achievements').select('*').eq('user_id', userId).order('sort_order');
    setItems(data || []);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i.id === active.id);
    const newIdx = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx).map((it, i) => ({ ...it, sort_order: i }));
    setItems(reordered);
    await Promise.all(reordered.map(it => supabase.from('achievements').update({ sort_order: it.sort_order }).eq('id', it.id)));
    onSaved();
  };

  const openNew = () => { setEditForm(emptyAchievement()); setEditing(null); setIsNew(true); };
  const openEdit = (item: Achievement) => {
    setEditForm({ number_value: item.number_value, label: item.label, description: item.description });
    setEditing(item); setIsNew(false);
  };
  const closeForm = () => { setEditing(null); setIsNew(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...editForm, user_id: userId, updated_at: new Date().toISOString() };
      if (isNew) {
        await supabase.from('achievements').insert({ ...payload, sort_order: items.length });
      } else if (editing) {
        await supabase.from('achievements').update(payload).eq('id', editing.id);
      }
      await loadItems();
      setSaved(true); onSaved(); closeForm();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    await supabase.from('achievements').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    onSaved();
  };

  const setF = (key: string, val: string) => setEditForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>Achievement Cards</h2>
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle size={16} /> Saved!</span>}
            <button type="button" onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209' }}>
              <Plus size={15} /> Add Stat
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#78716C' }}>No achievements yet. Add your first stat above.</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map(item => (
                <SortableCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {(editing || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border" style={{ borderColor: '#E8DCC8' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>{isNew ? 'Add Achievement' : 'Edit Achievement'}</h3>
              <button type="button" onClick={closeForm} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={20} style={{ color: '#78716C' }} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Number / Value (e.g. "1.5M+")</label>
                <input required type="text" className={inputClass} style={inputStyle} value={editForm.number_value} onChange={e => setF('number_value', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Label</label>
                <input required type="text" className={inputClass} style={inputStyle} value={editForm.label} onChange={e => setF('label', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Short Description</label>
                <input type="text" className={inputClass} style={inputStyle} value={editForm.description} onChange={e => setF('description', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209' }}>
                  <Save size={15} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={closeForm} className="px-5 py-2.5 rounded-xl text-sm border hover:bg-gray-50 transition-all" style={{ borderColor: '#E8DCC8', color: '#78716C' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
