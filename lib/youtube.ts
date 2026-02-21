const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

export function parseYouTubeVideoId(input: string): string | null {
  if (!input) return null;

  try {
    const url = new URL(input.trim());
    if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return isValidVideoId(id) ? id : null;
    }

    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return isValidVideoId(id) ? id : null;
    }

    if (url.pathname.startsWith('/shorts/')) {
      const id = url.pathname.split('/')[2];
      return isValidVideoId(id) ? id : null;
    }

    if (url.pathname.startsWith('/embed/')) {
      const id = url.pathname.split('/')[2];
      return isValidVideoId(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function buildYouTubeEmbedUrl(videoId: string, options?: { autoplay?: boolean; mute?: boolean }) {
  const autoplay = options?.autoplay ?? true;
  const mute = options?.mute ?? true;

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function isValidVideoId(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[A-Za-z0-9_-]{11}$/.test(value);
}
