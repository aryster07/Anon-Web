import { Song, SongData } from '../types';

// Cache with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const SEARCH_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for search results
const POPULAR_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours for popular songs (keeps them fresh)
const searchCache = new Map<string, CacheEntry<Song[]>>();
let popularCache: CacheEntry<Song[]> | null = null;

// Check if cache is still valid
const isCacheValid = <T>(entry: CacheEntry<T> | null, ttl: number): entry is CacheEntry<T> => {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttl;
};

// Clear expired cache entries periodically
const cleanupCache = () => {
  const now = Date.now();
  searchCache.forEach((entry, key) => {
    if (now - entry.timestamp >= SEARCH_CACHE_TTL) {
      searchCache.delete(key);
    }
  });
  // Also clear popular cache if expired
  if (popularCache && now - popularCache.timestamp >= POPULAR_CACHE_TTL) {
    popularCache = null;
  }
};

// Run cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 10 * 60 * 1000);
}

// Parse iTunes response with validation
const parseITunesResponse = (data: any): Song[] => {
  if (!data?.results?.length) return [];
  
  return data.results
    .filter((t: any) => t.previewUrl && t.kind === 'song' && t.trackId)
    .map((t: any) => ({
      id: t.trackId,
      title: (t.trackName || 'Unknown').slice(0, 100), // Limit length
      artist: (t.artistName || 'Unknown Artist').slice(0, 100),
      album: (t.collectionName || '').slice(0, 100),
      albumCover: t.artworkUrl100?.replace('100x100', '300x300') || '',
      preview: t.previewUrl,
      duration: Math.floor((t.trackTimeMillis || 30000) / 1000),
    }));
};

// Fetch from iTunes with retry logic
const fetchFromITunes = async (url: string, retries = 2): Promise<any> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeout);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    clearTimeout(timeout);
    
    // Retry on network errors
    if (retries > 0 && !(error instanceof DOMException && error.name === 'AbortError')) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
      return fetchFromITunes(url, retries - 1);
    }
    
    return null;
  }
};

// Get popular songs with 2-hour cache refresh
export const getPopularSongs = async (): Promise<Song[]> => {
  // Return cached data if valid (2-hour TTL keeps songs fresh)
  if (isCacheValid(popularCache, POPULAR_CACHE_TTL) && popularCache.data.length > 0) {
    return popularCache.data;
  }

  const queries = [
    'https://itunes.apple.com/search?term=top+hits+2024&media=music&entity=song&limit=8',
    'https://itunes.apple.com/search?term=arijit+singh&media=music&entity=song&limit=4',
    'https://itunes.apple.com/search?term=ed+sheeran&media=music&entity=song&limit=4',
  ];

  const allSongs: Song[] = [];
  
  // Fetch in parallel for faster loading
  const results = await Promise.allSettled(
    queries.map(url => fetchFromITunes(url))
  );
  
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      allSongs.push(...parseITunesResponse(result.value));
    }
  }

  const unique = Array.from(new Map(allSongs.map(s => [s.id, s])).values());
  const finalSongs = unique.slice(0, 15);
  
  if (finalSongs.length > 0) {
    popularCache = { data: finalSongs, timestamp: Date.now() };
    return finalSongs;
  }
  
  return FALLBACK_SONGS;
};

// Search songs with debounce-friendly caching
export const searchSongs = async (query: string): Promise<Song[]> => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return []; // Require at least 2 chars

  const key = trimmed.toLowerCase();
  
  // Check cache (30-minute TTL for search results)
  const cached = searchCache.get(key);
  if (isCacheValid(cached, SEARCH_CACHE_TTL)) {
    return cached.data;
  }

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=15`;
  const data = await fetchFromITunes(url);
  const songs = parseITunesResponse(data);

  if (songs.length) {
    searchCache.set(key, { data: songs, timestamp: Date.now() });
    return songs;
  }

  // Fallback search
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
