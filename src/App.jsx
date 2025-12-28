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
  const [themes, setThemes] = useState(['', '', '', '']);
  const [gameMasterName, setGameMasterName] = useState('');
  const [players, setPlayers] = useState([]);

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
    if (!gameName.trim() || !gameMasterName.trim()) {
      alert('Please fill in game name and your name.');
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
      themes: themes.slice(0, totalWeeks),
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
        <h1 className="text-3xl font-black mb-8">CREATE NEW CONTEST</h1>
        
        <div className="space-y-6">
          <section>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-2">Game Name</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="e.g. 2024 Office Bangers"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 focus:outline-none"
            />
          </section>

          <section>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-2">Themes per Week</label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((theme, i) => (
                <input
                  key={i}
                  value={theme}
                  onChange={(e) => updateTheme(i, e.target.value)}
                  placeholder={`Week ${i+1} Theme`}
                  className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-yellow-400 focus:outline-none"
                />
              ))}
            </div>
          </section>

          <section>
            <label className="block text-xs font-bold text-purple-300 uppercase mb-2">Players</label>
            <div className="space-y-2">
              <div className="flex gap-2 p-3 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                <div className="flex-1 text-sm font-bold">{gameMasterName || 'You'} (GM)</div>
                <div className="text-sm opacity-60">{playerEmail}</div>
              </div>
              {players.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="Name"
                    value={p.name}
                    onChange={(e) => updatePlayer(i, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20"
                  />
                  <input
                    placeholder="Email"
                    value={p.email}
                    onChange={(e) => updatePlayer(i, 'email', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20"
                  />
                </div>
              ))}
              <button onClick={addPlayer} className="text-yellow-400 text-sm font-bold">+ Add Player</button>
            </div>
          </section>

          <button
            onClick={handleCreate}
            className="w-full bg-yellow-400 text-purple-900 font-black py-4 rounded-2xl shadow-xl mt-8"
          >
            START CONTEST
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

  const handleNextWeek = async () => {
    if (voted < game.players.length) {
      if (!window.confirm("Not everyone has voted. Advance anyway?")) return;
    }
    const updatedGame = { ...game, currentWeek: game.currentWeek + 1 };
    await saveGame(updatedGame);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="text-xs font-bold text-purple-300 uppercase mb-2">Submissions</div>
          <div className="text-4xl font-black text-white">{submitted} / {game.players.length}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="text-xs font-bold text-purple-300 uppercase mb-2">Votes Cast</div>
          <div className="text-4xl font-black text-white">{voted} / {game.players.length}</div>
        </div>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Players in Battle</h3>
        <div className="grid grid-cols-2 gap-3">
          {game.players.map(p => (
            <div key={p.email} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
              <span className="text-sm font-medium">{p.name}</span>
              {p.email === game.gameMaster && <Crown className="w-3 h-3 text-yellow-400" />}
            </div>
          ))}
        </div>
      </div>

      {isGameMaster && game.currentWeek < game.totalWeeks && (
        <button onClick={handleNextWeek} className="w-full py-4 bg-green-500 font-bold rounded-2xl flex items-center justify-center gap-2">
          ADVANCE TO NEXT WEEK <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const SubmitTab = ({ game, playerEmail, saveGame, refreshGame }) => {
  const [song, setSong] = useState({ title: '', artist: '', link: '' });
  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const mySubmission = currentWeekData.submissions?.[playerEmail];

  const handleSubmit = async () => {
    if (!song.title || !song.artist) return alert("Title and Artist are required.");
    
    const updatedGame = { ...game };
    if (!updatedGame.weeks[game.currentWeek]) updatedGame.weeks[game.currentWeek] = { submissions: {}, votes: {} };
    
    updatedGame.weeks[game.currentWeek].submissions[playerEmail] = {
      ...song,
      timestamp: new Date().toISOString()
    };

    await saveGame(updatedGame);
  };

  if (mySubmission) {
    return (
      <div className="text-center py-10 bg-green-500/10 border border-green-500/30 rounded-3xl">
        <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Song Submitted!</h2>
        <p className="text-purple-200">{mySubmission.title} by {mySubmission.artist}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <input
        placeholder="Song Title"
        className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20"
        onChange={e => setSong({...song, title: e.target.value})}
      />
      <input
        placeholder="Artist"
        className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20"
        onChange={e => setSong({...song, artist: e.target.value})}
      />
      <input
        placeholder="Spotify URL (Optional)"
        className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20"
        onChange={e => setSong({...song, link: e.target.value})}
      />
      <button onClick={handleSubmit} className="w-full py-4 bg-yellow-400 text-purple-900 font-black rounded-2xl">
        SUBMIT TO CLOUD
      </button>
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