'use client';

import { useState } from 'react';
import { IntakeFormData, Testimonial, TeamBio, UploadedFile } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
  clientId: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function StepBrandAssets({ data, onChange, clientId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // --- Testimonials ---
  function addTestimonial() {
    onChange({
      testimonials: [...data.testimonials, { id: generateId(), text: '' }],
    });
  }

  function updateTestimonial(idx: number, text: string) {
    const next = data.testimonials.map((t, i) =>
      i === idx ? { ...t, text } : t
    );
    onChange({ testimonials: next });
  }

  function removeTestimonial(idx: number) {
    onChange({ testimonials: data.testimonials.filter((_, i) => i !== idx) });
  }

  // --- Team Bios ---
  function addBio() {
    onChange({
      team_bios: [
        ...data.team_bios,
        { id: generateId(), name: '', title: '', bio: '' },
      ],
    });
  }

  function updateBio(idx: number, updates: Partial<TeamBio>) {
    const next = data.team_bios.map((b, i) =>
      i === idx ? { ...b, ...updates } : b
    );
    onChange({ team_bios: next });
  }

  function removeBio(idx: number) {
    onChange({ team_bios: data.team_bios.filter((_, i) => i !== idx) });
  }

  // --- File Upload ---
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const newFiles: UploadedFile[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${clientId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

        const { error } = await supabase.storage
          .from('intake-files')
          .upload(path, file);

        if (error) {
          setUploadError(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('intake-files')
          .getPublicUrl(path);

        newFiles.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
        });
      }

      onChange({
        marketing_file_urls: [...data.marketing_file_urls, ...newFiles],
      });
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeFile(idx: number) {
    onChange({
      marketing_file_urls: data.marketing_file_urls.filter((_, i) => i !== idx),
    });
  }

  return (
    <div className="space-y-8 fade-up">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl mb-1" style={{ color: 'var(--gold)' }}>
          Brand Assets
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Share your marketing materials so we can maintain your brand voice.
        </p>
      </div>

      {/* Testimonials */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Existing Testimonials
        </h3>
        <div className="space-y-3">
          {data.testimonials.map((t: Testimonial, idx: number) => (
            <div key={t.id} className="relative">
              <textarea
                className="input pr-16"
                rows={3}
                value={t.text}
                onChange={(e) => updateTestimonial(idx, e.target.value)}
                placeholder="Paste one testimonial here..."
                style={{ resize: 'vertical' }}
              />
              <button
                onClick={() => removeTestimonial(idx)}
                className="absolute top-2 right-2 text-xs px-2 py-1 rounded"
                style={{ color: 'var(--red)', background: 'rgba(224,80,80,0.1)' }}
              >
                ✕
              </button>
            </div>
          ))}
          <button onClick={addTestimonial} className="btn-ghost px-4 py-2 text-sm">
            + Add Testimonial
          </button>
        </div>
      </div>

      <div className="gold-divider" />

      {/* Team Bios */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Team Bios
        </h3>
        <div className="space-y-4">
          {data.team_bios.map((bio: TeamBio, idx: number) => (
            <div
              key={bio.id}
              className="p-4 rounded-xl space-y-3"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                  Team Member #{idx + 1}
                </span>
                <button
                  onClick={() => removeBio(idx)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: 'var(--red)', background: 'rgba(224,80,80,0.1)' }}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    className="input"
                    value={bio.name}
                    onChange={(e) => updateBio(idx, { name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    className="input"
                    value={bio.title}
                    onChange={(e) => updateBio(idx, { title: e.target.value })}
                    placeholder="Managing Director"
                  />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input"
                  rows={3}
                  value={bio.bio}
                  onChange={(e) => updateBio(idx, { bio: e.target.value })}
                  placeholder="Brief professional bio..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          ))}
          <button onClick={addBio} className="btn-ghost px-4 py-2 text-sm">
            + Add Team Member
          </button>
        </div>
      </div>

      <div className="gold-divider" />

      {/* Awards / Press */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Awards, Press &amp; Associations
        </h3>
        <textarea
          className="input"
          rows={4}
          value={data.awards_press}
          onChange={(e) => onChange({ awards_press: e.target.value })}
          placeholder="List any awards, press mentions, or industry associations..."
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="gold-divider" />

      {/* File Upload */}
      <div>
        <h3 className="font-heading text-lg mb-3" style={{ color: 'var(--light)' }}>
          Marketing Copy / Pitch Deck
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
          PDF, PowerPoint, Word, or images. Max 50 MB per file.
        </p>

        <label
          className="flex flex-col items-center justify-center py-8 rounded-xl cursor-pointer transition-all duration-200"
          style={{
            border: '2px dashed var(--border-gold)',
            background: 'rgba(212,168,67,0.04)',
          }}
        >
          <span className="text-2xl mb-2">📎</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
            {uploading ? 'Uploading...' : 'Click to upload files'}
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,.pptx,.ppt,.doc,.docx,.png,.jpg,.jpeg,.webp"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {uploadError && (
          <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>
            {uploadError}
          </p>
        )}

        {data.marketing_file_urls.length > 0 && (
          <div className="mt-3 space-y-2">
            {data.marketing_file_urls.map((f: UploadedFile, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'var(--navy3)', border: '1px solid var(--border)' }}
              >
                <span className="text-sm truncate mr-2" style={{ color: 'var(--silver)' }}>
                  {f.name}{' '}
                  <span style={{ color: 'var(--muted)' }}>
                    ({(f.size / 1024).toFixed(0)} KB)
                  </span>
                </span>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-xs px-2 py-1 rounded flex-shrink-0"
                  style={{ color: 'var(--red)', background: 'rgba(224,80,80,0.1)' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
