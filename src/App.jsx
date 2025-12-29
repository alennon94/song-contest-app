import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Music, Users, Trophy, Calendar, Vote, Plus, X, 
  ChevronRight, Crown, Send, Download, RefreshCw 
} from 'lucide-react';

// --- SUPABASE CONFIGURATION ---
// Replace these strings with your actual Project URL and Anon Key from Supabase Settings
const supabaseUrl = 'https://raxzlocileqqbfzxzsvx.supabase.co';
const supabaseKey = 'sb_publishable_GnjUYh3S_fe46Svkxta5-g_i4OxHFbK';
const supabase = createClient(supabaseUrl, supabaseKey);

const SongContestApp = () => {
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [playerEmail, setPlayerEmail] = useState('');
  const [view, setView] = useState('home'); // home, create, game
  const [loading, setLoading] = useState(true);

  // Load games from Supabase on mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*');

      if (error) throw error;

      if (data) {
        // We store the game object inside the 'value' column
        const loadedGames = data.map(item => item.value);
        setGames(loadedGames);
        
        // If we're currently in a game, update the local state of that game too
        if (currentGame) {
          const updatedCurrent = loadedGames.find(g => g.id === currentGame.id);
          if (updatedCurrent) setCurrentGame(updatedCurrent);
        }
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGame = async (game) => {
    try {
      const { error } = await supabase
        .from('games')
        .upsert({ 
          id: game.id, 
          value: game,
          updated_at: new Date() 
        });

      if (error) throw error;
      await loadGames(); // Refresh the global list
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game to the cloud. Check your connection.');
    }
  };

  if (loading && !games.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-2">
          <RefreshCw className="animate-spin" /> Loading Live Contest...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-slate-100">
      {/* Player Email Display */}
      {playerEmail && (
        <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 z-50 shadow-xl">
          <div className="text-purple-200 text-xs uppercase tracking-wider font-bold">Playing as:</div>
          <div className="text-yellow-400 font-bold text-sm">{playerEmail}</div>
          <button
            onClick={() => {
              setPlayerEmail('');
              setView('home');
              setCurrentGame(null);
            }}
            className="text-[10px] text-purple-300 hover:text-white underline mt-1"
          >
            Switch Player
          </button>
        </div>
      )}

      {view === 'home' && (
        <HomeView 
          games={games} 
          setView={setView} 
          setCurrentGame={setCurrentGame}
          playerEmail={playerEmail}
          setPlayerEmail={setPlayerEmail}
        />
      )}
      {view === 'create' && (
        <CreateGameView 
          setView={setView}
          saveGame={saveGame}
          setCurrentGame={setCurrentGame}
          playerEmail={playerEmail}
        />
      )}
      {view === 'game' && currentGame && (
        <GameView 
          game={currentGame}
          setView={setView}
          saveGame={saveGame}
          playerEmail={playerEmail}
          setCurrentGame={setCurrentGame}
          refreshGame={loadGames}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const HomeView = ({ games, setView, setCurrentGame, playerEmail, setPlayerEmail }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [gameCode, setGameCode] = useState('');

  const handleJoinGame = () => {
    const game = games.find(g => g.id === gameCode.toUpperCase());
    if (game && playerEmail.trim()) {
      const playerEntry = game.players.find(p => p.email.toLowerCase() === playerEmail.toLowerCase());
      if (!playerEntry) {
        alert('This email is not registered for this game code.');
        return;
      }
      setCurrentGame(game);
      setView('game');
    } else if (!game) {
      alert('Game not found. Please check the code.');
    } else {
      alert('Please enter your email.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <Music className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
        <h1 className="text-6xl font-black text-white mb-2 tracking-tight">THE SONG CONTEST</h1>
        <p className="text-xl text-purple-200 font-light">Office aux cord battle: Cloud Edition</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <input
          type="email"
          placeholder="Enter your email"
          value={playerEmail}
          onChange={(e) => setPlayerEmail(e.target.value)}
          className="w-full px-4 py-4 rounded-xl bg-white/10 text-white placeholder-purple-300 border border-white/20 focus:border-yellow-400 focus:outline-none mb-4 transition-all"
        />
        
        <button
          onClick={() => setView('create')}
          disabled={!playerEmail.trim()}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black py-4 rounded-xl mb-3 flex items-center justify-center gap-2 disabled:opacity-30 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" /> CREATE NEW GAME
        </button>

        <button
          onClick={() => setShowJoin(!showJoin)}
          disabled={!playerEmail.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-30 transition-all shadow-lg"
        >
          <Users className="w-5 h-5" /> JOIN WITH CODE
        </button>

        {showJoin && (
          <div className="mt-6 p-4 bg-black/20 rounded-xl animate-in fade-in slide-in-from-top-4">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-yellow-400 focus:outline-none mb-3 text-center font-mono text-xl tracking-widest"
            />
            <button
              onClick={handleJoinGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-md"
            >
              Enter Game
            </button>
          </div>
        )}
      </div>

      {games.length > 0 && (
        <div className="mt-10 max-w-md w-full">
          <h2 className="text-purple-200 uppercase tracking-widest text-xs font-bold mb-4 text-center">Your Active Battles</h2>
          <div className="space-y-3">
            {games.filter(g => g.players.some(p => p.email === playerEmail)).map(game => (
              <button
                key={game.id}
                onClick={() => {
                  setCurrentGame(game);
                  setView('game');
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl text-left transition-all flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-yellow-400 transition-colors">{game.name}</div>
                  <div className="text-xs text-purple-300 font-mono">{game.id} • Week {game.currentWeek}/{game.totalWeeks}</div>
                </div>
                <ChevronRight className="text-purple-400 w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateGameView = ({ setView, saveGame, setCurrentGame, playerEmail }) => {
  const [gameName, setGameName] = useState('');
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [themes, setThemes] = useState(Array(4).fill(''));
  const [gameMasterName, setGameMasterName] = useState('');
  const [players, setPlayers] = useState([]);

  // Adjust themes array when week count changes
  const handleWeekChange = (newCount) => {
    const count = parseInt(newCount);
    setTotalWeeks(count);
    const newThemes = [...themes];
    if (count > themes.length) {
      const extra = Array(count - themes.length).fill('');
      setThemes([...newThemes, ...extra]);
    } else {
      setThemes(newThemes.slice(0, count));
    }
  };

  const updateTheme = (index, value) => {
    const newThemes = [...themes];
    newThemes[index] = value;
    setThemes(newThemes);
  };

  const addPlayer = () => setPlayers([...players, { name: '', email: '' }]);
  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const handleCreate = async () => {
    if (!gameName.trim()) {
      alert('Please enter a Game Name.');
      return;
    }
    if (!gameMasterName.trim()) {
      alert('Please enter your name as the GameMaster.');
      return;
    }
    
    const validPlayers = players.filter(p => p.name.trim() && p.email.trim());
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const allPlayers = [
      { name: gameMasterName, email: playerEmail },
      ...validPlayers
    ];
    
    const game = {
      id: gameId,
      name: gameName,
      gameMaster: playerEmail,
      totalWeeks,
      currentWeek: 1,
      themes: themes,
      players: allPlayers,
      weeks: {},
      cumulativeScores: {}
    };

    allPlayers.forEach(player => {
      game.cumulativeScores[player.email] = 0;
    });

    await saveGame(game);
    setCurrentGame(game);
    setView('game');
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <button onClick={() => setView('home')} className="mb-8 flex items-center gap-2 text-purple-300 hover:text-white">
        <X className="w-4 h-4" /> CANCEL
      </button>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black mb-8 text-yellow-400">CREATE NEW CONTEST</h1>
        
        <div className="space-y-6">
          {/* GAME NAME */}
          <section>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-2 tracking-widest">Game Name</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="e.g. 2025 Office Bangers"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 focus:outline-none text-white"
            />
          </section>

          {/* GAMEMASTER NAME */}
          <section>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-2 tracking-widest">Your Display Name (GameMaster)</label>
            <input
              type="text"
              value={gameMasterName}
              onChange={(e) => setGameMasterName(e.target.value)}
              placeholder="e.g. DJ Alex"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 focus:outline-none text-white shadow-inner"
            />
          </section>

          {/* WEEK SELECTOR */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-widest">Duration (Weeks)</label>
              <span className="text-yellow-400 font-bold">{totalWeeks} Weeks</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={totalWeeks}
              onChange={(e) => handleWeekChange(e.target.value)}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </section>

          {/* THEMES LIST */}
          <section>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-2 tracking-widest">Weekly Themes</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {themes.map((theme, i) => (
                <div key={i} className="relative">
                  <span className="absolute left-3 top-3 text-[10px] font-bold text-purple-400">W{i+1}</span>
                  <input
                    value={theme}
                    onChange={(e) => updateTheme(i, e.target.value)}
                    placeholder="Enter Theme..."
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-400 focus:outline-none text-sm text-white"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* PLAYERS LIST */}
          <section>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-2 tracking-widest">Invite Players</label>
            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className="flex gap-2 group animate-in slide-in-from-left-2">
                  <input
                    placeholder="Player Name"
                    value={p.name}
                    onChange={(e) => updatePlayer(i, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-purple-400 focus:outline-none"
                  />
                  <input
                    placeholder="Player Email"
                    value={p.email}
                    onChange={(e) => updatePlayer(i, 'email', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>
              ))}
              <button 
                onClick={addPlayer} 
                className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-purple-300 text-xs font-bold hover:border-yellow-400/50 hover:text-yellow-400 transition-all"
              >
                + ADD ANOTHER PLAYER
              </button>
            </div>
          </section>

          <button
            onClick={handleCreate}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)] mt-8 transition-all active:scale-95"
          >
            LAUNCH CONTEST
          </button>
        </div>
      </div>
    </div>
  );
};

const GameView = ({ game, setView, saveGame, playerEmail, setCurrentGame, refreshGame }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const isGameMaster = game.gameMaster === playerEmail;

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => setView('home')} className="text-purple-300 hover:text-white">← Dashboard</button>
        <button onClick={refreshGame} className="p-2 bg-white/10 rounded-full hover:rotate-180 transition-all duration-500">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/10 flex justify-between items-end">
          <div>
            <div className="text-yellow-400 font-mono text-sm mb-1">CODE: {game.id}</div>
            <h1 className="text-4xl font-black">{game.name}</h1>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-widest">Current Theme</div>
            <div className="text-xl font-bold">Week {game.currentWeek}: {game.themes[game.currentWeek-1]}</div>
          </div>
        </div>

        <div className="flex border-b border-white/10">
          {['overview', 'submit', 'vote', 'results'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === tab ? 'bg-white/10 text-yellow-400 border-b-2 border-yellow-400' : 'text-purple-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab game={game} isGameMaster={isGameMaster} saveGame={saveGame} refreshGame={refreshGame} />}
          {activeTab === 'submit' && <SubmitTab game={game} playerEmail={playerEmail} saveGame={saveGame} refreshGame={refreshGame} />}
          {activeTab === 'vote' && <VoteTab game={game} playerEmail={playerEmail} saveGame={saveGame} refreshGame={refreshGame} />}
          {activeTab === 'results' && <ResultsTab game={game} />}
        </div>
      </div>
    </div>
  );
};

// --- TAB CONTENT COMPONENTS ---

const OverviewTab = ({ game, isGameMaster, saveGame, refreshGame }) => {
  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const submitted = Object.keys(currentWeekData.submissions || {}).length;
  const voted = Object.keys(currentWeekData.votes || {}).length;
  const allSubmitted = submitted === game.players.length;
  const allVoted = voted === game.players.length;

  // Check if Spotify is connected (checking both token fields in the game object)
  const spotifyConnected = !!(game.spotify_access_token && game.spotify_refresh_token);

  const handleConnectSpotify = () => {
  // Redirect to Spotify OAuth login with game ID in state
  window.location.href = `/api/spotify-login?gameId=${game.id}`;
};

  const handleCreatePlaylist = async () => {
    if (!allSubmitted) {
      return alert('All players must submit their songs before creating a playlist.');
    }

    if (!spotifyConnected) {
      return alert('Please connect your Spotify account first.');
    }

    const confirmCreate = window.confirm(
      `Create a Spotify playlist for Week ${game.currentWeek}?\n\nThis will include all ${submitted} submitted songs.`
    );

    if (!confirmCreate) return;

    try {
      const response = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          weekNumber: game.currentWeek
        })
      });

      const data = await response.json();

      if (response.ok && data.playlistUrl) {
        // Save playlist URL to game data
        const updatedGame = { ...game };
        if (!updatedGame.weeks[game.currentWeek].playlistUrl) {
          updatedGame.weeks[game.currentWeek].playlistUrl = data.playlistUrl;
          await saveGame(updatedGame);
        }

        alert('Playlist created successfully! Opening Spotify...');
        window.open(data.playlistUrl, '_blank');
        await refreshGame();
      } else {
        alert(`Failed to create playlist: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Playlist creation error:', error);
      alert('Error creating playlist. Check console for details.');
    }
  };

  const handleNextWeek = async () => {
    if (voted < game.players.length) {
      if (!window.confirm("Not everyone has voted. Advance anyway?")) return;
    }
    const updatedGame = { ...game, currentWeek: game.currentWeek + 1 };
    await saveGame(updatedGame);
    await refreshGame();
  };

  // Check if playlist already created for this week
  const playlistCreated = currentWeekData.playlistUrl;

  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="text-xs font-bold text-purple-300 uppercase mb-2">Submissions</div>
          <div className="text-4xl font-black text-white">{submitted} / {game.players.length}</div>
          {allSubmitted && (
            <div className="text-xs text-green-400 mt-2">✓ All songs submitted!</div>
          )}
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="text-xs font-bold text-purple-300 uppercase mb-2">Votes Cast</div>
          <div className="text-4xl font-black text-white">{voted} / {game.players.length}</div>
          {allVoted && (
            <div className="text-xs text-green-400 mt-2">✓ All votes in!</div>
          )}
        </div>
      </div>

      {/* Spotify Integration Section - Only for Game Master */}
      {isGameMaster && (
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-2 border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-6 h-6 text-green-400" />
            <h3 className="font-bold text-lg text-white">Spotify Integration</h3>
          </div>

          {!spotifyConnected ? (
            <div>
              <p className="text-purple-200 text-sm mb-4">
                Connect your Spotify account to automatically create playlists for each week's submissions.
              </p>
              <button
                onClick={handleConnectSpotify}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Music className="w-5 h-5" />
                Connect Spotify Account
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-bold">Spotify Connected</span>
              </div>

              {playlistCreated ? (
                <div className="bg-black/20 p-4 rounded-xl">
                  <div className="text-sm text-purple-200 mb-2">Week {game.currentWeek} Playlist Created</div>
<a 
  href={playlistCreated}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold"
>
  <Music className="w-4 h-4" />
  Open in Spotify
</a>
                </div>
              ) : allSubmitted ? (
                <button
                  onClick={handleCreatePlaylist}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Week {game.currentWeek} Playlist
                </button>
              ) : (
                <div className="text-sm text-purple-300 text-center py-3">
                  Playlist will be available once all songs are submitted
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Players List */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" /> Players in Battle
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {game.players.map((p) => {
            const hasSubmitted = currentWeekData.submissions?.[p.email];
            const hasVoted = currentWeekData.votes?.[p.email];
            
            return (
              <div key={p.email} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                <div>
                  <span className="text-sm font-medium">{p.name}</span>
                  <div className="flex gap-2 mt-1">
                    {hasSubmitted && (
                      <span className="text-[10px] text-green-400">✓ Song</span>
                    )}
                    {hasVoted && (
                      <span className="text-[10px] text-blue-400">✓ Vote</span>
                    )}
                  </div>
                </div>
                {p.email === game.gameMaster && <Crown className="w-3 h-3 text-yellow-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Week Button */}
      {isGameMaster && game.currentWeek < game.totalWeeks && allVoted && (
        <button
          onClick={handleNextWeek}
          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          ADVANCE TO NEXT WEEK <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const SubmitTab = ({ game, playerEmail, saveGame, refreshGame }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const mySubmission = currentWeekData.submissions?.[playerEmail];

  // Check if song is already submitted by someone else - MOVED OUTSIDE useEffect
  const checkForDuplicates = (spotifyId) => {
    const submissions = currentWeekData.submissions || {};
    
    for (const [email, submission] of Object.entries(submissions)) {
      if (submission.spotifyId === spotifyId && email !== playerEmail) {
        const submitterName = game.players.find(p => p.email === email)?.name || email;
        return { isDuplicate: true, submittedBy: submitterName };
      }
    }
    
    return { isDuplicate: false };
  };

  // Debounced search function
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/spotify-search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (data.tracks) {
          setSearchResults(data.tracks);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        alert('Failed to search Spotify. Please try again.');
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const selectSong = (track) => {
    const duplicateCheck = checkForDuplicates(track.id);
    
    if (duplicateCheck.isDuplicate) {
      alert(`Sorry! "${track.title}" has already been submitted by ${duplicateCheck.submittedBy}.\n\nPlease choose a different song.`);
      return;
    }
    
    setSelectedSong(track);
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedSong) {
      return alert("Please select a song from Spotify.");
    }
    
    const updatedGame = { ...game };
    if (!updatedGame.weeks[game.currentWeek]) {
      updatedGame.weeks[game.currentWeek] = { submissions: {}, votes: {} };
    }
    
    updatedGame.weeks[game.currentWeek].submissions[playerEmail] = {
      title: selectedSong.title,
      artist: selectedSong.artist,
      spotifyUri: selectedSong.uri,
      spotifyId: selectedSong.id,
      albumArt: selectedSong.albumArt,
      albumArtLarge: selectedSong.albumArtLarge,
      previewUrl: selectedSong.previewUrl,
      spotifyUrl: selectedSong.spotifyUrl,
      timestamp: new Date().toISOString()
    };

    await saveGame(updatedGame);
    await refreshGame();
  };

  if (mySubmission) {
    return (
      <div className="text-center py-10 bg-green-500/10 border border-green-500/30 rounded-3xl">
        <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Song Submitted!</h2>
        
        {mySubmission.albumArt && (
          <img 
            src={mySubmission.albumArt} 
            alt="Album cover"
            className="w-32 h-32 mx-auto rounded-lg shadow-lg mb-4 mt-6"
          />
        )}
        
        <div className="text-xl font-bold">{mySubmission.title}</div>
        <p className="text-purple-200">{mySubmission.artist}</p>
        
        {mySubmission.spotifyUrl && (
          <a 
            href={mySubmission.spotifyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-sm transition-all"
          >
            Open in Spotify
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Submit Your Song</h2>
        <p className="text-purple-300 text-sm">
          Theme: <span className="font-bold text-yellow-400">{game.themes[game.currentWeek - 1]}</span>
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search Spotify for a song..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-yellow-400 focus:outline-none text-white placeholder-purple-300"
        />
        
        {searching && (
          <div className="absolute right-4 top-4">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
          </div>
        )}

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-purple-900 border border-white/20 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
            {searchResults.map((track) => {
              const duplicateCheck = checkForDuplicates(track.id);
              const isDuplicate = duplicateCheck.isDuplicate;
              
              return (
                <button
                  key={track.id}
                  onClick={() => selectSong(track)}
                  disabled={isDuplicate}
                  className={`w-full p-4 flex items-center gap-4 text-left transition-all border-b border-white/5 last:border-b-0 ${
                    isDuplicate 
                      ? 'opacity-50 cursor-not-allowed bg-red-500/10' 
                      : 'hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  {track.albumArt && (
                    <img 
                      src={track.albumArt} 
                      alt={track.title}
                      className="w-12 h-12 rounded shadow-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{track.title}</div>
                    <div className="text-sm text-purple-300 truncate">{track.artist}</div>
                    <div className="text-xs text-purple-400 truncate">{track.album}</div>
                    {isDuplicate && (
                      <div className="text-xs text-red-400 mt-1">
                        ✗ Already submitted by {duplicateCheck.submittedBy}
                      </div>
                    )}
                  </div>

                  {!isDuplicate && track.previewUrl && (
                    <Music className="w-4 h-4 text-green-400 flex-shrink-0" title="Preview available" />
                  )}
                  
                  {isDuplicate && (
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {showResults && searchResults.length === 0 && !searching && (
          <div className="absolute z-10 w-full mt-2 bg-purple-900 border border-white/20 rounded-2xl p-6 text-center text-purple-300">
            No songs found. Try a different search.
          </div>
        )}
      </div>

      {selectedSong && (
        <div className="bg-white/10 border-2 border-yellow-400 rounded-2xl p-6">
          <div className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4">Selected Song</div>
          
          <div className="flex items-center gap-4">
            {selectedSong.albumArtLarge && (
              <img 
                src={selectedSong.albumArtLarge} 
                alt={selectedSong.title}
                className="w-24 h-24 rounded-lg shadow-xl flex-shrink-0"
              />
            )}
            
            <div className="flex-1">
              <div className="text-xl font-bold text-white mb-1">{selectedSong.title}</div>
              <div className="text-purple-200 mb-2">{selectedSong.artist}</div>
              <div className="text-sm text-purple-300">{selectedSong.album}</div>
            </div>
          </div>

          {selectedSong.previewUrl && (
            <audio 
              controls 
              className="w-full mt-4"
              src={selectedSong.previewUrl}
            >
              Your browser does not support audio playback.
            </audio>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setSelectedSong(null)}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
            >
              Change Song
            </button>
            
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-purple-900 rounded-xl font-black transition-all shadow-lg"
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      )}

      {!selectedSong && (
        <div className="text-center text-sm text-purple-400 mt-8">
          <Music className="w-6 h-6 mx-auto mb-2 opacity-50" />
          Start typing to search millions of songs on Spotify
        </div>
      )}
    </div>
  );
};

const VoteTab = ({ game, playerEmail, saveGame }) => {
  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const submissions = Object.entries(currentWeekData.submissions || {});
  const myVote = currentWeekData.votes?.[playerEmail];

  const [rankings, setRankings] = useState({});

  const submitVote = async () => {
    const updatedGame = { ...game };
    if (!updatedGame.weeks[game.currentWeek].votes) updatedGame.weeks[game.currentWeek].votes = {};
    updatedGame.weeks[game.currentWeek].votes[playerEmail] = rankings;

    // Apply points to cumulative score
    Object.entries(rankings).forEach(([email, rank]) => {
      // Logic: 1st place = 1pt (lower is better in this game)
      updatedGame.cumulativeScores[email] += parseInt(rank);
    });

    await saveGame(updatedGame);
  };

  if (myVote) return <div className="text-center py-10">You have already voted for this week!</div>;
  if (submissions.length < 2) return <div className="text-center py-10">Waiting for more songs to be submitted...</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-purple-300 mb-6 text-center">Rank the songs (1 = Best, Higher = Worse)</p>
      {submissions.filter(([email]) => email !== playerEmail).map(([email, data]) => (
        <div key={email} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex-1">
            <div className="font-bold">{data.title}</div>
            <div className="text-xs text-purple-300">{data.artist}</div>
          </div>
          <select 
            className="bg-purple-800 border border-white/20 rounded-lg p-2"
            onChange={e => setRankings({...rankings, [email]: e.target.value})}
          >
            <option value="">Rank...</option>
            {submissions.map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
          </select>
        </div>
      ))}
      <button onClick={submitVote} className="w-full py-4 bg-yellow-400 text-purple-900 font-black rounded-2xl mt-8 shadow-xl">
        CAST FINAL VOTE
      </button>
    </div>
  );
};

const ResultsTab = ({ game }) => {
  const players = game.players.sort((a, b) => 
    game.cumulativeScores[a.email] - game.cumulativeScores[b.email]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-center font-black text-2xl mb-8 uppercase tracking-widest text-yellow-400">The Leaderboard</h2>
      {players.map((p, i) => (
        <div key={p.email} className={`flex items-center gap-4 p-5 rounded-3xl border ${i === 0 ? 'bg-yellow-400/20 border-yellow-400' : 'bg-white/5 border-white/10'}`}>
          <div className="text-3xl font-black opacity-30"># {i + 1}</div>
          <div className="flex-1">
            <div className="font-bold text-lg">{p.name}</div>
            <div className="text-xs text-purple-300">{p.email}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black">{game.cumulativeScores[p.email]}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Points</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongContestApp;