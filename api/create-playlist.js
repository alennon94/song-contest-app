// /api/create-playlist.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://raxzlocileqqbfzxzsvx.supabase.co',
  process.env.SUPABASE_KEY || 'sb_publishable_GnjUYh3S_fe46Svkxta5-g_i4OxHFbK'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameId, weekNumber } = req.body;

  if (!gameId || !weekNumber) {
    return res.status(400).json({ error: 'Game ID and week number are required' });
  }

  try {
    // Get game from Supabase
    const { data: gameData, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError || !gameData) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = gameData.value;
    const accessToken = gameData.spotify_access_token;
    const spotifyUserId = gameData.spotify_user_id;

    if (!accessToken || !spotifyUserId) {
      return res.status(400).json({ error: 'Spotify not connected' });
    }

    // Get submissions for this week
    const weekData = game.weeks[weekNumber];
    if (!weekData || !weekData.submissions) {
      return res.status(400).json({ error: 'No submissions for this week' });
    }

    // Extract Spotify URIs from submissions
    const trackUris = Object.values(weekData.submissions)
      .map(submission => submission.spotifyUri)
      .filter(uri => uri); // Remove any null/undefined

    if (trackUris.length === 0) {
      return res.status(400).json({ error: 'No valid Spotify tracks found' });
    }

    // Create playlist
    const playlistName = `${game.name} - Week ${weekNumber}`;
    const playlistDescription = `Theme: ${game.themes[weekNumber - 1]} | Created by Song Contest App`;

    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          public: true
        })
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Spotify create playlist error:', errorData);
      
      // If token expired, we might need to refresh it
      if (createResponse.status === 401) {
        return res.status(401).json({ 
          error: 'Spotify token expired',
          message: 'Please reconnect your Spotify account'
        });
      }
      
      throw new Error('Failed to create playlist');
    }

    const playlist = await createResponse.json();

    // Add tracks to playlist
    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: trackUris
        })
      }
    );

    if (!addTracksResponse.ok) {
      throw new Error('Failed to add tracks to playlist');
    }

    // Return playlist URL
    res.status(200).json({
      playlistUrl: playlist.external_urls.spotify,
      playlistId: playlist.id,
      trackCount: trackUris.length
    });

  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ 
      error: 'Failed to create playlist',
      message: error.message 
    });
  }
}