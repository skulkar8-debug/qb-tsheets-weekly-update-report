import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Search, RefreshCw, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
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
// DESIGN TOKENS — one place to change everything
// ─────────────────────────────────────────────────────────
const C = {
  billable:  '#16A34A',   // green-600
  internal:  '#7C3AED',   // violet-600
  ooo:       '#94A3B8',   // slate-400
  avail:     '#E2E8F0',   // slate-200
  burn:      '#DC2626',   // red-600
  burnBg:    '#FEF2F2',
  under:     '#2563EB',   // blue-600
  underBg:   '#EFF6FF',
  healthy:   '#15803D',   // green-700
  healthyBg: '#F0FDF4',
  border:    '#E2E8F0',
  headerBg:  '#F8FAFC',
  rowAlt:    '#FAFAFA',
  text:      '#0F172A',
  muted:     '#64748B',
  faint:     '#94A3B8',
};

// ─────────────────────────────────────────────────────────
// DATA HELPERS
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
  if (/^administrative$/i.test(j.trim())||/^business development/i.test(j)||
      /^cds\b/i.test(j)||/tableau/i.test(j)) return 'Internal/BD';
  return 'Billable';
};

const parseCSV = (text) => {
  const clean = text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const lines = clean.split('\n').filter(l=>l.trim());
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const r=[]; let cur='',inQ=false;
    for (let i=0;i<line.length;i++) {
      const ch=line[i];
      if(ch==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}
      else if(ch===','&&!inQ){r.push(cur.trim());cur='';}
      else cur+=ch;
    }
    r.push(cur.trim()); return r;
  };
  const hdrs=parseLine(lines[0]).map(h=>h.toLowerCase().replace(/\s+/g,'_'));
  return lines.slice(1)
    .map(line=>{const v=parseLine(line);const row={};hdrs.forEach((h,i)=>{row[h]=v[i]??'';});return row;})
    .filter(r=>r.fname||r.lname||r.username);
};

const detectWeeks = (rows) => {
  const m={};
  rows.forEach(r=>{
    const d=new Date(r.local_date);if(isNaN(d))return;
    const day=d.getDay();const diff=day===0?-6:1-day;
    const mon=new Date(d);mon.setDate(d.getDate()+diff);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    const fmt=dt=>dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const key=mon.toISOString().slice(0,10);
    if(!m[key]) m[key]={key,label:`${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`};
  });
  return Object.values(m).sort((a,b)=>b.key.localeCompare(a.key));
};

const riskOf = (u) => u>=95?'Over':u<60?'Under':'OK';

// ─────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────

// Plain bordered table header
const Th = ({children, right, sort, onClick}) => (
  <th
    onClick={onClick}
    style={{
      padding:'8px 12px',
      fontSize:11,
      fontWeight:600,
      textTransform:'uppercase',
      letterSpacing:'0.06em',
      color:C.muted,
      background:C.headerBg,
      borderBottom:`2px solid ${C.border}`,
      textAlign: right?'right':'left',
      whiteSpace:'nowrap',
      cursor: onClick?'pointer':'default',
      userSelect:'none',
    }}>
    {children}{sort}
  </th>
);

// Plain table cell
const Td = ({children, right, bold, muted, color, style={}}) => (
  <td style={{
    padding:'9px 12px',
    fontSize:13,
    color: color||(muted?C.faint:bold?C.text:C.muted),
    fontWeight: bold?600:400,
    textAlign: right?'right':'left',
    fontVariantNumeric: right?'tabular-nums':'normal',
    verticalAlign:'middle',
    ...style,
  }}>
    {children}
  </td>
);

// Risk pill — small and functional
const RiskPill = ({level}) => {
  const map = {
    Over:  {bg:'#FEE2E2',color:'#B91C1C',text:'At risk'},
    Under: {bg:'#DBEAFE',color:'#1D4ED8',text:'Under'},
    OK:    {bg:'#DCFCE7',color:'#15803D',text:'Healthy'},
  };
  const s=map[level]||map.OK;
  return (
    <span style={{
      display:'inline-block',
      padding:'2px 8px',
      borderRadius:4,
      fontSize:11,
      fontWeight:600,
      background:s.bg,
      color:s.color,
      letterSpacing:'0.02em',
    }}>
      {s.text}
    </span>
  );
};

