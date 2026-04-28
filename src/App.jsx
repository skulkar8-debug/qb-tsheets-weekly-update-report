import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Users, DollarSign, Activity, Clock,
  Search, RefreshCw, AlertCircle,
  ChevronDown, ChevronRight, AlertTriangle, UserCheck, Target, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────
const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv';

const CDS_TEAM = new Set([
  'Mohit Sharma','Rakesh Nayak','Sharvan Pandey',
  'Stefan Joseph','Jogendra Singh','Ramya D','Vaishnav Govind',
]);

// ─────────────────────────────────────────────────────────
// DATA HELPERS  (unchanged logic)
// ─────────────────────────────────────────────────────────
const normalizeClient = (j) => {
  if (!j) return 'Other';
  if (/^holiday$|^vacation$|^sick$/i.test(j.trim())) return 'OOO';
  if (/^administrative$/i.test(j.trim())) return 'Administrative';
  if (/^business development/i.test(j)) return 'Business Development';
  if (/^cds\b/i.test(j) || /tableau/i.test(j)) return 'CDS Internal';
  if (/^AEG[\s\-–]/i.test(j)  || /^AEG$/i.test(j))   return 'AEG';
  if (/^SALT[\s\-–]/i.test(j) || /^SALT$/i.test(j))   return 'SALT';
  if (/^ADP[\s\-–]/i.test(j)  || /^ADP$/i.test(j))    return 'ADP';
  if (/^SP\s*USA[\s\-–]/i.test(j)||/^SPUSA[\s\-–]/i.test(j)||/^SP\s*USA$/i.test(j)) return 'SP USA';
  if (/^CPC[\s\-–]/i.test(j)  || /^CPC$/i.test(j))    return 'CPC';
  if (/^RIATA[\s\-–]/i.test(j)||/^RIATA$/i.test(j))   return 'Riata';
  if (/^BEACON/i.test(j))   return 'Beacon';
  if (/^ARCHWAY/i.test(j))  return 'Archway';
  if (/^BUDGET/i.test(j))   return 'Budget';
  const m = j.match(/^(.+?)\s*[-–]\s*/);
  if (m) return m[1].trim();
  return j.trim();
};

const catOf = (j) => {
  if (!j) return 'Billable';
  if (/^holiday$|^vacation$|^sick$/i.test(j.trim())) return 'OOO';
  if (/^administrative$/i.test(j.trim())||/^business development/i.test(j)||
      /^cds\b/i.test(j)||/tableau/i.test(j)) return 'Internal/BD';
  return 'Billable';
};

const parseCSV = (text) => {
  const clean = text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const lines = clean.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const r = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i+1]==='"') { cur+='"'; i++; } else inQ=!inQ; }
      else if (ch === ',' && !inQ) { r.push(cur.trim()); cur=''; }
      else cur += ch;
    }
    r.push(cur.trim()); return r;
  };
  const hdrs = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g,'_'));
  return lines.slice(1)
    .map(line => { const v=parseLine(line); const row={}; hdrs.forEach((h,i)=>{ row[h]=v[i]??''; }); return row; })
    .filter(r => r.fname||r.lname||r.username);
};

const detectWeeks = (rows) => {
  const m = {};
  rows.forEach(r => {
    const d = new Date(r.local_date); if (isNaN(d)) return;
    const day=d.getDay(); const diff=day===0?-6:1-day;
    const mon=new Date(d); mon.setDate(d.getDate()+diff);
    const sun=new Date(mon); sun.setDate(mon.getDate()+6);
    const fmt=dt=>dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const key=mon.toISOString().slice(0,10);
    if (!m[key]) m[key]={key,label:`${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`};
  });
  return Object.values(m).sort((a,b)=>b.key.localeCompare(a.key));
};

const riskOf  = (u) => u>=95?'Burnout Risk':u<60?'Underutilized':'Healthy';
const pct     = (n,d) => d>0?Math.round((n/d)*100):0;

// Colour tokens — used everywhere consistently
const RISK = {
  'Burnout Risk':  { rowBg:'bg-red-50',   badge:'bg-red-100 text-red-800',   dot:'bg-red-500',  bar:'#EF4444', label:'text-red-700'  },
  'Underutilized': { rowBg:'bg-sky-50',   badge:'bg-sky-100 text-sky-800',   dot:'bg-sky-400',  bar:'#38BDF8', label:'text-sky-700'  },
  'Healthy':       { rowBg:'',            badge:'bg-emerald-100 text-emerald-800', dot:'bg-emerald-500', bar:'#10B981', label:'text-emerald-700' },
};

