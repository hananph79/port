import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/ui/ImageUpload';
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
import { Plus, Trash2, Edit3, Save, X, GripVertical, CheckCircle, Image as ImageIcon } from 'lucide-react';

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  image_url?: string;
  tags: string[];
  metric_value?: string;
  metric_label?: string;
  metric2_value?: string;
  metric2_label?: string;
  sort_order: number;
}

const emptyProject = (): Omit<ProjectItem, 'id' | 'sort_order'> => ({
  title: '',
  subtitle: '',
  category: 'Selected Work',
  description: '',
  image_url: '',
  tags: ['CAMPAIGN', 'CONTENT'],
  metric_value: '',
  metric_label: '',
  metric2_value: '',
  metric2_label: '',
});

const inputClass = 'w-full px-3 py-2.5 rounded-xl border bg-white text-sm transition-all outline-none';
const inputStyle = { borderColor: '#E8DCC8', color: '#1A1209' };

function SortableProject({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectItem;
  onEdit: (p: ProjectItem) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: '#E8DCC8', background: 'white' }}
      className="rounded-xl border p-4 flex items-start gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
        type="button"
      >
        <GripVertical size={18} />
      </button>

      {project.image_url && (
        <div className="w-16 h-16 rounded-xl border border-amber-200 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: '#1A1209' }}>{project.title}</span>
          {project.subtitle && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-800">
              {project.subtitle}
            </span>
          )}
        </div>
        <p className="text-xs mt-1 text-stone-600 line-clamp-2">{project.description}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {project.tags?.map((t, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono">
              {t}
            </span>
          ))}
          {project.metric_value && (
            <span className="text-[11px] font-bold text-amber-600 ml-auto">
              {project.metric_value} {project.metric_label}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(project)}
          className="p-2 rounded-lg border transition-all hover:bg-amber-50 cursor-pointer"
          style={{ borderColor: '#E8DCC8' }}
        >
          <Edit3 size={14} style={{ color: '#F59E0B' }} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(project.id)}
          className="p-2 rounded-lg border border-red-100 hover:bg-red-50 transition-all cursor-pointer"
        >
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

export function ProjectsManager({ userId, onSaved }: Props) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [editForm, setEditForm] = useState(emptyProject());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order');
      if (data) setProjects(data);
    } catch {
      // Table might not exist yet if migration not run
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex(p => p.id === active.id);
    const newIndex = projects.findIndex(p => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex).map((p, idx) => ({ ...p, sort_order: idx }));
    setProjects(reordered);

    await Promise.all(
      reordered.map(p => supabase.from('projects').update({ sort_order: p.sort_order }).eq('id', p.id))
    );
    onSaved();
  };

  const openNew = () => {
    setEditForm(emptyProject());
    setTagInput('8–10 REELS / WEEK, INSTAGRAM, EVENT MARKETING');
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (p: ProjectItem) => {
    setEditForm({
      title: p.title,
      subtitle: p.subtitle,
      category: p.category,
      description: p.description,
      image_url: p.image_url || '',
      tags: p.tags || [],
      metric_value: p.metric_value || '',
      metric_label: p.metric_label || '',
      metric2_value: p.metric2_value || '',
      metric2_label: p.metric2_label || '',
    });
    setTagInput((p.tags || []).join(', '));
    setEditing(p);
    setIsNew(false);
  };

  const closeForm = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedTags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        title: editForm.title,
        subtitle: editForm.subtitle,
        category: editForm.category,
        description: editForm.description,
        image_url: editForm.image_url,
        tags: parsedTags,
        metric_value: editForm.metric_value,
        metric_label: editForm.metric_label,
        metric2_value: editForm.metric2_value,
        metric2_label: editForm.metric2_label,
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        await supabase.from('projects').insert({
          ...payload,
          sort_order: projects.length,
        });
      } else if (editing) {
        await supabase.from('projects').update(payload).eq('id', editing.id);
      }

      await loadProjects();
      closeForm();
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study/project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    onSaved();
  };

  const setF = (key: string, val: string) => setEditForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>Selected Work & Case Studies</h2>
            <p className="text-xs text-stone-500 mt-0.5">Manage the cards displayed in the "01 / Selected work" section.</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle size={16} /> Saved!</span>}
            <button
              type="button"
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209' }}
            >
              <Plus size={15} /> Add Case Study
            </button>
          </div>
        </div>

        {projects.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#78716C' }}>
            No custom projects in database yet. The portfolio is currently showing default case studies. Click "Add Case Study" to customize.
          </p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {projects.map(project => (
                <SortableProject key={project.id} project={project} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Edit/Add Modal */}
      {(editing || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border" style={{ borderColor: '#E8DCC8' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>
                {isNew ? 'Add Case Study' : 'Edit Case Study'}
              </h3>
              <button type="button" onClick={closeForm} className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={20} style={{ color: '#78716C' }} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Main Headline / Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Bringing a school’s stories to life."
                  className={inputClass}
                  style={inputStyle}
                  value={editForm.title}
                  onChange={e => setF('title', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Client / Company</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Inventure Academy"
                    className={inputClass}
                    style={inputStyle}
                    value={editForm.subtitle}
                    onChange={e => setF('subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Category Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 01 / Education & storytelling"
                    className={inputClass}
                    style={inputStyle}
                    value={editForm.category}
                    onChange={e => setF('category', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Description</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Summary of the campaign, strategy, and impact..."
                  value={editForm.description}
                  onChange={e => setF('description', e.target.value)}
                />
              </div>

              {/* Poster / Project Image */}
              <div className="p-4 rounded-xl border border-dashed border-[#E8DCC8] bg-stone-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-stone-900">Case Study Image / Poster (Optional)</span>
                </div>
                <ImageUpload
                  label="Upload Visual Asset"
                  value={editForm.image_url || ''}
                  onChange={url => setF('image_url', url)}
                  folder="projects"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 8–10 REELS / WEEK, INSTAGRAM & YOUTUBE, EVENT AMPLIFICATION"
                  className={inputClass}
                  style={inputStyle}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Primary Metric Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 1M+"
                    className={inputClass}
                    style={inputStyle}
                    value={editForm.metric_value || ''}
                    onChange={e => setF('metric_value', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Primary Metric Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Campaign & event views"
                    className={inputClass}
                    style={inputStyle}
                    value={editForm.metric_label || ''}
                    onChange={e => setF('metric_label', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: '#E8DCC8' }}>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ borderColor: '#E8DCC8', color: '#78716C' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209' }}
                >
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Case Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
