import { Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function Notes() {
  const { user } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    async function loadNotes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
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
  }, [user]);

  const filteredNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return notes;
    }

    return notes.filter(
      (note) =>
        note.video_title.toLowerCase().includes(keyword) ||
        note.content.toLowerCase().includes(keyword),
    );
  }, [notes, query]);

  const groupedNotes = useMemo(
    () =>
      filteredNotes.reduce((groups, note) => {
        const title = note.video_title || 'Untitled video';
        groups[title] = groups[title] || [];
        groups[title].push(note);
        return groups;
      }, {}),
    [filteredNotes],
  );

  async function handleDelete(noteId) {
    const { error } = await supabase.from('notes').delete().eq('id', noteId).eq('user_id', user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setNotes((value) => value.filter((note) => note.id !== noteId));
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">My Notes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Search and revisit everything you have saved while studying.</p>
      </div>

      <label className="relative block">
        <span className="sr-only">Search notes</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by keyword..."
          className="min-h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            {notes.length === 0 ? 'No notes yet. Start watching and taking notes!' : 'No matching notes found'}
          </h2>
          {notes.length === 0 ? (
            <Link
              to="/search"
              className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Search lessons
            </Link>
          ) : (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try a different keyword.</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotes).map(([videoTitle, videoNotes]) => (
            <section key={videoTitle} className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{videoTitle}</h2>
              <div className="space-y-3">
                {videoNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(note.created_at)}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                          {note.content}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Link
                          to={`/watch?videoId=${note.video_id}`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Go to Video
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                          aria-label="Delete note"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
