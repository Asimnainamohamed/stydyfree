import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

function getStoragePath(fileUrl) {
  const marker = '/screenshots/';
  const markerIndex = fileUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(fileUrl.slice(markerIndex + marker.length));
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export default function ScreenshotsPanel({ active, userId, videoId, videoTitle }) {
  const inputRef = useRef(null);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active || !userId || !videoId) {
      return;
    }

    let mounted = true;

    async function loadScreenshots() {
      setLoading(true);
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(error.message);
      } else if (mounted) {
        setScreenshots(data);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadScreenshots();

    return () => {
      mounted = false;
    };
  }, [active, userId, videoId]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }

    setUploading(true);
    setProgress(15);

    const path = `${userId}/${videoId}/${Date.now()}-${sanitizeFilename(file.name)}`;
    const { error: uploadError } = await supabase.storage.from('screenshots').upload(path, file);

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(65);
    const {
      data: { publicUrl },
    } = supabase.storage.from('screenshots').getPublicUrl(path);

    const { data, error } = await supabase
      .from('screenshots')
      .insert({
        user_id: userId,
        video_id: videoId,
        video_title: videoTitle,
        file_url: publicUrl,
      })
      .select()
      .single();

    if (error) {
      await supabase.storage.from('screenshots').remove([path]);
      toast.error(error.message);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(100);
    setScreenshots((value) => [data, ...value]);
    toast.success('Screenshot uploaded successfully.');
    setUploading(false);
    window.setTimeout(() => setProgress(0), 500);
    event.target.value = '';
  }

  async function handleDelete(screenshot) {
    const storagePath = getStoragePath(screenshot.file_url);

    if (storagePath) {
      const { error: storageError } = await supabase.storage.from('screenshots').remove([storagePath]);

      if (storageError) {
        toast.error(storageError.message);
        return;
      }
    }

    const { error } = await supabase
      .from('screenshots')
      .delete()
      .eq('id', screenshot.id)
      .eq('user_id', userId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setScreenshots((value) => value.filter((item) => item.id !== screenshot.id));
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">Keep visual references beside your notes.</p>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <ImagePlus className="h-4 w-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Screenshot'}</span>
          </button>
        </div>
      </div>

      {progress > 0 ? (
        <div className="space-y-2">
          <progress
            value={progress}
            max="100"
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100 accent-emerald-500 dark:bg-slate-800"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">{progress}% uploaded</p>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="aspect-video animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : screenshots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No screenshots uploaded for this video yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {screenshots.map((screenshot) => (
            <article key={screenshot.id} className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <a href={screenshot.file_url} target="_blank" rel="noreferrer">
                <img
                  src={screenshot.file_url}
                  alt=""
                  className="aspect-video h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
              <button
                type="button"
                onClick={() => handleDelete(screenshot)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-rose-600 opacity-100 shadow-sm hover:bg-rose-50 dark:bg-slate-950/95 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Delete screenshot"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
