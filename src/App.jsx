import React, { useState, useEffect } from 'react';
import { Music, Users, Trophy, Calendar, Vote, Plus, X, ChevronRight, Crown, Send, Download } from 'lucide-react';
import './App.css';

const SongContestApp = () => {
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [playerEmail, setPlayerEmail] = useState('');
  const [view, setView] = useState('home'); // home, create, game
  const [loading, setLoading] = useState(true);

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const result = await window.storage.list('game:', true);
      if (result && result.keys) {
        const gamePromises = result.keys.map(async (key) => {
          const gameResult = await window.storage.get(key, true);
          return gameResult ? JSON.parse(gameResult.value) : null;
        });
        const loadedGames = (await Promise.all(gamePromises)).filter(Boolean);
        setGames(loadedGames);
      }
    } catch (error) {
      console.log('No games found yet');
    }
    setLoading(false);
  };

  const saveGame = async (game) => {
    try {
const { data, error } = await supabase
  .from('games')
  .upsert({ id: game.id, data: game });
      await loadGames();
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Player Email Display - Always visible */}
      {playerEmail && (
        <div className="fixed top-4 right-4 bg-white/20 backdrop-blur-lg rounded-lg px-4 py-2 z-50">
          <div className="text-white text-sm">Playing as:</div>
          <div className="text-yellow-400 font-bold text-sm">{playerEmail}</div>
          <button
            onClick={() => {
              setPlayerEmail('');
              setView('home');
              setCurrentGame(null);
            }}
            className="text-xs text-purple-200 hover:text-white underline mt-1"
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
        />
      )}
    </div>
  );
};

