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

interface Job {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  category?: string;
  image_url?: string;
  bullet_points: string[];
  sort_order: number;
}

const emptyJob = (): Omit<Job, 'id' | 'sort_order'> => ({
  company: '',
  role: '',
  start_date: '',
  end_date: 'Present',
  is_current: false,
  category: 'DIGITAL & CONTENT',
  image_url: '',
  bullet_points: [''],
});

const inputClass = 'w-full px-3 py-2.5 rounded-xl border bg-white text-sm transition-all outline-none';
const inputStyle = { borderColor: '#E8DCC8', color: '#1A1209' };

function SortableJob({
  job,
  onEdit,
  onDelete,
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
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

      {job.image_url && (
        <div className="w-12 h-12 rounded-lg border border-amber-200 overflow-hidden shrink-0 bg-stone-50 flex items-center justify-center">
          <img src={job.image_url} alt={job.company} className="w-full h-full object-contain p-1" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: '#1A1209' }}>{job.company}</span>
          {job.is_current && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEF3C7', color: '#B45309' }}>Current</span>
          )}
          {job.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono">
              {job.category}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>{job.role}</p>
        <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>{job.start_date} — {job.end_date}</p>
        <p className="text-xs mt-1" style={{ color: '#78716C' }}>{job.bullet_points.length} bullet point{job.bullet_points.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(job)}
          className="p-2 rounded-lg border transition-all hover:bg-amber-50 cursor-pointer"
          style={{ borderColor: '#E8DCC8' }}
        >
          <Edit3 size={14} style={{ color: '#F59E0B' }} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(job.id)}
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

export function ExperienceManager({ userId, onSaved }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editing, setEditing] = useState<Job | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editForm, setEditForm] = useState(emptyJob());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadJobs = async () => {
    const { data } = await supabase
      .from('experience')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order');
    if (data) setJobs(data);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = jobs.findIndex(j => j.id === active.id);
    const newIndex = jobs.findIndex(j => j.id === over.id);
    const reordered = arrayMove(jobs, oldIndex, newIndex).map((j, idx) => ({ ...j, sort_order: idx }));
    setJobs(reordered);

    // Save sort_order to DB
    await Promise.all(
      reordered.map(j => supabase.from('experience').update({ sort_order: j.sort_order }).eq('id', j.id))
    );
    onSaved();
  };

  const openNew = () => {
    setEditForm(emptyJob());
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (job: Job) => {
    setEditForm({
      company: job.company,
      role: job.role,
      start_date: job.start_date,
      end_date: job.end_date,
      is_current: job.is_current,
      category: job.category || 'DIGITAL & CONTENT',
      image_url: job.image_url || '',
      bullet_points: job.bullet_points.length ? job.bullet_points : [''],
    });
    setEditing(job);
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
      const payload = {
        company: editForm.company,
        role: editForm.role,
        start_date: editForm.start_date,
        end_date: editForm.is_current ? 'Present' : editForm.end_date,
        is_current: editForm.is_current,
        category: editForm.category,
        image_url: editForm.image_url,
        bullet_points: editForm.bullet_points.filter(b => b.trim() !== ''),
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        await supabase.from('experience').insert({
          ...payload,
          sort_order: jobs.length,
        });
      } else if (editing) {
        await supabase.from('experience').update(payload).eq('id', editing.id);
      }

      await loadJobs();
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
    if (!confirm('Are you sure you want to remove this job entry?')) return;
    await supabase.from('experience').delete().eq('id', id);
    setJobs(prev => prev.filter(j => j.id !== id));
    onSaved();
  };

  const addBullet = () => setEditForm(f => ({ ...f, bullet_points: [...f.bullet_points, ''] }));
  const updateBullet = (i: number, val: string) => setEditForm(f => ({
    ...f,
    bullet_points: f.bullet_points.map((b, idx) => idx === i ? val : b),
  }));
  const removeBullet = (i: number) => setEditForm(f => ({
    ...f,
    bullet_points: f.bullet_points.filter((_, idx) => idx !== i),
  }));

  const setF = (key: string, val: string | boolean) => setEditForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#E8DCC8', boxShadow: '0 4px 24px rgba(26,18,9,.08)' }}>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}>Experience Timeline</h2>
            <p className="text-xs text-stone-500 mt-0.5">Drag to reorder jobs. Add company logos/images and details.</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle size={16} /> Saved!</span>}
            <button
              type="button"
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: '#1A1209' }}
            >
              <Plus size={15} /> Add Job
            </button>
          </div>
        </div>

        {jobs.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#78716C' }}>No experience entries yet. Add your first job above.</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {jobs.map(job => (
                <SortableJob key={job.id} job={job} onEdit={openEdit} onDelete={handleDelete} />
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
                {isNew ? 'Add New Job' : 'Edit Job'}
              </h3>
              <button type="button" onClick={closeForm} className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={20} style={{ color: '#78716C' }} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['company', 'role'] as const).map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      required
                      type="text"
                      className={inputClass}
                      style={inputStyle}
                      value={editForm[key]}
                      onChange={e => setF(key, e.target.value)}
                      onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E8DCC8'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Category / Track</label>
                  <input
                    type="text"
                    placeholder="e.g. EDUCATION · BRAND STORYTELLING"
                    className={inputClass}
                    style={inputStyle}
                    value={editForm.category || ''}
                    onChange={e => setF('category', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>Start Date</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Aug 2025"
                    className={inputClass}
                    style={inputStyle}
                    value={editForm.start_date}
                    onChange={e => setF('start_date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1209' }}>End Date</label>
                  <input
                    disabled={editForm.is_current}
                    type="text"
                    placeholder="e.g. Present or Jul 2025"
                    className={`${inputClass} ${editForm.is_current ? 'opacity-50' : ''}`}
                    style={inputStyle}
                    value={editForm.is_current ? 'Present' : editForm.end_date}
                    onChange={e => setF('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={editForm.is_current}
                  onChange={e => setF('is_current', e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="is_current" className="text-sm font-medium cursor-pointer" style={{ color: '#1A1209' }}>
                  I currently work here
                </label>
              </div>

              {/* Company Logo / Image Upload */}
              <div className="p-4 rounded-xl border border-dashed border-[#E8DCC8] bg-stone-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-stone-900">Company Logo or Visual (Optional)</span>
                </div>
                <ImageUpload
                  label="Upload Logo / Brand Asset"
                  value={editForm.image_url || ''}
                  onChange={url => setF('image_url', url)}
                  folder="experience"
                />
              </div>

              {/* Bullet Points */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium" style={{ color: '#1A1209' }}>Key Achievements & Responsibilities</label>
                  <button type="button" onClick={addBullet} className="text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer" style={{ color: '#F59E0B' }}>
                    <Plus size={13} /> Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {editForm.bullet_points.map((pt, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#F59E0B' }} />
                      <textarea
                        rows={2}
                        className={`${inputClass} flex-1`}
                        style={inputStyle}
                        placeholder={`Bullet point ${idx + 1}`}
                        value={pt}
                        onChange={e => updateBullet(idx, e.target.value)}
                      />
                      {editForm.bullet_points.length > 1 && (
                        <button type="button" onClick={() => removeBullet(idx)} className="mt-2 p-1 text-gray-400 hover:text-red-400 transition-colors cursor-pointer">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
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
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
