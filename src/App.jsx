import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Search, RefreshCw, AlertCircle, ChevronDown, ChevronRight, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv';

const CDS_TEAM = new Set(['Mohit Sharma','Rakesh Nayak','Sharvan Pandey','Stefan Joseph','Jogendra Singh','Ramya D','Vaishnav Govind']);

// ─────────────────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────────────────
const T = {
  bg:         '#F8FAFC',
  surface:    '#FFFFFF',
  border:     '#E2E8F0',
  borderMid:  '#CBD5E1',
  headerBg:   '#F8FAFC',
  rowAlt:     '#FAFBFC',
  hover:      '#F0F6FF',
  text:       '#0F172A',
  sub:        '#475569',
  muted:      '#94A3B8',
  billable:   '#15803D',
  billableBg: '#F0FDF4',
  internal:   '#6D28D9',
  internalBg: '#F5F3FF',
  burn:       '#DC2626',
  burnBg:     '#FEF2F2',
  under:      '#1D4ED8',
  underBg:    '#EFF6FF',
  healthy:    '#15803D',
  healthyBg:  '#F0FDF4',
  barB:       '#22C55E',
  barI:       '#A78BFA',
  barO:       '#CBD5E1',
  barA:       '#F1F5F9',
  accent:     '#2563EB',
};

// ─────────────────────────────────────────────────────────
// DATA HELPERS
// ─────────────────────────────────────────────────────────
const normalizeClient = j => {
  if (!j) return 'Other';
  const t = j.trim();
  if (/^(holiday|vacation|sick)$/i.test(t))        return 'OOO';
  if (/^administrative$/i.test(t))                  return 'Administrative';
  if (/^business development/i.test(t))             return 'Business Development';
  if (/^cds\b/i.test(t) || /tableau/i.test(t))      return 'CDS Internal';
  if (/^AEG(\s|[-–]|$)/i.test(t))                  return 'AEG';
  if (/^SALT(\s|[-–]|$)/i.test(t))                 return 'SALT';
  if (/^ADP(\s|[-–]|$)/i.test(t))                  return 'ADP';
  if (/^(SP\s*USA|SPUSA)(\s|[-–]|$)/i.test(t))     return 'SP USA';
  if (/^CPC(\s|[-–]|$)/i.test(t))                  return 'CPC';
  if (/^RIATA(\s|[-–]|$)/i.test(t))                return 'Riata';
  if (/^BEACON/i.test(t))                           return 'Beacon';
  if (/^ARCHWAY/i.test(t))                          return 'Archway';
  if (/^BUDGET/i.test(t))                           return 'Budget';
  const m = t.match(/^(.+?)\s*[-–]\s*/);
  return m ? m[1].trim() : t;
};

const catOf = j => {
  if (!j) return 'Billable';
  const t = j.trim();
  if (/^(holiday|vacation|sick)$/i.test(t))  return 'OOO';
  if (/^administrative$/i.test(t) || /^business development/i.test(t) || /^cds\b/i.test(t) || /tableau/i.test(t)) return 'Internal/BD';
  return 'Billable';
};

const parseCSV = text => {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const pl = line => {
    const r = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (q && line[i+1]==='"') { cur+='"'; i++; } else q=!q; }
      else if (c === ',' && !q) { r.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    return r.push(cur.trim()), r;
  };
  const hdrs = pl(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1)
    .map(line => { const v=pl(line), row={}; hdrs.forEach((h,i)=>{ row[h]=v[i]??''; }); return row; })
    .filter(r => r.fname || r.lname || r.username);
};

const detectWeeks = rows => {
  const m = {};
  rows.forEach(r => {
    const d = new Date(r.local_date); if (isNaN(d)) return;
    const diff = (d.getDay()||7) - 1;
    const mon = new Date(d); mon.setDate(d.getDate() - diff);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = dt => dt.toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const key = mon.toISOString().slice(0, 10);
    if (!m[key]) m[key] = { key, label:`${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}` };
  });
  return Object.values(m).sort((a,b) => b.key.localeCompare(a.key));
};

const riskOf = u => u >= 95 ? 'Over' : u < 60 ? 'Under' : 'OK';

// ─────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────

// Reusable select
const Sel = ({ value, onChange, children, minW = 120, highlight }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    height: 30, padding: '0 8px', fontSize: 12,
    border: `1px solid ${highlight ? T.accent : T.border}`,
    borderRadius: 4, background: highlight ? '#EFF6FF' : T.surface,
    color: highlight ? T.accent : T.sub, cursor: 'pointer', outline: 'none',
    fontWeight: highlight ? 600 : 400, minWidth: minW,
  }}>
    {children}
  </select>
);

// Table header cell
const TH = ({ children, right, onClick, sorted, w, pl }) => (
  <th onClick={onClick} style={{
    padding: `8px ${right?12:12}px`, paddingLeft: pl || 12,
    width: w, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: T.muted, background: T.headerBg,
    borderBottom: `2px solid ${T.borderMid}`, textAlign: right ? 'right' : 'left',
    whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none', position: 'sticky', top: 0,
  }}>
    {children}{sorted && <span style={{ color: T.accent }}>{sorted}</span>}
  </th>
);

// Risk badge — text only, small background pill
const RiskBadge = ({ r }) => {
  const s = r === 'Over'  ? { bg: '#FEE2E2', color: '#991B1B', label: 'At risk' }
           : r === 'Under' ? { bg: '#DBEAFE', color: '#1E40AF', label: 'Under'   }
           :                 { bg: '#DCFCE7', color: '#166534', label: 'Healthy' };
  return (
    <span style={{ display:'inline-block', padding:'2px 7px', borderRadius:3,
      fontSize:11, fontWeight:600, background:s.bg, color:s.color }}>
      {s.label}
    </span>
  );
};

