import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, Target, UserCheck, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { ScatterChart, Scatter, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, LabelList } from 'recharts';

// ============================================================================
// GOOGLE SHEETS CONFIG
// Real column names from sheet:
//   username | payroll_id | fname | lname | number | group |
//   local_date | local_day | local_start_time | local_end_time | tz | hours | jobcode | location
// ============================================================================
const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv';

// ============================================================================
// CDS TEAM MEMBERS
// ============================================================================
const CDS_TEAM_MEMBERS = new Set([
  'Mohit Sharma', 'Rakesh Nayak', 'Sharvan Pandey',
  'Stefan Joseph', 'Jogendra Singh', 'Ramya D', 'Vaishnav Govind',
]);

// ============================================================================
// CLIENT GROUPING
// Normalize messy jobcode prefixes into canonical client names
// ============================================================================
const normalizeClient = (jobcode) => {
  if (!jobcode) return 'Other';
  const j = jobcode.trim();

  if (/^holiday$/i.test(j) || /^vacation$/i.test(j) || /^sick$/i.test(j)) return 'OOO';
  if (/^administrative$/i.test(j)) return 'Administrative';
  if (/^business development/i.test(j)) return 'Business Development';
  if (/^cds\b/i.test(j) || /tableau/i.test(j)) return 'CDS Internal';

  // Billable client prefixes
  if (/^AEG[\s\-–]/i.test(j) || /^AEG$/i.test(j))                        return 'AEG';
  if (/^SALT[\s\-–]/i.test(j) || /^SALT$/i.test(j))                       return 'SALT';
  if (/^ADP[\s\-–]/i.test(j) || /^ADP$/i.test(j))                         return 'ADP';
  if (/^SP\s*USA[\s\-–]/i.test(j) || /^SPUSA[\s\-–]/i.test(j) || /^SP\s*USA$/i.test(j)) return 'SP USA';
  if (/^CPC[\s\-–]/i.test(j) || /^CPC$/i.test(j))                         return 'CPC';
  if (/^RIATA[\s\-–]/i.test(j) || /^RIATA$/i.test(j))                     return 'Riata';
  if (/^BEACON/i.test(j))                                                   return 'Beacon';
  if (/^ARCHWAY/i.test(j))                                                  return 'Archway';
  if (/^BUDGET/i.test(j))                                                   return 'Budget';

  // Fallback: text before dash/em-dash
  const m = j.match(/^(.+?)\s*[-–]\s*/);
  if (m) return m[1].trim();
  return j;
};

const categorizeJobcode = (jobcode) => {
  if (!jobcode) return 'Billable';
  const j = jobcode.trim();
  if (/^holiday$/i.test(j) || /^vacation$/i.test(j) || /^sick$/i.test(j)) return 'OOO';
  if (/^administrative$/i.test(j) || /^business development/i.test(j) ||
      /^cds\b/i.test(j) || /tableau/i.test(j)) return 'Internal/BD';
  return 'Billable';
};

// ============================================================================
// CSV PARSER — handles quoted fields, BOM, CRLF
// ============================================================================
const parseCSV = (text) => {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const result = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i+1]==='"') { cur+='"'; i++; } else inQ=!inQ; }
      else if (ch === ',' && !inQ) { result.push(cur.trim()); cur=''; }
      else cur += ch;
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g,'_'));
  return lines.slice(1)
    .map(line => {
      const vals = parseLine(line);
      const row = {};
      headers.forEach((h,i) => { row[h] = vals[i] ?? ''; });
      return row;
    })
    .filter(row => row.fname || row.lname || row.username);
};

