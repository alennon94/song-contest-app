import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Music, Users, Trophy, Calendar, Vote, Plus, X, 
  ChevronRight, Crown, Send, Download, RefreshCw, CheckCircle2, Circle, ExternalLink
} from 'lucide-react';

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = 'https://raxzlocileqqbfzxzsvx.supabase.co';
const supabaseKey = 'sb_publishable_GnjUYh3S_fe46Svkxta5-g_i4OxHFbK';
const supabase = createClient(supabaseUrl, supabaseKey);

const SongContestApp = () => {
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [playerEmail, setPlayerEmail] = useState('');
  const [view, setView] = useState('home'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('games').select('*');
      if (error) throw error;
      if (data) {
        const loadedGames = data.map(item => item.value);
        setGames(loadedGames);
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
      const { error } = await supabase.from('games').upsert({ 
        id: game.id, 
        value: game,
        updated_at: new Date() 
      });
      if (error) throw error;
      await loadGames();
    } catch (error) {
      console.error('Error saving game:', error);
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
      {playerEmail && (
        <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 z-50 shadow-xl">
          <div className="text-purple-200 text-xs uppercase tracking-wider font-bold">Playing as:</div>
          <div className="text-yellow-400 font-bold text-sm">{playerEmail}</div>
          <button onClick={() => { setPlayerEmail(''); setView('home'); setCurrentGame(null); }} className="text-[10px] text-purple-300 hover:text-white underline mt-1">Switch Player</button>
        </div>
      )}

      {view === 'home' && <HomeView games={games} setView={setView} setCurrentGame={setCurrentGame} playerEmail={playerEmail} setPlayerEmail={setPlayerEmail} />}
      {view === 'create' && <CreateGameView setView={setView} saveGame={saveGame} setCurrentGame={setCurrentGame} playerEmail={playerEmail} />}
      {view === 'game' && currentGame && <GameView game={currentGame} setView={setView} saveGame={saveGame} playerEmail={playerEmail} setCurrentGame={setCurrentGame} refreshGame={loadGames} />}
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
      if (!playerEntry) return alert('This email is not registered for this game code.');
      setCurrentGame(game);
      setView('game');
    } else if (!game) alert('Game not found.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <Music className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
        <h1 className="text-6xl font-black text-white mb-2 tracking-tight">THE SONG CONTEST</h1>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <input type="email" placeholder="Enter your email" value={playerEmail} onChange={(e) => setPlayerEmail(e.target.value)} className="w-full px-4 py-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-yellow-400 focus:outline-none mb-4" />
        <button onClick={() => setView('create')} disabled={!playerEmail.trim()} className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black py-4 rounded-xl mb-3 disabled:opacity-30">CREATE NEW GAME</button>
        <button onClick={() => setShowJoin(!showJoin)} disabled={!playerEmail.trim()} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl disabled:opacity-30">JOIN WITH CODE</button>
        {showJoin && (
          <div className="mt-6 p-4 bg-black/20 rounded-xl">
            <input type="text" placeholder="6-digit code" value={gameCode} onChange={(e) => setGameCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 mb-3 text-center font-mono text-xl" />
            <button onClick={handleJoinGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg">Enter Game</button>
          </div>
        )}
      </div>

      {games.length > 0 && (
        <div className="mt-10 max-w-md w-full space-y-3">
          {games.filter(g => g.players.some(p => p.email === playerEmail)).map(game => (
            <button key={game.id} onClick={() => { setCurrentGame(game); setView('game'); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl text-left flex justify-between items-center group">
              <div>
                <div className="font-bold text-white group-hover:text-yellow-400">{game.name}</div>
                <div className="text-xs text-purple-300 font-mono">{game.id} • Week {game.currentWeek}/{game.totalWeeks}</div>
              </div>
              <ChevronRight className="text-purple-400 w-5 h-5" />
            </button>
          ))}
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

  const handleWeekChange = (newCount) => {
    const count = parseInt(newCount);
    setTotalWeeks(count);
    const newThemes = [...themes];
    setThemes(count > themes.length ? [...newThemes, ...Array(count - themes.length).fill('')] : newThemes.slice(0, count));
  };

  const updateTheme = (index, value) => {
    const newThemes = [...themes];
    newThemes[index] = value;
    setThemes(newThemes);
  };

  const handleCreate = async () => {
    if (!gameName.trim() || !gameMasterName.trim()) return alert('Fill required fields.');
    const validPlayers = players.filter(p => p.name.trim() && p.email.trim());
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const allPlayers = [{ name: gameMasterName, email: playerEmail }, ...validPlayers];
    const game = { id: gameId, name: gameName, gameMaster: playerEmail, totalWeeks, currentWeek: 1, themes, players: allPlayers, weeks: {}, cumulativeScores: {} };
    allPlayers.forEach(p => { game.cumulativeScores[p.email] = 0; });
    await saveGame(game);
    setCurrentGame(game);
    setView('game');
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <button onClick={() => setView('home')} className="mb-8 flex items-center gap-2 text-purple-300"><X className="w-4 h-4" /> CANCEL</button>
      <div className="bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black mb-8 text-yellow-400 text-center">CREATE CONTEST</h1>
        <div className="space-y-6">
          <input type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder="Game Name" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white" />
          <input type="text" value={gameMasterName} onChange={(e) => setGameMasterName(e.target.value)} placeholder="Your Name (GM)" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white" />
          <section>
            <label className="text-xs font-bold text-purple-300 uppercase block mb-2">Duration: {totalWeeks} Weeks</label>
            <input type="range" min="1" max="12" value={totalWeeks} onChange={(e) => handleWeekChange(e.target.value)} className="w-full accent-yellow-400" />
          </section>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme, i) => (
              <input key={i} value={theme} onChange={(e) => updateTheme(i, e.target.value)} placeholder={`W${i+1} Theme`} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
            ))}
          </div>
          <button onClick={handleCreate} className="w-full bg-yellow-400 text-purple-900 font-black py-5 rounded-2xl mt-8">LAUNCH CONTEST</button>
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
        <button onClick={refreshGame} className="p-2 bg-white/10 rounded-full"><RefreshCw className="w-5 h-5" /></button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/10 flex justify-between items-end">
          <div><div className="text-yellow-400 font-mono text-sm mb-1">CODE: {game.id}</div><h1 className="text-4xl font-black">{game.name}</h1></div>
          <div className="text-right"><div className="text-xs font-bold text-purple-300 uppercase">Current Theme</div><div className="text-xl font-bold">W{game.currentWeek}: {game.themes[game.currentWeek-1]}</div></div>
        </div>
        <div className="flex border-b border-white/10">
          {['overview', 'submit', 'vote', 'results'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 font-bold uppercase text-xs ${activeTab === tab ? 'bg-white/10 text-yellow-400 border-b-2 border-yellow-400' : 'text-purple-300'}`}>{tab}</button>
          ))}
        </div>
        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab game={game} isGameMaster={isGameMaster} saveGame={saveGame} />}
          {activeTab === 'submit' && <SubmitTab game={game} playerEmail={playerEmail} saveGame={saveGame} refreshGame={refreshGame} />}
          {activeTab === 'vote' && <VoteTab game={game} playerEmail={playerEmail} saveGame={saveGame} />}
          {activeTab === 'results' && <ResultsTab game={game} />}
        </div>
      </div>
    </div>
  );
};

// --- IMPROVED TABS ---

const OverviewTab = ({ game, isGameMaster, saveGame }) => {
  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const [nextTheme, setNextTheme] = useState(game.themes[game.currentWeek] || '');

  const handleNextWeek = async () => {
    if (Object.keys(currentWeekData.votes).length < game.players.length) {
      if (!window.confirm("Not everyone has voted. Advance anyway?")) return;
    }
    const newThemes = [...game.themes];
    if (game.currentWeek < game.totalWeeks) newThemes[game.currentWeek] = nextTheme;
    const updatedGame = { ...game, themes: newThemes, currentWeek: game.currentWeek + 1 };
    await saveGame(updatedGame);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-yellow-400 uppercase tracking-widest text-xs">Current Week Activity</h3>
        <div className="grid grid-cols-1 gap-3">
          {game.players.map(p => {
            const hasSubmitted = !!currentWeekData.submissions[p.email];
            const hasVoted = !!currentWeekData.votes[p.email];
            return (
              <div key={p.email} className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
                <span className="font-bold">{p.name}</span>
                <div className="flex gap-4">
                  <div className={`flex items-center gap-1 text-xs ${hasSubmitted ? 'text-green-400' : 'text-slate-500'}`}>
                    {hasSubmitted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />} SUBMITTED
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${hasVoted ? 'text-green-400' : 'text-slate-500'}`}>
                    {hasVoted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />} VOTED
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isGameMaster && game.currentWeek < game.totalWeeks && (
        <div className="bg-yellow-400/10 p-6 rounded-2xl border border-yellow-400/30">
          <label className="block text-xs font-black text-yellow-400 mb-3 uppercase tracking-wider">Set Next Week's Theme (Week {game.currentWeek + 1})</label>
          <input type="text" value={nextTheme} onChange={(e) => setNextTheme(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white mb-4" />
          <button onClick={handleNextWeek} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl transition-all shadow-lg">ADVANCE TO WEEK {game.currentWeek + 1}</button>
        </div>
      )}
    </div>
  );
};

const VoteTab = ({ game, playerEmail, saveGame }) => {
  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const competitors = Object.entries(currentWeekData.submissions || {}).filter(([email]) => email !== playerEmail);
  const myVote = currentWeekData.votes?.[playerEmail];
  const [rankings, setRankings] = useState({});

  const submitVote = async () => {
    const values = Object.values(rankings);
    const uniqueValues = new Set(values);
    if (values.length < competitors.length || uniqueValues.size !== values.length) {
      return alert("Please assign a unique rank to every competitor.");
    }

    const updatedGame = { ...game };
    if (!updatedGame.weeks[game.currentWeek].votes) updatedGame.weeks[game.currentWeek].votes = {};
    updatedGame.weeks[game.currentWeek].votes[playerEmail] = rankings;
    Object.entries(rankings).forEach(([email, rank]) => {
      updatedGame.cumulativeScores[email] += parseInt(rank);
    });
    await saveGame(updatedGame);
  };

  if (myVote) return <div className="text-center py-10 font-bold text-green-400">Vote recorded. Waiting for others!</div>;
  if (competitors.length < game.players.length - 1) return <div className="text-center py-10 opacity-50 italic">Waiting for competitors to submit songs...</div>;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <p className="text-sm text-center text-purple-300 mb-6">Rank competitors from 1 (Best) to {competitors.length}</p>
      {competitors.map(([email, data]) => (
        <div key={email} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group">
          <img src={data.albumArt} className="w-12 h-12 rounded" />
          <div className="flex-1">
            <div className="font-bold text-sm flex items-center gap-2">
              {data.title} 
              <a href={data.spotifyUrl} target="_blank" className="text-green-400 hover:scale-110 transition-transform"><ExternalLink className="w-3 h-3"/></a>
            </div>
            <div className="text-xs text-purple-300">{data.artist}</div>
          </div>
          <select className="bg-purple-800 border border-white/20 rounded-lg p-2 text-sm" onChange={e => setRankings({...rankings, [email]: e.target.value})}>
            <option value="">Rank</option>
            {competitors.map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
          </select>
        </div>
      ))}
      <button onClick={submitVote} className="w-full py-4 bg-yellow-400 text-purple-900 font-black rounded-2xl mt-6">SUBMIT BALLOT</button>
    </div>
  );
};

const SubmitTab = ({ game, playerEmail, saveGame, refreshGame }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const currentWeekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const mySubmission = currentWeekData.submissions?.[playerEmail];

  useEffect(() => {
    if (searchQuery.length < 2) return;
    const timeoutId = setTimeout(async () => {
      const response = await fetch(`/api/spotify-search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.tracks) setSearchResults(data.tracks);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSubmit = async () => {
    if (!selectedSong) return;
    const updatedGame = { ...game };
    if (!updatedGame.weeks[game.currentWeek]) updatedGame.weeks[game.currentWeek] = { submissions: {}, votes: {} };
    updatedGame.weeks[game.currentWeek].submissions[playerEmail] = {
      title: selectedSong.title, artist: selectedSong.artist, spotifyUri: selectedSong.uri,
      albumArt: selectedSong.albumArt, spotifyUrl: selectedSong.spotifyUrl, timestamp: new Date().toISOString()
    };
    await saveGame(updatedGame);
    await refreshGame();
  };

  if (mySubmission) return (
    <div className="text-center py-10 bg-green-500/10 border border-green-500/30 rounded-3xl">
      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Submission Received</h2>
      <img src={mySubmission.albumArt} className="w-32 h-32 mx-auto rounded-lg shadow-lg mb-2" />
      <div className="font-bold">{mySubmission.title}</div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <input type="text" placeholder="Search Spotify..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white" />
      <div className="space-y-2">
        {searchResults.map(track => (
          <button key={track.id} onClick={() => setSelectedSong(track)} className={`w-full p-3 flex items-center gap-4 rounded-xl border ${selectedSong?.id === track.id ? 'bg-yellow-400/20 border-yellow-400' : 'bg-white/5 border-white/10'}`}>
            <img src={track.albumArt} className="w-10 h-10 rounded" />
            <div className="text-left text-xs"><div className="font-bold">{track.title}</div><div className="text-purple-300">{track.artist}</div></div>
          </button>
        ))}
      </div>
      {selectedSong && <button onClick={handleSubmit} className="w-full py-4 bg-yellow-400 text-purple-900 font-black rounded-2xl">CONFIRM SONG</button>}
    </div>
  );
};

const ResultsTab = ({ game }) => {
  const currentWeekData = game.weeks[game.currentWeek] || { votes: {} };
  const allVotesIn = Object.keys(currentWeekData.votes || {}).length === game.players.length;
  const resultsWeek = allVotesIn ? game.currentWeek : game.currentWeek - 1;

  const getPointsForWeek = (weekNum) => {
    const week = game.weeks[weekNum];
    if (!week || !week.votes) return {};
    const scores = {};
    Object.values(week.votes).forEach(ballot => {
      Object.entries(ballot).forEach(([email, rank]) => {
        scores[email] = (scores[email] || 0) + parseInt(rank);
      });
    });
    return scores;
  };

  const cumulativeThroughWeek = {};
  game.players.forEach(p => cumulativeThroughWeek[p.email] = 0);
  for(let i=1; i<=resultsWeek; i++) {
    const weekScores = getPointsForWeek(i);
    Object.entries(weekScores).forEach(([email, pts]) => cumulativeThroughWeek[email] += pts);
  }

  const sortedPlayers = [...game.players].sort((a, b) => cumulativeThroughWeek[a.email] - cumulativeThroughWeek[b.email]);

  const downloadCSV = () => {
    let csv = "Week,Voter,TargetPlayer,Rank\n";
    Object.entries(game.weeks).forEach(([wNum, data]) => {
      Object.entries(data.votes || {}).forEach(([voterEmail, ballot]) => {
        Object.entries(ballot).forEach(([targetEmail, rank]) => {
          csv += `${wNum},${voterEmail},${targetEmail},${rank}\n`;
        });
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `results_${game.id}.csv`);
    a.click();
  };

  const calculateCorrelation = () => {
    const matrix = {};
    game.players.forEach(p1 => {
      matrix[p1.email] = {};
      game.players.forEach(p2 => {
        if (p1.email === p2.email) { matrix[p1.email][p2.email] = 100; return; }
        let diff = 0, count = 0;
        for(let i=1; i<=resultsWeek; i++) {
          const v1 = game.weeks[i]?.votes?.[p1.email];
          const v2 = game.weeks[i]?.votes?.[p2.email];
          if(v1 && v2) {
            Object.keys(v1).forEach(target => {
              if(v2[target]) {
                diff += Math.abs(v1[target] - v2[target]);
                count++;
              }
            });
          }
        }
        const maxDiff = count * (game.players.length - 2);
        matrix[p1.email][p2.email] = count > 0 ? Math.round(100 * (1 - diff/maxDiff)) : 0;
      });
    });
    return matrix;
  };

  const correlationMatrix = useMemo(() => calculateCorrelation(), [game, resultsWeek]);

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-yellow-400 font-black text-2xl uppercase tracking-widest">Global Standings</h2>
        <p className="text-xs text-purple-300 font-bold mt-1">RESULTS THROUGH WEEK {resultsWeek || 0}</p>
        {!allVotesIn && <p className="text-[10px] text-yellow-400/50 mt-1 italic">Week {game.currentWeek} results will show once everyone votes.</p>}
      </div>

      {/* 1. Total Standings */}
      <div className="space-y-3">
        {sortedPlayers.map((p, i) => (
          <div key={p.email} className={`flex items-center gap-4 p-5 rounded-3xl border ${i === 0 ? 'bg-yellow-400/20 border-yellow-400' : 'bg-white/5 border-white/10'}`}>
            <div className="text-2xl font-black opacity-30">#{i + 1}</div>
            <div className="flex-1"><div className="font-bold">{p.name}</div><div className="text-xs text-purple-400">{p.email}</div></div>
            <div className="text-right"><div className="text-xl font-black">{cumulativeThroughWeek[p.email]}</div><div className="text-[10px] uppercase opacity-50">Points</div></div>
          </div>
        ))}
      </div>

      {/* 2. Detailed Weekly Votes Table */}
      <section>
        <h3 className="text-sm font-black text-purple-300 uppercase mb-4 text-center">Weekly Voting Detail</h3>
        <div className="space-y-8">
          {[...Array(resultsWeek)].map((_, i) => {
            const wNum = i + 1;
            const weekData = game.weeks[wNum] || { votes: {} };
            return (
              <div key={wNum} className="bg-black/20 rounded-2xl p-6 border border-white/5 overflow-x-auto">
                <div className="text-xs font-bold text-yellow-400 mb-4 tracking-widest uppercase">Week {wNum}: {game.themes[wNum-1]}</div>
                <table className="w-full text-[10px] text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-2 text-purple-400">Voter \ Target</th>
                      {game.players.map(p => (
                        <th key={p.email} className="p-2 text-purple-400 font-bold">{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {game.players.map(voter => (
                      <tr key={voter.email} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                        <td className="p-2 font-black text-purple-300 bg-white/5">{voter.name}</td>
                        {game.players.map(target => {
                          const rank = weekData.votes?.[voter.email]?.[target.email];
                          return (
                            <td key={target.email} className="p-2 text-center">
                              {voter.email === target.email ? (
                                <span className="opacity-20">—</span>
                              ) : (
                                <span className={rank === '1' ? 'text-yellow-400 font-bold' : 'text-slate-100'}>{rank || '?'}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Correlation Matrix */}
      <section>
        <h3 className="text-sm font-black text-purple-300 uppercase mb-4 text-center">Voting Correlation (%)</h3>
        <div className="overflow-x-auto bg-black/30 rounded-2xl p-4 border border-white/5">
          <table className="w-full text-[10px] text-center">
            <thead>
              <tr>
                <th></th>
                {game.players.map(p => <th key={p.email} className="p-2 text-purple-400">{p.name.substring(0,6)}</th>)}
              </tr>
            </thead>
            <tbody>
              {game.players.map(p1 => (
                <tr key={p1.email} className="border-t border-white/5">
                  <td className="p-2 font-bold text-left text-purple-400">{p1.name.substring(0,6)}</td>
                  {game.players.map(p2 => (
                    <td key={p2.email} className={`p-2 ${p1.email === p2.email ? 'opacity-20' : ''}`}>
                      {correlationMatrix[p1.email][p2.email]}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Download */}
      <button onClick={downloadCSV} className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-xs font-bold text-purple-300 hover:border-yellow-400 hover:text-yellow-400 flex items-center justify-center gap-2">
        <Download className="w-4 h-4" /> DOWNLOAD ALL VOTES (.CSV)
      </button>
    </div>
  );
};

export default SongContestApp;