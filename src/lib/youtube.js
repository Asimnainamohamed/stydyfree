import axios from 'axios';

const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
});

function requireApiKey() {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key is missing.');
  }

  return apiKey;
}

function normalizeVideo(item) {
  const snippet = item.snippet;

  return {
    videoId: item.id.videoId,
    title: snippet.title,
    channelTitle: snippet.channelTitle,
    publishedAt: snippet.publishedAt,
    thumbnail:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      '',
  };
}

export async function searchYouTube(query) {
  const { data } = await youtubeApi.get('/search', {
    params: {
      q: query,
      part: 'snippet',
      type: 'video',
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
      maxResults: 12,
      key: requireApiKey(),
    },
  });

  return data.items.map(normalizeVideo);
}

export async function getVideoDetails(videoId) {
  const { data } = await youtubeApi.get('/videos', {
    params: {
      id: videoId,
      part: 'snippet,status',
      key: requireApiKey(),
    },
  });

  const video = data.items?.[0];

  if (!video) {
    return null;
  }

  const snippet = video.snippet;

  return {
    videoId,
    title: snippet.title,
    channelTitle: snippet.channelTitle,
    embeddable: video.status?.embeddable !== false,
    thumbnail:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      '',
  };
}
