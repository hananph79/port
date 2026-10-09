import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  bucket = 'portfolio-images',
  folder = 'uploads',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert('Upload failed: ' + msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: '#1A1209' }}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-6 cursor-pointer text-center transition-all"
        style={{ borderColor: '#E8DCC8', background: '#FAFAF7' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#F59E0B')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#E8DCC8')}
      >
        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="max-h-40 mx-auto rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2" style={{ color: '#78716C' }}>
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }} />
            ) : (
              <>
                <Upload size={32} style={{ color: '#F59E0B' }} />
                <p className="text-sm">Click to upload image</p>
                <p className="text-xs opacity-60">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
