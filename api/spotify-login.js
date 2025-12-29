export default async function handler(req, res) {
  const { gameId, redirectUri } = req.query;

  const scope = 'playlist-modify-public playlist-modify-private';
  
  // Construct the Spotify Auth URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    // Use the redirectUri passed from the frontend
    redirect_uri: redirectUri, 
    state: gameId // We use state to pass the gameId through the login flow
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}