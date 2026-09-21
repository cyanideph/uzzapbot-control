import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Bot, Gamepad2, LogOut, Menu, MessageSquare, Settings, ShieldCheck, Users, X } from "lucide-react";
import { supabase } from "./lib/supabase";

type Page = "dashboard" | "monitor" | "questions" | "games" | "errors" | "settings";

const nav: { id: Page; label: string; icon: typeof Bot }[] = [
  { id: "dashboard", label: "Dashboard", icon: Bot },
  { id: "monitor", label: "Monitor", icon: Activity },
  { id: "questions", label: "Questions", icon: MessageSquare },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "errors", label: "Errors", icon: AlertTriangle },
  { id: "settings", label: "Settings", icon: Settings },
];

function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLoggedIn();
    setBusy(false);
  }

  return <main className="login"><form className="login-card" onSubmit={submit}>
    <div className="brand"><Bot size={30}/><div><strong>UzzapBot</strong><span>Control Center</span></div></div>
    <h1>Administrator Login</h1>
    <p>Sign in to monitor the production UzzapBot.</p>
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
    {error && <div className="error">{error}</div>}
    <button className="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
  </form></main>;
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) return <div className="loading">Loading…</div>;
  if (!session) return <Login onLoggedIn={() => setSession(true)} />;

  const title = nav.find(n => n.id === page)?.label ?? "Dashboard";
  return <div className="app">
    <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
      <div className="brand"><Bot size={28}/><div><strong>UzzapBot</strong><span>Control Center</span></div></div>
      <nav>{nav.map(({id,label,icon:Icon}) => <button key={id} className={page===id ? "nav active" : "nav"} onClick={()=>{setPage(id);setMobileOpen(false)}}><Icon size={18}/>{label}</button>)}</nav>
      <button className="nav logout" onClick={()=>supabase.auth.signOut()}><LogOut size={18}/>Logout</button>
    </aside>
    {mobileOpen && <button className="backdrop" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"><X/></button>}
    <section className="content">
      <header><button className="menu" onClick={()=>setMobileOpen(true)}><Menu/></button><div><h1>{title}</h1><span>Production UzzapBot management</span></div><div className="online"><span/> Supabase</div></header>
      {page === "dashboard" && <Dashboard />}
      {page === "monitor" && <Monitor />}
      {page === "questions" && <Questions />}
      {page === "games" && <Games />}
      {page === "errors" && <Errors />}
      {page === "settings" && <SettingsPage />}
    </section>
  </div>;
}

function Card({label,value,icon:Icon}: {label:string;value:string;icon:typeof Bot}) {
  return <div className="card"><div className="card-icon"><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function Dashboard() {
  const [stats,setStats] = useState({processed:"—",failed:"—",games:"—",players:"—"});
  useEffect(()=>{(async()=> {
    const [p,f,g,pl] = await Promise.all([
      supabase.from("uzzapbot_event_receipts").select("*",{count:"exact",head:true}).eq("status","processed"),
      supabase.from("uzzapbot_event_receipts").select("*",{count:"exact",head:true}).eq("status","failed"),
      supabase.from("game_sessions").select("*",{count:"exact",head:true}),
      supabase.from("game_players").select("*",{count:"exact",head:true}),
    ]);
    setStats({processed:String(p.count ?? 0),failed:String(f.count ?? 0),games:String(g.count ?? 0),players:String(pl.count ?? 0)});
  })()},[]);
  return <div>
    <div className="grid"><Card label="Bot Status" value="Supabase" icon={Bot}/><Card label="Processed Events" value={stats.processed} icon={Activity}/><Card label="Failed Events" value={stats.failed} icon={AlertTriangle}/><Card label="Game Sessions" value={stats.games} icon={Gamepad2}/><Card label="Players" value={stats.players} icon={Users}/><Card label="Admin Access" value="Protected" icon={ShieldCheck}/></div>
    <div className="panel"><h2>UzzapBot Control Center</h2><p>The management foundation is ready. Monitoring pages use the existing production schema and will be expanded after schema verification.</p></div>
  </div>;
}

function Monitor(){ return <div className="panel"><h2>Live Monitor</h2><p>Event monitoring is connected to the existing UzzapBot receipt system. Detailed event tables will be added after schema verification.</p></div>; }
function Questions(){ return <div className="panel"><h2>Question Bank</h2><p>No new question table is created until the existing Supabase schema is inspected.</p></div>; }
function Games(){ return <div className="panel"><h2>Active Games</h2><p>Game monitoring uses the existing game_sessions and game_players tables.</p></div>; }
function Errors(){ return <div className="panel"><h2>Error Center</h2><p>Failed UzzapBot event receipts will appear here.</p></div>; }
function SettingsPage(){ return <div className="panel"><h2>Settings</h2><p>Read-only production settings. Service-role credentials are never used in the browser.</p></div>; }

export default App;
