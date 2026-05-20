import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import VideoCard from '../components/VideoCard';
import { searchYouTube } from '../lib/youtube';

function SearchSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-video animate-pulse bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      toast.error('Enter a topic to search.');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const results = await searchYouTube(trimmedQuery);
      setVideos(results);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || error.message || 'Unable to search YouTube.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Search Lessons</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Find YouTube lessons and continue studying inside StudyNest.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search YouTube lessons</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="time and work aptitude tamil"
            className="min-h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-950 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading ? (
        <SearchSkeleton />
      ) : videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      ) : searched ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">No videos found</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try a broader topic or a different language keyword.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Start with a topic</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Search for a lesson, aptitude topic, or exam concept.</p>
        </div>
      )}
    </section>
  );
}
