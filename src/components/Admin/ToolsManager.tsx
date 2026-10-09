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
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, CheckCircle } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  icon_emoji: string;
  sort_order: number;
}

const inputClass = 'px-3 py-2.5 rounded-xl border bg-white text-sm transition-all outline-none';
const inputStyle = { borderColor: '#E8DCC8', color: '#1A1209' };

function SortableTool({ tool, onDelete }: { tool: Tool; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tool.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: '#E8DCC8', background: 'white' }}
      className="rounded-xl border p-3 flex items-center gap-3 group"
    >
      <button {...attributes} {...listeners} type="button" className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
        <GripVertical size={16} />
      </button>
      <span className="text-2xl">{tool.icon_emoji}</span>
      <span className="flex-1 text-sm font-medium truncate" style={{ color: '#1A1209' }}>{tool.name}</span>
      <button
        type="button"
        onClick={() => onDelete(tool.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg border-red-100 border hover:bg-red-50 transition-all"
      >
        <Trash2 size={13} className="text-red-400" />
      </button>
    </div>
  );
}

interface Props {
  userId: string;
  onSaved: () => void;
}

export function ToolsManager({ userId, onSaved }: Props) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('⚡');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { loadTools(); }, [userId]);

  const loadTools = async () => {
    const { data } = await supabase.from('tools').select('*').eq('user_id', userId).order('sort_order');
    setTools(data || []);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = tools.findIndex(t => t.id === active.id);
    const newIdx = tools.findIndex(t => t.id === over.id);
    const reordered = arrayMove(tools, oldIdx, newIdx).map((t, i) => ({ ...t, sort_order: i }));
    setTools(reordered);
    await Promise.all(reordered.map(t => supabase.from('tools').update({ sort_order: t.sort_order }).eq('id', t.id)));
    onSaved();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await supabase.from('tools').insert({
        name: newName.trim(),
        icon_emoji: newEmoji,
        user_id: userId,
        sort_order: tools.length,
        updated_at: new Date().toISOString(),
      });
      await loadTools();
      setNewName(''); setNewEmoji('⚡');
      setSaved(true); onSaved();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tool?')) return;
    await supabase.from('tools').delete().eq('id', id);
    setTools(prev => prev.filter(t => t.id !== id));
    onSaved();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>Tools & Platforms</h2>
          {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle size={16} /> Saved!</span>}
        </div>

        <form onSubmit={handleAdd} className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            className={inputClass}
            style={{ ...inputStyle, width: '60px', textAlign: 'center', fontSize: '20px' }}
            value={newEmoji}
            onChange={e => setNewEmoji(e.target.value)}
            placeholder="⚡"
          />
          <input
            type="text"
            className={inputClass + ' flex-1 min-w-48'}
            style={inputStyle}
            placeholder="Tool name (e.g. Canva)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            type="submit"
            disabled={saving || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209' }}
          >
            <Plus size={15} /> Add Tool
          </button>
        </form>

        {tools.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: '#78716C' }}>No tools yet. Add your first tool above.</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tools.map(t => t.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tools.map(tool => (
                <SortableTool key={tool.id} tool={tool} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