// ─────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────

// Consistent table header cell
const TH = ({ children, right, onClick, sorted }) => (
  <th
    onClick={onClick}
    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border-b border-gray-200 whitespace-nowrap select-none
      ${right ? 'text-right' : 'text-left'}
      ${onClick ? 'cursor-pointer hover:bg-gray-100 hover:text-gray-700' : ''}`}
  >
    {children}{sorted}
  </th>
);

// Consistent table data cell
const TD = ({ children, right, muted, bold, className='' }) => (
  <td className={`px-4 py-3 text-sm whitespace-nowrap
    ${right ? 'text-right tabular-nums' : ''}
    ${muted ? 'text-gray-400' : 'text-gray-700'}
    ${bold  ? 'font-semibold text-gray-900' : ''}
    ${className}`}>
    {children}
  </td>
);

// Risk badge pill
const RiskBadge = ({ level }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${RISK[level]?.badge}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${RISK[level]?.dot}`}/>
    {level}
  </span>
);

// Utilization bar (inline, fixed width)
const UtilBar = ({ value }) => {
  const capped = Math.min(value, 120);
  const color  = value>=95?'bg-red-400':value<60?'bg-sky-400':'bg-emerald-400';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${color}`} style={{width:`${Math.min(capped,100)}%`}}/>
      </div>
      <span className={`text-xs font-semibold tabular-nums w-9 text-right
        ${value>=95?'text-red-600':value<60?'text-sky-600':'text-emerald-600'}`}>
        {value.toFixed(0)}%
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function StocStaffingDashboard() {

  // ── state ──
  const [allRows,     setAllRows]    = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState(null);
  const [lastUpdated, setLastUpdated]= useState(null);

  const [tab,         setTab]        = useState('projects');
  const [teamFilter,  setTeamFilter] = useState('all');
  const [selWeeks,    setSelWeeks]   = useState([]);
  const [weekDD,      setWeekDD]     = useState(false);

  const [projSearch,  setProjSearch]   = useState('');
  const [projFilter,  setProjFilter]   = useState('all');
  const [projSort,    setProjSort]     = useState({ k:'hours', d:'desc' });
  const [collapsed,   setCollapsed]    = useState({});   // client groups

  const [teamSearch,  setTeamSearch]   = useState('');
  const [teamSort,    setTeamSort]     = useState({ k:'utilized', d:'desc' });
  const [openMember,  setOpenMember]   = useState(null);

  const [riskFilter,  setRiskFilter]   = useState('all');

  // ── fetch ──
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(SHEET_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      if (!rows.length) throw new Error('No data rows found. Check the sheet is publicly shared.');
      setAllRows(rows);
      setLastUpdated(new Date());
      const w = detectWeeks(rows);
      if (w.length) setSelWeeks([w[0].key]);
    } catch(e) { setError(e.message); }
    finally    { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const h = e => { if (!e.target.closest('.week-dd')) setWeekDD(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const weeks = useMemo(() => detectWeeks(allRows), [allRows]);

  // ── filter rows to selected weeks ──
  const filteredRows = useMemo(() => {
    if (!selWeeks.length) return allRows;
    return allRows.filter(r => {
      const d = new Date(r.local_date); if (isNaN(d)) return false;
      const day=d.getDay(); const diff=day===0?-6:1-day;
      const mon=new Date(d); mon.setDate(d.getDate()+diff);
      return selWeeks.includes(mon.toISOString().slice(0,10));
    });
  }, [allRows, selWeeks]);

  // ── core aggregation ──
  const { members, projectsMap } = useMemo(() => {
    const tm={}, pm={};
    const nW = Math.max(selWeeks.length, 1);

    filteredRows.forEach(r => {
      const name = `${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs  = parseFloat(r.hours) || 0;
      const jc   = (r.jobcode||'').trim();
      if (!name || !hrs || !jc) return;

      const cat    = catOf(jc);
      const client = normalizeClient(jc);
      const isCDS  = CDS_TEAM.has(name);

      if (teamFilter==='cds' && !isCDS) return;
      if (teamFilter==='tas' &&  isCDS) return;

      // members
      if (!tm[name]) tm[name]={ name, isCDS, total:0, billable:0, ooo:0, internal:0, utilized:0, jobs:{}, entries:[] };
      tm[name].total    += hrs;
      tm[name].entries.push({ jc, hrs, cat, client });
      if      (cat==='OOO')         tm[name].ooo      += hrs;
      else if (cat==='Internal/BD') { tm[name].internal += hrs; tm[name].utilized += hrs; }
      else                          { tm[name].billable  += hrs; tm[name].utilized += hrs; }
      tm[name].jobs[jc] = (tm[name].jobs[jc]||0) + hrs;

      // projects — OOO entries are NOT projects
      if (cat==='OOO') return;
      if (!pm[jc]) pm[jc]={ name:jc, cat, client, hrs:0, mems:{} };
      pm[jc].hrs += hrs;
      pm[jc].mems[name] = (pm[jc].mems[name]||0) + hrs;
    });

    Object.values(tm).forEach(m => {
      m.effCap = 40*nW - m.ooo;
      m.avail  = m.effCap - m.utilized;
      m.util   = m.effCap>0 ? (m.utilized/m.effCap)*100 : 0;
      m.risk   = riskOf(m.util);
    });
    return { members:tm, projectsMap:pm };
  }, [filteredRows, teamFilter, selWeeks]);

  // ── summary stats ──
  const stats = useMemo(() => {
    const ms=Object.values(members);
    return {
      n:    ms.length,
      tB:   ms.reduce((s,m)=>s+m.billable,0),
      tI:   ms.reduce((s,m)=>s+m.internal,0),
      tO:   ms.reduce((s,m)=>s+m.ooo,0),
      tU:   ms.reduce((s,m)=>s+m.utilized,0),
      tA:   ms.reduce((s,m)=>s+m.avail,0),
      tC:   ms.reduce((s,m)=>s+m.effCap,0),
      avgU: ms.reduce((s,m)=>s+m.effCap,0)>0
              ? (ms.reduce((s,m)=>s+m.utilized,0)/ms.reduce((s,m)=>s+m.effCap,0))*100
              : 0,
    };
  }, [members]);

  const totalBillableHrs = useMemo(() =>
    Object.values(projectsMap).filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0)
  , [projectsMap]);

  // ── projects by client ──
  const clientGroups = useMemo(() => {
    const g={};
    Object.values(projectsMap).forEach(p => {
      if (projFilter==='billable'    && p.cat!=='Billable')    return;
      if (projFilter==='internal-bd' && p.cat!=='Internal/BD') return;
      if (projSearch && !p.name.toLowerCase().includes(projSearch.toLowerCase()) &&
          !p.client.toLowerCase().includes(projSearch.toLowerCase())) return;
      if (!g[p.client]) g[p.client]={ client:p.client, total:0, projs:[] };
      g[p.client].projs.push(p);
      g[p.client].total += p.hrs;
    });
    Object.values(g).forEach(cg =>
      cg.projs.sort((a,b) =>
        projSort.k==='hours'
          ? (projSort.d==='desc' ? b.hrs-a.hrs : a.hrs-b.hrs)
          : (projSort.d==='desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name))
      )
    );
    return Object.values(g).sort((a,b) => b.total-a.total);
  }, [projectsMap, projFilter, projSearch, projSort]);

  // ── sorted team members ──
  const sortedMembers = useMemo(() => {
    let ms = Object.values(members);
    if (teamSearch.trim()) ms = ms.filter(m => m.name.toLowerCase().includes(teamSearch.toLowerCase()));
    return ms.sort((a,b) => {
      const av=a[teamSort.k]??a.util, bv=b[teamSort.k]??b.util;
      return teamSort.d==='asc' ? (av>bv?1:-1) : (av>bv?-1:1);
    });
  }, [members, teamSearch, teamSort]);

  // ── risk members ──
  const riskMembers = useMemo(() => {
    let ms = Object.values(members).filter(m => m.utilized>0);
    if (riskFilter!=='all') ms = ms.filter(m => m.risk===riskFilter);
    return ms.sort((a,b) => b.util-a.util);
  }, [members, riskFilter]);

  // ── sort helpers ──
  const toggleProjSort = k => setProjSort(p=>({k, d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const toggleTeamSort = k => setTeamSort(p=>({k, d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const arr = (cfg, k) => cfg.k===k ? (cfg.d==='desc'?' ↓':' ↑') : '';

  const weekLabel = () => {
    if (!selWeeks.length || selWeeks.length===weeks.length) return 'All Weeks';
    if (selWeeks.length===1) return weeks.find(w=>w.key===selWeeks[0])?.label || '1 week';
    return `${selWeeks.length} weeks`;
  };
  const toggleWeek = k => setSelWeeks(p =>
    p.includes(k) ? (p.length===1 ? p : p.filter(x=>x!==k)) : [...p,k]
  );

  // ─────────────────────── LOADING / ERROR ───────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-500 mx-auto animate-spin"/>
        <p className="text-base font-medium text-gray-600">Loading staffing data…</p>
        <p className="text-sm text-gray-400">Fetching from Google Sheets</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md w-full text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto"/>
        <h2 className="text-lg font-semibold text-gray-800">Could not load data</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={load} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          Try again
        </button>
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 text-left space-y-1">
          <p className="font-semibold">Checklist</p>
          <p>• Sheet shared as "Anyone with the link"</p>
          <p>• Columns: fname, lname, hours, jobcode, local_date</p>
        </div>
      </div>
    </div>
  );

  // ─────────────────────── MAIN RENDER ───────────────────────
  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily:'system-ui,-apple-system,sans-serif'}}>

      {/* ══════════ TOP NAVIGATION BAR ══════════ */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

          {/* Left: title + tabs */}
          <div className="flex items-center gap-6 min-w-0">
            <span className="text-base font-bold text-gray-900 shrink-0">STOC Staffing</span>
            <nav className="flex gap-1">
              {[
                ['projects',  'Projects'],
                ['teams',     'Teams'],
                ['risk',      'Risk'],
                ['capacity',  'Capacity'],
                ['exceptions','Exceptions'],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                    ${tab===id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 shrink-0">
            <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}
              className="h-8 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="all">All Teams</option>
              <option value="tas">TAS</option>
              <option value="cds">CDS</option>
            </select>

            <div className="relative week-dd">
              <button onClick={() => setWeekDD(v=>!v)}
                className="h-8 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 flex items-center gap-1.5 hover:bg-gray-50">
                <Calendar className="w-3.5 h-3.5 text-gray-400"/>
                <span>{weekLabel()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${weekDD?'rotate-180':''}`}/>
              </button>
              {weekDD && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="max-h-56 overflow-y-auto p-1">
                    {weeks.map(w => (
                      <label key={w.key} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={selWeeks.includes(w.key)} onChange={()=>toggleWeek(w.key)}
                          className="w-4 h-4 rounded text-blue-600"/>
                        <span className="text-sm text-gray-700">{w.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 flex p-1 gap-1">
                    <button onClick={()=>setSelWeeks(weeks.map(w=>w.key))}
                      className="flex-1 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md">All</button>
                    <button onClick={()=>setSelWeeks(weeks.length?[weeks[0].key]:[])}
                      className="flex-1 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-md">Latest</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={load}
              className="h-8 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 flex items-center gap-1.5 hover:bg-gray-50">
              <RefreshCw className="w-3.5 h-3.5 text-gray-400"/>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ SUMMARY STRIP ══════════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center gap-8 overflow-x-auto">
          {[
            { label:'Members',    value: stats.n,              unit:'',  color:'text-gray-900' },
            { label:'Billable',   value: stats.tB.toFixed(0),  unit:'h', color:'text-emerald-600' },
            { label:'Internal',   value: stats.tI.toFixed(0),  unit:'h', color:'text-violet-600' },
            { label:'OOO',        value: stats.tO.toFixed(0),  unit:'h', color:'text-gray-400' },
            { label:'Avg Util',   value: stats.avgU.toFixed(0),unit:'%',
              color: stats.avgU>=95?'text-red-600':stats.avgU<60?'text-sky-600':'text-emerald-600' },
            { label:'Bandwidth',  value: stats.tA.toFixed(0),  unit:'h',
              color: stats.tA<0?'text-red-600':'text-gray-900' },
          ].map((s,i) => (
            <div key={i} className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.label}</span>
              <span className={`text-base font-bold tabular-nums ${s.color}`}>{s.value}{s.unit}</span>
            </div>
          ))}
          {lastUpdated && (
            <span className="ml-auto text-xs text-gray-400 shrink-0">
              Data as of {lastUpdated.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}, {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ══════════ PAGE CONTENT ══════════ */}
      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-4">

        {/* ──────────────────────────────────────
            PROJECTS TAB
        ────────────────────────────────────── */}
        {tab==='projects' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                <input value={projSearch} onChange={e=>setProjSearch(e.target.value)}
                  placeholder="Filter projects or clients…"
                  className="pl-9 pr-8 py-1.5 w-64 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                {projSearch && (
                  <button onClick={()=>setProjSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none">×</button>
                )}
              </div>
              <select value={projFilter} onChange={e=>setProjFilter(e.target.value)}
                className="h-8 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none">
                <option value="all">All types</option>
                <option value="billable">Billable only</option>
                <option value="internal-bd">Internal / BD only</option>
              </select>
              <span className="ml-auto text-sm text-gray-400">
                {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects across {clientGroups.length} clients
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TH>Project</TH>
                    <TH right onClick={()=>toggleProjSort('hours')} sorted={arr(projSort,'hours')}>Hours</TH>
                    <TH right>% of Billable</TH>
                    <TH>Type</TH>
                    <TH>People</TH>
                    <TH right>Count</TH>
                  </tr>
                </thead>
                <tbody>
                  {clientGroups.length===0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">No projects match your filters</td></tr>
                  )}
                  {clientGroups.map((cg, ci) => {
                    const isCollapsed = collapsed[cg.client];
                    const allMembers  = [...new Set(cg.projs.flatMap(p=>Object.keys(p.mems)))];
                    return (
                      <React.Fragment key={ci}>
                        {/* ── CLIENT GROUP ROW ── */}
                        <tr
                          className="bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors"
                          onClick={()=>setCollapsed(p=>({...p,[cg.client]:!p[cg.client]}))}>
                          <td className="px-5 py-3" colSpan={1}>
                            <div className="flex items-center gap-2">
                              {isCollapsed
                                ? <ChevronRight className="w-4 h-4 text-gray-500 shrink-0"/>
                                : <ChevronDown  className="w-4 h-4 text-gray-500 shrink-0"/>}
                              <span className="text-sm font-bold text-gray-900">{cg.client}</span>
                              <span className="text-xs text-gray-500 font-normal">{cg.projs.length} project{cg.projs.length!==1?'s':''}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 tabular-nums">
                            {cg.total.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500 tabular-nums">
                            {cg.projs[0]?.cat==='Billable' ? `${pct(cg.total,totalBillableHrs)}%` : '—'}
                          </td>
                          <td className="px-4 py-3"/>
                          <td className="px-4 py-3 text-sm text-gray-500">{allMembers.length} people</td>
                          <td className="px-4 py-3"/>
                        </tr>

                        {/* ── PROJECT ROWS ── */}
                        {!isCollapsed && cg.projs.map((p, pi) => {
                          const memEntries = Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                          const typeBadge  =
                            p.cat==='Billable'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-violet-50 text-violet-700 border border-violet-200';
                          return (
                            <tr key={pi} className={`border-t border-gray-100 hover:bg-blue-50 transition-colors ${pi%2===1?'bg-gray-50/50':''}`}>
                              {/* Project name — indented */}
                              <td className="px-5 py-3">
                                <span className="pl-6 text-sm text-gray-800">{p.name}</span>
                              </td>
                              {/* Hours */}
                              <TD right bold>{p.hrs.toFixed(1)}</TD>
                              {/* % of billable */}
                              <TD right muted>
                                {p.cat==='Billable' ? `${pct(p.hrs,totalBillableHrs)}%` : '—'}
                              </TD>
                              {/* Type badge */}
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeBadge}`}>
                                  {p.cat}
                                </span>
                              </td>
                              {/* Member names */}
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {memEntries.map(([n,h],mi)=>(
                                    <span key={mi} className="text-xs bg-white border border-gray-200 rounded-md px-2 py-0.5 text-gray-600 whitespace-nowrap">
                                      {n.split(' ')[0]} <span className="text-gray-400 font-medium tabular-nums">{h.toFixed(0)}h</span>
                                    </span>
                                  ))}
                                </div>
                              </td>
                              {/* People count */}
                              <TD right muted>{memEntries.length}</TD>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────
            TEAMS TAB
        ────────────────────────────────────── */}
        {tab==='teams' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                <input value={teamSearch} onChange={e=>setTeamSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="pl-9 pr-3 py-1.5 w-56 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"/>
              </div>
              <span className="ml-auto text-sm text-gray-400">{sortedMembers.length} members</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TH onClick={()=>toggleTeamSort('name')}    sorted={arr(teamSort,'name')}>Name</TH>
                    <TH>Team</TH>
                    <TH right onClick={()=>toggleTeamSort('billable')}  sorted={arr(teamSort,'billable')}>Billable</TH>
                    <TH right onClick={()=>toggleTeamSort('internal')}  sorted={arr(teamSort,'internal')}>Internal / BD</TH>
                    <TH right onClick={()=>toggleTeamSort('ooo')}       sorted={arr(teamSort,'ooo')}>OOO</TH>
                    <TH right onClick={()=>toggleTeamSort('utilized')}  sorted={arr(teamSort,'utilized')}>Utilized</TH>
                    <TH right onClick={()=>toggleTeamSort('avail')}     sorted={arr(teamSort,'avail')}>Available</TH>
                    <TH onClick={()=>toggleTeamSort('util')}    sorted={arr(teamSort,'util')}>Utilization</TH>
                    <TH>Status</TH>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((m, i) => {
                    const isOpen = openMember===m.name;
                    const projs  = Object.entries(m.jobs)
                      .filter(([jc])=>catOf(jc)!=='OOO')
                      .sort(([,a],[,b])=>b-a);
                    return (
                      <React.Fragment key={i}>
                        <tr
                          className={`border-t border-gray-100 cursor-pointer transition-colors
                            ${isOpen ? 'bg-blue-50' : i%2===1 ? 'bg-gray-50/50 hover:bg-blue-50' : 'hover:bg-blue-50'}`}
                          onClick={()=>setOpenMember(isOpen?null:m.name)}>
                          {/* Name */}
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {isOpen
                                ? <ChevronDown  className="w-3.5 h-3.5 text-gray-400 shrink-0"/>
                                : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0"/>}
                              <span className="text-sm font-medium text-gray-900">{m.name}</span>
                            </div>
                          </td>
                          {/* Team badge */}
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md
                              ${m.isCDS?'bg-purple-50 text-purple-700 border border-purple-200':'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                              {m.isCDS?'CDS':'TAS'}
                            </span>
                          </td>
                          <TD right>{m.billable.toFixed(1)}</TD>
                          <TD right>{m.internal.toFixed(1)}</TD>
                          <TD right muted>{m.ooo.toFixed(1)}</TD>
                          <TD right bold>{m.utilized.toFixed(1)}</TD>
                          {/* Available — coloured */}
                          <td className={`px-4 py-3 text-right text-sm font-semibold tabular-nums
                            ${m.avail<0?'text-red-600':m.avail<8?'text-amber-600':'text-gray-700'}`}>
                            {m.avail.toFixed(1)}
                          </td>
                          {/* Util bar */}
                          <td className="px-4 py-3 min-w-[140px]">
                            <UtilBar value={m.util}/>
                          </td>
                          {/* Risk badge */}
                          <td className="px-4 py-3">
                            <RiskBadge level={m.risk}/>
                          </td>
                        </tr>

                        {/* Expanded project breakdown */}
                        {isOpen && (
                          <tr className="border-t border-blue-100 bg-blue-50/60">
                            <td colSpan={9} className="px-5 py-4">
                              <div className="ml-6 max-w-xl">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                  Project breakdown — % of utilized hours
                                </p>
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="py-1.5 text-left font-semibold text-gray-600">Project</th>
                                      <th className="py-1.5 text-right font-semibold text-gray-600 tabular-nums w-20">Hours</th>
                                      <th className="py-1.5 text-right font-semibold text-gray-600 w-16">%</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {projs.map(([jc,hrs],j)=>(
                                      <tr key={j} className={j%2===1?'bg-white/60':''}>
                                        <td className="py-1.5 text-gray-700">{jc}</td>
                                        <td className="py-1.5 text-right text-gray-900 font-medium tabular-nums">{hrs.toFixed(1)}</td>
                                        <td className="py-1.5 text-right text-gray-400">{m.utilized>0?pct(hrs,m.utilized):0}%</td>
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

                  {/* Totals row */}
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="px-5 py-3 text-sm font-bold text-gray-900" colSpan={2}>Total</td>
                    <TD right bold>{stats.tB.toFixed(1)}</TD>
                    <TD right bold>{stats.tI.toFixed(1)}</TD>
                    <TD right muted>{stats.tO.toFixed(1)}</TD>
                    <TD right bold>{stats.tU.toFixed(1)}</TD>
                    <td className={`px-4 py-3 text-right text-sm font-bold tabular-nums ${stats.tA<0?'text-red-600':'text-gray-900'}`}>
                      {stats.tA.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 min-w-[140px]"><UtilBar value={stats.avgU}/></td>
                    <td className="px-4 py-3"/>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────
            RISK TAB
        ────────────────────────────────────── */}
        {tab==='risk' && (() => {
          const burnout  = Object.values(members).filter(m=>m.risk==='Burnout Risk');
          const under    = Object.values(members).filter(m=>m.risk==='Underutilized');
          const capacity = under.reduce((s,m)=>s+Math.max(0,m.effCap*0.60-m.utilized),0);
          return (
            <div className="space-y-4">
              {/* Action banner */}
              {(burnout.length>0||under.length>0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Action needed this week</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-amber-800">
                      {burnout.length>0 && (
                        <span>
                          <strong>{burnout.length}</strong> at burnout risk —&nbsp;
                          {burnout.map(m=>m.name.split(' ')[0]).join(', ')}
                        </span>
                      )}
                      {under.length>0 && (
                        <span>
                          <strong>{under.length}</strong> underutilised with&nbsp;
                          <strong>~{capacity.toFixed(0)}h</strong> available to absorb
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bar chart */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Team Utilization</h2>
                  <select value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}
                    className="h-8 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none">
                    <option value="all">All</option>
                    <option value="Burnout Risk">Burnout Risk</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Underutilized">Underutilized</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(riskMembers.length*36, 120)}>
                  <BarChart
                    data={riskMembers.map(m=>({
                      name: m.name,
                      util: parseFloat(m.util.toFixed(1)),
                      risk: m.risk,
                    }))}
                    layout="vertical"
                    margin={{top:0,right:60,bottom:0,left:140}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9"/>
                    <XAxis type="number" domain={[0,120]} unit="%" tick={{fontSize:11,fill:'#94A3B8'}} tickLine={false} axisLine={false}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:13,fill:'#374151'}} tickLine={false} axisLine={false} width={136}/>
                    <Tooltip
                      formatter={v=>[`${v}%`,'Utilization']}
                      contentStyle={{fontSize:13,borderRadius:8,border:'1px solid #E2E8F0',boxShadow:'0 4px 6px -1px rgba(0,0,0,.07)'}}/>
                    <ReferenceLine x={60}  stroke="#BAE6FD" strokeDasharray="5 3"
                      label={{value:'60%',position:'insideTopRight',fontSize:10,fill:'#7DD3FC'}}/>
                    <ReferenceLine x={95}  stroke="#FECACA" strokeDasharray="5 3"
                      label={{value:'95%',position:'insideTopRight',fontSize:10,fill:'#F87171'}}/>
                    <Bar dataKey="util" radius={[0,4,4,0]} maxBarSize={24}>
                      {riskMembers.map((m,i)=>(<Cell key={i} fill={RISK[m.risk].bar} fillOpacity={0.9}/>))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-gray-100">
                  {Object.entries(RISK).map(([level,c])=>(
                    <div key={level} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background:c.bar}}/>
                      <span className="text-xs text-gray-500">{level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <TH>Name</TH>
                        <TH>Status</TH>
                        <TH right>Util %</TH>
                        <TH right>Used hrs</TH>
                        <TH right>Available</TH>
                        <TH right>Billable</TH>
                        <TH right>Internal / BD</TH>
                        <TH>Suggested action</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {riskMembers.map((m,i)=>{
                        const avail  = m.effCap - m.utilized;
                        const action =
                          m.risk==='Burnout Risk'
                            ? `Offload ~${Math.abs(avail).toFixed(0)}h — reassign to underutilised members`
                            : m.risk==='Underutilized'
                              ? `~${Math.max(0,m.effCap*0.60-m.utilized).toFixed(0)}h capacity available`
                              : 'On track — no action needed';
                        return (
                          <tr key={i}
                            className={`border-t border-gray-100 transition-colors
                              ${i%2===1?'bg-gray-50/50':''}
                              ${m.risk!=='Healthy'?RISK[m.risk].rowBg:''}
                              hover:bg-blue-50`}>
                            <td className="px-5 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{m.name}</td>
                            <td className="px-4 py-3"><RiskBadge level={m.risk}/></td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-sm font-bold tabular-nums ${RISK[m.risk].label}`}>
                                {m.util.toFixed(0)}%
                              </span>
                            </td>
                            <TD right>{(m.billable+m.internal).toFixed(1)}</TD>
                            <td className={`px-4 py-3 text-right text-sm font-semibold tabular-nums
                              ${avail<0?'text-red-600':avail<8?'text-amber-600':'text-gray-700'}`}>
                              {avail.toFixed(1)}
                            </td>
                            <TD right muted>{m.billable.toFixed(1)}</TD>
                            <TD right muted>{m.internal.toFixed(1)}</TD>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                {m.risk!=='Healthy' && <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0"/>}
                                {action}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ──────────────────────────────────────
            CAPACITY TAB
        ────────────────────────────────────── */}
        {tab==='capacity' && (
          <div className="space-y-4">
            {/* Summary tiles */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon:<UserCheck className="w-5 h-5"/>, label:'Available', sub:'10+ hours remaining',
                  count:Object.values(members).filter(m=>m.avail>=10).length,
                  cls:'border-emerald-200 bg-emerald-50 text-emerald-600' },
                { icon:<Target className="w-5 h-5"/>,    label:'Near Capacity', sub:'Under 10 hours left',
                  count:Object.values(members).filter(m=>m.avail>=0&&m.avail<10).length,
                  cls:'border-amber-200 bg-amber-50 text-amber-600' },
                { icon:<AlertTriangle className="w-5 h-5"/>, label:'Overallocated', sub:'Exceeded weekly target',
                  count:Object.values(members).filter(m=>m.avail<0).length,
                  cls:'border-red-200 bg-red-50 text-red-600' },
              ].map((c,i)=>(
                <div key={i} className={`border rounded-xl p-5 flex items-center gap-4 ${c.cls}`}>
                  {c.icon}
                  <div>
                    <p className="text-2xl font-bold">{c.count}</p>
                    <p className="text-sm font-semibold mt-0.5">{c.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <TH>Team Member</TH>
                      <TH right>Weekly Target</TH>
                      <TH right>OOO</TH>
                      <TH right>Effective Cap.</TH>
                      <TH right>Utilized</TH>
                      <TH right>Available</TH>
                      <TH right>Util %</TH>
                      <TH>Status</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(members)
                      .sort((a,b)=>a.avail-b.avail)
                      .map((m,i)=>(
                        <tr key={i} className={`border-t border-gray-100 hover:bg-blue-50 transition-colors ${i%2===1?'bg-gray-50/50':''}`}>
                          <td className="px-5 py-3 text-sm font-medium text-gray-900">{m.name}</td>
                          <TD right muted>40.0</TD>
                          <TD right muted>{m.ooo.toFixed(1)}</TD>
                          <TD right>{m.effCap.toFixed(1)}</TD>
                          <TD right>{m.utilized.toFixed(1)}</TD>
                          <td className={`px-4 py-3 text-right text-sm font-semibold tabular-nums
                            ${m.avail<0?'text-red-600':m.avail<8?'text-amber-600':'text-gray-700'}`}>
                            {m.avail.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-bold tabular-nums ${RISK[m.risk].label}`}>
                              {m.util.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                              ${m.avail<0?'bg-red-100 text-red-700':m.avail<8?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>
                              {m.avail<0?'Overallocated':m.avail<8?'Near Capacity':'Available'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────
            EXCEPTIONS TAB
        ────────────────────────────────────── */}
        {tab==='exceptions' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TH>Issue</TH>
                    <TH>Team Member</TH>
                    <TH>Details</TH>
                    <TH>Action</TH>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(members).filter(m=>m.avail<0).map((m,i)=>(
                    <tr key={`o${i}`} className="border-t border-gray-100 bg-red-50 hover:bg-red-100 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Overallocated</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {Math.abs(m.avail).toFixed(1)}h over capacity · {m.util.toFixed(0)}% utilised
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-700">Rebalance work</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.total>0&&m.total<20).map((m,i)=>(
                    <tr key={`l${i}`} className="border-t border-gray-100 bg-amber-50 hover:bg-amber-100 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Low Hours</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        Only {m.total.toFixed(1)}h logged this period
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-amber-700">Review entry</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.avail<0||m.total<20).length===0 && (
                    <tr>
                      <td colSpan={4} className="py-14 text-center text-sm text-gray-400">
                        No exceptions this period 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
