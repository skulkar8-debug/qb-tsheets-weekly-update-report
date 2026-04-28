import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Users, DollarSign, Activity, Clock,
  Filter, Search, RefreshCw, AlertCircle,
  ChevronDown, ChevronRight, AlertTriangle, UserCheck, Target, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv';

const CDS_TEAM = new Set([
  'Mohit Sharma','Rakesh Nayak','Sharvan Pandey',
  'Stefan Joseph','Jogendra Singh','Ramya D','Vaishnav Govind',
]);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const normalizeClient = (j) => {
  if (!j) return 'Other';
  if (/^holiday$|^vacation$|^sick$/i.test(j.trim())) return 'OOO';
  if (/^administrative$/i.test(j.trim())) return 'Administrative';
  if (/^business development/i.test(j)) return 'Business Development';
  if (/^cds\b/i.test(j) || /tableau/i.test(j)) return 'CDS Internal';
  if (/^AEG[\s\-–]/i.test(j) || /^AEG$/i.test(j))    return 'AEG';
  if (/^SALT[\s\-–]/i.test(j)|| /^SALT$/i.test(j))   return 'SALT';
  if (/^ADP[\s\-–]/i.test(j) || /^ADP$/i.test(j))    return 'ADP';
  if (/^SP\s*USA[\s\-–]/i.test(j)||/^SPUSA[\s\-–]/i.test(j)||/^SP\s*USA$/i.test(j)) return 'SP USA';
  if (/^CPC[\s\-–]/i.test(j) || /^CPC$/i.test(j))    return 'CPC';
  if (/^RIATA[\s\-–]/i.test(j)||/^RIATA$/i.test(j))  return 'Riata';
  if (/^BEACON/i.test(j))  return 'Beacon';
  if (/^ARCHWAY/i.test(j)) return 'Archway';
  if (/^BUDGET/i.test(j))  return 'Budget';
  const m = j.match(/^(.+?)\s*[-–]\s*/);
  if (m) return m[1].trim();
  return j.trim();
};

const catOf = (j) => {
  if (!j) return 'Billable';
  if (/^holiday$|^vacation$|^sick$/i.test(j.trim())) return 'OOO';
  if (/^administrative$/i.test(j.trim())||/^business development/i.test(j)||/^cds\b/i.test(j)||/tableau/i.test(j)) return 'Internal/BD';
  return 'Billable';
};

const parseCSV = (text) => {
  const clean = text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const lines = clean.split('\n').filter(l=>l.trim());
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const r=[]; let cur='',inQ=false;
    for (let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}
      else if(ch===','&&!inQ){r.push(cur.trim());cur='';}
      else cur+=ch;
    }
    r.push(cur.trim()); return r;
  };
  const hdrs = parseLine(lines[0]).map(h=>h.toLowerCase().replace(/\s+/g,'_'));
  return lines.slice(1).map(line=>{
    const v=parseLine(line); const row={};
    hdrs.forEach((h,i)=>{ row[h]=v[i]??''; });
    return row;
  }).filter(r=>r.fname||r.lname||r.username);
};

const detectWeeks = (rows) => {
  const m={};
  rows.forEach(r=>{
    const d=new Date(r.local_date); if(isNaN(d)) return;
    const day=d.getDay(); const diff=day===0?-6:1-day;
    const mon=new Date(d); mon.setDate(d.getDate()+diff);
    const sun=new Date(mon); sun.setDate(mon.getDate()+6);
    const fmt=dt=>dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const key=mon.toISOString().slice(0,10);
    if(!m[key]) m[key]={key,label:`${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`};
  });
  return Object.values(m).sort((a,b)=>b.key.localeCompare(a.key));
};

const pct = (n,d) => d>0?Math.round((n/d)*100):0;

const riskLevel = (util) =>
  util >= 95 ? 'Burnout Risk' : util < 60 ? 'Underutilized' : 'Healthy';

