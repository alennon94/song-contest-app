// /api/spotify-login.js
export default function handler(req, res) {
  const { gameId } = req.query;

  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}/api/spotify-callback`
    : 'http://localhost:3000/api/spotify-callback';

  const scopes = 'playlist-modify-public playlist-modify-private';
  
  const authUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: gameId,
    show_dialog: 'true'
  });

  res.redirect(authUrl);
}