// Inline stacked bar — THE key visualization building block
const CapacityBar = ({billable, internal, ooo, avail, total=40, height=20, showTooltip=true}) => {
  const [hovered, setHovered] = useState(null);
  const bW = Math.min((billable/total)*100, 100);
  const iW = Math.min((internal/total)*100, Math.max(0, 100-bW));
  const oW = Math.min((ooo/total)*100, Math.max(0, 100-bW-iW));
  const aW = Math.max(0, 100-bW-iW-oW);
  const overRatio = (billable+internal)/total;
  const isOver = overRatio > 1;

  const segments = [
    {key:'billable',  w:bW, color:C.billable,  label:'Billable',  value:billable},
    {key:'internal',  w:iW, color:C.internal,  label:'Internal/BD',value:internal},
    {key:'ooo',       w:oW, color:C.ooo,       label:'OOO',       value:ooo},
    {key:'avail',     w:aW, color:C.avail,     label:'Available', value:Math.max(0,avail)},
  ];

  return (
    <div style={{position:'relative',width:'100%'}}>
      <div style={{
        display:'flex',
        height,
        borderRadius:3,
        overflow:'hidden',
        border:`1px solid ${isOver?C.burn:C.border}`,
        boxShadow: isOver?`0 0 0 1px ${C.burn}20`:'none',
      }}>
        {segments.map(seg=>seg.w>0&&(
          <div
            key={seg.key}
            onMouseEnter={()=>showTooltip&&setHovered(seg)}
            onMouseLeave={()=>setHovered(null)}
            style={{
              width:`${seg.w}%`,
              background:seg.color,
              transition:'opacity 0.1s',
              opacity: hovered&&hovered.key!==seg.key?0.7:1,
              flexShrink:0,
            }}
          />
        ))}
        {/* overflow stripe */}
        {isOver && (
          <div style={{
            position:'absolute',right:0,top:0,bottom:0,width:4,
            background:`repeating-linear-gradient(45deg,${C.burn},${C.burn} 2px,transparent 2px,transparent 4px)`,
          }}/>
        )}
      </div>
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position:'absolute',bottom:'calc(100% + 6px)',left:'50%',transform:'translateX(-50%)',
          background:C.text,color:'#fff',padding:'4px 10px',borderRadius:4,fontSize:11,
          whiteSpace:'nowrap',zIndex:100,pointerEvents:'none',
        }}>
          {hovered.label}: {hovered.value.toFixed(1)}h
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function StocStaffingDashboard() {
  const [allRows,     setAllRows]    = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState(null);
  const [lastUpdated, setLastUpdated]= useState(null);

  const [tab,        setTab]       = useState('dashboard');
  const [teamFilter, setTeamFilter]= useState('all');
  const [selWeeks,   setSelWeeks]  = useState([]);
  const [weekDD,     setWeekDD]    = useState(false);

  const [projSearch,       setProjSearch]       = useState('');
  const [projFilter,       setProjFilter]       = useState('all');
  const [projClientFilter, setProjClientFilter] = useState('all');
  const [projSort,         setProjSort]         = useState({k:'hours',d:'desc'});
  const [collapsed,        setCollapsed]        = useState({});

  const [teamSearch, setTeamSearch] = useState('');
  const [teamSort,   setTeamSort]   = useState({k:'utilized',d:'desc'});
  const [openMember, setOpenMember] = useState(null);

  const [dashSort,   setDashSort]   = useState('util-desc');
  const [dashFilter, setDashFilter] = useState('all');

  // ── fetch ──
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res=await fetch(SHEET_CSV_URL);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows=parseCSV(await res.text());
      if(!rows.length) throw new Error('No rows found. Is the sheet publicly shared?');
      setAllRows(rows);
      setLastUpdated(new Date());
      const w=detectWeeks(rows);
      if(w.length) setSelWeeks([w[0].key]);
    } catch(e){setError(e.message);}
    finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
  useEffect(()=>{
    const h=e=>{if(!e.target.closest('.week-dd'))setWeekDD(false);};
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[]);

  const weeks = useMemo(()=>detectWeeks(allRows),[allRows]);

  const filteredRows = useMemo(()=>{
    if(!selWeeks.length) return allRows;
    return allRows.filter(r=>{
      const d=new Date(r.local_date);if(isNaN(d))return false;
      const day=d.getDay();const diff=day===0?-6:1-day;
      const mon=new Date(d);mon.setDate(d.getDate()+diff);
      return selWeeks.includes(mon.toISOString().slice(0,10));
    });
  },[allRows,selWeeks]);

  // ── core aggregation ──
  const {members,projectsMap} = useMemo(()=>{
    const tm={},pm={};
    const nW=Math.max(selWeeks.length,1);
    filteredRows.forEach(r=>{
      const name=`${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs=parseFloat(r.hours)||0;
      const jc=(r.jobcode||'').trim();
      if(!name||!hrs||!jc) return;
      const cat=catOf(jc),client=normalizeClient(jc),isCDS=CDS_TEAM.has(name);
      if(teamFilter==='cds'&&!isCDS) return;
      if(teamFilter==='tas'&& isCDS) return;

      if(!tm[name]) tm[name]={name,isCDS,total:0,billable:0,ooo:0,internal:0,utilized:0,jobs:{},entries:[]};
      tm[name].total+=hrs;tm[name].entries.push({jc,hrs,cat,client});
      if(cat==='OOO')         {tm[name].ooo+=hrs;}
      else if(cat==='Internal/BD'){tm[name].internal+=hrs;tm[name].utilized+=hrs;}
      else                    {tm[name].billable+=hrs;tm[name].utilized+=hrs;}
      tm[name].jobs[jc]=(tm[name].jobs[jc]||0)+hrs;

      if(cat==='OOO') return;
      if(!pm[jc]) pm[jc]={name:jc,cat,client,hrs:0,mems:{}};
      pm[jc].hrs+=hrs;pm[jc].mems[name]=(pm[jc].mems[name]||0)+hrs;
    });
    Object.values(tm).forEach(m=>{
      m.effCap=40*nW-m.ooo;
      m.avail =m.effCap-m.utilized;
      m.util  =m.effCap>0?(m.utilized/m.effCap)*100:0;
      m.risk  =riskOf(m.util);
    });
    return{members:tm,projectsMap:pm};
  },[filteredRows,teamFilter,selWeeks]);

  const stats = useMemo(()=>{
    const ms=Object.values(members);
    const tC=ms.reduce((s,m)=>s+m.effCap,0);
    const tU=ms.reduce((s,m)=>s+m.utilized,0);
    return{
      n:ms.length,
      tB:ms.reduce((s,m)=>s+m.billable,0),
      tI:ms.reduce((s,m)=>s+m.internal,0),
      tO:ms.reduce((s,m)=>s+m.ooo,0),
      tU,tC,tA:ms.reduce((s,m)=>s+m.avail,0),
      avgU:tC>0?(tU/tC)*100:0,
      atRisk:ms.filter(m=>m.risk==='Over').length,
      under:ms.filter(m=>m.risk==='Under').length,
    };
  },[members]);

  const totalBillableHrs=useMemo(()=>
    Object.values(projectsMap).filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0)
  ,[projectsMap]);

  // Dashboard: sorted/filtered member list
  const dashMembers = useMemo(()=>{
    let ms=Object.values(members).filter(m=>m.total>0);
    if(dashFilter==='over')  ms=ms.filter(m=>m.risk==='Over');
    if(dashFilter==='under') ms=ms.filter(m=>m.risk==='Under');
    if(dashFilter==='ok')    ms=ms.filter(m=>m.risk==='OK');
    const [key,dir]=dashSort.split('-');
    return ms.sort((a,b)=>dir==='desc'?b[key]-a[key]:a[key]-b[key]);
  },[members,dashSort,dashFilter]);

  // Client hours for chart
  const clientHours = useMemo(()=>{
    const ch={};
    Object.values(projectsMap)
      .filter(p=>p.cat==='Billable')
      .forEach(p=>{ ch[p.client]=(ch[p.client]||0)+p.hrs; });
    return Object.entries(ch)
      .map(([client,hrs])=>({client,hrs:parseFloat(hrs.toFixed(1))}))
      .sort((a,b)=>b.hrs-a.hrs)
      .slice(0,12);
  },[projectsMap]);

  // All distinct billable clients for the filter dropdown
  const allClients = useMemo(()=>{
    const s = new Set(Object.values(projectsMap).map(p=>p.client));
    return [...s].sort();
  },[projectsMap]);

  // Projects grouped by client
  const clientGroups = useMemo(()=>{
    const g={};
    Object.values(projectsMap).forEach(p=>{
      if(projFilter==='billable'    &&p.cat!=='Billable')    return;
      if(projFilter==='internal-bd' &&p.cat!=='Internal/BD') return;
      if(projClientFilter!=='all'   &&p.client!==projClientFilter) return;
      if(projSearch&&!p.name.toLowerCase().includes(projSearch.toLowerCase())&&
         !p.client.toLowerCase().includes(projSearch.toLowerCase())) return;
      if(!g[p.client]) g[p.client]={client:p.client,total:0,projs:[]};
      g[p.client].projs.push(p);g[p.client].total+=p.hrs;
    });
    Object.values(g).forEach(cg=>cg.projs.sort((a,b)=>
      projSort.k==='hours'?(projSort.d==='desc'?b.hrs-a.hrs:a.hrs-b.hrs):
      (projSort.d==='desc'?b.name.localeCompare(a.name):a.name.localeCompare(b.name))
    ));
    return Object.values(g).sort((a,b)=>b.total-a.total);
  },[projectsMap,projFilter,projSearch,projSort]);

  const sortedTeam=useMemo(()=>{
    let ms=Object.values(members);
    if(teamSearch.trim()) ms=ms.filter(m=>m.name.toLowerCase().includes(teamSearch.toLowerCase()));
    const[k,d]=teamSort.k.split('__');
    return ms.sort((a,b)=>{
      const av=a[teamSort.k]??a.util,bv=b[teamSort.k]??b.util;
      return teamSort.d==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  },[members,teamSearch,teamSort]);

  const togglePS=k=>setProjSort(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const toggleTS=k=>setTeamSort(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const arr=(cfg,k)=>cfg.k===k?(cfg.d==='desc'?' ↓':' ↑'):'';

  const weekLabel=()=>{
    if(!selWeeks.length||selWeeks.length===weeks.length) return 'All Weeks';
    if(selWeeks.length===1) return weeks.find(w=>w.key===selWeeks[0])?.label||'1 week';
    return `${selWeeks.length} weeks`;
  };
  const toggleWeek=k=>setSelWeeks(p=>
    p.includes(k)?(p.length===1?p:p.filter(x=>x!==k)):[...p,k]
  );

  // ── LOADING / ERROR ──
  if(loading) return(
    <div style={{minHeight:'100vh',background:'#F8FAFC',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:C.muted}}>
        <div style={{width:32,height:32,border:`3px solid ${C.border}`,borderTopColor:C.under,borderRadius:'50%',
          animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
        <p style={{fontSize:14,fontWeight:500}}>Loading from Google Sheets…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if(error) return(
    <div style={{minHeight:'100vh',background:'#F8FAFC',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',border:`1px solid #FECACA`,borderRadius:8,padding:32,maxWidth:420,textAlign:'center'}}>
        <AlertCircle size={32} color={C.burn} style={{margin:'0 auto 12px'}}/>
        <p style={{fontSize:15,fontWeight:600,marginBottom:8}}>Could not load data</p>
        <p style={{fontSize:13,color:C.muted,marginBottom:16}}>{error}</p>
        <button onClick={load} style={{padding:'8px 20px',background:C.under,color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:500,cursor:'pointer'}}>
          Try again
        </button>
      </div>
    </div>
  );

  // ── shared table style ──
  const tableStyle={width:'100%',borderCollapse:'collapse',fontSize:13};
  const trStyle=(i,risk)=>({
    background: risk==='Over'?'#FFF5F5':risk==='Under'?'#F8FAFF':i%2===1?C.rowAlt:'#fff',
    borderBottom:`1px solid ${C.border}`,
  });

  // ─────────────────────── RENDER ───────────────────────
  return(
    <div style={{minHeight:'100vh',background:'#F8FAFC',fontFamily:'system-ui,-apple-system,sans-serif',color:C.text}}>

      {/* ══ TOPBAR ══ */}
      <div style={{
        background:'#fff',borderBottom:`1px solid ${C.border}`,
        position:'sticky',top:0,zIndex:30,
      }}>
        <div style={{maxWidth:1400,margin:'0 auto',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',gap:24}}>

          {/* Logo + tabs */}
          <div style={{display:'flex',alignItems:'center',gap:28}}>
            <img src="/logo.png" alt="STOC Advisory" style={{height:30,width:'auto',display:'block',flexShrink:0}}/>
            <nav style={{display:'flex',gap:2}}>
              {[
                ['dashboard','Dashboard'],
                ['projects', 'Projects'],
                ['team',     'Team'],
                ['exceptions','Exceptions'],
              ].map(([id,label])=>(
                <button key={id} onClick={()=>setTab(id)} style={{
                  padding:'4px 12px',fontSize:13,fontWeight:tab===id?600:400,
                  color:tab===id?C.under:C.muted,
                  background:tab===id?'#EFF6FF':'transparent',
                  border:'none',borderRadius:5,cursor:'pointer',
                  borderBottom:tab===id?`2px solid ${C.under}`:'2px solid transparent',
                  transition:'all 0.1s',
                }}>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Controls */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)} style={{
              height:30,padding:'0 10px',fontSize:12,border:`1px solid ${C.border}`,
              borderRadius:5,background:'#fff',color:C.text,cursor:'pointer',outline:'none',
            }}>
              <option value="all">All Teams</option>
              <option value="tas">TAS</option>
              <option value="cds">CDS</option>
            </select>

            {/* Week picker */}
            <div className="week-dd" style={{position:'relative'}}>
              <button onClick={()=>setWeekDD(v=>!v)} style={{
                height:30,padding:'0 10px',fontSize:12,border:`1px solid ${C.border}`,
                borderRadius:5,background:'#fff',color:C.text,cursor:'pointer',
                display:'flex',alignItems:'center',gap:6,
              }}>
                <Calendar size={13} color={C.faint}/>
                {weekLabel()}
                <ChevronDown size={12} color={C.faint} style={{transform:weekDD?'rotate(180deg)':'none',transition:'transform 0.15s'}}/>
              </button>
              {weekDD&&(
                <div style={{
                  position:'absolute',right:0,top:'calc(100% + 4px)',
                  background:'#fff',border:`1px solid ${C.border}`,
                  borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.10)',
                  zIndex:50,minWidth:240,overflow:'hidden',
                }}>
                  <div style={{maxHeight:224,overflowY:'auto',padding:4}}>
                    {weeks.map(w=>(
                      <label key={w.key} style={{
                        display:'flex',alignItems:'center',gap:8,
                        padding:'6px 10px',cursor:'pointer',borderRadius:5,
                        background:selWeeks.includes(w.key)?'#EFF6FF':'transparent',
                      }}>
                        <input type="checkbox" checked={selWeeks.includes(w.key)} onChange={()=>toggleWeek(w.key)}
                          style={{width:14,height:14,accentColor:C.under,cursor:'pointer'}}/>
                        <span style={{fontSize:12,color:C.text}}>{w.label}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{borderTop:`1px solid ${C.border}`,display:'flex',padding:4,gap:4}}>
                    <button onClick={()=>setSelWeeks(weeks.map(w=>w.key))} style={{flex:1,padding:'4px 0',fontSize:11,fontWeight:500,color:C.under,background:'transparent',border:'none',cursor:'pointer',borderRadius:4}}>All</button>
                    <button onClick={()=>setSelWeeks(weeks.length?[weeks[0].key]:[])} style={{flex:1,padding:'4px 0',fontSize:11,fontWeight:500,color:C.muted,background:'transparent',border:'none',cursor:'pointer',borderRadius:4}}>Latest</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={load} style={{
              height:30,padding:'0 12px',fontSize:12,fontWeight:500,
              border:`1px solid ${C.border}`,borderRadius:5,
              background:'#fff',color:C.muted,cursor:'pointer',
              display:'flex',alignItems:'center',gap:5,
            }}>
              <RefreshCw size={12}/>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ══ STAT BAR ══ */}
      <div style={{background:'#fff',borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1400,margin:'0 auto',padding:'0 24px',height:40,display:'flex',alignItems:'center',gap:0}}>
          {[
            {label:'Members',    val:stats.n,              unit:'',  color:C.text},
            {label:'Billable',   val:stats.tB.toFixed(0), unit:'h', color:C.billable},
            {label:'Internal',   val:stats.tI.toFixed(0), unit:'h', color:C.internal},
            {label:'OOO',        val:stats.tO.toFixed(0), unit:'h', color:C.faint},
            {label:'Avg Util',   val:stats.avgU.toFixed(0),unit:'%',
              color:stats.avgU>=95?C.burn:stats.avgU<60?C.under:C.healthy},
            {label:'At Risk',    val:stats.atRisk,        unit:'',  color:stats.atRisk>0?C.burn:C.faint},
            {label:'Bandwidth',  val:stats.tA.toFixed(0), unit:'h', color:stats.tA<0?C.burn:C.text},
          ].map((s,i)=>(
            <React.Fragment key={i}>
              {i>0&&<div style={{width:1,height:20,background:C.border,margin:'0 20px'}}/>}
              <div style={{display:'flex',alignItems:'baseline',gap:5,whiteSpace:'nowrap'}}>
                <span style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',color:C.faint}}>{s.label}</span>
                <span style={{fontSize:15,fontWeight:700,color:s.color,fontVariantNumeric:'tabular-nums'}}>{s.val}{s.unit}</span>
              </div>
            </React.Fragment>
          ))}
          {lastUpdated&&(
            <span style={{marginLeft:'auto',fontSize:11,color:C.faint,whiteSpace:'nowrap'}}>
              Data as of {lastUpdated.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}, {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>

        {/* ─────────────────────────────
            DASHBOARD TAB
            The big visualization: capacity lanes + client chart
        ───────────────────────────── */}
        {tab==='dashboard'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16,alignItems:'start'}}>

            {/* LEFT: CAPACITY LANE VIEW */}
            <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
              {/* Header */}
              <div style={{
                padding:'10px 16px',borderBottom:`1px solid ${C.border}`,
                display:'flex',alignItems:'center',justifyContent:'space-between',
                background:C.headerBg,
              }}>
                <div>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>Capacity Overview</span>
                  <span style={{fontSize:11,color:C.faint,marginLeft:8}}>Each bar = 40h weekly target</span>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  {[
                    {color:C.billable,label:'Billable'},
                    {color:C.internal,label:'Internal/BD'},
                    {color:C.ooo,label:'OOO'},
                    {color:C.avail,label:'Available',border:`1px solid ${C.border}`},
                  ].map(s=>(
                    <div key={s.label} style={{display:'flex',alignItems:'center',gap:4}}>
                      <div style={{width:10,height:10,borderRadius:2,background:s.color,border:s.border||'none',flexShrink:0}}/>
                      <span style={{fontSize:10,color:C.muted}}>{s.label}</span>
                    </div>
                  ))}
                  <div style={{width:1,height:14,background:C.border,margin:'0 4px'}}/>
                  <select value={dashFilter} onChange={e=>setDashFilter(e.target.value)} style={{
                    height:24,padding:'0 6px',fontSize:11,border:`1px solid ${C.border}`,
                    borderRadius:4,background:'#fff',color:C.text,cursor:'pointer',outline:'none',
                  }}>
                    <option value="all">All</option>
                    <option value="over">At Risk</option>
                    <option value="under">Under</option>
                    <option value="ok">Healthy</option>
                  </select>
                  <select value={dashSort} onChange={e=>setDashSort(e.target.value)} style={{
                    height:24,padding:'0 6px',fontSize:11,border:`1px solid ${C.border}`,
                    borderRadius:4,background:'#fff',color:C.text,cursor:'pointer',outline:'none',
                  }}>
                    <option value="util-desc">Sort: Highest util</option>
                    <option value="util-asc">Sort: Lowest util</option>
                    <option value="billable-desc">Sort: Most billable</option>
                    <option value="avail-desc">Sort: Most available</option>
                  </select>
                </div>
              </div>

              {/* Column labels */}
              <div style={{
                display:'grid',gridTemplateColumns:'160px 1fr 52px 80px',
                padding:'6px 16px',borderBottom:`1px solid ${C.border}`,
                background:C.headerBg,gap:12,
              }}>
                {['Name','',  'Util %',''].map((h,i)=>(
                  <span key={i} style={{fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',color:C.faint,textAlign:i===2?'right':'left'}}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {dashMembers.length===0&&(
                <div style={{padding:40,textAlign:'center',color:C.faint,fontSize:13}}>No members match filter</div>
              )}
              {dashMembers.map((m,i)=>{
                const isOver=m.risk==='Over';
                const isUnder=m.risk==='Under';
                return(
                  <div key={i} style={{
                    display:'grid',gridTemplateColumns:'160px 1fr 52px 80px',
                    padding:'8px 16px',gap:12,alignItems:'center',
                    borderBottom:`1px solid ${C.border}`,
                    background:isOver?'#FFF8F8':isUnder?'#F8FBFF':i%2===1?C.rowAlt:'#fff',
                    transition:'background 0.1s',
                  }}>
                    {/* Name */}
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:C.text,lineHeight:'1.2'}}>{m.name}</div>
                      <div style={{fontSize:10,color:C.faint,marginTop:1}}>
                        {m.isCDS?'CDS':'TAS'}
                        {m.ooo>0&&<> · {m.ooo.toFixed(0)}h OOO</>}
                      </div>
                    </div>
                    {/* Bar */}
                    <CapacityBar
                      billable={m.billable} internal={m.internal}
                      ooo={m.ooo} avail={Math.max(0,m.avail)}
                      total={Math.max(40*Math.max(selWeeks.length,1), m.total)}
                    />
                    {/* Util % */}
                    <div style={{
                      fontSize:13,fontWeight:700,textAlign:'right',
                      color:isOver?C.burn:isUnder?C.under:C.healthy,
                      fontVariantNumeric:'tabular-nums',
                    }}>
                      {m.util.toFixed(0)}%
                    </div>
                    {/* Status */}
                    <RiskPill level={m.risk}/>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: CLIENT HOURS CHART */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>

              {/* Billable hours by client */}
              <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:`1px solid ${C.border}`,background:C.headerBg}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>Billable Hours by Client</span>
                </div>
                <div style={{padding:'12px 8px 8px'}}>
                  <ResponsiveContainer width="100%" height={clientHours.length*34+20}>
                    <BarChart
                      data={clientHours}
                      layout="vertical"
                      margin={{top:0,right:50,bottom:0,left:8}}
                      barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke={C.border}/>
                      <XAxis type="number" tick={{fontSize:10,fill:C.faint}} tickLine={false} axisLine={false}/>
                      <YAxis type="category" dataKey="client" tick={{fontSize:12,fill:C.text}} tickLine={false} axisLine={false} width={80}/>
                      <Tooltip
                        formatter={v=>[`${v}h`,'Billable hours']}
                        contentStyle={{fontSize:12,border:`1px solid ${C.border}`,borderRadius:6,boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}
                        cursor={{fill:C.avail}}/>
                      <Bar dataKey="hrs" radius={[0,3,3,0]} maxBarSize={18}>
                        {clientHours.map((_,i)=><Cell key={i} fill={C.billable} fillOpacity={0.75+0.25*(1-i/clientHours.length)}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:`1px solid ${C.border}`,background:C.headerBg}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>This Period</span>
                </div>
                <div style={{padding:12,display:'flex',flexDirection:'column',gap:1}}>
                  {[
                    {label:'Billable hours',    val:`${stats.tB.toFixed(0)}h`,  color:C.billable},
                    {label:'Internal / BD',     val:`${stats.tI.toFixed(0)}h`,  color:C.internal},
                    {label:'OOO (Holiday/Vac)', val:`${stats.tO.toFixed(0)}h`,  color:C.faint},
                    {label:'Team bandwidth',    val:`${Math.max(0,stats.tA).toFixed(0)}h`, color:C.under},
                    {label:'Avg utilization',   val:`${stats.avgU.toFixed(0)}%`,color:stats.avgU>=95?C.burn:stats.avgU<60?C.under:C.healthy},
                    {label:'At burnout risk',   val:`${stats.atRisk} people`,   color:stats.atRisk>0?C.burn:C.faint},
                    {label:'Underutilized',     val:`${stats.under} people`,    color:stats.under>0?C.under:C.faint},
                  ].map((r,i)=>(
                    <div key={i} style={{
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                      padding:'5px 4px',borderBottom:i<6?`1px solid ${C.border}`:'none',
                    }}>
                      <span style={{fontSize:12,color:C.muted}}>{r.label}</span>
                      <span style={{fontSize:13,fontWeight:700,color:r.color,fontVariantNumeric:'tabular-nums'}}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────
            PROJECTS TAB  — flat spreadsheet-style report
        ───────────────────────────── */}
        {tab==='projects'&&(
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>

            {/* ── Toolbar ── */}
            <div style={{
              display:'flex',alignItems:'center',flexWrap:'wrap',gap:8,
              padding:'10px 16px',borderBottom:`2px solid ${C.border}`,background:C.headerBg,
            }}>
              {/* Search */}
              <div style={{position:'relative',flex:'0 0 240px'}}>
                <Search size={13} color={C.faint} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                <input value={projSearch} onChange={e=>setProjSearch(e.target.value)}
                  placeholder="Search project name…"
                  style={{width:'100%',height:30,paddingLeft:30,paddingRight:24,fontSize:12,
                    border:`1px solid ${C.border}`,borderRadius:4,background:'#fff',
                    color:C.text,outline:'none',boxSizing:'border-box'}}/>
                {projSearch&&(
                  <button onClick={()=>setProjSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',cursor:'pointer',color:C.faint,fontSize:14,lineHeight:1,padding:0}}>×</button>
                )}
              </div>

              {/* Client filter */}
              <select value={projClientFilter} onChange={e=>setProjClientFilter(e.target.value)} style={{
                height:30,padding:'0 8px',fontSize:12,border:`1px solid ${C.border}`,
                borderRadius:4,background:'#fff',color:projClientFilter!=='all'?C.text:C.muted,
                cursor:'pointer',outline:'none',minWidth:130,
              }}>
                <option value="all">All clients</option>
                {allClients.map(c=><option key={c} value={c}>{c}</option>)}
              </select>

              {/* Type filter */}
              <select value={projFilter} onChange={e=>setProjFilter(e.target.value)} style={{
                height:30,padding:'0 8px',fontSize:12,border:`1px solid ${C.border}`,
                borderRadius:4,background:'#fff',color:projFilter!=='all'?C.text:C.muted,
                cursor:'pointer',outline:'none',
              }}>
                <option value="all">All types</option>
                <option value="billable">Billable</option>
                <option value="internal-bd">Internal / BD</option>
              </select>

              {/* Active filter chips */}
              {(projClientFilter!=='all'||projFilter!=='all'||projSearch)&&(
                <button onClick={()=>{setProjClientFilter('all');setProjFilter('all');setProjSearch('');}}
                  style={{height:30,padding:'0 10px',fontSize:11,fontWeight:600,color:C.burn,
                    border:`1px solid #FECACA`,borderRadius:4,background:'#FEF2F2',cursor:'pointer'}}>
                  Clear filters
                </button>
              )}

              <span style={{marginLeft:'auto',fontSize:11,color:C.faint,whiteSpace:'nowrap'}}>
                {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects &nbsp;·&nbsp; {clientGroups.length} clients
              </span>
            </div>

            {/* ── Table ── */}
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:`2px solid #CBD5E1`}}>
                    <Th style={{width:160,paddingLeft:16}}>Client</Th>
                    <Th onClick={()=>togglePS('name')} sort={arr(projSort,'name')}>Project</Th>
                    <Th right onClick={()=>togglePS('hours')} sort={arr(projSort,'hours')}>Hours</Th>
                    <Th right>% of Billable</Th>
                    <Th>Type</Th>
                    <Th>Team members</Th>
                  </tr>
                </thead>
                <tbody>
                  {clientGroups.length===0&&(
                    <tr>
                      <td colSpan={6} style={{padding:'48px 16px',textAlign:'center',color:C.faint,fontSize:13}}>
                        No projects match your filters
                      </td>
                    </tr>
                  )}

                  {clientGroups.map((cg,ci)=>{
                    const isCollapsed=collapsed[cg.client];
                    const hasBillable=cg.projs.some(p=>p.cat==='Billable');
                    // subtle client accent color — cycles through a small palette
                    const accentColors=['#2563EB','#7C3AED','#0891B2','#0D9488','#D97706','#DC2626','#6366F1','#059669'];
                    const accent=accentColors[ci%accentColors.length];

                    return(
                      <React.Fragment key={ci}>

                        {/* ── CLIENT HEADER ROW ── */}
                        <tr
                          onClick={()=>setCollapsed(p=>({...p,[cg.client]:!p[cg.client]}))}
                          style={{
                            cursor:'pointer',
                            background:'#F8FAFC',
                            borderTop: ci===0?`1px solid ${C.border}`:`2px solid #CBD5E1`,
                            borderBottom:`1px solid ${C.border}`,
                          }}>
                          {/* Client name with color indicator */}
                          <td style={{padding:'10px 16px',paddingLeft:14}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:3,height:18,borderRadius:2,background:accent,flexShrink:0}}/>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                {isCollapsed
                                  ?<ChevronRight size={13} color={C.muted}/>
                                  :<ChevronDown  size={13} color={C.muted}/>}
                                <span style={{fontSize:13,fontWeight:700,color:C.text,letterSpacing:'-0.01em'}}>{cg.client}</span>
                              </div>
                            </div>
                          </td>
                          {/* Project count */}
                          <td style={{padding:'10px 12px',fontSize:12,color:C.faint}}>
                            {cg.projs.length} project{cg.projs.length!==1?'s':''}
                          </td>
                          {/* Total hours */}
                          <td style={{padding:'10px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:C.text,fontVariantNumeric:'tabular-nums'}}>
                            {cg.total.toFixed(1)}
                          </td>
                          {/* % billable */}
                          <td style={{padding:'10px 12px',textAlign:'right',fontSize:12,color:C.muted,fontVariantNumeric:'tabular-nums'}}>
                            {hasBillable?`${Math.round((cg.total/totalBillableHrs)*100)}%`:'—'}
                          </td>
                          <td colSpan={2} style={{padding:'10px 12px'}}>
                            {/* inline hours bar for the client total */}
                            <div style={{width:160,height:4,background:C.avail,borderRadius:2,overflow:'hidden'}}>
                              <div style={{
                                height:4,borderRadius:2,
                                width:`${Math.min(100,Math.round((cg.total/Math.max(...clientGroups.map(g=>g.total)))*100))}%`,
                                background:accent,opacity:0.7,
                              }}/>
                            </div>
                          </td>
                        </tr>

                        {/* ── PROJECT ROWS ── */}
                        {!isCollapsed&&cg.projs.map((p,pi)=>{
                          const mems=Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                          const isBillable=p.cat==='Billable';
                          // plain comma-separated member list: "Sean (16h), Brandon (5h)"
                          const memberText=mems.map(([n,h])=>`${n.split(' ')[0]} (${h.toFixed(0)}h)`).join('  ·  ');
                          const isLastRow=pi===cg.projs.length-1;

                          return(
                            <tr key={pi} style={{
                              background: pi%2===0?'#fff':'#FAFBFC',
                              borderBottom: isLastRow?`1px solid ${C.border}`:`1px solid #F1F5F9`,
                              borderLeft:`3px solid ${pi===0?accent:'transparent'}`,
                            }}>
                              {/* Client column — blank after first row, thin left rule */}
                              <td style={{
                                padding:'9px 12px',paddingLeft:pi===0?13:16,
                                fontSize:11,color:C.faint,
                                borderLeft:`3px solid ${accent}`,
                                background: pi%2===0?'#fff':'#FAFBFC',
                              }}>
                                {pi===0?'':<span style={{opacity:0}}>{cg.client}</span>}
                              </td>

                              {/* Project name */}
                              <td style={{padding:'9px 12px',paddingLeft:20,fontSize:13,color:C.text,maxWidth:360}}>
                                <span style={{fontWeight:450}}>{p.name}</span>
                              </td>

                              {/* Hours */}
                              <td style={{padding:'9px 12px',textAlign:'right',fontWeight:600,fontSize:13,color:C.text,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>
                                {p.hrs.toFixed(1)}
                              </td>

                              {/* % of billable */}
                              <td style={{padding:'9px 12px',textAlign:'right',fontSize:12,color:C.faint,fontVariantNumeric:'tabular-nums'}}>
                                {isBillable&&totalBillableHrs>0?`${Math.round((p.hrs/totalBillableHrs)*100)}%`:'—'}
                              </td>

                              {/* Type — text only, no badge */}
                              <td style={{padding:'9px 12px',fontSize:12,color:isBillable?C.billable:C.internal,fontWeight:500,whiteSpace:'nowrap'}}>
                                {p.cat}
                              </td>

                              {/* Members — plain dot-separated text */}
                              <td style={{padding:'9px 12px',fontSize:12,color:C.muted,maxWidth:420}}>
                                {memberText}
                              </td>
                            </tr>
                          );
                        })}

                      </React.Fragment>
                    );
                  })}

                  {/* ── GRAND TOTAL ROW ── */}
                  {clientGroups.length>0&&(
                    <tr style={{background:C.headerBg,borderTop:`2px solid #CBD5E1`}}>
                      <td style={{padding:'10px 16px',fontSize:12,fontWeight:700,color:C.text}} colSpan={2}>
                        Total — {clientGroups.length} clients, {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects
                      </td>
                      <td style={{padding:'10px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:C.text,fontVariantNumeric:'tabular-nums'}}>
                        {clientGroups.reduce((s,g)=>s+g.total,0).toFixed(1)}
                      </td>
                      <td style={{padding:'10px 12px',textAlign:'right',fontSize:12,fontWeight:600,color:C.muted}}>100%</td>
                      <td colSpan={2}/>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────
            TEAM TAB
        ───────────────────────────── */}
        {tab==='team'&&(
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
            <div style={{
              display:'flex',alignItems:'center',gap:10,
              padding:'8px 16px',borderBottom:`1px solid ${C.border}`,background:C.headerBg,
            }}>
              <div style={{position:'relative',flex:'0 0 220px'}}>
                <Search size={13} color={C.faint} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                <input value={teamSearch} onChange={e=>setTeamSearch(e.target.value)}
                  placeholder="Search by name…"
                  style={{width:'100%',height:30,paddingLeft:30,paddingRight:8,fontSize:12,border:`1px solid ${C.border}`,borderRadius:5,background:'#fff',color:C.text,outline:'none',boxSizing:'border-box'}}/>
              </div>
              <span style={{marginLeft:'auto',fontSize:11,color:C.faint}}>{sortedTeam.length} members</span>
            </div>

            <div style={{overflowX:'auto'}}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <Th onClick={()=>toggleTS('name')}     sort={arr(teamSort,'name')}>Name</Th>
                    <Th>Team</Th>
                    <Th right onClick={()=>toggleTS('billable')}  sort={arr(teamSort,'billable')}>Billable</Th>
                    <Th right onClick={()=>toggleTS('internal')}  sort={arr(teamSort,'internal')}>Internal/BD</Th>
                    <Th right onClick={()=>toggleTS('ooo')}       sort={arr(teamSort,'ooo')}>OOO</Th>
                    <Th right onClick={()=>toggleTS('utilized')}  sort={arr(teamSort,'utilized')}>Utilized</Th>
                    <Th right onClick={()=>toggleTS('avail')}     sort={arr(teamSort,'avail')}>Available</Th>
                    <Th onClick={()=>toggleTS('util')}     sort={arr(teamSort,'util')}>Utilization</Th>
                    <Th>Status</Th>
                    <Th right>Projects</Th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeam.map((m,i)=>{
                    const isOpen=openMember===m.name;
                    const projs=Object.entries(m.jobs).filter(([jc])=>catOf(jc)!=='OOO').sort(([,a],[,b])=>b-a);
                    return(
                      <React.Fragment key={i}>
                        <tr
                          onClick={()=>setOpenMember(isOpen?null:m.name)}
                          style={{
                            ...trStyle(i,m.risk),
                            cursor:'pointer',
                            background:isOpen?'#EFF6FF':m.risk==='Over'?'#FFF8F8':m.risk==='Under'?'#F8FBFF':i%2===1?C.rowAlt:'#fff',
                          }}>
                          <td style={{padding:'9px 12px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              {isOpen?<ChevronDown size={13} color={C.muted}/>:<ChevronRight size={13} color={C.muted}/>}
                              <span style={{fontSize:13,fontWeight:500,color:C.text}}>{m.name}</span>
                            </div>
                          </td>
                          <Td>
                            <span style={{
                              fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:3,
                              background:m.isCDS?'#EDE9FE':'#DBEAFE',
                              color:m.isCDS?C.internal:C.under,
                            }}>
                              {m.isCDS?'CDS':'TAS'}
                            </span>
                          </Td>
                          <Td right>{m.billable.toFixed(1)}</Td>
                          <Td right>{m.internal.toFixed(1)}</Td>
                          <Td right muted>{m.ooo.toFixed(1)}</Td>
                          <Td right bold>{m.utilized.toFixed(1)}</Td>
                          <td style={{
                            padding:'9px 12px',textAlign:'right',fontSize:13,
                            fontWeight:700,fontVariantNumeric:'tabular-nums',
                            color:m.avail<0?C.burn:m.avail<8?'#D97706':C.text,
                          }}>
                            {m.avail.toFixed(1)}
                          </td>
                          {/* Util bar */}
                          <td style={{padding:'9px 12px',minWidth:160}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{flex:1,height:6,background:C.avail,borderRadius:3,overflow:'hidden'}}>
                                <div style={{
                                  height:6,borderRadius:3,
                                  width:`${Math.min(m.util,100)}%`,
                                  background:m.risk==='Over'?C.burn:m.risk==='Under'?C.under:C.billable,
                                }}/>
                              </div>
                              <span style={{
                                fontSize:12,fontWeight:700,color:m.risk==='Over'?C.burn:m.risk==='Under'?C.under:C.healthy,
                                fontVariantNumeric:'tabular-nums',minWidth:32,textAlign:'right',
                              }}>
                                {m.util.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td style={{padding:'9px 12px'}}><RiskPill level={m.risk}/></td>
                          <td style={{padding:'9px 12px',textAlign:'right',fontSize:13,color:C.faint}}>
                            {projs.length}
                          </td>
                        </tr>

                        {/* Expanded breakdown */}
                        {isOpen&&(
                          <tr style={{borderBottom:`1px solid ${C.border}`}}>
                            <td colSpan={10} style={{padding:'0 12px 12px',background:'#F0F7FF'}}>
                              <div style={{marginLeft:24,marginTop:8,maxWidth:500}}>
                                <table style={{...tableStyle,fontSize:12}}>
                                  <thead>
                                    <tr style={{borderBottom:`1px solid ${C.border}`}}>
                                      <th style={{padding:'4px 8px',textAlign:'left',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',color:C.faint}}>Project</th>
                                      <th style={{padding:'4px 8px',textAlign:'right',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',color:C.faint}}>Hours</th>
                                      <th style={{padding:'4px 8px',textAlign:'right',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',color:C.faint}}>% of util</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {projs.map(([jc,hrs],j)=>(
                                      <tr key={j} style={{borderBottom:j<projs.length-1?`1px solid ${C.border}`:'none'}}>
                                        <td style={{padding:'5px 8px',color:C.text}}>{jc}</td>
                                        <td style={{padding:'5px 8px',textAlign:'right',fontWeight:600,color:C.text,fontVariantNumeric:'tabular-nums'}}>{hrs.toFixed(1)}</td>
                                        <td style={{padding:'5px 8px',textAlign:'right',color:C.faint,fontVariantNumeric:'tabular-nums'}}>{m.utilized>0?Math.round((hrs/m.utilized)*100):0}%</td>
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
                  <tr style={{background:C.headerBg,borderTop:`2px solid ${C.border}`}}>
                    <td style={{padding:'9px 12px',fontSize:13,fontWeight:700,color:C.text}} colSpan={2}>Total</td>
                    <Td right bold>{stats.tB.toFixed(1)}</Td>
                    <Td right bold>{stats.tI.toFixed(1)}</Td>
                    <Td right muted>{stats.tO.toFixed(1)}</Td>
                    <Td right bold>{stats.tU.toFixed(1)}</Td>
                    <td style={{padding:'9px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:stats.tA<0?C.burn:C.text,fontVariantNumeric:'tabular-nums'}}>
                      {stats.tA.toFixed(1)}
                    </td>
                    <td style={{padding:'9px 12px',minWidth:160}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{flex:1,height:6,background:C.avail,borderRadius:3,overflow:'hidden'}}>
                          <div style={{height:6,borderRadius:3,width:`${Math.min(stats.avgU,100)}%`,background:stats.avgU>=95?C.burn:stats.avgU<60?C.under:C.billable}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:C.text,fontVariantNumeric:'tabular-nums',minWidth:32,textAlign:'right'}}>
                          {stats.avgU.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td colSpan={2}/>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─────────────────────────────
            EXCEPTIONS TAB
        ───────────────────────────── */}
        {tab==='exceptions'&&(
          <div style={{background:'#fff',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>Issue</Th>
                  <Th>Team Member</Th>
                  <Th>Details</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {Object.values(members).filter(m=>m.avail<0).map((m,i)=>(
                  <tr key={`o${i}`} style={{...trStyle(i),background:'#FFF5F5',borderLeft:`3px solid ${C.burn}`}}>
                    <td style={{padding:'9px 12px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:3,background:'#FEE2E2',color:C.burn}}>Overallocated</span>
                    </td>
                    <td style={{padding:'9px 12px',fontSize:13,fontWeight:500,color:C.text}}>{m.name}</td>
                    <td style={{padding:'9px 12px',fontSize:13,color:C.muted}}>
                      {Math.abs(m.avail).toFixed(1)}h over capacity · {m.util.toFixed(0)}% utilized
                    </td>
                    <td style={{padding:'9px 12px',fontSize:13,fontWeight:600,color:C.burn}}>Rebalance work</td>
                  </tr>
                ))}
                {Object.values(members).filter(m=>m.total>0&&m.total<20).map((m,i)=>(
                  <tr key={`l${i}`} style={{...trStyle(i),background:'#FFFBEB',borderLeft:'3px solid #D97706'}}>
                    <td style={{padding:'9px 12px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:3,background:'#FEF3C7',color:'#B45309'}}>Low Hours</span>
                    </td>
                    <td style={{padding:'9px 12px',fontSize:13,fontWeight:500,color:C.text}}>{m.name}</td>
                    <td style={{padding:'9px 12px',fontSize:13,color:C.muted}}>Only {m.total.toFixed(1)}h logged</td>
                    <td style={{padding:'9px 12px',fontSize:13,fontWeight:600,color:'#B45309'}}>Review entry</td>
                  </tr>
                ))}
                {Object.values(members).filter(m=>m.avail<0||m.total<20).length===0&&(
                  <tr><td colSpan={4} style={{padding:40,textAlign:'center',fontSize:13,color:C.faint}}>
                    No exceptions this period 🎉
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