// Stacked capacity bar (hover shows segment value)
const CapBar = ({ billable, internal, ooo, avail, cap }) => {
  const [tip, setTip] = useState(null);
  const total = Math.max(cap, billable + internal + ooo);
  const segs = [
    { k:'Billable',    v:billable,  color:T.barB },
    { k:'Internal/BD', v:internal,  color:T.barI },
    { k:'OOO',         v:ooo,       color:T.barO },
    { k:'Available',   v:Math.max(0,avail), color:T.barA, border:true },
  ];
  const isOver = (billable + internal) > cap;
  return (
    <div style={{ position:'relative', flex:1 }}>
      <div style={{ display:'flex', height:16, borderRadius:2, overflow:'hidden',
        border:`1px solid ${isOver ? T.burn : T.border}` }}>
        {segs.map(s => s.v > 0 && (
          <div key={s.k}
            style={{ width:`${Math.min((s.v/total)*100,100)}%`, background:s.color,
              outline:s.border?`1px solid ${T.border}`:'none', cursor:'default' }}
            onMouseEnter={e => setTip({ label:s.k, value:s.v, x:e.clientX })}
            onMouseLeave={() => setTip(null)}
          />
        ))}
      </div>
      {tip && (
        <div style={{ position:'fixed', top:'-9999px', left:tip.x,
          background:T.text, color:'#fff', padding:'3px 8px', borderRadius:3,
          fontSize:11, pointerEvents:'none', whiteSpace:'nowrap', zIndex:999,
          transform:'translate(-50%,-120%)', marginTop:-4 }}>
          {tip.label}: {tip.value.toFixed(1)}h
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
export default function App() {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [updatedAt,  setUpdatedAt]  = useState(null);

  const [tab,        setTab]        = useState('projects');
  const [teamF,      setTeamF]      = useState('all');
  const [selWeeks,   setSelWeeks]   = useState([]);
  const [weekDD,     setWeekDD]     = useState(false);

  // Projects filters
  const [pSearch,    setPSearch]    = useState('');
  const [pClient,    setPClient]    = useState('all');
  const [pType,      setPType]      = useState('all');
  const [pSort,      setPSort]      = useState({ k:'hours', d:'desc' });
  const [collapsed,  setCollapsed]  = useState({});

  // Team filters
  const [tSearch,    setTSearch]    = useState('');
  const [tSort,      setTSort]      = useState({ k:'util', d:'desc' });
  const [openRow,    setOpenRow]    = useState(null);

  // Dashboard
  const [dSort,      setDSort]      = useState('util-desc');
  const [dFilter,    setDFilter]    = useState('all');

  // ── FETCH ──
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = parseCSV(await res.text());
      if (!data.length) throw new Error('No rows found. Is the sheet publicly shared?');
      setRows(data);
      setUpdatedAt(new Date());
      const w = detectWeeks(data);
      if (w.length) setSelWeeks([w[0].key]);
    } catch(e) { setError(e.message); }
    finally    { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const h = e => { if (!e.target.closest('.wdd')) setWeekDD(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const weeks = useMemo(() => detectWeeks(rows), [rows]);

  // ── FILTER TO SELECTED WEEKS ──
  const weekRows = useMemo(() => {
    if (!selWeeks.length) return rows;
    return rows.filter(r => {
      const d = new Date(r.local_date); if (isNaN(d)) return false;
      const diff = (d.getDay()||7) - 1;
      const mon = new Date(d); mon.setDate(d.getDate() - diff);
      return selWeeks.includes(mon.toISOString().slice(0, 10));
    });
  }, [rows, selWeeks]);

  // ── AGGREGATE ──
  const { members, projectsMap } = useMemo(() => {
    const tm = {}, pm = {};
    const nW = Math.max(selWeeks.length, 1);
    weekRows.forEach(r => {
      const name = `${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs  = parseFloat(r.hours) || 0;
      const jc   = (r.jobcode||'').trim();
      if (!name || !hrs || !jc) return;
      const cat = catOf(jc), client = normalizeClient(jc), isCDS = CDS_TEAM.has(name);
      if (teamF === 'cds' && !isCDS) return;
      if (teamF === 'tas' &&  isCDS) return;

      if (!tm[name]) tm[name] = { name, isCDS, total:0, billable:0, ooo:0, internal:0, utilized:0, jobs:{} };
      tm[name].total += hrs;
      if      (cat === 'OOO')          tm[name].ooo      += hrs;
      else if (cat === 'Internal/BD') { tm[name].internal += hrs; tm[name].utilized += hrs; }
      else                            { tm[name].billable  += hrs; tm[name].utilized += hrs; }
      tm[name].jobs[jc] = (tm[name].jobs[jc]||0) + hrs;

      if (cat === 'OOO') return; // OOO is NOT a project
      if (!pm[jc]) pm[jc] = { name:jc, cat, client, hrs:0, mems:{} };
      pm[jc].hrs += hrs;
      pm[jc].mems[name] = (pm[jc].mems[name]||0) + hrs;
    });
    Object.values(tm).forEach(m => {
      m.effCap = 40 * nW - m.ooo;
      m.avail  = m.effCap - m.utilized;
      m.util   = m.effCap > 0 ? (m.utilized / m.effCap) * 100 : 0;
      m.risk   = riskOf(m.util);
    });
    return { members: tm, projectsMap: pm };
  }, [weekRows, teamF, selWeeks]);

  // ── STATS ──
  const S = useMemo(() => {
    const ms = Object.values(members);
    const tC = ms.reduce((s,m) => s+m.effCap, 0);
    const tU = ms.reduce((s,m) => s+m.utilized, 0);
    return {
      n:   ms.length,
      tB:  ms.reduce((s,m) => s+m.billable,  0),
      tI:  ms.reduce((s,m) => s+m.internal,  0),
      tO:  ms.reduce((s,m) => s+m.ooo,       0),
      tU, tC,
      tA:  ms.reduce((s,m) => s+m.avail,     0),
      avgU: tC > 0 ? (tU/tC)*100 : 0,
      nOver:  ms.filter(m => m.risk==='Over').length,
      nUnder: ms.filter(m => m.risk==='Under').length,
    };
  }, [members]);

  const totalBillHrs = useMemo(() =>
    Object.values(projectsMap).filter(p => p.cat==='Billable').reduce((s,p) => s+p.hrs, 0)
  , [projectsMap]);

  // ── ALL CLIENTS (for dropdown) ──
  const allClients = useMemo(() => {
    const s = new Set(Object.values(projectsMap).map(p => p.client));
    return [...s].sort();
  }, [projectsMap]);

  // ── CLIENT GROUPS — CORRECT DEPS ──
  const clientGroups = useMemo(() => {
    const g = {};
    Object.values(projectsMap).forEach(p => {
      if (pType   === 'billable'    && p.cat !== 'Billable')    return;
      if (pType   === 'internal-bd' && p.cat !== 'Internal/BD') return;
      if (pClient !== 'all'         && p.client !== pClient)    return;  // ← client filter
      if (pSearch && !p.name.toLowerCase().includes(pSearch.toLowerCase()) &&
                     !p.client.toLowerCase().includes(pSearch.toLowerCase())) return;
      if (!g[p.client]) g[p.client] = { client:p.client, total:0, projs:[] };
      g[p.client].projs.push(p);
      g[p.client].total += p.hrs;
    });
    const dir = pSort.d === 'desc' ? -1 : 1;
    Object.values(g).forEach(cg =>
      cg.projs.sort((a,b) => pSort.k==='hours' ? dir*(b.hrs-a.hrs) : dir*b.name.localeCompare(a.name))
    );
    return Object.values(g).sort((a,b) => b.total - a.total);
  }, [projectsMap, pType, pClient, pSearch, pSort]); // ← ALL 5 deps

  // ── SORTED TEAM ──
  const sortedTeam = useMemo(() => {
    let ms = Object.values(members);
    if (tSearch.trim()) ms = ms.filter(m => m.name.toLowerCase().includes(tSearch.toLowerCase()));
    return ms.sort((a,b) => {
      const av = a[tSort.k] ?? a.util, bv = b[tSort.k] ?? b.util;
      return tSort.d === 'asc' ? (av>bv?1:-1) : (av>bv?-1:1);
    });
  }, [members, tSearch, tSort]);

  // ── DASHBOARD MEMBERS ──
  const dashMembers = useMemo(() => {
    let ms = Object.values(members).filter(m => m.total > 0);
    if (dFilter === 'over')  ms = ms.filter(m => m.risk==='Over');
    if (dFilter === 'under') ms = ms.filter(m => m.risk==='Under');
    if (dFilter === 'ok')    ms = ms.filter(m => m.risk==='OK');
    const [k, dir] = dSort.split('-');
    return ms.sort((a,b) => dir==='desc' ? b[k]-a[k] : a[k]-b[k]);
  }, [members, dSort, dFilter]);

  // ── CLIENT HOURS FOR CHART ──
  const clientHours = useMemo(() => {
    const ch = {};
    Object.values(projectsMap).filter(p => p.cat==='Billable')
      .forEach(p => { ch[p.client] = (ch[p.client]||0) + p.hrs; });
    return Object.entries(ch).map(([c,h]) => ({ c, h:parseFloat(h.toFixed(1)) }))
      .sort((a,b) => b.h-a.h).slice(0,12);
  }, [projectsMap]);

  // ── SORT HELPERS ──
  const tsP = k => setPSort(p => ({ k, d: p.k===k && p.d==='desc' ? 'asc' : 'desc' }));
  const tsT = k => setTSort(p => ({ k, d: p.k===k && p.d==='desc' ? 'asc' : 'desc' }));
  const arr = (cfg, k) => cfg.k===k ? (cfg.d==='desc' ? ' ↓' : ' ↑') : '';

  const weekLabel = () => {
    if (!selWeeks.length || selWeeks.length===weeks.length) return 'All Weeks';
    if (selWeeks.length===1) return weeks.find(w=>w.key===selWeeks[0])?.label || '1 week';
    return `${selWeeks.length} weeks`;
  };
  const toggleWeek = k => setSelWeeks(p =>
    p.includes(k) ? (p.length===1 ? p : p.filter(x=>x!==k)) : [...p,k]
  );

  const hasFilters = pClient!=='all' || pType!=='all' || pSearch;

  // ─────────────── LOADING / ERROR ───────────────
  const spinStyle = `@keyframes spin { to { transform:rotate(360deg) } }`;
  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{spinStyle}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:28, height:28, border:`2px solid ${T.border}`, borderTopColor:T.accent,
          borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ fontSize:13, color:T.sub }}>Loading from Google Sheets…</p>
      </div>
    </div>
  );
  if (error) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:T.surface, border:`1px solid #FECACA`, borderRadius:6, padding:32, maxWidth:400, textAlign:'center' }}>
        <AlertCircle size={28} color={T.burn} style={{ margin:'0 auto 10px' }}/>
        <p style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>Could not load data</p>
        <p style={{ fontSize:12, color:T.sub, marginBottom:16 }}>{error}</p>
        <button onClick={load} style={{ padding:'7px 18px', background:T.accent, color:'#fff',
          border:'none', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer' }}>
          Try again
        </button>
      </div>
    </div>
  );

  // ─────────────── SHARED STYLES ───────────────
  const card = { background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, overflow:'hidden' };
  const tblStyle = { width:'100%', borderCollapse:'collapse', fontSize:13 };
  const trHover = (i, risk) => ({
    background: risk==='Over' ? '#FFF8F8' : risk==='Under' ? '#F8FBFF' : i%2===1 ? T.rowAlt : T.surface,
    borderBottom: `1px solid ${T.border}`,
  });

  const controlBar = {
    display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
    padding:'10px 16px', borderBottom:`1px solid ${T.border}`, background:T.headerBg,
  };

  // ─────────────── RENDER ───────────────────────
  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,sans-serif', color:T.text }}>

      {/* ════════ HEADER ════════ */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:40 }}>

        {/* Top row: logo + controls */}
        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 24px',
          height:52, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>

          <img src="/logo.png" alt="STOC Advisory" style={{ height:28, width:'auto', display:'block', flexShrink:0 }}/>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Sel value={teamF} onChange={setTeamF} minW={110}>
              <option value="all">All Teams</option>
              <option value="tas">TAS</option>
              <option value="cds">CDS</option>
            </Sel>

            <div className="wdd" style={{ position:'relative' }}>
              <button onClick={() => setWeekDD(v=>!v)} style={{
                height:30, padding:'0 10px', fontSize:12, border:`1px solid ${T.border}`,
                borderRadius:4, background:T.surface, color:T.sub, cursor:'pointer',
                display:'flex', alignItems:'center', gap:6, outline:'none',
              }}>
                <Calendar size={12} color={T.muted}/>
                {weekLabel()}
                <ChevronDown size={11} color={T.muted} style={{ transition:'.15s', transform:weekDD?'rotate(180deg)':'none' }}/>
              </button>
              {weekDD && (
                <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', zIndex:50,
                  background:T.surface, border:`1px solid ${T.border}`, borderRadius:6,
                  boxShadow:'0 8px 20px rgba(0,0,0,.10)', minWidth:250, overflow:'hidden' }}>
                  <div style={{ maxHeight:220, overflowY:'auto', padding:4 }}>
                    {weeks.map(w => (
                      <label key={w.key} style={{ display:'flex', alignItems:'center', gap:8,
                        padding:'6px 10px', cursor:'pointer', borderRadius:4,
                        background:selWeeks.includes(w.key)?'#EFF6FF':'' }}>
                        <input type="checkbox" checked={selWeeks.includes(w.key)} onChange={() => toggleWeek(w.key)}
                          style={{ width:14, height:14, accentColor:T.accent, cursor:'pointer', flexShrink:0 }}/>
                        <span style={{ fontSize:12, color:T.text }}>{w.label}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ borderTop:`1px solid ${T.border}`, display:'flex', padding:4, gap:4 }}>
                    <button onClick={() => setSelWeeks(weeks.map(w=>w.key))}
                      style={{ flex:1, padding:'4px 0', fontSize:11, fontWeight:500, color:T.accent, background:'none', border:'none', cursor:'pointer', borderRadius:3 }}>All</button>
                    <button onClick={() => weeks.length && setSelWeeks([weeks[0].key])}
                      style={{ flex:1, padding:'4px 0', fontSize:11, fontWeight:500, color:T.sub, background:'none', border:'none', cursor:'pointer', borderRadius:3 }}>Latest</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={load} style={{ height:30, padding:'0 10px', fontSize:12,
              border:`1px solid ${T.border}`, borderRadius:4, background:T.surface,
              color:T.sub, cursor:'pointer', display:'flex', alignItems:'center', gap:5, outline:'none' }}>
              <RefreshCw size={11}/> Refresh
            </button>
          </div>
        </div>

        {/* Nav tabs row */}
        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 24px', display:'flex', gap:0, borderTop:`1px solid ${T.border}` }}>
          {[['projects','Projects'],['dashboard','Dashboard'],['team','Team'],['exceptions','Exceptions']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:'8px 16px', fontSize:13, fontWeight: tab===id ? 600 : 400,
              color: tab===id ? T.accent : T.sub,
              borderBottom: tab===id ? `2px solid ${T.accent}` : '2px solid transparent',
              background:'none', border:'none', borderBottom: tab===id ? `2px solid ${T.accent}` : '2px solid transparent',
              cursor:'pointer', outline:'none', transition:'color .1s',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════ STATS STRIP ════════ */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 24px', height:38,
          display:'flex', alignItems:'center', gap:0, overflow:'hidden' }}>
          {[
            { label:'Members',   val:S.n,                unit:'',  c:T.text },
            { label:'Billable',  val:S.tB.toFixed(0),    unit:'h', c:T.billable },
            { label:'Internal',  val:S.tI.toFixed(0),    unit:'h', c:T.internal },
            { label:'OOO',       val:S.tO.toFixed(0),    unit:'h', c:T.muted },
            { label:'Avg Util',  val:S.avgU.toFixed(0),  unit:'%',
              c: S.avgU>=95?T.burn:S.avgU<60?T.under:T.healthy },
            { label:'At Risk',   val:S.nOver,            unit:'',  c: S.nOver>0?T.burn:T.muted },
            { label:'Bandwidth', val:Math.max(0,S.tA).toFixed(0), unit:'h',
              c: S.tA<0?T.burn:T.text },
          ].map((s,i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width:1, height:16, background:T.border, margin:'0 18px', flexShrink:0 }}/>}
              <div style={{ display:'flex', alignItems:'baseline', gap:4, whiteSpace:'nowrap', flexShrink:0 }}>
                <span style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:T.muted }}>{s.label}</span>
                <span style={{ fontSize:14, fontWeight:700, color:s.c, fontVariantNumeric:'tabular-nums' }}>{s.val}{s.unit}</span>
              </div>
            </React.Fragment>
          ))}
          {updatedAt && (
            <span style={{ marginLeft:'auto', fontSize:11, color:T.muted, whiteSpace:'nowrap', flexShrink:0 }}>
              Data as of {updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}, {updatedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ════════ PAGE BODY ════════ */}
      <div style={{ maxWidth:1440, margin:'0 auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

        {/* ══════════════════════════════════════
            PROJECTS TAB
        ══════════════════════════════════════ */}
        {tab==='projects' && (
          <div style={card}>

            {/* ── Filter bar ── */}
            <div style={controlBar}>
              {/* Search */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <Search size={13} color={T.muted} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                <input
                  value={pSearch} onChange={e => setPSearch(e.target.value)}
                  placeholder="Search projects…"
                  style={{ height:30, paddingLeft:28, paddingRight:pSearch?24:8, width:220, fontSize:12,
                    border:`1px solid ${T.border}`, borderRadius:4, background:T.surface,
                    color:T.text, outline:'none', boxSizing:'border-box' }}/>
                {pSearch && (
                  <button onClick={() => setPSearch('')}
                    style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center' }}>
                    <X size={13}/>
                  </button>
                )}
              </div>

              {/* Client filter */}
              <Sel value={pClient} onChange={setPClient} minW={140} highlight={pClient!=='all'}>
                <option value="all">All clients</option>
                {allClients.map(c => <option key={c} value={c}>{c}</option>)}
              </Sel>

              {/* Type filter */}
              <Sel value={pType} onChange={setPType} minW={130} highlight={pType!=='all'}>
                <option value="all">All types</option>
                <option value="billable">Billable only</option>
                <option value="internal-bd">Internal / BD</option>
              </Sel>

              {/* Clear */}
              {hasFilters && (
                <button onClick={() => { setPSearch(''); setPClient('all'); setPType('all'); }}
                  style={{ height:30, padding:'0 10px', fontSize:12, fontWeight:500,
                    border:`1px solid #FECACA`, borderRadius:4, background:'#FEF2F2',
                    color:T.burn, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                  <X size={12}/> Clear
                </button>
              )}

              <span style={{ marginLeft:'auto', fontSize:11, color:T.muted, whiteSpace:'nowrap' }}>
                {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects &nbsp;·&nbsp; {clientGroups.length} clients
              </span>
            </div>

            {/* ── Table ── */}
            <div style={{ overflowX:'auto' }}>
              <table style={tblStyle}>
                <thead>
                  <tr>
                    <TH pl={16} w={320} onClick={() => tsP('name')} sorted={arr(pSort,'name')}>Project</TH>
                    <TH right w={80}  onClick={() => tsP('hours')} sorted={arr(pSort,'hours')}>Hours</TH>
                    <TH right w={90}>% Billable</TH>
                    <TH w={110}>Type</TH>
                    <TH>Assigned to</TH>
                  </tr>
                </thead>
                <tbody>
                  {clientGroups.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding:'48px 16px', textAlign:'center', color:T.muted, fontSize:13 }}>
                        No projects match your filters
                      </td>
                    </tr>
                  )}

                  {clientGroups.map((cg, ci) => {
                    const isCollapsed = collapsed[cg.client];
                    const billableTotal = cg.projs.filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0);

                    return (
                      <React.Fragment key={ci}>

                        {/* ── CLIENT GROUP HEADER ── */}
                        <tr
                          onClick={() => setCollapsed(p => ({...p, [cg.client]: !p[cg.client]}))}
                          style={{
                            background:'#F1F5F9',
                            borderTop: `2px solid ${T.borderMid}`,
                            borderBottom: `1px solid ${T.border}`,
                            cursor:'pointer',
                          }}>
                          <td colSpan={5} style={{ padding:'9px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              {isCollapsed
                                ? <ChevronRight size={14} color={T.sub}/>
                                : <ChevronDown  size={14} color={T.sub}/>}
                              <span style={{ fontSize:13, fontWeight:700, color:T.text, letterSpacing:'-.01em' }}>
                                {cg.client}
                              </span>
                              <span style={{ fontSize:12, color:T.muted }}>
                                {cg.projs.length} project{cg.projs.length!==1?'s':''}
                              </span>
                              <span style={{ marginLeft:'auto', fontSize:13, fontWeight:600, color:T.text, fontVariantNumeric:'tabular-nums' }}>
                                {cg.total.toFixed(1)}h
                              </span>
                              {totalBillHrs > 0 && billableTotal > 0 && (
                                <span style={{ fontSize:12, color:T.muted, fontVariantNumeric:'tabular-nums', minWidth:40, textAlign:'right' }}>
                                  {Math.round((billableTotal/totalBillHrs)*100)}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* ── PROJECT ROWS ── */}
                        {!isCollapsed && cg.projs.map((p, pi) => {
                          const mems = Object.entries(p.mems).sort(([,a],[,b]) => b-a);
                          const isBill = p.cat === 'Billable';
                          const memberStr = mems.map(([n,h]) => `${n.split(' ')[0]} (${h.toFixed(0)}h)`).join('  ·  ');

                          return (
                            <tr key={pi} style={{
                              background: pi%2===0 ? T.surface : T.rowAlt,
                              borderBottom: `1px solid ${pi===cg.projs.length-1 ? T.border : '#F1F5F9'}`,
                            }}>
                              {/* Project name — indented */}
                              <td style={{ padding:'9px 12px', paddingLeft:36 }}>
                                <span style={{ fontSize:13, color:T.text }}>{p.name}</span>
                              </td>
                              {/* Hours */}
                              <td style={{ padding:'9px 12px', textAlign:'right', fontWeight:600, fontSize:13,
                                color:T.text, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>
                                {p.hrs.toFixed(1)}
                              </td>
                              {/* % of billable */}
                              <td style={{ padding:'9px 12px', textAlign:'right', fontSize:12, color:T.muted, fontVariantNumeric:'tabular-nums' }}>
                                {isBill && totalBillHrs > 0 ? `${Math.round((p.hrs/totalBillHrs)*100)}%` : '—'}
                              </td>
                              {/* Type — text, no badge */}
                              <td style={{ padding:'9px 12px', fontSize:12, fontWeight:500,
                                color: isBill ? T.billable : T.internal }}>
                                {p.cat}
                              </td>
                              {/* Members — plain text */}
                              <td style={{ padding:'9px 12px', fontSize:12, color:T.sub }}>
                                {memberStr}
                              </td>
                            </tr>
                          );
                        })}

                      </React.Fragment>
                    );
                  })}

                  {/* Grand total */}
                  {clientGroups.length > 0 && (
                    <tr style={{ background:T.headerBg, borderTop:`2px solid ${T.borderMid}` }}>
                      <td style={{ padding:'9px 16px', fontSize:12, fontWeight:600, color:T.sub }}>
                        Total — {clientGroups.length} clients, {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects
                      </td>
                      <td style={{ padding:'9px 12px', textAlign:'right', fontSize:13, fontWeight:700,
                        color:T.text, fontVariantNumeric:'tabular-nums' }}>
                        {clientGroups.reduce((s,g)=>s+g.total,0).toFixed(1)}
                      </td>
                      <td style={{ padding:'9px 12px', textAlign:'right', fontSize:12, fontWeight:600, color:T.muted }}>100%</td>
                      <td colSpan={2}/>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            DASHBOARD TAB  (capacity lanes + client chart)
        ══════════════════════════════════════ */}
        {tab==='dashboard' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, alignItems:'start' }}>

            {/* LEFT: Capacity lanes */}
            <div style={card}>
              <div style={{ ...controlBar, gap:10 }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Capacity Overview</span>
                  <span style={{ fontSize:11, color:T.muted, marginLeft:8 }}>40h = full bar</span>
                </div>
                {/* Legend */}
                <div style={{ display:'flex', gap:12, marginLeft:8 }}>
                  {[['Billable',T.barB],['Internal/BD',T.barI],['OOO',T.barO],['Available',T.barA]].map(([l,c])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:c,
                        border:l==='Available'?`1px solid ${T.border}`:'none', flexShrink:0 }}/>
                      <span style={{ fontSize:10, color:T.muted }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                  <Sel value={dFilter} onChange={setDFilter} minW={100}>
                    <option value="all">All</option>
                    <option value="over">At Risk</option>
                    <option value="under">Underutil.</option>
                    <option value="ok">Healthy</option>
                  </Sel>
                  <Sel value={dSort} onChange={setDSort} minW={150}>
                    <option value="util-desc">Highest util first</option>
                    <option value="util-asc">Lowest util first</option>
                    <option value="billable-desc">Most billable</option>
                    <option value="avail-desc">Most available</option>
                  </Sel>
                </div>
              </div>

              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', padding:'6px 16px',
                borderBottom:`1px solid ${T.border}`, background:T.headerBg, gap:12 }}>
                <div style={{ width:156, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', color:T.muted }}>Name</div>
                <div style={{ flex:1 }}/>
                <div style={{ width:44, textAlign:'right', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', color:T.muted }}>Util %</div>
                <div style={{ width:68, textAlign:'right', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', color:T.muted }}>Status</div>
              </div>

              {dashMembers.length === 0 && (
                <div style={{ padding:'32px 16px', textAlign:'center', color:T.muted, fontSize:13 }}>No members match filter</div>
              )}
              {dashMembers.map((m, i) => {
                const cap = Math.max(40*Math.max(selWeeks.length,1), m.total);
                const isOver = m.risk==='Over', isUnder = m.risk==='Under';
                const utilColor = isOver ? T.burn : isUnder ? T.under : T.healthy;
                return (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'8px 16px',
                    borderBottom:`1px solid ${T.border}`,
                    background: isOver ? '#FFF8F8' : isUnder ? '#F8FBFF' : i%2===1 ? T.rowAlt : T.surface,
                  }}>
                    <div style={{ width:156, flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:T.text, lineHeight:1.2 }}>{m.name}</div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>
                        {m.isCDS?'CDS':'TAS'}{m.ooo>0?` · ${m.ooo.toFixed(0)}h OOO`:''}
                      </div>
                    </div>
                    <CapBar billable={m.billable} internal={m.internal} ooo={m.ooo} avail={Math.max(0,m.avail)} cap={cap}/>
                    <div style={{ width:44, textAlign:'right', fontSize:13, fontWeight:700, color:utilColor, fontVariantNumeric:'tabular-nums', flexShrink:0 }}>
                      {m.util.toFixed(0)}%
                    </div>
                    <div style={{ width:68, flexShrink:0 }}><RiskBadge r={m.risk}/></div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Client hours + summary */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Billable hours by client */}
              <div style={card}>
                <div style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}`, background:T.headerBg }}>
                  <span style={{ fontSize:12, fontWeight:600, color:T.text }}>Billable Hours by Client</span>
                </div>
                <div style={{ padding:'10px 6px 6px' }}>
                  <ResponsiveContainer width="100%" height={clientHours.length*32+8}>
                    <BarChart data={clientHours} layout="vertical" margin={{top:0,right:44,bottom:0,left:4}} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke={T.border}/>
                      <XAxis type="number" tick={{ fontSize:10, fill:T.muted }} tickLine={false} axisLine={false}/>
                      <YAxis type="category" dataKey="c" tick={{ fontSize:12, fill:T.text }} tickLine={false} axisLine={false} width={78}/>
                      <Tooltip formatter={v => [`${v}h`, 'Hours']}
                        contentStyle={{ fontSize:12, border:`1px solid ${T.border}`, borderRadius:4, boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}
                        cursor={{ fill:'#F8FAFC' }}/>
                      <Bar dataKey="h" radius={[0,3,3,0]} maxBarSize={16}>
                        {clientHours.map((_,i) => <Cell key={i} fill={T.barB} fillOpacity={.8+.2*(1-i/clientHours.length)}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary stats */}
              <div style={card}>
                <div style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}`, background:T.headerBg }}>
                  <span style={{ fontSize:12, fontWeight:600, color:T.text }}>Period Summary</span>
                </div>
                <table style={{ ...tblStyle, fontSize:12 }}>
                  <tbody>
                    {[
                      ['Billable hours',     `${S.tB.toFixed(0)}h`,  T.billable],
                      ['Internal / BD',      `${S.tI.toFixed(0)}h`,  T.internal],
                      ['OOO',                `${S.tO.toFixed(0)}h`,  T.muted],
                      ['Avg utilization',    `${S.avgU.toFixed(0)}%`, S.avgU>=95?T.burn:S.avgU<60?T.under:T.healthy],
                      ['Team bandwidth',     `${Math.max(0,S.tA).toFixed(0)}h`, T.under],
                      ['At burnout risk',    `${S.nOver} people`,     S.nOver>0?T.burn:T.muted],
                      ['Underutilized',      `${S.nUnder} people`,    S.nUnder>0?T.under:T.muted],
                    ].map(([l,v,c],i) => (
                      <tr key={i} style={{ borderBottom:`1px solid ${T.border}` }}>
                        <td style={{ padding:'7px 14px', color:T.sub }}>{l}</td>
                        <td style={{ padding:'7px 14px', textAlign:'right', fontWeight:700, color:c, fontVariantNumeric:'tabular-nums' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TEAM TAB
        ══════════════════════════════════════ */}
        {tab==='team' && (
          <div style={card}>
            <div style={controlBar}>
              <div style={{ position:'relative' }}>
                <Search size={13} color={T.muted} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                <input value={tSearch} onChange={e => setTSearch(e.target.value)} placeholder="Search…"
                  style={{ height:30, paddingLeft:28, paddingRight:8, width:200, fontSize:12,
                    border:`1px solid ${T.border}`, borderRadius:4, background:T.surface, color:T.text, outline:'none', boxSizing:'border-box' }}/>
              </div>
              <span style={{ marginLeft:'auto', fontSize:11, color:T.muted }}>{sortedTeam.length} members</span>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={tblStyle}>
                <thead>
                  <tr>
                    <TH pl={16} onClick={() => tsT('name')} sorted={arr(tSort,'name')}>Name</TH>
                    <TH w={56}>Team</TH>
                    <TH right w={80} onClick={() => tsT('billable')} sorted={arr(tSort,'billable')}>Billable</TH>
                    <TH right w={90} onClick={() => tsT('internal')} sorted={arr(tSort,'internal')}>Internal/BD</TH>
                    <TH right w={60} onClick={() => tsT('ooo')} sorted={arr(tSort,'ooo')}>OOO</TH>
                    <TH right w={80} onClick={() => tsT('utilized')} sorted={arr(tSort,'utilized')}>Utilized</TH>
                    <TH right w={80} onClick={() => tsT('avail')} sorted={arr(tSort,'avail')}>Available</TH>
                    <TH w={160} onClick={() => tsT('util')} sorted={arr(tSort,'util')}>Utilization</TH>
                    <TH w={80}>Status</TH>
                    <TH right w={70}>Projects</TH>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeam.map((m, i) => {
                    const isOpen = openRow === m.name;
                    const projs = Object.entries(m.jobs).filter(([jc]) => catOf(jc)!=='OOO').sort(([,a],[,b])=>b-a);
                    const utilColor = m.risk==='Over'?T.burn:m.risk==='Under'?T.under:T.healthy;
                    return (
                      <React.Fragment key={i}>
                        <tr onClick={() => setOpenRow(isOpen ? null : m.name)}
                          style={{ ...trHover(i, m.risk), cursor:'pointer',
                            background: isOpen?T.hover:m.risk==='Over'?'#FFF8F8':m.risk==='Under'?'#F8FBFF':i%2===1?T.rowAlt:T.surface }}>
                          <td style={{ padding:'9px 12px', paddingLeft:16 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              {isOpen?<ChevronDown size={13} color={T.muted}/>:<ChevronRight size={13} color={T.muted}/>}
                              <span style={{ fontSize:13, fontWeight:500, color:T.text }}>{m.name}</span>
                            </div>
                          </td>
                          <td style={{ padding:'9px 12px' }}>
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 5px', borderRadius:3,
                              background: m.isCDS?'#EDE9FE':'#DBEAFE', color:m.isCDS?T.internal:T.under }}>
                              {m.isCDS?'CDS':'TAS'}
                            </span>
                          </td>
                          {[m.billable,m.internal].map((v,j) => (
                            <td key={j} style={{ padding:'9px 12px', textAlign:'right', fontSize:13, color:T.sub, fontVariantNumeric:'tabular-nums' }}>{v.toFixed(1)}</td>
                          ))}
                          <td style={{ padding:'9px 12px', textAlign:'right', fontSize:13, color:T.muted, fontVariantNumeric:'tabular-nums' }}>{m.ooo.toFixed(1)}</td>
                          <td style={{ padding:'9px 12px', textAlign:'right', fontSize:13, fontWeight:600, color:T.text, fontVariantNumeric:'tabular-nums' }}>{m.utilized.toFixed(1)}</td>
                          <td style={{ padding:'9px 12px', textAlign:'right', fontSize:13, fontWeight:600,
                            color:m.avail<0?T.burn:m.avail<8?'#B45309':T.text, fontVariantNumeric:'tabular-nums' }}>
                            {m.avail.toFixed(1)}
                          </td>
                          {/* Utilization bar */}
                          <td style={{ padding:'9px 12px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ flex:1, height:5, background:T.border, borderRadius:2, overflow:'hidden' }}>
                                <div style={{ height:5, borderRadius:2, background:utilColor, width:`${Math.min(m.util,100)}%` }}/>
                              </div>
                              <span style={{ fontSize:12, fontWeight:700, color:utilColor, fontVariantNumeric:'tabular-nums', minWidth:30, textAlign:'right' }}>
                                {m.util.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding:'9px 12px' }}><RiskBadge r={m.risk}/></td>
                          <td style={{ padding:'9px 12px', textAlign:'right', fontSize:12, color:T.muted }}>{projs.length}</td>
                        </tr>

                        {/* Expanded project list */}
                        {isOpen && (
                          <tr style={{ borderBottom:`1px solid ${T.border}`, background:'#F0F7FF' }}>
                            <td colSpan={10} style={{ padding:'0 16px 12px' }}>
                              <div style={{ marginLeft:22, marginTop:8, maxWidth:480 }}>
                                <table style={{ ...tblStyle, fontSize:12 }}>
                                  <thead>
                                    <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                                      <th style={{ padding:'4px 8px', textAlign:'left', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', color:T.muted }}>Project</th>
                                      <th style={{ padding:'4px 8px', textAlign:'right', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', color:T.muted }}>Hours</th>
                                      <th style={{ padding:'4px 8px', textAlign:'right', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', color:T.muted }}>% of Util</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {projs.map(([jc,hrs],j) => (
                                      <tr key={j} style={{ borderBottom:j<projs.length-1?`1px solid ${T.border}`:'none', background:j%2===1?'rgba(255,255,255,.6)':'' }}>
                                        <td style={{ padding:'5px 8px', color:T.text }}>{jc}</td>
                                        <td style={{ padding:'5px 8px', textAlign:'right', fontWeight:600, color:T.text, fontVariantNumeric:'tabular-nums' }}>{hrs.toFixed(1)}</td>
                                        <td style={{ padding:'5px 8px', textAlign:'right', color:T.muted, fontVariantNumeric:'tabular-nums' }}>{m.utilized>0?Math.round((hrs/m.utilized)*100):0}%</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Totals */}
                  <tr style={{ background:T.headerBg, borderTop:`2px solid ${T.borderMid}` }}>
                    <td colSpan={2} style={{ padding:'9px 16px', fontSize:12, fontWeight:700, color:T.text }}>Total</td>
                    {[S.tB,S.tI,S.tO,S.tU].map((v,i) => (
                      <td key={i} style={{ padding:'9px 12px', textAlign:'right', fontSize:13, fontWeight:700, color:T.text, fontVariantNumeric:'tabular-nums' }}>{v.toFixed(1)}</td>
                    ))}
                    <td style={{ padding:'9px 12px', textAlign:'right', fontSize:13, fontWeight:700,
                      color:S.tA<0?T.burn:T.text, fontVariantNumeric:'tabular-nums' }}>{S.tA.toFixed(1)}</td>
                    <td style={{ padding:'9px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:5, background:T.border, borderRadius:2, overflow:'hidden' }}>
                          <div style={{ height:5, borderRadius:2, background:S.avgU>=95?T.burn:S.avgU<60?T.under:T.healthy, width:`${Math.min(S.avgU,100)}%` }}/>
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color:T.text, fontVariantNumeric:'tabular-nums', minWidth:30, textAlign:'right' }}>{S.avgU.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td colSpan={2}/>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            EXCEPTIONS TAB
        ══════════════════════════════════════ */}
        {tab==='exceptions' && (
          <div style={card}>
            <table style={tblStyle}>
              <thead>
                <tr>
                  <TH pl={16} w={130}>Issue</TH>
                  <TH w={180}>Team Member</TH>
                  <TH>Details</TH>
                  <TH w={140}>Action</TH>
                </tr>
              </thead>
              <tbody>
                {Object.values(members).filter(m=>m.avail<0).map((m,i) => (
                  <tr key={`o${i}`} style={{ borderBottom:`1px solid ${T.border}`, background:'#FFF8F8',
                    borderLeft:`3px solid ${T.burn}` }}>
                    <td style={{ padding:'10px 12px', paddingLeft:13 }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:3, background:'#FEE2E2', color:'#991B1B' }}>Overallocated</span>
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13, fontWeight:500, color:T.text }}>{m.name}</td>
                    <td style={{ padding:'10px 12px', fontSize:13, color:T.sub }}>
                      {Math.abs(m.avail).toFixed(1)}h over capacity &nbsp;·&nbsp; {m.util.toFixed(0)}% utilized
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:12, fontWeight:600, color:T.burn }}>Rebalance work</td>
                  </tr>
                ))}
                {Object.values(members).filter(m=>m.total>0&&m.total<20).map((m,i) => (
                  <tr key={`l${i}`} style={{ borderBottom:`1px solid ${T.border}`, background:'#FFFBEB',
                    borderLeft:'3px solid #D97706' }}>
                    <td style={{ padding:'10px 12px', paddingLeft:13 }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:3, background:'#FEF3C7', color:'#92400E' }}>Low Hours</span>
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13, fontWeight:500, color:T.text }}>{m.name}</td>
                    <td style={{ padding:'10px 12px', fontSize:13, color:T.sub }}>Only {m.total.toFixed(1)}h logged this period</td>
                    <td style={{ padding:'10px 12px', fontSize:12, fontWeight:600, color:'#92400E' }}>Review entry</td>
                  </tr>
                ))}
                {Object.values(members).filter(m=>m.avail<0||m.total<20).length===0 && (
                  <tr><td colSpan={4} style={{ padding:'48px 16px', textAlign:'center', fontSize:13, color:T.muted }}>No exceptions this period 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
