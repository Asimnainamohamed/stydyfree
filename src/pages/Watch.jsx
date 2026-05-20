import { ClipboardCopy, ExternalLink, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import ChatPanel from '../components/ChatPanel';
import NotesPanel from '../components/NotesPanel';
import ScreenshotsPanel from '../components/ScreenshotsPanel';
import { supabase } from '../lib/supabase';
import { getVideoDetails } from '../lib/youtube';

const tabs = [
  { id: 'assistant', label: 'AI Assistant' },
  { id: 'notes', label: 'My Notes' },
  { id: 'screenshots', label: 'Screenshots' },
];

export default function Watch() {
  const { user } = useOutletContext();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('videoId');
  const [activeTab, setActiveTab] = useState('assistant');
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(Boolean(videoId));
  const [saving, setSaving] = useState(false);
  const [usePrivacyPlayer, setUsePrivacyPlayer] = useState(true);
  const youtubeUrl = videoId ? `https://youtube.com/watch?v=${videoId}` : '';
  const pageOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const playerHost = usePrivacyPlayer ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  const embedUrl = videoId
    ? `https://${playerHost}/embed/${videoId}?rel=0&origin=${encodeURIComponent(pageOrigin)}`
    : '';
  const canEmbed = video?.embeddable !== false;

  useEffect(() => {
    if (!videoId) {
      return;
    }

    let mounted = true;
    setUsePrivacyPlayer(true);

    async function loadVideo() {
      setLoading(true);

      try {
        const details = await getVideoDetails(videoId);

        if (mounted) {
          setVideo(details);
        }
      } catch (error) {
        toast.error(error.response?.data?.error?.message || error.message || 'Unable to load video details.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadVideo();

    return () => {
      mounted = false;
    };
  }, [videoId]);

  async function handleSaveVideo() {
    if (!video || !user) {
      return;
    }

    setSaving(true);
    const { data: existing, error: lookupError } = await supabase
      .from('saved_videos')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', video.videoId)
      .maybeSingle();

    if (lookupError) {
      toast.error(lookupError.message);
      setSaving(false);
      return;
    }

    if (existing) {
      toast.success('Video already saved.');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('saved_videos').insert({
      user_id: user.id,
      video_id: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      youtube_url: youtubeUrl,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Video saved successfully.');
    }

    setSaving(false);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(youtubeUrl);
      toast.success('Link copied to clipboard.');
    } catch {
      toast.error('Unable to copy link.');
    }
  }

  if (!videoId) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 px-4 py-14 text-center dark:border-slate-700">
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">No video selected</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose a lesson from Search to open the study workspace.</p>
        <Link
          to="/search"
          className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Go to Search
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {loading ? (
            <div className="space-y-3">
              <div className="h-7 w-72 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
                {video?.title || 'Untitled video'}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{video?.channelTitle}</p>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveVideo}
            disabled={!video || saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Video'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ClipboardCopy className="h-4 w-4" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-black shadow-panel dark:border-slate-800">
          {canEmbed ? (
            <>
              <iframe
                key={embedUrl}
                title={video?.title || 'YouTube video player'}
                src={embedUrl}
                className="h-[18rem] w-full sm:h-[24rem] lg:h-[28rem]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-300">
                  If YouTube shows a playback error, switch player mode or open the video on YouTube.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setUsePrivacyPlayer((value) => !value)}
                    className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    {usePrivacyPlayer ? 'Try Standard Player' : 'Try Privacy Player'}
                  </button>
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open YouTube</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-[18rem] flex-col items-center justify-center px-6 text-center sm:h-[24rem] lg:h-[28rem]">
              <h2 className="text-xl font-semibold text-white">This video cannot play inside StudyNest</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                The creator has disabled playback on external websites. You can still watch it on YouTube.
              </p>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open YouTube</span>
              </a>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 dark:border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'shrink-0 rounded-lg px-3 py-2 text-sm font-medium',
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'assistant' ? <ChatPanel currentVideoUrl={youtubeUrl} /> : null}
          {activeTab === 'notes' ? (
            <NotesPanel
              active
              userId={user.id}
              videoId={videoId}
              videoTitle={video?.title || 'Untitled video'}
            />
          ) : null}
          {activeTab === 'screenshots' ? (
            <ScreenshotsPanel
              active
              userId={user.id}
              videoId={videoId}
              videoTitle={video?.title || 'Untitled video'}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
