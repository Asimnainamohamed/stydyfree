import { CalendarDays, ExternalLink, Play, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function VideoCard({ video, mode = 'search', onDelete }) {
  const watchHref = `/watch?videoId=${video.videoId}`;
  const youtubeHref = video.youtubeUrl || `https://youtube.com/watch?v=${video.videoId}`;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-video bg-slate-100 dark:bg-slate-800">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-950 dark:text-white">{video.title}</h3>
          {mode === 'search' ? (
            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
              <p className="line-clamp-1">{video.channelTitle}</p>
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(video.publishedAt)}</span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={watchHref}
            className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Play className="h-4 w-4" />
            <span>{mode === 'saved' ? 'Watch Again' : 'Watch Here'}</span>
          </Link>

          {mode === 'search' ? (
            <a
              href={youtubeHref}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open YouTube</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onDelete?.(video)}
              className="flex min-h-10 items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              aria-label={`Delete ${video.title}`}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