const riskColors = {
  'Burnout Risk':  { bg:'bg-red-50',   text:'text-red-700',   badge:'bg-red-100 text-red-700',   bar:'#EF4444' },
  'Underutilized': { bg:'bg-blue-50',  text:'text-blue-700',  badge:'bg-blue-100 text-blue-700',  bar:'#3B82F6' },
  'Healthy':       { bg:'bg-green-50', text:'text-green-700', badge:'bg-green-100 text-green-700',bar:'#10B981' },
};

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function StocStaffingDashboard() {
  const [allRows,    setAllRows]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastUpdated,setLastUpdated]= useState(null);

  const [tab,        setTab]        = useState('projects');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selWeeks,   setSelWeeks]   = useState([]);
  const [weekDD,     setWeekDD]     = useState(false);

  // Projects tab
  const [projSearch, setProjSearch] = useState('');
  const [projFilter, setProjFilter] = useState('all');
  const [sortProjBy, setSortProjBy] = useState({ k:'hours', d:'desc' });
  const [collapsedClients, setCollapsedClients] = useState({});

  // Teams tab
  const [teamSearch, setTeamSearch] = useState('');
  const [sortTeamBy, setSortTeamBy] = useState({ k:'utilized', d:'desc' });
  const [expandedMember, setExpandedMember] = useState(null);

  // Risk
  const [riskFilter, setRiskFilter] = useState('all');

  // ── FETCH ──
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(SHEET_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      if (!rows.length) throw new Error('No data rows. Check sheet is public and has correct columns.');
      setAllRows(rows);
      setLastUpdated(new Date());
      const w = detectWeeks(rows);
      if (w.length) setSelWeeks([w[0].key]);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  useEffect(()=>{
    const h=e=>{ if(!e.target.closest('.week-dd')) setWeekDD(false); };
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[]);

  const weeks = useMemo(()=>detectWeeks(allRows),[allRows]);

  const filteredRows = useMemo(()=>{
    if(!selWeeks.length) return allRows;
    return allRows.filter(r=>{
      const d=new Date(r.local_date); if(isNaN(d)) return false;
      const day=d.getDay(); const diff=day===0?-6:1-day;
      const mon=new Date(d); mon.setDate(d.getDate()+diff);
      return selWeeks.includes(mon.toISOString().slice(0,10));
    });
  },[allRows,selWeeks]);

  // ── PROCESS ──
  const { members, projectsMap } = useMemo(()=>{
    const tm={}, pm={};
    const nW = Math.max(selWeeks.length,1);

    filteredRows.forEach(r=>{
      const name=`${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs=parseFloat(r.hours)||0;
      const jc=(r.jobcode||'').trim();
      if(!name||!hrs||!jc) return;

      const cat=catOf(jc), client=normalizeClient(jc), isCDS=CDS_TEAM.has(name);
      if(teamFilter==='cds'&&!isCDS) return;
      if(teamFilter==='tas'&& isCDS) return;

      if(!tm[name]) tm[name]={name,isCDS,total:0,billable:0,ooo:0,internal:0,utilized:0,jobs:{},entries:[]};
      tm[name].total+=hrs; tm[name].entries.push({jc,hrs,cat,client});
      if(cat==='OOO')         { tm[name].ooo+=hrs; }
      else if(cat==='Internal/BD') { tm[name].internal+=hrs; tm[name].utilized+=hrs; }
      else                    { tm[name].billable+=hrs;  tm[name].utilized+=hrs; }
      tm[name].jobs[jc]=(tm[name].jobs[jc]||0)+hrs;

      // OOO entries (Holiday, Vacation, Sick) are NOT projects — never show in Projects tab
      if(cat==='OOO') return;
      if(!pm[jc]) pm[jc]={name:jc,cat,client,hrs:0,mems:{}};
      pm[jc].hrs+=hrs; pm[jc].mems[name]=(pm[jc].mems[name]||0)+hrs;
    });

    Object.values(tm).forEach(m=>{
      m.effCap = 40*nW - m.ooo;
      m.avail  = m.effCap - m.utilized;
      m.util   = m.effCap>0 ? (m.utilized/m.effCap)*100 : 0;
      m.risk   = riskLevel(m.util);
    });
    return { members:tm, projectsMap:pm };
  },[filteredRows,teamFilter,selWeeks]);

  // ── STATS ──
  const stats = useMemo(()=>{
    const ms=Object.values(members);
    const tB=ms.reduce((s,m)=>s+m.billable,0);
    const tI=ms.reduce((s,m)=>s+m.internal,0);
    const tO=ms.reduce((s,m)=>s+m.ooo,0);
    const tU=ms.reduce((s,m)=>s+m.utilized,0);
    const tA=ms.reduce((s,m)=>s+m.avail,0);
    const tC=ms.reduce((s,m)=>s+m.effCap,0);
    return {n:ms.length,tB,tI,tO,tU,tA,tC,avgUtil:tC>0?(tU/tC)*100:0};
  },[members]);

  // ── PROJECTS grouped by client ──
  const clientGroups = useMemo(()=>{
    const g={};
    Object.values(projectsMap).forEach(p=>{
      if(projFilter==='billable'    && p.cat!=='Billable')    return;
      if(projFilter==='internal-bd' && p.cat!=='Internal/BD') return;
      if(projSearch && !p.name.toLowerCase().includes(projSearch.toLowerCase()) &&
         !p.client.toLowerCase().includes(projSearch.toLowerCase())) return;
      if(!g[p.client]) g[p.client]={client:p.client,total:0,projs:[]};
      g[p.client].projs.push(p); g[p.client].total+=p.hrs;
    });
    // sort projects within each client
    Object.values(g).forEach(cg=>{
      cg.projs.sort((a,b)=>
        sortProjBy.k==='hours' ? (sortProjBy.d==='desc'?b.hrs-a.hrs:a.hrs-b.hrs)
                                : (sortProjBy.d==='desc'?b.name.localeCompare(a.name):a.name.localeCompare(b.name))
      );
    });
    return Object.values(g).sort((a,b)=>b.total-a.total);
  },[projectsMap,projFilter,projSearch,sortProjBy]);

  const totalBillableHrs = useMemo(()=>
    Object.values(projectsMap).filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0)
  ,[projectsMap]);

  // ── SORTED MEMBERS ──
  const sortedMembers = useMemo(()=>{
    let ms=Object.values(members);
    if(teamSearch.trim()) ms=ms.filter(m=>m.name.toLowerCase().includes(teamSearch.toLowerCase()));
    return ms.sort((a,b)=>{
      const av=a[sortTeamBy.k]??a.util, bv=b[sortTeamBy.k]??b.util;
      return sortTeamBy.d==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  },[members,teamSearch,sortTeamBy]);

  // ── RISK DATA ──
  const riskMembers = useMemo(()=>{
    let ms=Object.values(members).filter(m=>m.utilized>0);
    if(riskFilter!=='all') ms=ms.filter(m=>m.risk===riskFilter);
    return ms.sort((a,b)=>b.util-a.util);
  },[members,riskFilter]);

  // ── SORT HELPERS ──
  const toggleProjSort = (k) => setSortProjBy(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const toggleTeamSort = (k) => setSortTeamBy(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const arrow = (cfg,k) => cfg.k===k?(cfg.d==='desc'?' ▼':' ▲'):'';

  const weekLabel = () => {
    if(!selWeeks.length||selWeeks.length===weeks.length) return 'All Weeks';
    if(selWeeks.length===1) return weeks.find(w=>w.key===selWeeks[0])?.label||'1 week';
    return `${selWeeks.length} weeks`;
  };
  const toggleWeek = k => setSelWeeks(p=>
    p.includes(k)?(p.length===1?p:p.filter(x=>x!==k)):[...p,k]
  );

  // ─────────────────── LOADING / ERROR ───────────────────
  if(loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin"/>
        <p className="text-gray-600 font-medium">Loading from Google Sheets…</p>
      </div>
    </div>
  );
  if(error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow max-w-md text-center border border-red-200">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3"/>
        <p className="font-semibold text-gray-800 mb-2">Failed to load</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button onClick={load} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Retry</button>
      </div>
    </div>
  );

  // ─────────────────── RENDER ───────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-lg font-bold text-gray-900">STOC Staffing</span>
            {lastUpdated && <span className="ml-2 text-xs text-gray-400">· Data as of {lastUpdated.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} {lastUpdated.toLocaleTimeString()}</span>}
          </div>
          {/* NAV TABS */}
          <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden text-sm">
            {[['projects','Projects'],['teams','Teams'],['overview','Risk'],['capacity','Capacity'],['exceptions','Exceptions']].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                className={`px-4 py-1.5 font-medium transition-colors ${tab===id?'bg-blue-600 text-white':'text-gray-600 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Team filter */}
          <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none">
            <option value="all">All Teams</option>
            <option value="tas">TAS</option>
            <option value="cds">CDS</option>
          </select>
          {/* Week picker */}
          <div className="relative week-dd">
            <button onClick={()=>setWeekDD(v=>!v)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white flex items-center gap-1.5 hover:bg-gray-50">
              <Calendar className="w-3.5 h-3.5 text-gray-400"/>{weekLabel()}
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${weekDD?'rotate-180':''}`}/>
            </button>
            {weekDD && (
              <div className="absolute right-0 mt-1 w-68 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[260px]">
                <div className="p-2 max-h-60 overflow-y-auto">
                  {weeks.map(w=>(
                    <label key={w.key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={selWeeks.includes(w.key)} onChange={()=>toggleWeek(w.key)} className="w-3.5 h-3.5 text-blue-600 rounded"/>
                      <span className="text-sm text-gray-700">{w.label}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t p-2 flex gap-2">
                  <button onClick={()=>setSelWeeks(weeks.map(w=>w.key))} className="flex-1 text-xs py-1 text-blue-600 hover:bg-blue-50 rounded">All</button>
                  <button onClick={()=>setSelWeeks(weeks.length?[weeks[0].key]:[])} className="flex-1 text-xs py-1 text-gray-500 hover:bg-gray-50 rounded">Latest</button>
                </div>
              </div>
            )}
          </div>
          <button onClick={load} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white flex items-center gap-1.5 hover:bg-gray-50">
            <RefreshCw className="w-3.5 h-3.5 text-gray-400"/> Refresh
          </button>
        </div>
      </div>

      {/* ── STAT STRIP ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex gap-8">
        {[
          {label:'Members',   val:stats.n,                  color:'text-gray-900'},
          {label:'Billable',  val:`${stats.tB.toFixed(0)}h`,color:'text-emerald-700'},
          {label:'Internal',  val:`${stats.tI.toFixed(0)}h`,color:'text-violet-700'},
          {label:'OOO',       val:`${stats.tO.toFixed(0)}h`,color:'text-gray-500'},
          {label:'Avg Util',  val:`${stats.avgUtil.toFixed(0)}%`, color: stats.avgUtil>=95?'text-red-600':stats.avgUtil<60?'text-blue-600':'text-emerald-700'},
          {label:'Bandwidth', val:`${stats.tA.toFixed(0)}h`,color:stats.tA<0?'text-red-600':'text-gray-900'},
        ].map((s,i)=>(
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{s.label}</span>
            <span className={`text-sm font-bold ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      <div className="px-6 py-4">

        {/* ════════════════════════════════════════
            PROJECTS TAB  — dense spreadsheet view
            ════════════════════════════════════════ */}
        {tab==='projects' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
                <input value={projSearch} onChange={e=>setProjSearch(e.target.value)}
                  placeholder="Filter projects or clients…"
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"/>
                {projSearch && <button onClick={()=>setProjSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
              </div>
              <select value={projFilter} onChange={e=>setProjFilter(e.target.value)}
                className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white focus:outline-none">
                <option value="all">All Categories</option>
                <option value="billable">Billable</option>
                <option value="internal-bd">Internal / BD</option>
              </select>
              <span className="text-xs text-gray-400 ml-auto">
                {clientGroups.length} clients · {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects
              </span>
            </div>

            {/* TABLE HEADER */}
            <div className="grid text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200 px-4 py-2"
              style={{gridTemplateColumns:'1fr 80px 80px 90px 220px 80px'}}>
              <button className="text-left hover:text-gray-800" onClick={()=>toggleProjSort('name')}>Project{arrow(sortProjBy,'name')}</button>
              <button className="text-right hover:text-gray-800" onClick={()=>toggleProjSort('hours')}>Hours{arrow(sortProjBy,'hours')}</button>
              <div className="text-right">% Billable</div>
              <div className="text-left pl-3">Category</div>
              <div className="text-left">Members</div>
              <div className="text-right">People</div>
            </div>

            {/* ROWS */}
            <div className="divide-y divide-gray-100">
              {clientGroups.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No projects match</div>
              )}
              {clientGroups.map((cg,ci)=>{
                const collapsed = collapsedClients[cg.client];
                return (
                  <React.Fragment key={ci}>
                    {/* CLIENT GROUP ROW */}
                    <div
                      className="grid items-center px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 select-none"
                      style={{gridTemplateColumns:'1fr 80px 80px 90px 220px 80px'}}
                      onClick={()=>setCollapsedClients(p=>({...p,[cg.client]:!p[cg.client]}))}>
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-sm">
                        {collapsed
                          ? <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
                          : <ChevronDown  className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>}
                        {cg.client}
                        <span className="text-xs font-normal text-gray-400 ml-1">({cg.projs.length})</span>
                      </div>
                      <div className="text-right font-semibold text-gray-800 text-sm">{cg.total.toFixed(1)}</div>
                      <div className="text-right text-gray-500 text-xs">
                        {cg.projs[0]?.cat==='Billable' ? `${pct(cg.total,totalBillableHrs)}%` : '—'}
                      </div>
                      <div/>
                      <div/>
                      <div className="text-right text-xs text-gray-400">
                        {[...new Set(cg.projs.flatMap(p=>Object.keys(p.mems)))].length}
                      </div>
                    </div>

                    {/* PROJECT ROWS */}
                    {!collapsed && cg.projs.map((p,pi)=>{
                      const memEntries = Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                      const catStyle =
                        p.cat==='Billable'    ? 'bg-emerald-50 text-emerald-700' :
                        p.cat==='Internal/BD' ? 'bg-violet-50 text-violet-700'  :
                                                'bg-gray-100 text-gray-500';
                      return (
                        <div key={pi}
                          className="grid items-center px-4 py-2 hover:bg-blue-50 transition-colors"
                          style={{gridTemplateColumns:'1fr 80px 80px 90px 220px 80px'}}>
                          {/* project name — indented */}
                          <div className="pl-5 text-sm text-gray-800 truncate pr-4" title={p.name}>{p.name}</div>
                          {/* hours */}
                          <div className="text-right text-sm text-gray-800 font-medium">{p.hrs.toFixed(1)}</div>
                          {/* % billable */}
                          <div className="text-right text-sm text-gray-500">
                            {p.cat==='Billable' ? `${pct(p.hrs,totalBillableHrs)}%` : '—'}
                          </div>
                          {/* category */}
                          <div className="pl-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catStyle}`}>{p.cat}</span>
                          </div>
                          {/* members inline */}
                          <div className="flex flex-wrap gap-1">
                            {memEntries.map(([n,h],mi)=>(
                              <span key={mi} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded px-1.5 py-0.5 whitespace-nowrap">
                                <span className="font-medium">{n.split(' ')[0]}</span>
                                <span className="text-gray-400">{h.toFixed(0)}h</span>
                              </span>
                            ))}
                          </div>
                          {/* people count */}
                          <div className="text-right text-sm text-gray-500">{memEntries.length}</div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TEAMS TAB — dense table
            ════════════════════════════════════════ */}
        {tab==='teams' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
                <input value={teamSearch} onChange={e=>setTeamSearch(e.target.value)}
                  placeholder="Search members…"
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"/>
              </div>
              <span className="text-xs text-gray-400 ml-auto">{sortedMembers.length} members</span>
            </div>

            <div className="grid text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200 px-4 py-2"
              style={{gridTemplateColumns:'180px 60px 80px 80px 70px 80px 80px 80px 1fr'}}>
              <button className="text-left hover:text-gray-800" onClick={()=>toggleTeamSort('name')}>Name{arrow(sortTeamBy,'name')}</button>
              <div>Team</div>
              <button className="text-right hover:text-gray-800" onClick={()=>toggleTeamSort('billable')}>Billable{arrow(sortTeamBy,'billable')}</button>
              <button className="text-right hover:text-gray-800" onClick={()=>toggleTeamSort('internal')}>Int/BD{arrow(sortTeamBy,'internal')}</button>
              <button className="text-right hover:text-gray-800" onClick={()=>toggleTeamSort('ooo')}>OOO{arrow(sortTeamBy,'ooo')}</button>
              <button className="text-right hover:text-gray-800" onClick={()=>toggleTeamSort('utilized')}>Utilized{arrow(sortTeamBy,'utilized')}</button>
              <button className="text-right hover:text-gray-800" onClick={()=>toggleTeamSort('avail')}>Available{arrow(sortTeamBy,'avail')}</button>
              <button className="text-right hover:text-gray-800" onClick={()=>toggleTeamSort('util')}>Util %{arrow(sortTeamBy,'util')}</button>
              <div className="pl-3">Util Bar</div>
            </div>

            <div className="divide-y divide-gray-100">
              {sortedMembers.map((m,i)=>{
                const rc = riskColors[m.risk];
                const isOpen = expandedMember===m.name;
                const projs = Object.entries(m.jobs)
                  .filter(([jc])=>catOf(jc)!=='OOO')
                  .sort(([,a],[,b])=>b-a);
                return (
                  <React.Fragment key={i}>
                    <div
                      className={`grid items-center px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${isOpen?'bg-blue-50':''}`}
                      style={{gridTemplateColumns:'180px 60px 80px 80px 70px 80px 80px 80px 1fr'}}
                      onClick={()=>setExpandedMember(isOpen?null:m.name)}>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                        {isOpen?<ChevronDown className="w-3.5 h-3.5 text-gray-400"/>:<ChevronRight className="w-3.5 h-3.5 text-gray-400"/>}
                        {m.name}
                      </div>
                      <div><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${m.isCDS?'bg-purple-50 text-purple-700':'bg-blue-50 text-blue-700'}`}>{m.isCDS?'CDS':'TAS'}</span></div>
                      <div className="text-right text-sm text-gray-700">{m.billable.toFixed(1)}</div>
                      <div className="text-right text-sm text-gray-700">{m.internal.toFixed(1)}</div>
                      <div className="text-right text-sm text-gray-500">{m.ooo.toFixed(1)}</div>
                      <div className="text-right text-sm font-medium text-gray-900">{m.utilized.toFixed(1)}</div>
                      <div className={`text-right text-sm font-medium ${m.avail<0?'text-red-600':m.avail<8?'text-amber-600':'text-gray-700'}`}>{m.avail.toFixed(1)}</div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${rc.badge}`}>{m.util.toFixed(0)}%</span>
                      </div>
                      {/* mini bar */}
                      <div className="pl-3 flex items-center gap-1.5">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-2 rounded-full transition-all"
                            style={{width:`${Math.min(m.util,120)}%`,background:rc.bar,maxWidth:'100%'}}/>
                        </div>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                        <div className="ml-8 grid gap-0.5">
                          <div className="grid text-xs font-semibold text-gray-400 uppercase pb-1 mb-1 border-b border-gray-200"
                            style={{gridTemplateColumns:'1fr 80px 80px'}}>
                            <div>Project</div><div className="text-right">Hours</div><div className="text-right">% Util</div>
                          </div>
                          {projs.map(([jc,hrs],j)=>(
                            <div key={j} className="grid text-sm py-0.5" style={{gridTemplateColumns:'1fr 80px 80px'}}>
                              <div className="text-gray-700 truncate pr-4">{jc}</div>
                              <div className="text-right text-gray-900 font-medium">{hrs.toFixed(1)}</div>
                              <div className="text-right text-gray-400">{m.utilized>0?pct(hrs,m.utilized):0}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {/* totals */}
              <div className="grid items-center px-4 py-2 bg-gray-50 border-t-2 border-gray-300 font-semibold text-sm"
                style={{gridTemplateColumns:'180px 60px 80px 80px 70px 80px 80px 80px 1fr'}}>
                <div className="text-gray-700 pl-5">Total</div>
                <div/>
                <div className="text-right text-gray-900">{stats.tB.toFixed(1)}</div>
                <div className="text-right text-gray-900">{stats.tI.toFixed(1)}</div>
                <div className="text-right text-gray-500">{stats.tO.toFixed(1)}</div>
                <div className="text-right text-gray-900">{stats.tU.toFixed(1)}</div>
                <div className="text-right text-gray-900">{stats.tA.toFixed(1)}</div>
                <div className="text-right text-gray-900">{stats.avgUtil.toFixed(0)}%</div>
                <div/>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            RISK TAB — actionable, not decorative
            ════════════════════════════════════════ */}
        {tab==='overview' && (()=>{
          const burnout = Object.values(members).filter(m=>m.risk==='Burnout Risk');
          const under   = Object.values(members).filter(m=>m.risk==='Underutilized');
          const canAbsorb = under.reduce((s,m)=>s+(60-m.util)/100*m.effCap,0);
          return (
            <div className="space-y-4">
              {/* ACTION SUMMARY BANNER */}
              {(burnout.length>0||under.length>0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"/>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-amber-900 mb-1">Action needed this week</p>
                    <div className="flex flex-wrap gap-4 text-amber-800">
                      {burnout.length>0 && (
                        <span>
                          <strong>{burnout.length}</strong> {burnout.length===1?'person is':'people are'} at burnout risk
                          {burnout.length>0 && ` — ${burnout.map(m=>m.name.split(' ')[0]).join(', ')}`}
                        </span>
                      )}
                      {under.length>0 && (
                        <span>
                          <strong>{under.length}</strong> underutilized with ~<strong>{canAbsorb.toFixed(0)}h</strong> capacity available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* UTILIZATION BAR CHART */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">Team Utilization</h2>
                  <select value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}
                    className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none">
                    <option value="all">All</option>
                    <option value="Burnout Risk">Burnout Risk</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Underutilized">Underutilized</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(riskMembers.length*32,120)}>
                  <BarChart data={riskMembers.map(m=>({name:m.name.split(' ')[0]+' '+m.name.split(' ')[1]?.[0]+'.', util:parseFloat(m.util.toFixed(1)), risk:m.risk}))}
                    layout="vertical" margin={{top:0,right:60,left:90,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6"/>
                    <XAxis type="number" domain={[0,120]} unit="%" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:12,fill:'#374151'}} tickLine={false} axisLine={false} width={86}/>
                    <Tooltip formatter={(v)=>[`${v}%`,'Utilization']} contentStyle={{fontSize:12,borderRadius:6}}/>
                    <ReferenceLine x={60}  stroke="#93C5FD" strokeDasharray="4 4" label={{value:'60%', position:'top', fontSize:10, fill:'#93C5FD'}}/>
                    <ReferenceLine x={95}  stroke="#FCA5A5" strokeDasharray="4 4" label={{value:'95%', position:'top', fontSize:10, fill:'#FCA5A5'}}/>
                    <Bar dataKey="util" radius={[0,3,3,0]} maxBarSize={22}>
                      {riskMembers.map((m,i)=>(
                        <Cell key={i} fill={riskColors[m.risk].bar} fillOpacity={0.85}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ACTIONABLE TABLE */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="grid text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200 px-4 py-2"
                  style={{gridTemplateColumns:'160px 110px 70px 70px 70px 70px 70px 1fr'}}>
                  <div>Name</div>
                  <div>Status</div>
                  <div className="text-right">Util %</div>
                  <div className="text-right">Used</div>
                  <div className="text-right">Avail</div>
                  <div className="text-right">Billable</div>
                  <div className="text-right">Int/BD</div>
                  <div className="pl-3">Suggested Action</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {riskMembers.map((m,i)=>{
                    const rc = riskColors[m.risk];
                    const nW = Math.max(selWeeks.length,1);
                    const avail = m.effCap - m.utilized;
                    const action =
                      m.risk==='Burnout Risk'
                        ? `Offload ~${Math.abs(avail).toFixed(0)}h — check projects tab for redistribution`
                        : m.risk==='Underutilized'
                          ? `${Math.max(0,Math.round(m.effCap*0.60-m.utilized)).toFixed(0)}h+ capacity to absorb new work`
                          : 'No action needed';
                    return (
                      <div key={i} className={`grid items-center px-4 py-2.5 hover:bg-gray-50 ${rc.bg}`}
                        style={{gridTemplateColumns:'160px 110px 70px 70px 70px 70px 70px 1fr'}}>
                        <div className="text-sm font-medium text-gray-900">{m.name}</div>
                        <div><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.badge}`}>{m.risk}</span></div>
                        <div className="text-right text-sm font-bold text-gray-900">{m.util.toFixed(0)}%</div>
                        <div className="text-right text-sm text-gray-700">{(m.billable+m.internal).toFixed(1)}</div>
                        <div className={`text-right text-sm font-medium ${avail<0?'text-red-600':avail<8?'text-amber-600':'text-gray-700'}`}>{avail.toFixed(1)}</div>
                        <div className="text-right text-sm text-gray-600">{m.billable.toFixed(1)}</div>
                        <div className="text-right text-sm text-gray-600">{m.internal.toFixed(1)}</div>
                        <div className="pl-3 text-xs text-gray-600 flex items-center gap-1">
                          {m.risk!=='Healthy' && <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0"/>}
                          {action}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ════════════════════════════════════════
            CAPACITY TAB
            ════════════════════════════════════════ */}
        {tab==='capacity' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                {icon:<UserCheck className="w-5 h-5 text-green-600"/>,label:'Available (≥10h)',count:Object.values(members).filter(m=>m.avail>=10).length,cls:'border-green-200 bg-green-50',t:'text-green-800'},
                {icon:<Target className="w-5 h-5 text-amber-600"/>,label:'Near Capacity (0–10h)',count:Object.values(members).filter(m=>m.avail>=0&&m.avail<10).length,cls:'border-amber-200 bg-amber-50',t:'text-amber-800'},
                {icon:<AlertTriangle className="w-5 h-5 text-red-600"/>,label:'Overallocated',count:Object.values(members).filter(m=>m.avail<0).length,cls:'border-red-200 bg-red-50',t:'text-red-800'},
              ].map((c,i)=>(
                <div key={i} className={`border rounded-lg p-4 ${c.cls} flex items-center gap-3`}>
                  {c.icon}
                  <div><p className={`text-2xl font-bold ${c.t}`}>{c.count}</p><p className="text-xs text-gray-600">{c.label}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200 px-4 py-2"
                style={{gridTemplateColumns:'180px 70px 70px 80px 80px 80px 100px'}}>
                <div>Name</div>
                <div className="text-right">Target</div>
                <div className="text-right">OOO</div>
                <div className="text-right">Eff. Cap</div>
                <div className="text-right">Utilized</div>
                <div className="text-right">Available</div>
                <div className="text-right">Status</div>
              </div>
              <div className="divide-y divide-gray-100">
                {Object.values(members).sort((a,b)=>a.avail-b.avail).map((m,i)=>(
                  <div key={i} className="grid items-center px-4 py-2 hover:bg-gray-50 text-sm"
                    style={{gridTemplateColumns:'180px 70px 70px 80px 80px 80px 100px'}}>
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-right text-gray-400">40.0</div>
                    <div className="text-right text-gray-600">{m.ooo.toFixed(1)}</div>
                    <div className="text-right text-gray-800 font-medium">{m.effCap.toFixed(1)}</div>
                    <div className="text-right text-gray-700">{m.utilized.toFixed(1)}</div>
                    <div className={`text-right font-semibold ${m.avail<0?'text-red-600':m.avail<8?'text-amber-600':'text-gray-800'}`}>{m.avail.toFixed(1)}</div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.avail<0?'bg-red-100 text-red-700':m.avail<8?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}`}>
                        {m.avail<0?'Overallocated':m.avail<8?'Near Capacity':'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            EXCEPTIONS TAB
            ════════════════════════════════════════ */}
        {tab==='exceptions' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200 px-4 py-2"
              style={{gridTemplateColumns:'120px 160px 1fr 120px'}}>
              <div>Issue</div><div>Name</div><div>Details</div><div className="text-center">Action</div>
            </div>
            <div className="divide-y divide-gray-100">
              {Object.values(members).filter(m=>m.avail<0).map((m,i)=>(
                <div key={`o${i}`} className="grid items-center px-4 py-2.5 text-sm bg-red-50" style={{gridTemplateColumns:'120px 160px 1fr 120px'}}>
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium w-fit">Overallocated</span>
                  <div className="font-medium text-gray-900">{m.name}</div>
                  <div className="text-gray-600">{Math.abs(m.avail).toFixed(1)}h over capacity · {m.util.toFixed(0)}% utilized</div>
                  <div className="text-center text-red-600 font-medium text-xs">Rebalance work</div>
                </div>
              ))}
              {Object.values(members).filter(m=>m.total>0&&m.total<20).map((m,i)=>(
                <div key={`l${i}`} className="grid items-center px-4 py-2.5 text-sm bg-amber-50" style={{gridTemplateColumns:'120px 160px 1fr 120px'}}>
                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium w-fit">Low Hours</span>
                  <div className="font-medium text-gray-900">{m.name}</div>
                  <div className="text-gray-600">Only {m.total.toFixed(1)}h logged this period</div>
                  <div className="text-center text-amber-600 font-medium text-xs">Review entry</div>
                </div>
              ))}
              {Object.values(members).filter(m=>m.avail<0||m.total<20).length===0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No exceptions this period 🎉</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
