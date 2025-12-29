// /api/spotify-login.js
export default function handler(req, res) {
  const { gameId } = req.query;

  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  
  // Determine redirect URI based on environment
  let redirectUri;
  
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    // Production - use your actual domain
    redirectUri = 'https://song-contest-app.vercel.app/api/spotify-callback';
  } else {
    // Local development
    redirectUri = 'http://localhost:3000/api/spotify-callback';
  }

  const scopes = 'playlist-modify-public playlist-modify-private';
  
  const authUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: gameId,
    show_dialog: 'true'
  });

  console.log('Redirecting to Spotify with URI:', redirectUri); // Debug log

  res.redirect(authUrl);
}