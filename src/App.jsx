import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BrowserRouter, Routes, Route, useNavigate, useParams, Navigate 
} from 'react-router-dom';
import { 
  Music, Users, Trophy, Calendar, Vote, Plus, X, 
  ChevronRight, Crown, Send, Download, RefreshCw, CheckCircle2, Circle, ExternalLink, Link as LinkIcon, LogOut
} from 'lucide-react';

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = 'https://raxzlocileqqbfzxzsvx.supabase.co';
const supabaseKey = 'sb_publishable_GnjUYh3S_fe46Svkxta5-g_i4OxHFbK';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- MAIN ENTRY POINT ---
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for sign-in/sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="animate-spin text-yellow-400 w-10 h-10" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-slate-100">
        {session && <AuthHeader user={session.user} />}
        
        <Routes>
          <Route path="/login" element={!session ? <LoginView /> : <Navigate to="/" />} />
          <Route path="/" element={session ? <HomeView user={session.user} /> : <Navigate to="/login" />} />
          <Route path="/create" element={session ? <CreateGameView user={session.user} /> : <Navigate to="/login" />} />
          <Route path="/game/:gameId" element={session ? <GameView user={session.user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// --- SHARED COMPONENTS ---

const AuthHeader = ({ user }) => (
  <div className="fixed top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 z-50 shadow-2xl flex items-center gap-4">
    <div className="text-right">
      <div className="text-[10px] text-purple-300 font-bold uppercase tracking-tighter">Identity</div>
      <div className="text-yellow-400 font-bold text-xs">{user.email}</div>
    </div>
    <button onClick={() => supabase.auth.signOut()} className="p-2 hover:bg-white/10 rounded-full text-purple-300 hover:text-white transition-all">
      <LogOut className="w-4 h-4" />
    </button>
  </div>
);

// --- VIEW: LOGIN (Magic Links) ---

const LoginView = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setLoading(false);
    if (error) alert(error.message);
    else setMessage('Check your email for the magic login link!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl text-center">
        <Music className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-5xl font-black mb-2 tracking-tighter">SONG CONTEST</h1>
        <p className="text-purple-300 text-sm mb-8 font-medium italic">Music is better with competition.</p>
        
        {message ? (
          <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="font-bold text-green-400">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" placeholder="Your Email Address" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-400 outline-none transition-all"
            />
            <button disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50">
              {loading ? 'SENDING...' : 'GET MAGIC LINK'}
            </button>
            <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest">No Password Required</p>
          </form>
        )}
      </div>
    </div>
  );
};

// --- VIEW: HOME (Dashboard) ---

const HomeView = ({ user }) => {
  const [games, setGames] = useState([]);
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase.from('games').select('*');
      if (data) setGames(data.map(d => d.value));
      setLoading(false);
    };
    fetchGames();
  }, []);

  const myGames = games.filter(g => g.players.some(p => p.email.toLowerCase() === user.email.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
          <Music className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-4xl font-black">YOUR CONTESTS</h2>
        </header>

        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
          <button onClick={() => navigate('/create')} className="w-full bg-yellow-400 text-purple-900 font-black py-4 rounded-2xl shadow-lg">
            START NEW SEASON
          </button>
          <div className="relative">
            <input 
              type="text" placeholder="ENTER 6-DIGIT CODE" value={gameCode} onChange={e => setGameCode(e.target.value.toUpperCase())}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 text-center font-mono font-bold tracking-widest text-yellow-400 outline-none focus:border-purple-400"
            />
            {gameCode.length === 6 && (
              <button onClick={() => navigate(`/game/${gameCode}`)} className="absolute right-2 top-2 bottom-2 bg-purple-600 px-4 rounded-xl font-bold text-xs">JOIN</button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? <RefreshCw className="animate-spin mx-auto opacity-20" /> : (
            myGames.map(game => (
              <button key={game.id} onClick={() => navigate(`/game/${game.id}`)} className="w-full group bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-3xl flex justify-between items-center transition-all">
                <div className="text-left">
                  <div className="font-black text-lg group-hover:text-yellow-400">{game.name}</div>
                  <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Code: {game.id} • Week {game.currentWeek}/{game.totalWeeks}</div>
                </div>
                <ChevronRight className="text-purple-500" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- VIEW: CREATE CONTEST ---

const CreateGameView = ({ user }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [themes, setThemes] = useState(Array(4).fill(''));

  const handleCreate = async () => {
    if (!name || !userName) return alert('Name required');
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    const game = {
      id, name, gameMaster: user.email, totalWeeks: weeks, currentWeek: 1, themes,
      players: [{ name: userName, email: user.email }],
      weeks: {}, cumulativeScores: { [user.email]: 0 }
    };
    await supabase.from('games').insert({ id, value: game });
    navigate(`/game/${id}`);
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-8 text-purple-300">CANCEL</button>
      <div className="bg-white/10 rounded-[3rem] p-10 border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-black mb-8 text-yellow-400">LAUNCH CONTEST</h1>
        <div className="space-y-6">
          <input type="text" placeholder="Contest Name (e.g. Summer 2024)" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 outline-none" />
          <input type="text" placeholder="Your Display Name" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 outline-none" />
          <div>
            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 block">Duration: {weeks} Weeks</label>
            <input type="range" min="1" max="12" value={weeks} onChange={e => {
              const val = parseInt(e.target.value);
              setWeeks(val);
              setThemes(prev => val > prev.length ? [...prev, ...Array(val - prev.length).fill('')] : prev.slice(0, val));
            }} className="w-full accent-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t, i) => (
              <input key={i} placeholder={`Week ${i+1} Theme`} value={t} onChange={e => {
                const nt = [...themes]; nt[i] = e.target.value; setThemes(nt);
              }} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs" />
            ))}
          </div>
          <button onClick={handleCreate} className="w-full bg-yellow-400 text-purple-900 font-black py-5 rounded-3xl mt-6 shadow-xl">START CONTEST</button>
        </div>
      </div>
    </div>
  );
};

// --- VIEW: INDIVIDUAL GAME ---

const GameView = ({ user }) => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchGame = async () => {
    const { data } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (data) setGame(data.value);
  };

  useEffect(() => { fetchGame(); }, [gameId]);

  const saveGame = async (updated) => {
    await supabase.from('games').update({ value: updated, updated_at: new Date() }).eq('id', gameId);
    setGame(updated);
  };

  if (!game) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-yellow-400" /></div>;

  const isGM = game.gameMaster === user.email;

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/')} className="text-purple-300 font-bold text-sm">← DASHBOARD</button>
        <div className="text-right">
          <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Code: {game.id}</div>
          <h1 className="text-2xl font-black leading-none">{game.name}</h1>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="flex border-b border-white/10 bg-black/20">
          {['overview', 'submit', 'vote', 'results'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-yellow-400 bg-white/5 border-b-2 border-yellow-400' : 'text-purple-400 opacity-60'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab game={game} isGM={isGM} user={user} saveGame={saveGame} />}
          {activeTab === 'submit' && <SubmitTab game={game} user={user} saveGame={saveGame} refresh={fetchGame} />}
          {activeTab === 'vote' && <VoteTab game={game} user={user} saveGame={saveGame} />}
          {activeTab === 'results' && <ResultsTab game={game} />}
        </div>
      </div>
    </div>
  );
};

// --- SUB-TABS ---

const OverviewTab = ({ game, isGM, user, saveGame }) => {
  const weekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  
  const copyInviteLink = () => {
    const link = `${window.location.origin}/game/${game.id}`;
    navigator.clipboard.writeText(link);
    alert("Direct Invite Link Copied!");
  };

  const advanceWeek = async () => {
    if (game.currentWeek >= game.totalWeeks) return;
    if (Object.keys(weekData.votes).length < game.players.length && !window.confirm("Advance despite missing votes?")) return;
    saveGame({ ...game, currentWeek: game.currentWeek + 1 });
  };

  return (
    <div className="space-y-8">
      <div className="bg-purple-600/20 border border-purple-400/30 p-6 rounded-3xl flex items-center justify-between">
        <div>
          <h4 className="font-black text-yellow-400 text-sm uppercase">Direct Invite</h4>
          <p className="text-[10px] text-purple-200 opacity-70">Send this URL to players to skip the code entry.</p>
        </div>
        <button onClick={copyInviteLink} className="bg-purple-500 hover:bg-purple-400 p-3 rounded-2xl shadow-lg transition-all">
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
          <h3 className="text-xs font-black text-purple-300 uppercase mb-4 tracking-widest">Week {game.currentWeek} Status</h3>
          <div className="space-y-2">
            {game.players.map(p => (
              <div key={p.email} className="flex justify-between items-center text-xs">
                <span className="font-bold">{p.name} {p.email === user.email && '(You)'}</span>
                <div className="flex gap-2">
                  <div className={weekData.submissions[p.email] ? 'text-green-400' : 'text-slate-600'}><CheckCircle2 className="w-4 h-4"/></div>
                  <div className={weekData.votes[p.email] ? 'text-green-400' : 'text-slate-600'}><Vote className="w-4 h-4"/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-400/10 p-6 rounded-3xl border border-yellow-400/20 text-center flex flex-col justify-center">
          <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">Weekly Theme</div>
          <div className="text-2xl font-black uppercase">{game.themes[game.currentWeek - 1] || 'No Theme'}</div>
        </div>
      </div>

      {isGM && game.currentWeek < game.totalWeeks && (
        <button onClick={advanceWeek} className="w-full py-5 bg-green-500 text-white font-black rounded-3xl shadow-xl hover:bg-green-600 transition-all">
          FINALIZE & ADVANCE TO WEEK {game.currentWeek + 1}
        </button>
      )}
    </div>
  );
};

const SubmitTab = ({ game, user, saveGame, refresh }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const weekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const sub = weekData.submissions[user.email];

  useEffect(() => {
    if (query.length < 3) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/spotify-search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.tracks) setResults(data.tracks);
    }, 500);
    return () => clearTimeout(t);
  }, [query]);

  const selectSong = async (track) => {
    const updated = { ...game };
    if (!updated.weeks[game.currentWeek]) updated.weeks[game.currentWeek] = { submissions: {}, votes: {} };
    updated.weeks[game.currentWeek].submissions[user.email] = {
      title: track.title, artist: track.artist, albumArt: track.albumArt, spotifyUrl: track.spotifyUrl
    };
    await saveGame(updated);
    refresh();
  };

  if (sub) return (
    <div className="text-center py-10">
      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <h3 className="text-2xl font-black mb-6">SONG SECURED</h3>
      <div className="max-w-xs mx-auto bg-white/5 p-4 rounded-3xl border border-white/10">
        <img src={sub.albumArt} className="rounded-2xl mb-4 w-full aspect-square object-cover" />
        <div className="font-black text-lg">{sub.title}</div>
        <div className="text-purple-400 text-sm mb-4">{sub.artist}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <input 
        type="text" placeholder="Search Spotify..." value={query} onChange={e => setQuery(e.target.value)}
        className="w-full bg-black/30 border border-white/20 rounded-2xl p-4 outline-none focus:border-yellow-400"
      />
      <div className="space-y-2">
        {results.map(t => (
          <button key={t.id} onClick={() => selectSong(t)} className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all text-left">
            <img src={t.albumArt} className="w-12 h-12 rounded-lg" />
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-sm truncate">{t.title}</div>
              <div className="text-[10px] text-purple-400 truncate">{t.artist}</div>
            </div>
            <Plus className="text-yellow-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

const VoteTab = ({ game, user, saveGame }) => {
  const weekData = game.weeks[game.currentWeek] || { submissions: {}, votes: {} };
  const competitors = Object.entries(weekData.submissions).filter(([email]) => email !== user.email);
  const myVote = weekData.votes[user.email];
  const [ranks, setRanks] = useState({});

  const submitBallot = async () => {
    if (Object.keys(ranks).length < competitors.length) return alert('Rank all songs!');
    const updated = { ...game };
    updated.weeks[game.currentWeek].votes[user.email] = ranks;
    Object.entries(ranks).forEach(([email, rank]) => {
      updated.cumulativeScores[email] += parseInt(rank);
    });
    await saveGame(updated);
  };

  if (myVote) return <div className="py-20 text-center font-black text-yellow-400 text-2xl uppercase tracking-tighter opacity-50 italic">Ballot Cast. Waiting for others...</div>;
  if (competitors.length < game.players.length - 1) return <div className="py-20 text-center text-purple-400 italic">Waiting for everyone to submit songs...</div>;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-black text-xl">THE BALLOT</h3>
        <p className="text-xs text-purple-300">1 = Your Favorite Song. {competitors.length} = Your Least Favorite.</p>
      </div>
      {competitors.map(([email, song]) => (
        <div key={email} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
          <img src={song.albumArt} className="w-14 h-14 rounded-xl" />
          <div className="flex-1">
            <div className="font-black text-sm">{song.title} <a href={song.spotifyUrl} target="_blank" className="inline-block ml-1 text-green-400"><ExternalLink size={12}/></a></div>
            <div className="text-[10px] text-purple-400 uppercase tracking-widest">{song.artist}</div>
          </div>
          <select 
            onChange={e => setRanks({ ...ranks, [email]: e.target.value })}
            className="bg-purple-800 border border-white/20 rounded-xl p-2 text-xs font-bold text-white outline-none"
          >
            <option value="">RANK</option>
            {competitors.map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
        </div>
      ))}
      <button onClick={submitBallot} className="w-full py-5 bg-yellow-400 text-purple-900 font-black rounded-3xl mt-8 shadow-2xl">SUBMIT FINAL BALLOT</button>
    </div>
  );
};

const ResultsTab = ({ game }) => {
  const currentWeekVotes = game.weeks[game.currentWeek]?.votes || {};
  const allVotesIn = Object.keys(currentWeekVotes).length === game.players.length;
  const resultsWeek = allVotesIn ? game.currentWeek : game.currentWeek - 1;

  // Sorting global leaderboard (Lower is better)
  const sortedGlobal = [...game.players].sort((a, b) => game.cumulativeScores[a.email] - game.cumulativeScores[b.email]);

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h2 className="text-3xl font-black text-yellow-400 uppercase mb-6 tracking-tighter">Leaderboard</h2>
        <div className="space-y-2 max-w-md mx-auto">
          {sortedGlobal.map((p, i) => (
            <div key={p.email} className={`flex items-center gap-4 p-4 rounded-3xl border ${i === 0 ? 'bg-yellow-400/20 border-yellow-400' : 'bg-white/5 border-white/10'}`}>
              <div className="text-2xl font-black opacity-20">#{i+1}</div>
              <div className="flex-1 text-left font-bold">{p.name}</div>
              <div className="text-xl font-black text-yellow-400">{game.cumulativeScores[p.email]} <span className="text-[8px] uppercase opacity-50">Pts</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* SWAPPED & SORTED WEEKLY TABLES */}
      <section className="space-y-8">
        {[...Array(resultsWeek)].map((_, i) => {
          const wNum = i + 1;
          const weekData = game.weeks[wNum] || { votes: {}, submissions: {} };
          
          // Calculate scores and sort (Low points = high rank)
          const targetScores = game.players.map(p => {
            let total = 0;
            Object.values(weekData.votes).forEach(ballot => { if(ballot[p.email]) total += parseInt(ballot[p.email]); });
            return { ...p, weeklyScore: total };
          }).sort((a, b) => a.weeklyScore - b.weeklyScore);

          return (
            <div key={wNum} className="bg-black/30 rounded-[2rem] border border-white/10 overflow-x-auto p-6">
              <h3 className="text-sm font-black text-purple-300 uppercase mb-4 text-center tracking-widest">
                Week {wNum}: {game.themes[wNum-1]}
              </h3>
              <table className="w-full text-[10px] text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 bg-white/5 rounded-tl-xl text-purple-400">Song (Submitter)</th>
                    {game.players.map(voter => (
                      <th key={voter.email} className="p-3 text-center text-purple-400 font-bold">{voter.name}</th>
                    ))}
                    <th className="p-3 text-center bg-yellow-400/10 text-yellow-400 font-black rounded-tr-xl">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {targetScores.map(target => {
                    const song = weekData.submissions[target.email];
                    return (
                      <tr key={target.email} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                        <td className="p-3 border-r border-white/10">
                          <div className="font-bold truncate max-w-[150px]">{song?.title || "No Show"}</div>
                          <div className="text-[8px] text-purple-400 font-medium italic">by {target.name}</div>
                        </td>
                        {game.players.map(voter => {
                          const rank = weekData.votes[voter.email]?.[target.email];
                          return (
                            <td key={voter.email} className="p-3 text-center">
                              {voter.email === target.email ? (
                                <span className="opacity-10 text-xs">X</span>
                              ) : (
                                <span className={rank == 1 ? 'text-yellow-400 font-black text-xs' : 'text-slate-400 font-bold'}>
                                  {rank ? `${rank}${rank == 1 ? 'st' : rank == 2 ? 'nd' : rank == 3 ? 'rd' : 'th'}` : '—'}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center bg-yellow-400/10 font-black text-sm text-yellow-400">
                          {target.weeklyScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>
    </div>
  );
};