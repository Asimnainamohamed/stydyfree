import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function NotesPanel({ active, userId, videoId, videoTitle }) {
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!active || !userId || !videoId) {
      return;
    }

    let mounted = true;

    async function loadNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(error.message);
      } else if (mounted) {
        setNotes(data);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadNotes();

    return () => {
      mounted = false;
    };
  }, [active, userId, videoId]);

  async function handleSave() {
    const trimmed = content.trim();

    if (!trimmed) {
      toast.error('Write a note before saving.');
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        video_id: videoId,
        video_title: videoTitle,
        content: trimmed,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else {
      setNotes((value) => [data, ...value]);
      setContent('');
      toast.success('Note saved successfully.');
    }

    setSaving(false);
  }

  async function handleDelete(noteId) {
    const { error } = await supabase.from('notes').delete().eq('id', noteId).eq('user_id', userId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setNotes((value) => value.filter((note) => note.id !== noteId));
  }

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your notes here..."
          rows={6}
          className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Saved Notes</h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No notes for this video yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(note.created_at)}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    aria-label="Delete note"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{note.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
