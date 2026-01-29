import { Song, SongData } from '../types';

// Cache for search results
const searchCache = new Map<string, Song[]>();
let popularCache: Song[] | null = null;

// Parse iTunes response
const parseITunesResponse = (data: any): Song[] => {
  if (!data?.results?.length) return [];
  
  return data.results
    .filter((t: any) => t.previewUrl && t.kind === 'song')
    .map((t: any) => ({
      id: t.trackId,
      title: t.trackName || 'Unknown',
      artist: t.artistName || 'Unknown Artist',
      album: t.collectionName || '',
      albumCover: t.artworkUrl100?.replace('100x100', '300x300') || '',
      preview: t.previewUrl,
      duration: Math.floor((t.trackTimeMillis || 30000) / 1000),
    }));
};

// Fetch from iTunes
const fetchFromITunes = async (url: string): Promise<any> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok ? await res.json() : null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
};

// Get popular songs
export const getPopularSongs = async (): Promise<Song[]> => {
  if (popularCache?.length) return popularCache;

  const queries = [
    'https://itunes.apple.com/search?term=top+hits+2024&media=music&entity=song&limit=8',
    'https://itunes.apple.com/search?term=arijit+singh&media=music&entity=song&limit=4',
    'https://itunes.apple.com/search?term=ed+sheeran&media=music&entity=song&limit=4',
  ];

  const allSongs: Song[] = [];
  for (const url of queries) {
    const data = await fetchFromITunes(url);
    if (data) allSongs.push(...parseITunesResponse(data));
    if (allSongs.length >= 12) break;
  }

  const unique = Array.from(new Map(allSongs.map(s => [s.id, s])).values());
  popularCache = unique.slice(0, 15);
  return popularCache.length ? popularCache : FALLBACK_SONGS;
};

// Search songs
export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query.trim()) return [];

  const key = query.toLowerCase().trim();
  if (searchCache.has(key)) return searchCache.get(key)!;

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=15`;
  const data = await fetchFromITunes(url);
  const songs = parseITunesResponse(data);

  if (songs.length) {
    searchCache.set(key, songs);
    return songs;
  }

  return FALLBACK_SONGS.filter(s =>
    s.title.toLowerCase().includes(key) || s.artist.toLowerCase().includes(key)
  );
};

// Parse YouTube URL
export const parseYouTubeUrl = (url: string): { videoId: string; startTime?: number } | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  
  const startMatch = url.match(/[?&]t=(\d+)/);
  return { videoId: match[1], startTime: startMatch ? parseInt(startMatch[1]) : undefined };
};

// Parse Spotify URL
export const parseSpotifyUrl = (url: string): { trackId: string } | null => {
  const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  return match ? { trackId: match[1] } : null;
};

// Fetch YouTube info
export const fetchYouTubeInfo = async (videoId: string): Promise<SongData | null> => {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) return null;

    const data = await res.json();
    const parts = data.title.split('-').map((s: string) => s.trim());

    return {
      type: 'youtube',
      videoId,
      title: parts[1] || data.title,
      artist: parts[0] || 'Unknown Artist',
      albumCover: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      startTime: 0,
      endTime: 30,
    };
  } catch {
    return null;
  }
};

// Fetch Spotify info
export const fetchSpotifyInfo = async (trackId: string): Promise<SongData | null> => {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`);
    if (!res.ok) return null;

    const data = await res.json();
    const match = data.title?.match(/(.+?)\s*·\s*(.+)/);

    return {
      type: 'spotify',
      trackId,
      title: match ? match[1] : data.title || 'Unknown',
      artist: match ? match[2] : 'Unknown Artist',
      albumCover: data.thumbnail_url,
      startTime: 0,
      endTime: 30,
    };
  } catch {
    return null;
  }
};

// Process music link
export const processMusicLink = async (url: string): Promise<SongData | null> => {
  const yt = parseYouTubeUrl(url);
  if (yt) {
    const info = await fetchYouTubeInfo(yt.videoId);
    if (info && yt.startTime) {
      info.startTime = yt.startTime;
      info.endTime = yt.startTime + 30;
    }
    return info;
  }

  const sp = parseSpotifyUrl(url);
  if (sp) return fetchSpotifyInfo(sp.trackId);

  return null;
};

// Fallback songs
const FALLBACK_SONGS: Song[] = [
  { id: 1440818839, title: "Shape of You", artist: "Ed Sheeran", album: "÷", albumCover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3f/84/14/3f841469-7404-6b98-a8f9-4f8b1a3c3d4b/source/300x300bb.jpg", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/ab/86/52/ab8652a7-62d0-9fba-1f28-7a92c8d18518/mzaf_12184443632225615168.plus.aac.p.m4a", duration: 234 },
  { id: 1450330685, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", albumCover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1c/50/de/1c50de8f-5ee5-5a31-5c83-9b1c6e0d3558/source/300x300bb.jpg", preview: "", duration: 200 },
  { id: 1508562704, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", albumCover: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/3f/ee/75/3fee75c6-c8cc-2eb0-3e64-ce3d6e8f8d6a/source/300x300bb.jpg", preview: "", duration: 203 },
];