const HomeView = ({ games, setView, setCurrentGame, playerEmail, setPlayerEmail }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [gameCode, setGameCode] = useState('');

  const handleJoinGame = () => {
    const game = games.find(g => g.id === gameCode.toUpperCase());
    if (game && playerEmail.trim()) {
      // Check if email is registered for this game
      const playerEntry = game.players.find(p => p.email.toLowerCase() === playerEmail.toLowerCase());
      if (!playerEntry) {
        alert('This email is not registered for this game. Please contact the game master.');
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
        <div className="flex items-center justify-center mb-4">
          <Music className="w-16 h-16 text-yellow-400" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">The Song Contest</h1>
        <p className="text-xl text-purple-200">Where music taste becomes competition</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mb-6">
        <input
          type="email"
          placeholder="Enter your email"
          value={playerEmail}
          onChange={(e) => setPlayerEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none mb-4"
        />
        
        <button
          onClick={() => setView('create')}
          disabled={!playerEmail.trim()}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-4 rounded-lg mb-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Game
        </button>

        <button
          onClick={() => setShowJoin(!showJoin)}
          disabled={!playerEmail.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Users className="w-5 h-5" />
          Join Existing Game
        </button>

        {showJoin && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter game code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none mb-2"
            />
            <button
              onClick={handleJoinGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
            >
              Join Game
            </button>
          </div>
        )}
      </div>

      {games.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Active Games</h2>
          <div className="space-y-2">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => {
                  if (playerEmail.trim()) {
                    const playerEntry = game.players.find(p => p.email.toLowerCase() === playerEmail.toLowerCase());
                    if (!playerEntry) {
                      alert('This email is not registered for this game.');
                      return;
                    }
                    setCurrentGame(game);
                    setView('game');
                  } else {
                    alert('Please enter your email first.');
                  }
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white p-4 rounded-lg text-left transition-all"
              >
                <div className="font-bold">{game.name}</div>
                <div className="text-sm text-purple-200">Code: {game.id} • Week {game.currentWeek} of {game.totalWeeks}</div>
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
  const [themes, setThemes] = useState(['']);
  const [gameMasterName, setGameMasterName] = useState('');
  const [players, setPlayers] = useState([]);

  const addTheme = () => setThemes([...themes, '']);
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
  const removePlayer = (index) => setPlayers(players.filter((_, i) => i !== index));

  const handleCreate = async () => {
    if (!gameName.trim()) {
      alert('Please enter a game name');
      return;
    }
    if (!gameMasterName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (themes.filter(t => t.trim()).length < totalWeeks) {
      alert(`Please enter themes for all ${totalWeeks} weeks`);
      return;
    }
    const validPlayers = players.filter(p => p.name.trim() && p.email.trim());
    if (validPlayers.length < 1) {
      alert('Please add at least 1 other player with name and email');
      return;
    }

    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Add game master as first player
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
      themes: themes.filter(t => t.trim()),
      players: allPlayers,
      weeks: {},
      cumulativeScores: {}
    };

    // Initialize cumulative scores
    allPlayers.forEach(player => {
      game.cumulativeScores[player.email] = 0;
    });

    await saveGame(game);
    setCurrentGame(game);
    setView('game');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setView('home')}
          className="text-white mb-6 hover:text-yellow-400 transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-6">Create New Game</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-bold mb-2">Game Name</label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="e.g., Office Song Battle"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Number of Weeks</label>
              <input
                type="number"
                value={totalWeeks}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setTotalWeeks(val);
                  if (themes.length < val) {
                    setThemes([...themes, ...Array(val - themes.length).fill('')]);
                  }
                }}
                min="1"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Weekly Themes</label>
              <div className="space-y-2">
                {themes.slice(0, totalWeeks).map((theme, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => updateTheme(index, e.target.value)}
                      placeholder={`Week ${index + 1} theme (e.g., Summer Vibes)`}
                      className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Your Name (Game Master)</label>
              <input
                type="text"
                value={gameMasterName}
                onChange={(e) => setGameMasterName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
              />
              <div className="text-sm text-purple-200 mt-1">Email: {playerEmail}</div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Other Players</label>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      placeholder="Player name"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
                    />
                    <input
                      type="email"
                      value={player.email}
                      onChange={(e) => updatePlayer(index, 'email', e.target.value)}
                      placeholder="Email address"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
                    />
                    <button
                      onClick={() => removePlayer(index)}
                      className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addPlayer}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Player
                </button>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Trophy className="w-5 h-5" />
              Create Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameView = ({ game, setView, saveGame, playerEmail, setCurrentGame }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const isGameMaster = game.gameMaster === playerEmail;
  const currentWeekData = game.weeks[game.currentWeek] || null;
  
  // Get player name from email
  const getPlayerName = (email) => {
    const player = game.players.find(p => p.email === email);
    return player ? player.name : email;
  };

  const refreshGame = async () => {
    try {
      const result = await window.storage.get(`game:${game.id}`, true);
      if (result) {
        const updatedGame = JSON.parse(result.value);
        setCurrentGame(updatedGame);
      }
    } catch (error) {
      console.error('Error refreshing game:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setView('home')}
          className="text-white mb-6 hover:text-yellow-400 transition-colors"
        >
          ← Back to Home
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white">{game.name}</h1>
              <p className="text-purple-200">Game Code: <span className="font-mono font-bold text-yellow-400">{game.id}</span></p>
            </div>
            {isGameMaster && (
              <div className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Game Master
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-yellow-400 text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'submit'
                  ? 'bg-yellow-400 text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Submit Song
            </button>
            <button
              onClick={() => setActiveTab('vote')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'vote'
                  ? 'bg-yellow-400 text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Vote
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'results'
                  ? 'bg-yellow-400 text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Results
            </button>
          </div>

          {activeTab === 'overview' && (
            <OverviewTab 
              game={game} 
              isGameMaster={isGameMaster}
              saveGame={saveGame}
              refreshGame={refreshGame}
              getPlayerName={getPlayerName}
            />
          )}
          {activeTab === 'submit' && (
            <SubmitTab 
              game={game}
              playerEmail={playerEmail}
              saveGame={saveGame}
              refreshGame={refreshGame}
              getPlayerName={getPlayerName}
            />
          )}
          {activeTab === 'vote' && (
            <VoteTab 
              game={game}
              playerEmail={playerEmail}
              saveGame={saveGame}
              refreshGame={refreshGame}
              getPlayerName={getPlayerName}
            />
          )}
          {activeTab === 'results' && (
            <ResultsTab 
              game={game}
              getPlayerName={getPlayerName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ game, isGameMaster, saveGame, refreshGame, getPlayerName }) => {
  const currentWeekData = game.weeks[game.currentWeek];
  const theme = game.themes[game.currentWeek - 1];

  const submissions = currentWeekData?.submissions || {};
  const votes = currentWeekData?.votes || {};

  const submittedEmails = Object.keys(submissions);
  const votedEmails = Object.keys(votes);
  const playersWhoNeedToSubmit = game.players.filter(p => !submittedEmails.includes(p.email)).map(p => p.name);
  const playersWhoNeedToVote = game.players.filter(p => !votedEmails.includes(p.email)).map(p => p.name);

  const allSubmitted = submittedEmails.length === game.players.length;
  const allVoted = votedEmails.length === game.players.length;

  const handleAdvanceWeek = async () => {
    if (!allVoted) {
      alert('Not all players have voted yet!');
      return;
    }

    if (game.currentWeek < game.totalWeeks) {
      const updatedGame = { ...game, currentWeek: game.currentWeek + 1 };
      await saveGame(updatedGame);
      await refreshGame();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Week {game.currentWeek} of {game.totalWeeks}</h2>
        <div className="text-xl text-yellow-400 mb-4">Theme: <span className="font-bold">{theme}</span></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-white font-bold mb-2">Song Submissions</div>
            <div className="text-3xl font-bold text-yellow-400">{submittedEmails.length} / {game.players.length}</div>
            {!allSubmitted && (
              <div className="mt-2 text-sm text-purple-200">
                Waiting on: {playersWhoNeedToSubmit.join(', ')}
              </div>
            )}
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-white font-bold mb-2">Votes Cast</div>
            <div className="text-3xl font-bold text-yellow-400">{votedEmails.length} / {game.players.length}</div>
            {allSubmitted && !allVoted && (
              <div className="mt-2 text-sm text-purple-200">
                Waiting on: {playersWhoNeedToVote.join(', ')}
              </div>
            )}
          </div>
        </div>

        {isGameMaster && allVoted && game.currentWeek < game.totalWeeks && (
          <button
            onClick={handleAdvanceWeek}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
            Advance to Week {game.currentWeek + 1}
          </button>
        )}
      </div>

      <div className="bg-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Players</h3>
        <div className="grid grid-cols-2 gap-2">
          {game.players.map(player => (
            <div key={player.email} className="bg-white/10 rounded-lg p-3 text-white">
              <div className="font-bold">{player.name}</div>
              <div className="text-xs text-purple-200">{player.email}</div>
              {player.email === game.gameMaster && (
                <Crown className="inline-block w-4 h-4 ml-2 text-yellow-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SubmitTab = ({ game, playerEmail, saveGame, refreshGame, getPlayerName }) => {
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState(null);

  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const hasSubmitted = currentWeekData.submissions && currentWeekData.submissions[playerEmail];

  // Levenshtein distance calculation
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Calculate similarity ratio
  const similarityRatio = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    
    if (longerLength === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longerLength - distance) / longerLength;
  };

  // Check for duplicates
  const checkForDuplicates = (title, artist) => {
    const submissions = currentWeekData.submissions || {};
    const existingSubmissions = Object.entries(submissions).filter(([email]) => email !== playerEmail);
    
    for (const [submitter, submission] of existingSubmissions) {
      const titleSimilarity = similarityRatio(title.toLowerCase(), submission.title.toLowerCase());
      const artistSimilarity = similarityRatio(artist.toLowerCase(), submission.artist.toLowerCase());
      
      // If both title and artist are 80% similar, flag as possible duplicate
      if (titleSimilarity >= 0.8 && artistSimilarity >= 0.8) {
        return {
          isDuplicate: true,
          existingSong: submission,
          titleSimilarity,
          artistSimilarity
        };
      }
    }
    
    return { isDuplicate: false };
  };

  const handleSubmit = async () => {
    if (!songTitle.trim() || !artist.trim()) {
      alert('Please enter both song title and artist');
      return;
    }

    // Check for duplicates
    const duplicateResult = checkForDuplicates(songTitle, artist);
    
    if (duplicateResult.isDuplicate) {
      // Show duplicate confirmation popup
      setDuplicateCheck({
        title: songTitle,
        artist: artist,
        spotifyLink: spotifyLink,
        existingSong: duplicateResult.existingSong
      });
      return;
    }

    // No duplicates, proceed with submission
    await confirmSubmission();
  };

  const confirmSubmission = async () => {
    const updatedGame = { ...game };
    if (!updatedGame.weeks[game.currentWeek]) {
      updatedGame.weeks[game.currentWeek] = { submissions: {}, votes: {} };
    }

    updatedGame.weeks[game.currentWeek].submissions[playerEmail] = {
      title: duplicateCheck ? duplicateCheck.title : songTitle,
      artist: duplicateCheck ? duplicateCheck.artist : artist,
      spotifyLink: duplicateCheck ? duplicateCheck.spotifyLink : spotifyLink,
      submittedBy: playerEmail
    };

    await saveGame(updatedGame);
    await refreshGame();
    setSongTitle('');
    setArtist('');
    setSpotifyLink('');
    setDuplicateCheck(null);
  };

  const handleCancelDuplicate = () => {
    setSongTitle('');
    setArtist('');
    setSpotifyLink('');
    setDuplicateCheck(null);
  };

  const theme = game.themes[game.currentWeek - 1];

  return (
    <div className="space-y-6">
      {/* Duplicate Check Popup */}
      {duplicateCheck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-900 border-4 border-yellow-400 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">⚠️ Possible Duplicate Detected</h3>
            <p className="text-purple-200 mb-4">
              Your submission appears similar to an existing song:
            </p>
            
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="text-white font-bold text-lg">{duplicateCheck.existingSong.title}</div>
              <div className="text-purple-200">{duplicateCheck.existingSong.artist}</div>
            </div>

            <p className="text-purple-200 mb-6">
              Is your submission the same song as this existing entry?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCancelDuplicate}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all"
              >
                Yes, it's a duplicate - Let me choose another song
              </button>
              <button
                onClick={confirmSubmission}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all"
              >
                No, my song is different - Submit anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Submit Your Song</h2>
        <div className="text-lg text-yellow-400 mb-6">Week {game.currentWeek} Theme: <span className="font-bold">{theme}</span></div>

        {hasSubmitted ? (
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">✓ Your Submission</h3>
            <div className="text-white">
              <div className="font-bold text-lg">{hasSubmitted.title}</div>
              <div className="text-purple-200">{hasSubmitted.artist}</div>
              {hasSubmitted.spotifyLink && (
                <a
                  href={hasSubmitted.spotifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 underline mt-2 inline-block"
                >
                  Open in Spotify
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-bold mb-2">Song Title *</label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="Enter song title"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Artist *</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Spotify Link (Optional)</label>
              <input
                type="text"
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-5 h-5" />
              Submit Song
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Submissions So Far</h3>
        <div className="space-y-2">
          {game.players.map(player => {
            const submission = currentWeekData.submissions?.[player.email];
            return (
              <div key={player.email} className="bg-white/10 rounded-lg p-4">
                <div className="text-white font-bold">{player.name}</div>
                {submission ? (
                  <div className="text-green-400 text-sm">✓ Submitted</div>
                ) : (
                  <div className="text-purple-300 text-sm">Waiting...</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const VoteTab = ({ game, playerEmail, saveGame, refreshGame, getPlayerName }) => {
  const currentWeekData = game.weeks[game.currentWeek];
  const [rankings, setRankings] = useState({});

  if (!currentWeekData || !currentWeekData.submissions) {
    return (
      <div className="bg-white/20 rounded-xl p-6">
        <p className="text-white">Waiting for all songs to be submitted...</p>
      </div>
    );
  }

  const submissions = currentWeekData.submissions;
  const submissionEntries = Object.entries(submissions).filter(([email]) => email !== playerEmail);

  if (submissionEntries.length === 0) {
    return (
      <div className="bg-white/20 rounded-xl p-6">
        <p className="text-white">No other submissions to vote on yet.</p>
      </div>
    );
  }

  const allSubmitted = Object.keys(submissions).length === game.players.length;
  const hasVoted = currentWeekData.votes && currentWeekData.votes[playerEmail];

  const handleRankChange = (email, rank) => {
    const newRank = parseInt(rank);
    const newRankings = { ...rankings };
    
    // Remove the selected rank from any other player
    Object.keys(newRankings).forEach(e => {
      if (e !== email && newRankings[e] === newRank) {
        delete newRankings[e];
      }
    });
    
    newRankings[email] = newRank;
    setRankings(newRankings);
  };

  const handleSubmitVotes = async () => {
    const rankValues = Object.values(rankings);
    const expectedRanks = Array.from({ length: submissionEntries.length }, (_, i) => i + 1);
    
    if (rankValues.length !== submissionEntries.length) {
      alert('Please rank all songs');
      return;
    }

    const sortedRanks = [...rankValues].sort((a, b) => a - b);
    const allRanksValid = expectedRanks.every((rank, i) => sortedRanks[i] === rank);

    if (!allRanksValid) {
      alert(`Please use each rank from 1 to ${submissionEntries.length} exactly once`);
      return;
    }

    const updatedGame = { ...game };
    updatedGame.weeks[game.currentWeek].votes[playerEmail] = rankings;

    // Calculate scores if all votes are in
    const allVotesIn = Object.keys(updatedGame.weeks[game.currentWeek].votes).length === game.players.length;
    
    if (allVotesIn) {
      const scores = {};
      game.players.forEach(player => {
        scores[player.email] = 0;
      });

      // Sum up points for each player
      Object.values(updatedGame.weeks[game.currentWeek].votes).forEach(vote => {
        Object.entries(vote).forEach(([email, rank]) => {
          scores[email] += rank;
        });
      });

      updatedGame.weeks[game.currentWeek].scores = scores;

      // Update cumulative scores
      Object.entries(scores).forEach(([email, score]) => {
        updatedGame.cumulativeScores[email] = (updatedGame.cumulativeScores[email] || 0) + score;
      });
    }

    await saveGame(updatedGame);
    await refreshGame();
  };

  const theme = game.themes[game.currentWeek - 1];

  if (hasVoted) {
    return (
      <div className="bg-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Your Votes</h2>
        <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-6">
          <p className="text-white mb-4">✓ You have already voted for this week!</p>
          <div className="space-y-2">
            {Object.entries(hasVoted)
              .sort(([, a], [, b]) => a - b)
              .map(([email, rank]) => {
                const submission = submissions[email];
                return (
                  <div key={email} className="bg-white/10 rounded-lg p-4 text-white">
                    <div className="font-bold">#{rank} - {submission.title}</div>
                    <div className="text-sm text-purple-200">{submission.artist}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  if (!allSubmitted) {
    return (
      <div className="bg-white/20 rounded-xl p-6">
        <p className="text-white">Waiting for all players to submit their songs before voting begins...</p>
        <div className="mt-4 text-purple-200">
          {game.players.length - Object.keys(submissions).length} player(s) still need to submit.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Vote for Songs</h2>
        <div className="text-lg text-yellow-400 mb-6">Week {game.currentWeek} Theme: <span className="font-bold">{theme}</span></div>
        <p className="text-purple-200 mb-6">
          Rank each song from 1 (favorite) to {submissionEntries.length} (least favorite). Lower total scores win!
        </p>

        <div className="space-y-4">
          {submissionEntries.map(([email, submission]) => (
            <div key={email} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-white font-bold text-lg">{submission.title}</div>
                  <div className="text-purple-200">{submission.artist}</div>
                  {submission.spotifyLink && (
                    <a
                      href={submission.spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 underline text-sm mt-2 inline-block"
                    >
                      Listen on Spotify
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white font-bold">Rank:</label>
                  <select
                    value={rankings[email] || ''}
                    onChange={(e) => handleRankChange(email, e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="">-</option>
                    {Array.from({ length: submissionEntries.length }, (_, i) => i + 1).map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmitVotes}
          className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <Vote className="w-5 h-5" />
          Submit Votes
        </button>
      </div>
    </div>
  );
};

const ResultsTab = ({ game, getPlayerName }) => {
  const weeks = Object.keys(game.weeks).map(Number).sort((a, b) => a - b);

  // Calculate correlation matrix
  const calculateCorrelationMatrix = () => {
    const playerEmails = game.players.map(p => p.email);
    const correlations = {};
    
    // Initialize matrix
    playerEmails.forEach(email1 => {
      correlations[email1] = {};
      playerEmails.forEach(email2 => {
        correlations[email1][email2] = null;
      });
    });

    // Collect all votes for each player pair
    playerEmails.forEach(email1 => {
      playerEmails.forEach(email2 => {
        if (email1 === email2) {
          correlations[email1][email2] = 1.0;
          return;
        }

        const votes1 = [];
        const votes2 = [];

        // Collect votes across all weeks
        weeks.forEach(weekNum => {
          const weekData = game.weeks[weekNum];
          if (weekData.votes && weekData.votes[email1] && weekData.votes[email2]) {
            const vote1 = weekData.votes[email1];
            const vote2 = weekData.votes[email2];

            // Find common songs they both voted on
            const commonSongs = Object.keys(vote1).filter(song => vote2[song] !== undefined);
            
            commonSongs.forEach(song => {
              votes1.push(vote1[song]);
              votes2.push(vote2[song]);
            });
          }
        });

        // Calculate Pearson correlation if we have enough data
        if (votes1.length >= 2) {
          const correlation = pearsonCorrelation(votes1, votes2);
          correlations[email1][email2] = correlation;
        }
      });
    });

    return correlations;
  };

  // Pearson correlation coefficient
  const pearsonCorrelation = (x, y) => {
    const n = x.length;
    if (n === 0) return null;

    const sum1 = x.reduce((a, b) => a + b, 0);
    const sum2 = y.reduce((a, b) => a + b, 0);
    const sum1Sq = x.reduce((a, b) => a + b * b, 0);
    const sum2Sq = y.reduce((a, b) => a + b * b, 0);
    const pSum = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    if (den === 0) return 0;
    return num / den;
  };

  // Download CSV function
  const downloadCSV = () => {
    let csv = 'Week,Theme,Voter,Song,Artist,Submitted By,Rank,Total Score\n';

    weeks.forEach(weekNum => {
      const weekData = game.weeks[weekNum];
      if (!weekData.scores) return;

      const theme = game.themes[weekNum - 1];
      const voters = Object.keys(weekData.votes || {});
      const submitters = Object.keys(weekData.submissions || {});

      submitters.forEach(submitterEmail => {
        const submission = weekData.submissions[submitterEmail];
        const totalScore = weekData.scores[submitterEmail];
        const submitterName = getPlayerName(submitterEmail);

        voters.forEach(voterEmail => {
          const rank = weekData.votes[voterEmail][submitterEmail];
          const voterName = getPlayerName(voterEmail);
          
          if (rank !== undefined) {
            csv += `${weekNum},"${theme}","${voterName}","${submission.title}","${submission.artist}","${submitterName}",${rank},${totalScore}\n`;
          }
        });
      });
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${game.name.replace(/[^a-z0-9]/gi, '_')}_votes.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const correlationMatrix = calculateCorrelationMatrix();
  
  // Get completed weeks (where all votes are in)
  const completedWeeks = weeks.filter(weekNum => {
    const weekData = game.weeks[weekNum];
    return weekData.scores !== undefined;
  });

  return (
    <div className="space-y-6">
      {completedWeeks.length > 0 && (
        <div className="bg-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Overall Standings
          </h2>
          <div className="space-y-2">
            {Object.entries(game.cumulativeScores)
              .sort(([, a], [, b]) => a - b)
              .map(([email, score], index) => (
                <div
                  key={email}
                  className={`rounded-lg p-4 flex items-center justify-between ${
                    index === 0
                      ? 'bg-yellow-400 text-purple-900'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">#{index + 1}</div>
                    <div>
                      <div className="font-bold text-lg">{getPlayerName(email)}</div>
                      {index === 0 && <div className="text-sm">🏆 Current Leader</div>}
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{score}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {completedWeeks.length === 0 && (
        <div className="bg-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Results</h2>
          <p className="text-purple-200">No completed rounds yet. Results will appear once all players have voted for a round.</p>
        </div>
      )}

      {weeks.map(weekNum => {
        const weekData = game.weeks[weekNum];
        // Only show results if all votes are in (scores calculated)
        if (!weekData || !weekData.scores) return null;

        const theme = game.themes[weekNum - 1];
        
        // Get all players who submitted songs
        const submitters = Object.keys(weekData.submissions);
        // Get all players who voted
        const voters = Object.keys(weekData.votes);
        
        // Sort submitters by score (lowest to highest)
        const sortedSubmitters = submitters.sort((a, b) => 
          weekData.scores[a] - weekData.scores[b]
        );

        return (
          <div key={weekNum} className="bg-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Week {weekNum} Results</h3>
            <div className="text-lg text-yellow-400 mb-4">Theme: {theme}</div>

            {/* Detailed Voting Table */}
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-lg font-bold text-white mb-4">Detailed Votes</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-white text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-2 px-2 font-bold">Song (Submitted by)</th>
                      {voters.map(voterEmail => (
                        <th key={voterEmail} className="text-center py-2 px-2 font-bold">{getPlayerName(voterEmail)}</th>
                      ))}
                      <th className="text-center py-2 px-2 font-bold bg-yellow-400/20">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubmitters.map((submitterEmail, index) => {
                      const submission = weekData.submissions[submitterEmail];
                      const totalScore = weekData.scores[submitterEmail];
                      const isWinner = index === 0;
                      return (
                        <tr key={submitterEmail} className={`border-b border-white/10 ${
                          isWinner ? 'bg-yellow-400/10' : ''
                        }`}>
                          <td className="py-3 px-2">
                            <div className="font-bold">
                              {isWinner && '🏆 '}
                              {submission.title}
                            </div>
                            <div className="text-xs text-purple-200">{submission.artist}</div>
                            <div className="text-xs text-purple-300 mt-1">by {getPlayerName(submitterEmail)}</div>
                          </td>
                          {voters.map(voterEmail => {
                            // Get the rank this voter gave to this submitter's song
                            const rank = weekData.votes[voterEmail]?.[submitterEmail];
                            return (
                              <td key={voterEmail} className="text-center py-3 px-2">
                                {rank !== undefined ? (
                                  <span className={`inline-block px-2 py-1 rounded ${
                                    rank === 1 ? 'bg-green-500/30 font-bold' :
                                    rank === 2 ? 'bg-blue-500/30' :
                                    'bg-white/10'
                                  }`}>
                                    {rank}
                                  </span>
                                ) : (
                                  <span className="text-purple-400">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="text-center py-3 px-2 bg-yellow-400/20 font-bold text-lg">
                            {totalScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-purple-200">
                Lower scores are better. Each voter ranks songs from 1 (favorite) to {submitters.length} (least favorite).
              </div>
            </div>
          </div>
        );
      })}

      {/* Correlation Matrix */}
      {completedWeeks.length > 0 && (
        <div className="bg-white/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Voting Correlation Matrix</h3>
          <p className="text-purple-200 text-sm mb-4">
            Shows how similarly players vote. 1.0 = identical voting patterns, -1.0 = opposite patterns, 0 = no correlation.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 px-2 font-bold"></th>
                  {game.players.map(player => (
                    <th key={player.email} className="text-center py-2 px-2 font-bold text-xs">{player.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {game.players.map(player1 => (
                  <tr key={player1.email} className="border-b border-white/10">
                    <td className="py-2 px-2 font-bold text-xs">{player1.name}</td>
                    {game.players.map(player2 => {
                      const corr = correlationMatrix[player1.email]?.[player2.email];
                      const bgColor = corr === null ? 'bg-gray-500/20' :
                                    corr === 1.0 ? 'bg-purple-500/30' :
                                    corr > 0.5 ? 'bg-green-500/30' :
                                    corr > 0 ? 'bg-blue-500/20' :
                                    corr > -0.5 ? 'bg-orange-500/20' :
                                    'bg-red-500/30';
                      return (
                        <td key={player2.email} className={`text-center py-2 px-2 ${bgColor}`}>
                          {corr !== null ? corr.toFixed(2) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Download CSV Button */}
      {completedWeeks.length > 0 && (
        <div className="bg-white/20 rounded-xl p-6">
          <button
            onClick={downloadCSV}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            Download All Votes as CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default SongContestApp;
