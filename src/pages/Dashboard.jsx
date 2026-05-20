import { Bot, Camera, NotebookText, PlaySquare, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useOutletContext } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { supabase } from '../lib/supabase';

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-56 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile } = useOutletContext();
  const [stats, setStats] = useState({ videos: 0, notes: 0, screenshots: 0 });
  const [savedVideos, setSavedVideos] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentScreenshots, setRecentScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      const [videosCount, notesCount, screenshotsCount, videos, notes, screenshots] = await Promise.all([
        supabase.from('saved_videos').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('notes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('screenshots').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('saved_videos').select('*').eq('user_id', user.id).order('saved_at', { ascending: false }),
        supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase
          .from('screenshots')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      const firstError =
        videosCount.error ||
        notesCount.error ||
        screenshotsCount.error ||
        videos.error ||
        notes.error ||
        screenshots.error;

      if (firstError) {
        toast.error(firstError.message);
      } else if (mounted) {
        setStats({
          videos: videosCount.count ?? 0,
          notes: notesCount.count ?? 0,
          screenshots: screenshotsCount.count ?? 0,
        });
        setSavedVideos(videos.data);
        setRecentNotes(notes.data);
        setRecentScreenshots(screenshots.data);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function handleDelete(video) {
    const { error } = await supabase.from('saved_videos').delete().eq('id', video.id).eq('user_id', user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSavedVideos((value) => value.filter((item) => item.id !== video.id));
    setStats((value) => ({ ...value, videos: Math.max(0, value.videos - 1) }));
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <section className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">StudyNest</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white sm:text-4xl">
              Your AI-powered study space for videos, notes, and revision.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Search YouTube lessons, watch them with an AI study assistant beside you, save important videos, write notes,
              and keep screenshots together so every topic stays easy to revisit.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              to="/search"
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Search className="h-4 w-4" />
              <span>Start Searching</span>
            </Link>
            <Link
              to="/notes"
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <NotebookText className="h-4 w-4" />
              <span>View Notes</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950/60">
            <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="mt-3 font-semibold text-slate-950 dark:text-white">Find lessons faster</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Search YouTube topics directly from StudyNest.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950/60">
            <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="mt-3 font-semibold text-slate-950 dark:text-white">Ask while watching</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Get explanations, formulas, examples, and shortcuts.</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950/60">
            <NotebookText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="mt-3 font-semibold text-slate-950 dark:text-white">Keep study proof</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Save videos, notes, and screenshots in one place.</p>
          </div>
        </div>
      </section>

      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
        <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">
          Hello, {profile?.name || user?.email?.split('@')[0] || 'Student'}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Saved Videos"
          value={stats.videos}
          icon={PlaySquare}
          accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
        />
        <StatCard
          label="Total Notes"
          value={stats.notes}
          icon={NotebookText}
          accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
        />
        <StatCard
          label="Total Screenshots"
          value={stats.screenshots}
          icon={Camera}
          accent="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Saved Videos</h2>
          <Link to="/search" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Find more
          </Link>
        </div>

        {savedVideos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">No saved videos yet</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Save lessons from the watch page to keep them close.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {savedVideos.map((video) => (
              <VideoCard
                key={video.id}
                mode="saved"
                video={{
                  id: video.id,
                  videoId: video.video_id,
                  title: video.title,
                  thumbnail: video.thumbnail,
                  youtubeUrl: video.youtube_url,
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Recent Notes</h2>

          {recentNotes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Your latest notes will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-950 dark:text-white">{note.video_title}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(note.created_at)}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{note.content}</p>
                    </div>
                    <Link
                      to={`/watch?videoId=${note.video_id}`}
                      className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Go to Video
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Recent Screenshots</h2>

          {recentScreenshots.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Uploaded screenshots will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recentScreenshots.map((screenshot) => (
                <a
                  key={screenshot.id}
                  href={screenshot.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <img
                    src={screenshot.file_url}
                    alt=""
                    className="aspect-video h-full w-full object-cover"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
