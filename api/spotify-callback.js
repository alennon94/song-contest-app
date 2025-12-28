// /api/spotify-callback.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://raxzlocileqqbfzxzsvx.supabase.co',
  process.env.SUPABASE_KEY || 'sb_publishable_GnjUYh3S_fe46Svkxta5-g_i4OxHFbK'
);

export default async function handler(req, res) {
  const { code, state: gameId, error } = req.query;

  // If user denied access
  if (error) {
    return res.redirect(`/?error=spotify_denied`);
  }

  if (!code || !gameId) {
    return res.status(400).json({ error: 'Missing code or game ID' });
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/spotify-callback`
      : 'http://localhost:3000/api/spotify-callback';

    // Exchange code for tokens
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get Spotify user ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const spotifyUser = await userResponse.json();

    // Get current game from Supabase
    const { data: gameData, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError || !gameData) {
      throw new Error('Game not found');
    }

    // Update game with Spotify tokens
    const updatedGame = {
      ...gameData.value,
      spotify_access_token: tokens.access_token,
      spotify_refresh_token: tokens.refresh_token,
      spotify_user_id: spotifyUser.id,
      spotify_connected_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('games')
      .update({
        value: updatedGame,
        spotify_access_token: tokens.access_token,
        spotify_refresh_token: tokens.refresh_token,
        spotify_user_id: spotifyUser.id,
        spotify_connected_at: new Date().toISOString(),
        updated_at: new Date()
      })
      .eq('id', gameId);

    if (updateError) {
      throw new Error('Failed to update game');
    }

    // Redirect back to app
    const redirectUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/?spotify=connected&game=${gameId}`
      : `http://localhost:3000/?spotify=connected&game=${gameId}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect(`/?error=spotify_failed`);
  }
}