// ============================================================================
// WEEK DETECTION — group rows into Mon-Sun week buckets
// ============================================================================
const detectWeeks = (rows) => {
  const weekMap = {};
  rows.forEach(row => {
    const ds = row.local_date;
    if (!ds) return;
    const d = new Date(ds);
    if (isNaN(d)) return;
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(d); mon.setDate(d.getDate() + diff);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = dt => dt.toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const yr = sun.getFullYear();
    const label = `${fmt(mon)} – ${fmt(sun)}, ${yr}`;
    const key = mon.toISOString().slice(0,10);
    if (!weekMap[key]) weekMap[key] = { key, label };
  });
  return Object.values(weekMap).sort((a,b) => b.key.localeCompare(a.key));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const StocStaffingDashboard = () => {
  const [allRows,    setAllRows]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastUpdated,setLastUpdated]= useState(null);

  const [activeTab,  setActiveTab]  = useState('overview');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [showWeekDD, setShowWeekDD] = useState(false);

  const [teamSearch,    setTeamSearch]    = useState('');
  const [expandedMembers, setExpandedMembers] = useState({});
  const [memberProjSearch, setMemberProjSearch] = useState({});
  const [teamSort, setTeamSort] = useState({ key:'utilized', dir:'desc' });

  const [projSearch,  setProjSearch]  = useState('');
  const [projFilter,  setProjFilter]  = useState('all');
  const [expandedClients, setExpandedClients] = useState({});

  const [capSort, setCapSort] = useState({ key:'availableBandwidth', dir:'desc' });

  const [selectedRiskMember, setSelectedRiskMember] = useState(null);
  const [riskRoleFilter,   setRiskRoleFilter]   = useState('all');
  const [riskClientFilter, setRiskClientFilter] = useState('all');
  const [riskLevelFilter,  setRiskLevelFilter]  = useState('all');
  const [riskSort, setRiskSort] = useState({ key:'utilization', dir:'desc' });

  // ---- fetch ----
  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(SHEET_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      const rows = parseCSV(text);
      if (rows.length === 0) throw new Error('No data rows found. Check sheet is public and columns are correct.');
      setAllRows(rows);
      setLastUpdated(new Date());
      const weeks = detectWeeks(rows);
      if (weeks.length > 0) setSelectedWeeks([weeks[0].key]);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const h = e => { if (!e.target.closest('.week-dropdown')) setShowWeekDD(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const weeks = useMemo(() => detectWeeks(allRows), [allRows]);

  const filteredRows = useMemo(() => {
    if (selectedWeeks.length === 0) return allRows;
    return allRows.filter(row => {
      if (!row.local_date) return false;
      const d = new Date(row.local_date);
      if (isNaN(d)) return false;
      const day = d.getDay();
      const diff = day===0?-6:1-day;
      const mon = new Date(d); mon.setDate(d.getDate()+diff);
      return selectedWeeks.includes(mon.toISOString().slice(0,10));
    });
  }, [allRows, selectedWeeks]);

  const { teamMembers, projects } = useMemo(() => {
    const tm = {}, proj = {};
    const numWeeks = Math.max(selectedWeeks.length, 1);

    filteredRows.forEach(row => {
      const fname   = (row.fname  || '').trim();
      const lname   = (row.lname  || '').trim();
      const name    = `${fname} ${lname}`.trim();
      const hours   = parseFloat(row.hours) || 0;
      const jobcode = (row.jobcode || '').trim();
      if (!name || name === '' || hours === 0 || !jobcode) return;

      const category = categorizeJobcode(jobcode);
      const client   = normalizeClient(jobcode);
      const isCDS    = CDS_TEAM_MEMBERS.has(name);

      if (teamFilter==='cds' && !isCDS) return;
      if (teamFilter==='tas' &&  isCDS) return;

      if (!tm[name]) tm[name] = { name, isCDS, totalHours:0, billableHours:0, oooHours:0, internalHours:0, utilized:0, projects:{}, entries:[] };
      tm[name].totalHours += hours;
      tm[name].entries.push({ jobcode, hours, category, client });
      if      (category==='OOO')         tm[name].oooHours      += hours;
      else if (category==='Internal/BD') { tm[name].internalHours += hours; tm[name].utilized += hours; }
      else                               { tm[name].billableHours  += hours; tm[name].utilized += hours; }
      tm[name].projects[jobcode] = (tm[name].projects[jobcode]||0) + hours;

      if (!proj[jobcode]) proj[jobcode] = { name:jobcode, category, client, totalHours:0, members:{} };
      proj[jobcode].totalHours += hours;
      proj[jobcode].members[name] = (proj[jobcode].members[name]||0) + hours;
    });

    Object.values(tm).forEach(m => {
      m.effectiveCapacity  = 40*numWeeks - m.oooHours;
      m.availableBandwidth = m.effectiveCapacity - m.utilized;
      m.utilizationRate    = m.effectiveCapacity>0 ? (m.utilized/m.effectiveCapacity)*100 : 0;
    });
    return { teamMembers:tm, projects:proj };
  }, [filteredRows, teamFilter, selectedWeeks]);

  const stats = useMemo(() => {
    const ms = Object.values(teamMembers);
    const tB = ms.reduce((s,m)=>s+m.billableHours,0);
    const tI = ms.reduce((s,m)=>s+m.internalHours,0);
    const tO = ms.reduce((s,m)=>s+m.oooHours,0);
    const tU = ms.reduce((s,m)=>s+m.utilized,0);
    const tA = ms.reduce((s,m)=>s+m.availableBandwidth,0);
    const tC = ms.reduce((s,m)=>s+m.effectiveCapacity,0);
    return { count:ms.length, tB, tI, tO, tU, tA, tC, avgUtil: tC>0?(tU/tC)*100:0 };
  }, [teamMembers]);

  const riskData = useMemo(() => {
    const numWeeks = Math.max(selectedWeeks.length, 1);
    const getPrimary = (entries) => {
      const cc={}; entries.forEach(e=>{ cc[e.client]=(cc[e.client]||0)+e.hours; });
      return Object.entries(cc).sort((a,b)=>b[1]-a[1])[0]?.[0]||'Multiple';
    };
    let members = Object.values(teamMembers).map(m => {
      const usedHours = m.billableHours + m.internalHours;
      const targetHours = 40*numWeeks;
      const availableHours = targetHours - m.oooHours;
      const utilization = availableHours>0 ? (usedHours/availableHours)*100 : 0;
      const riskLevel = utilization>=95?'Burnout Risk':utilization<60?'Underutilized':'Healthy';
      return { ...m, usedHours, targetHours, availableHours, utilization, riskLevel,
               primaryClient: getPrimary(m.entries), role: m.isCDS?'CDS':'TAS' };
    }).filter(m=>m.usedHours>0);

    const allForFilters = [...members];
    if (riskRoleFilter!=='all')   members=members.filter(m=>m.role===riskRoleFilter);
    if (riskClientFilter!=='all') members=members.filter(m=>m.primaryClient===riskClientFilter);
    if (riskLevelFilter!=='all')  members=members.filter(m=>m.riskLevel===riskLevelFilter);

    return {
      members,
      roles:   [...new Set(allForFilters.map(m=>m.role))].sort(),
      clients: [...new Set(allForFilters.map(m=>m.primaryClient))].sort(),
      avgUtil: members.length ? members.reduce((s,m)=>s+m.utilization,0)/members.length : 0,
      burnout: members.filter(m=>m.riskLevel==='Burnout Risk').length,
      healthy: members.filter(m=>m.riskLevel==='Healthy').length,
      under:   members.filter(m=>m.riskLevel==='Underutilized').length,
    };
  }, [teamMembers, selectedWeeks, riskRoleFilter, riskClientFilter, riskLevelFilter]);

  const projectsByClient = useMemo(() => {
    const g = {};
    Object.values(projects).forEach(p => {
      if (projFilter==='billable'    && p.category!=='Billable')    return;
      if (projFilter==='internal-bd' && p.category!=='Internal/BD') return;
      if (projFilter==='ooo'         && p.category!=='OOO')         return;
      if (projSearch && !p.name.toLowerCase().includes(projSearch.toLowerCase())) return;
      if (!g[p.client]) g[p.client]={ client:p.client, projects:[], totalHours:0 };
      g[p.client].projects.push(p);
      g[p.client].totalHours += p.totalHours;
    });
    return Object.values(g).sort((a,b)=>b.totalHours-a.totalHours);
  }, [projects, projFilter, projSearch]);

  const sortedTeamMembers = useMemo(() => {
    let ms = Object.values(teamMembers);
    if (teamSearch.trim()) ms=ms.filter(m=>m.name.toLowerCase().includes(teamSearch.toLowerCase()));
    return ms.sort((a,b)=>{
      const av=a[teamSort.key], bv=b[teamSort.key];
      return teamSort.dir==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  }, [teamMembers, teamSearch, teamSort]);

  const sortedCapacity = useMemo(() => {
    return Object.values(teamMembers).sort((a,b)=>{
      const av=a[capSort.key],bv=b[capSort.key];
      return capSort.dir==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  }, [teamMembers, capSort]);

  const sortedRisk = useMemo(() => {
    return [...riskData.members].sort((a,b)=>{
      const av=a[riskSort.key],bv=b[riskSort.key];
      return riskSort.dir==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  }, [riskData.members, riskSort]);

  const toggleSort = (current, key, setter) =>
    setter(prev=>({ key, dir: prev.key===key && prev.dir==='desc'?'asc':'desc' }));

  const sortArrow = (cfg, key) => cfg.key===key ? (cfg.dir==='desc'?' ↓':' ↑') : '';

  const getRiskColor = lvl => lvl==='Burnout Risk'?'#DC2626':lvl==='Underutilized'?'#2563EB':'#059669';

  const hl = (text, search) => {
    if (!search || !text) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return <>{parts.map((p,i)=>p.toLowerCase()===search.toLowerCase()?<mark key={i} className="bg-yellow-200 px-0.5">{p}</mark>:p)}</>;
  };

  const weekLabel = () => {
    if (!selectedWeeks.length || selectedWeeks.length===weeks.length) return 'All Weeks';
    if (selectedWeeks.length===1) return weeks.find(w=>w.key===selectedWeeks[0])?.label||'1 week';
    return `${selectedWeeks.length} weeks`;
  };

  const toggleWeek = key => setSelectedWeeks(prev =>
    prev.includes(key) ? (prev.length===1?prev:prev.filter(k=>k!==key)) : [...prev,key]
  );

  const RiskTooltip = ({ active, payload }) => {
    if (!active||!payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200 text-sm min-w-[200px]">
        <div className="font-semibold text-gray-900 mb-2">{d.name}</div>
        <div className="space-y-1 text-gray-600">
          <div className="flex justify-between"><span>Used:</span><span className="font-medium text-gray-800">{d.usedHours?.toFixed(1)}h</span></div>
          <div className="flex justify-between"><span>Available:</span><span>{d.availableHours?.toFixed(1)}h</span></div>
          <div className="flex justify-between border-t pt-1 mt-1"><span>Utilization:</span><span className="font-bold text-gray-900">{d.utilization?.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span>Risk:</span>
            <span style={{fontWeight:600,color:getRiskColor(d.riskLevel)}}>{d.riskLevel}</span>
          </div>
        </div>
      </div>
    );
  };

  // ---- loading / error ----
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin"/>
        <h2 className="text-xl font-semibold text-gray-700">Loading STOC Staffing Data…</h2>
        <p className="text-sm text-gray-400 mt-1">Connecting to Google Sheets</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md text-center bg-white rounded-xl shadow-lg p-8 border border-red-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
        <h2 className="text-xl font-semibold mb-2">Could Not Load Data</h2>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={loadData} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Retry</button>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 text-left">
          <p className="font-semibold mb-1">Checklist:</p>
          <p>• Sheet shared publicly (Anyone with link)</p>
          <p>• Columns present: fname, lname, hours, jobcode, local_date</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">STOC Staffing Tool</h1>
              <p className="text-sm text-gray-400 mt-1">
                Live · {allRows.length} rows
                {lastUpdated && <> · refreshed {lastUpdated.toLocaleTimeString()}</>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400"/>
                <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)}
                  className="border-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none">
                  <option value="all">All Teams</option>
                  <option value="tas">TAS Only</option>
                  <option value="cds">CDS Only</option>
                </select>
              </div>

              <div className="relative week-dropdown">
                <button onClick={()=>setShowWeekDD(v=>!v)}
                  className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Calendar className="w-4 h-4 text-gray-400"/>{weekLabel()}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showWeekDD?'rotate-180':''}`}/>
                </button>
                {showWeekDD && (
                  <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {weeks.map(w=>(
                        <label key={w.key} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input type="checkbox" checked={selectedWeeks.includes(w.key)} onChange={()=>toggleWeek(w.key)}
                            className="w-4 h-4 text-blue-600 rounded"/>
                          <span className="text-sm text-gray-700">{w.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="border-t p-2 flex gap-2">
                      <button onClick={()=>setSelectedWeeks(weeks.map(w=>w.key))} className="flex-1 text-xs py-1 text-blue-600 hover:bg-blue-50 rounded">All</button>
                      <button onClick={()=>setSelectedWeeks(weeks.length>0?[weeks[0].key]:[])} className="flex-1 text-xs py-1 text-gray-600 hover:bg-gray-50 rounded">Latest</button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={loadData} disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
                <RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Refresh
              </button>
            </div>
          </div>

          <div className="flex gap-1 border-b border-gray-200">
            {['overview','teams','projects','capacity','exceptions'].map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab===tab?'border-b-2 border-blue-600 text-blue-600':'text-gray-500 hover:text-gray-800'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-2"><Users className="w-7 h-7 text-blue-500"/></div>
            <div className="text-2xl font-bold text-gray-900">{stats.count}</div>
            <p className="text-sm text-gray-500 mt-1">Team Members</p>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-2"><DollarSign className="w-7 h-7 text-emerald-500"/><span className="text-xs font-medium text-emerald-600">Billable</span></div>
            <div className="text-2xl font-bold text-gray-900">{stats.tB.toFixed(0)}</div>
            <p className="text-sm text-gray-500 mt-1">Billable Hours</p>
          </div>
          <div className="bg-white border border-violet-200 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-2"><Activity className="w-7 h-7 text-violet-500"/><span className="text-xs font-medium text-violet-600">Rate</span></div>
            <div className="text-2xl font-bold text-gray-900">{stats.avgUtil.toFixed(0)}%</div>
            <p className="text-sm text-gray-500 mt-1">Avg Utilization</p>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-2"><Clock className="w-7 h-7 text-amber-500"/><span className="text-xs font-medium text-amber-600">Available</span></div>
            <div className="text-2xl font-bold text-gray-900">{stats.tA.toFixed(0)}</div>
            <p className="text-sm text-gray-500 mt-1">Hours Bandwidth</p>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="space-y-6">

          {/* ══ OVERVIEW ══ */}
          {activeTab==='overview' && (<>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold">Utilization Risk Dashboard</h2>
                <div className="flex gap-2">
                  <select value={riskRoleFilter} onChange={e=>setRiskRoleFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                    <option value="all">All Roles</option>{riskData.roles.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={riskClientFilter} onChange={e=>setRiskClientFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                    <option value="all">All Clients</option>{riskData.clients.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={riskLevelFilter} onChange={e=>setRiskLevelFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                    <option value="all">All Risk Levels</option>
                    <option value="Burnout Risk">Burnout Risk</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Underutilized">Underutilized</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  {label:'Avg Utilization',val:`${riskData.avgUtil.toFixed(0)}%`,from:'from-blue-50',to:'to-blue-100',border:'border-blue-200',txt:'text-blue-900',sub:'',sc:'text-blue-600'},
                  {label:'Burnout Risk',val:riskData.burnout,from:'from-red-50',to:'to-red-100',border:'border-red-200',txt:'text-red-900',sub:'≥95%',sc:'text-red-500'},
                  {label:'Healthy',val:riskData.healthy,from:'from-green-50',to:'to-green-100',border:'border-green-200',txt:'text-green-900',sub:'60–95%',sc:'text-green-600'},
                  {label:'Underutilized',val:riskData.under,from:'from-indigo-50',to:'to-indigo-100',border:'border-indigo-200',txt:'text-indigo-900',sub:'<60%',sc:'text-indigo-500'},
                ].map((k,i)=>(
                  <div key={i} className={`bg-gradient-to-br ${k.from} ${k.to} border ${k.border} rounded-lg p-4`}>
                    <div className={`text-sm font-medium mb-1 ${k.sc}`}>{k.label}</div>
                    <div className={`text-3xl font-bold ${k.txt}`}>{k.val}</div>
                    {k.sub&&<div className={`text-xs mt-1 ${k.sc}`}>{k.sub}</div>}
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart margin={{top:20,right:80,bottom:30,left:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                  <XAxis type="number" dataKey="utilization" unit="%" domain={[0,'auto']}
                    label={{value:'Utilization %',position:'insideBottom',offset:-10,fill:'#9CA3AF',fontSize:12}}/>
                  <YAxis type="number" dataKey="usedHours"
                    label={{value:'Used Hours',angle:-90,position:'insideLeft',fill:'#9CA3AF',fontSize:12}}/>
                  <ZAxis range={[90,90]}/>
                  <Tooltip content={<RiskTooltip/>}/>
                  <Scatter data={riskData.members} onClick={d=>setSelectedRiskMember(d)} style={{cursor:'pointer'}}>
                    {riskData.members.map((m,i)=>(
                      <Cell key={i} fill={getRiskColor(m.riskLevel)}
                        stroke={selectedRiskMember?.name===m.name?'#1F2937':'none'} strokeWidth={2}/>
                    ))}
                    <LabelList dataKey="name" position="right" content={props=>{
                      const {x,y,value,index} = props;
                      const m = riskData.members[index];
                      if (!m) return null;
                      const fn = value?.split(' ')[0]||value;
                      const top = riskData.members.slice().sort((a,b)=>b.utilization-a.utilization).slice(0,12).map(m=>m.name);
                      if (!top.includes(m.name) && selectedRiskMember?.name!==m.name) return null;
                      return <text x={x+10} y={y+4} fontSize="11" fill="#374151" fontWeight={selectedRiskMember?.name===m.name?700:400}>{fn}</text>;
                    }}/>
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-3">
                {[['#DC2626','Burnout Risk (≥95%)'],['#059669','Healthy (60–95%)'],['#2563EB','Underutilized (<60%)']].map(([c,l])=>(
                  <div key={l} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{background:c}}/><span className="text-xs text-gray-500">{l}</span></div>
                ))}
              </div>
            </div>

            {selectedRiskMember && (
              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{selectedRiskMember.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedRiskMember.riskLevel==='Burnout Risk'?'bg-red-100 text-red-700':selectedRiskMember.riskLevel==='Underutilized'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>
                        {selectedRiskMember.riskLevel}
                      </span>
                      <span className="text-xs text-gray-500">{selectedRiskMember.role} · {selectedRiskMember.primaryClient}</span>
                    </div>
                  </div>
                  <button onClick={()=>setSelectedRiskMember(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[['Used Hours',selectedRiskMember.usedHours?.toFixed(1)],
                    ['Available Hours',selectedRiskMember.availableHours?.toFixed(1)],
                    ['OOO Hours',selectedRiskMember.oooHours?.toFixed(1)],
                    ['Billable Hours',selectedRiskMember.billableHours?.toFixed(1)],
                    ['Internal/BD',selectedRiskMember.internalHours?.toFixed(1)],
                    ['Utilization',`${selectedRiskMember.utilization?.toFixed(1)}%`],
                  ].map(([l,v])=>(
                    <div key={l} className="bg-white rounded-lg p-3 border border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{l}</span>
                      <span className="font-semibold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4">Utilization Risk Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      {[['name','Name'],['riskLevel','Risk'],['utilization','Util %'],['usedHours','Used'],['availableHours','Available'],['billableHours','Billable'],['internalHours','Int/BD'],['oooHours','OOO']].map(([k,l])=>(
                        <th key={k} onClick={()=>toggleSort(riskSort,k,setRiskSort)}
                          className={`py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 ${k!=='name'&&k!=='riskLevel'?'text-right':'text-left'}`}>
                          {l}{sortArrow(riskSort,k)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRisk.map((m,i)=>(
                      <tr key={i} onClick={()=>setSelectedRiskMember(m)}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedRiskMember?.name===m.name?'bg-blue-50':''}`}>
                        <td className="py-2.5 px-4 font-medium text-gray-900">{m.name}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.riskLevel==='Burnout Risk'?'bg-red-100 text-red-700':m.riskLevel==='Underutilized'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>{m.riskLevel}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold">{m.utilization.toFixed(1)}%</td>
                        <td className="py-2.5 px-4 text-right text-gray-700">{m.usedHours.toFixed(1)}</td>
                        <td className="py-2.5 px-4 text-right text-gray-700">{m.availableHours.toFixed(1)}</td>
                        <td className="py-2.5 px-4 text-right text-gray-700">{m.billableHours.toFixed(1)}</td>
                        <td className="py-2.5 px-4 text-right text-gray-700">{m.internalHours.toFixed(1)}</td>
                        <td className="py-2.5 px-4 text-right text-gray-700">{m.oooHours.toFixed(1)}</td>
                      </tr>
                    ))}
                    {sortedRisk.length===0&&<tr><td colSpan="8" className="text-center py-8 text-gray-400">No members match filters</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* ══ TEAMS ══ */}
          {activeTab==='teams' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Team Member Details</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input value={teamSearch} onChange={e=>setTeamSearch(e.target.value)} placeholder="Search members…"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-gray-600">Name</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-600">Team</th>
                      {[['billableHours','Billable'],['internalHours','Int/BD'],['oooHours','OOO'],['utilized','Utilized'],['availableBandwidth','Available'],['utilizationRate','Util %']].map(([k,l])=>(
                        <th key={k} onClick={()=>toggleSort(teamSort,k,setTeamSort)}
                          className="py-3 px-4 text-right font-semibold text-gray-600 cursor-pointer hover:bg-gray-100">
                          {l}{sortArrow(teamSort,k)}
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center font-semibold text-gray-600">Projects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedTeamMembers.map((m,i)=>{
                      const projs = Object.entries(m.projects)
                        .filter(([jc])=>categorizeJobcode(jc)!=='OOO')
                        .map(([jc,hrs])=>({jc,hrs,pct:m.utilized>0?(hrs/m.utilized)*100:0}))
                        .sort((a,b)=>b.hrs-a.hrs);
                      const search = memberProjSearch[m.name]||'';
                      const filtered = search ? projs.filter(p=>p.jc.toLowerCase().includes(search.toLowerCase())) : projs;
                      return (
                        <React.Fragment key={i}>
                          <tr className="hover:bg-gray-50">
                            <td className="py-2.5 px-4 font-medium text-gray-900">{m.name}</td>
                            <td className="py-2.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.isCDS?'bg-purple-50 text-purple-700':'bg-blue-50 text-blue-700'}`}>{m.isCDS?'CDS':'TAS'}</span>
                            </td>
                            <td className="py-2.5 px-4 text-right text-gray-600">{m.billableHours.toFixed(1)}</td>
                            <td className="py-2.5 px-4 text-right text-gray-600">{m.internalHours.toFixed(1)}</td>
                            <td className="py-2.5 px-4 text-right text-gray-600">{m.oooHours.toFixed(1)}</td>
                            <td className="py-2.5 px-4 text-right font-medium">{m.utilized.toFixed(1)}</td>
                            <td className="py-2.5 px-4 text-right"><span className={`font-medium ${m.availableBandwidth<0?'text-red-500':'text-green-600'}`}>{m.availableBandwidth.toFixed(1)}</span></td>
                            <td className="py-2.5 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.utilizationRate>=90?'bg-red-50 text-red-700':m.utilizationRate>=75?'bg-amber-50 text-amber-700':'bg-green-50 text-green-700'}`}>{m.utilizationRate.toFixed(0)}%</span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <button onClick={()=>setExpandedMembers(p=>({...p,[m.name]:!p[m.name]}))}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                {projs.length}{expandedMembers[m.name]?<ChevronDown className="w-4 h-4"/>:<ChevronRight className="w-4 h-4"/>}
                              </button>
                            </td>
                          </tr>
                          {expandedMembers[m.name] && (
                            <tr><td colSpan="9" className="px-4 py-3 bg-gray-50">
                              <div className="ml-8 space-y-2">
                                <div className="relative w-full max-w-sm">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                  <input value={memberProjSearch[m.name]||''} placeholder="Search projects…"
                                    onChange={e=>setMemberProjSearch(p=>({...p,[m.name]:e.target.value}))}
                                    className="w-full pl-10 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none" onClick={e=>e.stopPropagation()}/>
                                </div>
                                {filtered.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {filtered.map((p,j)=>(
                                      <div key={j} className="flex justify-between text-sm py-1">
                                        <span className="text-gray-700">{hl(p.jc,search)}</span>
                                        <span className="font-medium text-gray-900">{p.hrs.toFixed(1)}h ({p.pct.toFixed(1)}%)</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-sm text-gray-400 italic">No projects match</p>}
                              </div>
                            </td></tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                      <td className="py-3 px-4" colSpan={2}>Total</td>
                      <td className="py-3 px-4 text-right">{stats.tB.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{stats.tI.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{stats.tO.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{stats.tU.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{stats.tA.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">{stats.avgUtil.toFixed(0)}%</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ PROJECTS ══ */}
          {activeTab==='projects' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Project Allocation</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input value={projSearch} onChange={e=>setProjSearch(e.target.value)} placeholder="Search…"
                      className="w-60 pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"/>
                    {projSearch && <button onClick={()=>setProjSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
                  </div>
                  <select value={projFilter} onChange={e=>setProjFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="all">All Projects</option>
                    <option value="billable">Billable Only</option>
                    <option value="internal-bd">Internal/BD</option>
                    <option value="ooo">OOO Only</option>
                  </select>
                </div>
              </div>
              {projectsByClient.length===0 ? (
                <div className="text-center py-12 text-gray-400">No projects match</div>
              ) : (
                <div className="space-y-3">
                  {projectsByClient.map((cg,i)=>(
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={()=>setExpandedClients(p=>({...p,[cg.client]:!p[cg.client]}))}>
                        <div className="flex items-center gap-2">
                          {expandedClients[cg.client]?<ChevronDown className="w-4 h-4 text-gray-500"/>:<ChevronRight className="w-4 h-4 text-gray-500"/>}
                          <span className="font-semibold text-gray-900">{hl(cg.client,projSearch)}</span>
                          <span className="text-xs text-gray-400">({cg.projects.length})</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{cg.totalHours.toFixed(1)} hrs</span>
                      </div>
                      {expandedClients[cg.client] && (
                        <div className="p-4 space-y-2">
                          {cg.projects.sort((a,b)=>b.totalHours-a.totalHours).map((p,j)=>(
                            <div key={j} className={`border-l-4 pl-4 py-2 rounded-r ${p.category==='Billable'?'border-blue-400 bg-blue-50':p.category==='Internal/BD'?'border-purple-400 bg-purple-50':'border-gray-400 bg-gray-50'}`}>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium text-gray-900 text-sm">{hl(p.name,projSearch)}</span>
                                <span className="font-bold text-gray-900 ml-4">{p.totalHours.toFixed(1)}h</span>
                              </div>
                              <div className="space-y-0.5">
                                {Object.entries(p.members).sort(([,a],[,b])=>b-a).map(([mn,hrs],k)=>(
                                  <div key={k} className="flex justify-between text-xs text-gray-600">
                                    <span>{mn}</span><span className="font-medium">{hrs.toFixed(1)}h</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ CAPACITY ══ */}
          {activeTab==='capacity' && (<>
            <div className="grid grid-cols-3 gap-4">
              {[
                {cls:'green',  icon:<UserCheck className="w-7 h-7 text-green-600 mx-auto mb-1"/>, label:'Available',  count:Object.values(teamMembers).filter(m=>m.availableBandwidth>=10).length, sub:'≥10h remaining'},
                {cls:'amber',  icon:<Target className="w-7 h-7 text-amber-600 mx-auto mb-1"/>,   label:'Near Capacity',count:Object.values(teamMembers).filter(m=>m.availableBandwidth>=0&&m.availableBandwidth<10).length, sub:'0–10h remaining'},
                {cls:'red',    icon:<AlertTriangle className="w-7 h-7 text-red-600 mx-auto mb-1"/>,label:'Overallocated',count:Object.values(teamMembers).filter(m=>m.availableBandwidth<0).length, sub:'Action required'},
              ].map((c,i)=>(
                <div key={i} className={`bg-${c.cls}-50 border border-${c.cls}-200 rounded-xl p-5 text-center`}>
                  {c.icon}
                  <div className="text-3xl font-bold text-gray-900">{c.count}</div>
                  <p className="text-sm font-medium text-gray-700 mt-1">{c.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Capacity & Bandwidth</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-gray-600">Team Member</th>
                      <th className="py-3 px-4 text-right font-semibold text-gray-600">Target</th>
                      {[['oooHours','OOO'],['effectiveCapacity','Eff. Cap'],['utilized','Utilized'],['availableBandwidth','Available']].map(([k,l])=>(
                        <th key={k} onClick={()=>toggleSort(capSort,k,setCapSort)}
                          className="py-3 px-4 text-right font-semibold text-gray-600 cursor-pointer hover:bg-gray-100">
                          {l}{sortArrow(capSort,k)}
                        </th>
                      ))}
                      <th className="py-3 px-4 text-right font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedCapacity.map((m,i)=>(
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 font-medium">{m.name}</td>
                        <td className="py-2.5 px-4 text-right text-gray-400">40.0</td>
                        <td className="py-2.5 px-4 text-right text-gray-600">{m.oooHours.toFixed(1)}</td>
                        <td className="py-2.5 px-4 text-right font-medium">{m.effectiveCapacity.toFixed(1)}</td>
                        <td className="py-2.5 px-4 text-right text-gray-600">{m.utilized.toFixed(1)}</td>
                        <td className="py-2.5 px-4 text-right"><span className={`font-semibold ${m.availableBandwidth<0?'text-red-500':m.availableBandwidth<10?'text-amber-500':'text-green-600'}`}>{m.availableBandwidth.toFixed(1)}</span></td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.availableBandwidth<0?'bg-red-50 text-red-700':m.availableBandwidth<10?'bg-amber-50 text-amber-700':'bg-green-50 text-green-700'}`}>
                            {m.availableBandwidth<0?'Overallocated':m.availableBandwidth<10?'Near Capacity':'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* ══ EXCEPTIONS ══ */}
          {activeTab==='exceptions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-5">Exceptions & Alerts</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  {cls:'yellow',label:'Low Hours (<20)',count:Object.values(teamMembers).filter(m=>m.totalHours>0&&m.totalHours<20).length,sub:'Needs review'},
                  {cls:'orange',label:'Near Capacity',count:Object.values(teamMembers).filter(m=>m.availableBandwidth>=0&&m.availableBandwidth<10).length,sub:'<10h available'},
                  {cls:'red',   label:'Overallocated',count:Object.values(teamMembers).filter(m=>m.availableBandwidth<0).length,sub:'Action required'},
                ].map((c,i)=>(
                  <div key={i} className={`bg-${c.cls}-50 border border-${c.cls}-200 rounded-lg p-4`}>
                    <p className={`text-sm font-semibold text-${c.cls}-700 mb-1`}>{c.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{c.count}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    {['Issue','Team Member','Details','Status'].map(h=>(
                      <th key={h} className={`py-3 px-4 font-semibold text-gray-600 ${h==='Status'?'text-center':'text-left'}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {Object.values(teamMembers).filter(m=>m.availableBandwidth<0).map((m,i)=>(
                      <tr key={`o${i}`} className="border-t border-gray-100">
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Overallocated</span></td>
                        <td className="py-2.5 px-4 font-medium">{m.name}</td>
                        <td className="py-2.5 px-4 text-gray-500">{Math.abs(m.availableBandwidth).toFixed(1)}h over ({m.utilizationRate.toFixed(0)}%)</td>
                        <td className="py-2.5 px-4 text-center text-red-600 font-medium text-xs">Action Required</td>
                      </tr>
                    ))}
                    {Object.values(teamMembers).filter(m=>m.totalHours>0&&m.totalHours<20).map((m,i)=>(
                      <tr key={`l${i}`} className="border-t border-gray-100">
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Low Hours</span></td>
                        <td className="py-2.5 px-4 font-medium">{m.name}</td>
                        <td className="py-2.5 px-4 text-gray-500">Only {m.totalHours.toFixed(1)}h logged</td>
                        <td className="py-2.5 px-4 text-center text-amber-600 font-medium text-xs">Review</td>
                      </tr>
                    ))}
                    {Object.values(teamMembers).filter(m=>m.availableBandwidth<0||m.totalHours<20).length===0 && (
                      <tr><td colSpan="4" className="text-center py-8 text-gray-400">No exceptions 🎉</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StocStaffingDashboard;
