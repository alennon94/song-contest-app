// /api/spotify-search.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  try {
    // Step 1: Get Spotify Access Token using Client Credentials flow
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Spotify credentials not configured' });
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Spotify token');
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Search Spotify API
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=US`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!searchResponse.ok) {
      throw new Error('Spotify search failed');
    }

    const data = await searchResponse.json();

    // Step 3: Format and return results
    const tracks = data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      artistNames: track.artists.map(a => a.name),
      album: track.album.name,
      uri: track.uri,
      albumArt: track.album.images[2]?.url || track.album.images[0]?.url,
      albumArtLarge: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      releaseDate: track.album.release_date,
      duration: track.duration_ms
    }));

    return res.status(200).json({ tracks });

  } catch (error) {
    console.error('Spotify search error:', error);
    return res.status(500).json({ 
      error: 'Failed to search Spotify',
      message: error.message 
    });
  }
}