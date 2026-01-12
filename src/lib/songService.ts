// Song search service using iTunes API (free, no auth required, CORS-friendly)

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  albumCover: string;
  preview: string; // 30-second preview URL
  duration: number;
}

const ITUNES_API = 'https://itunes.apple.com';

export async function searchSongs(query: string): Promise<Song[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${ITUNES_API}/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=15`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search songs');
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    
    return data.results
      .filter((track: any) => track.previewUrl) // Only include songs with previews
      .map((track: any) => ({
        id: track.trackId,
        title: track.trackName || 'Unknown Title',
        artist: track.artistName || 'Unknown Artist',
        album: track.collectionName || 'Unknown Album',
        // Get higher resolution artwork (300x300)
        albumCover: track.artworkUrl100?.replace('100x100bb', '300x300bb') || 
                   track.artworkUrl60?.replace('60x60bb', '300x300bb') || 
                   'https://via.placeholder.com/150?text=🎵',
        preview: track.previewUrl || '',
        duration: Math.round((track.trackTimeMillis || 0) / 1000),
      }));
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
}

// Get popular/trending songs (for suggestions)
export async function getPopularSongs(): Promise<Song[]> {
  try {
    // Search for current popular artists/songs
    const popularSearches = ['Taylor Swift', 'The Weeknd', 'Dua Lipa', 'Ed Sheeran', 'Arijit Singh'];
    const randomSearch = popularSearches[Math.floor(Math.random() * popularSearches.length)];
    
    const response = await fetch(
      `${ITUNES_API}/search?term=${encodeURIComponent(randomSearch)}&media=music&entity=song&limit=10`
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    
    return data.results
      .filter((track: any) => track.previewUrl)
      .map((track: any) => ({
        id: track.trackId,
        title: track.trackName || 'Unknown Title',
        artist: track.artistName || 'Unknown Artist',
        album: track.collectionName || 'Unknown Album',
        albumCover: track.artworkUrl100?.replace('100x100bb', '300x300bb') || 
                   track.artworkUrl60?.replace('60x60bb', '300x300bb') || '',
        preview: track.previewUrl || '',
        duration: Math.round((track.trackTimeMillis || 0) / 1000),
      }));
  } catch (error) {
    console.error('Error fetching popular songs:', error);
    return [];
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get song URL for storage
export function getSongUrl(song: Song): string {
  return song.preview || `itunes:track:${song.id}`;
}
