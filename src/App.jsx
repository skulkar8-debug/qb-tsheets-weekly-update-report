import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, FolderOpen, Users, AlertTriangle, Calendar, Search, RefreshCw, AlertCircle, ChevronDown, ChevronRight, X, ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─────────────────────────────────────────────────────────
// SHEET CONFIG
// ─────────────────────────────────────────────────────────
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv';

const CDS_TEAM = new Set(['Mohit Sharma','Rakesh Nayak','Sharvan Pandey','Stefan Joseph','Jogendra Singh','Ramya D','Vaishnav Govind']);

// ─────────────────────────────────────────────────────────
// STOC DESIGN TOKENS  — drawn from stocadvisory.com palette
// ─────────────────────────────────────────────────────────
const STOC = {
  navy:     '#041E42',
  navyMid:  '#0A2447',
  navyLight:'#14305c',
  indigo:   '#3B3F75',
  blue:     '#1474C4',
  blueHov:  '#0e5fa3',
  sky:      '#B8C9E6',
  cloud:    '#F2F5FA',
  border:   '#E1E7F0',
  borderMid:'#C8D4E5',
  white:    '#FFFFFF',
  ink:      '#0A2447',
  slate:    '#475569',
  slateL:   '#64748B',
  muted:    '#94A3B8',
  // status
  green:    '#15803D',
  greenBg:  '#F0FDF4',
  red:      '#DC2626',
  redBg:    '#FEF2F2',
  amber:    '#B45309',
  amberBg:  '#FFFBEB',
  // sidebar
  sideW:    220,
};

// ─────────────────────────────────────────────────────────
// CLIENT COLOR PALETTE  — 10 distinct, professional
// ─────────────────────────────────────────────────────────
const CLIENT_COLORS = {
  'AEG':                  { bg:'#1474C4', text:'#fff', light:'#EBF4FB', border:'#1474C4' },
  'SALT':                 { bg:'#0D7377', text:'#fff', light:'#E6F4F4', border:'#0D7377' },
  'ADP':                  { bg:'#6D28D9', text:'#fff', light:'#F5F3FF', border:'#6D28D9' },
  'SP USA':               { bg:'#B45309', text:'#fff', light:'#FFFBEB', border:'#B45309' },
  'CPC':                  { bg:'#0369A1', text:'#fff', light:'#E0F2FE', border:'#0369A1' },
  'Riata':                { bg:'#065F46', text:'#fff', light:'#ECFDF5', border:'#065F46' },
  'Beacon':               { bg:'#7C3AED', text:'#fff', light:'#F5F3FF', border:'#7C3AED' },
  'Archway':              { bg:'#9D174D', text:'#fff', light:'#FDF2F8', border:'#9D174D' },
  'Budget':               { bg:'#92400E', text:'#fff', light:'#FEF3C7', border:'#92400E' },
  'Administrative':       { bg:'#475569', text:'#fff', light:'#F8FAFC', border:'#475569' },
  'Business Development': { bg:'#334155', text:'#fff', light:'#F8FAFC', border:'#334155' },
  'CDS Internal':         { bg:'#1E40AF', text:'#fff', light:'#EFF6FF', border:'#1E40AF' },
  'Other':                { bg:'#6B7280', text:'#fff', light:'#F9FAFB', border:'#6B7280' },
};
const getClientColor = (c) => CLIENT_COLORS[c] || CLIENT_COLORS['Other'];

// ─────────────────────────────────────────────────────────
// DATA HELPERS
// ─────────────────────────────────────────────────────────
const normalizeClient = j => {
  if (!j) return 'Other';
  const t = j.trim();
  if (/^(holiday|vacation|sick)$/i.test(t))       return 'OOO';
  if (/^administrative$/i.test(t))                 return 'Administrative';
  if (/^business development/i.test(t))            return 'Business Development';
  if (/^cds\b/i.test(t) || /tableau/i.test(t))     return 'CDS Internal';
  if (/^AEG(\s|[-–]|$)/i.test(t))                 return 'AEG';
  if (/^SALT(\s|[-–]|$)/i.test(t))                return 'SALT';
  if (/^ADP(\s|[-–]|$)/i.test(t))                 return 'ADP';
  if (/^(SP\s*USA|SPUSA)(\s|[-–]|$)/i.test(t))    return 'SP USA';
  if (/^CPC(\s|[-–]|$)/i.test(t))                 return 'CPC';
  if (/^RIATA(\s|[-–]|$)/i.test(t))               return 'Riata';
  if (/^BEACON/i.test(t))                          return 'Beacon';
  if (/^ARCHWAY/i.test(t))                         return 'Archway';
  if (/^BUDGET/i.test(t))                          return 'Budget';
  const m = t.match(/^(.+?)\s*[-–]\s*/);
  return m ? m[1].trim() : t;
};
const catOf = j => {
  if (!j) return 'Billable';
  const t = j.trim();
  if (/^(holiday|vacation|sick)$/i.test(t)) return 'OOO';
  if (/^administrative$/i.test(t) || /^business development/i.test(t) || /^cds\b/i.test(t) || /tableau/i.test(t)) return 'Internal/BD';
  return 'Billable';
};
const parseCSV = text => {
  const clean = text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const lines = clean.split('\n').filter(l=>l.trim());
  if (lines.length < 2) return [];
  const pl = line => {
    const r=[]; let cur='',q=false;
    for (let i=0;i<line.length;i++) {
      const c=line[i];
      if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}
      else if(c===','&&!q){r.push(cur.trim());cur='';}
      else cur+=c;
    }
    return r.push(cur.trim()),r;
  };
  const hdrs=pl(lines[0]).map(h=>h.toLowerCase().replace(/\s+/g,'_'));
  return lines.slice(1).map(line=>{const v=pl(line),row={};hdrs.forEach((h,i)=>{row[h]=v[i]??'';});return row;})
    .filter(r=>r.fname||r.lname||r.username);
};
const detectWeeks = rows => {
  const m={};
  rows.forEach(r=>{
    const d=new Date(r.local_date);if(isNaN(d))return;
    const diff=(d.getDay()||7)-1;
    const mon=new Date(d);mon.setDate(d.getDate()-diff);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    const fmt=dt=>dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const key=mon.toISOString().slice(0,10);
    if(!m[key]) m[key]={key,label:`${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`,mon,sun};
  });
  return Object.values(m).sort((a,b)=>b.key.localeCompare(a.key));
};
const riskOf=u=>u>=95?'Over':u<60?'Under':'OK';
const pctFmt=(n,d)=>{ if(!d||d===0) return '—'; const p=(n/d)*100; return p<1?'<1%':`${Math.round(p)}%`; };

// ─────────────────────────────────────────────────────────
// SMALL UI HELPERS
// ─────────────────────────────────────────────────────────
const RiskChip = ({r}) => {
  const s = r==='Over'  ? {bg:'#FEE2E2',color:'#991B1B',label:'At risk'}
           : r==='Under' ? {bg:'#DBEAFE',color:'#1E40AF',label:'Under'}
           :               {bg:'#DCFCE7',color:'#166534',label:'Healthy'};
  return <span style={{display:'inline-block',padding:'1px 7px',borderRadius:3,fontSize:11,fontWeight:600,background:s.bg,color:s.color,letterSpacing:'.02em'}}>{s.label}</span>;
};

const ClientTag = ({client, size='sm'}) => {
  const cc = getClientColor(client);
  const fs = size==='sm' ? 10 : 11;
  return (
    <span style={{display:'inline-block',padding:'1px 6px',borderRadius:3,fontSize:fs,fontWeight:700,
      background:cc.bg,color:cc.text,letterSpacing:'.03em',whiteSpace:'nowrap'}}>
      {client}
    </span>
  );
};

// Stacked capacity bar for dashboard
const CapBar = ({billable,internal,ooo,avail,cap,height=14}) => {
  const [tip,setTip]=useState(null);
  const total=Math.max(cap,billable+internal+ooo);
  const segs=[
    {k:'Billable',    v:billable, c:'#1474C4'},
    {k:'Internal/BD', v:internal, c:'#6D28D9'},
    {k:'OOO',         v:ooo,      c:'#94A3B8'},
    {k:'Available',   v:Math.max(0,avail), c:'#E1E7F0'},
  ];
  const isOver=(billable+internal)>cap;
  return(
    <div style={{position:'relative',flex:1,minWidth:0}}>
      <div style={{display:'flex',height,borderRadius:2,overflow:'hidden',border:`1px solid ${isOver?STOC.red:STOC.border}`}}>
        {segs.map(s=>s.v>0&&(
          <div key={s.k} style={{width:`${Math.min((s.v/total)*100,100)}%`,background:s.c,cursor:'default',flexShrink:0}}
            onMouseEnter={e=>setTip({label:s.k,value:s.v})} onMouseLeave={()=>setTip(null)}/>
        ))}
      </div>
      {tip&&<div style={{position:'absolute',bottom:'calc(100% + 4px)',left:'50%',transform:'translateX(-50%)',
        background:STOC.navy,color:'#fff',padding:'3px 8px',borderRadius:3,fontSize:11,whiteSpace:'nowrap',zIndex:99,pointerEvents:'none'}}>
        {tip.label}: {tip.value.toFixed(1)}h
      </div>}
    </div>
  );
};

// Utilization heat cell — for Gantt grid
const HeatCell = ({util, label}) => {
  const bg = util===null ? STOC.cloud
           : util>=95    ? '#FCA5A5'
           : util>=75    ? '#93C5FD'
           : util>=60    ? '#86EFAC'
           : util>0      ? '#E2E8F0'
           :                '#F8FAFC';
  const color = util===null ? STOC.muted
              : util>=95    ? '#7F1D1D'
              : util>=75    ? '#1E3A8A'
              : util>=60    ? '#14532D'
              : util>0      ? STOC.slate
              :               STOC.muted;
  const txt = util===null ? '' : util>=95 ? `${Math.round(util)}%` : `${Math.round(util)}%`;
  return(
    <div style={{background:bg,color,fontSize:10,fontWeight:700,textAlign:'center',
      padding:'5px 2px',borderRadius:2,border:`1px solid ${STOC.border}`,
      display:'flex',alignItems:'center',justifyContent:'center',
      minHeight:28,fontVariantNumeric:'tabular-nums',letterSpacing:'.02em'}}>
      {txt||<span style={{color:STOC.muted,fontWeight:400,fontSize:9}}>—</span>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────
export default function App() {
  const [rows,       setRows]      = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState(null);
  const [updatedAt,  setUpdatedAt] = useState(null);

  const [page,       setPage]      = useState('dashboard');
  const [teamF,      setTeamF]     = useState('all');
  const [selWeeks,   setSelWeeks]  = useState([]);
  const [weekDD,     setWeekDD]    = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);

  // Projects filters
  const [pSearch,   setPSearch]    = useState('');
  const [pClient,   setPClient]    = useState('all');
  const [pType,     setPType]      = useState('all');
  const [pSort,     setPSort]      = useState({k:'hours',d:'desc'});
  const [collapsed, setCollapsed]  = useState({});

  // Team filters
  const [tSearch,   setTSearch]    = useState('');
  const [tSort,     setTSort]      = useState({k:'util',d:'desc'});
  const [openRow,   setOpenRow]    = useState(null);

  // ── FETCH ──
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res=await fetch(SHEET_URL);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=parseCSV(await res.text());
      if(!data.length) throw new Error('No rows. Is the sheet publicly shared?');
      setRows(data);
      setUpdatedAt(new Date());
      const w=detectWeeks(data);
      if(w.length) setSelWeeks([w[0].key]);
    } catch(e){setError(e.message);}
    finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
  useEffect(()=>{
    const h=e=>{if(!e.target.closest('.wdd'))setWeekDD(false);};
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[]);

  const weeks=useMemo(()=>detectWeeks(rows),[rows]);

  const weekRows=useMemo(()=>{
    if(!selWeeks.length) return rows;
    return rows.filter(r=>{
      const d=new Date(r.local_date);if(isNaN(d))return false;
      const diff=(d.getDay()||7)-1;
      const mon=new Date(d);mon.setDate(d.getDate()-diff);
      return selWeeks.includes(mon.toISOString().slice(0,10));
    });
  },[rows,selWeeks]);

  // ── AGGREGATE ──
  const {members,projectsMap}=useMemo(()=>{
    const tm={},pm={};
    const nW=Math.max(selWeeks.length,1);
    weekRows.forEach(r=>{
      const name=`${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs=parseFloat(r.hours)||0;
      const jc=(r.jobcode||'').trim();
      if(!name||!hrs||!jc) return;
      const cat=catOf(jc),client=normalizeClient(jc),isCDS=CDS_TEAM.has(name);
      if(teamF==='cds'&&!isCDS) return;
      if(teamF==='tas'&& isCDS) return;
      if(!tm[name]) tm[name]={name,isCDS,total:0,billable:0,ooo:0,internal:0,utilized:0,jobs:{}};
      tm[name].total+=hrs;
      if(cat==='OOO')         {tm[name].ooo+=hrs;}
      else if(cat==='Internal/BD'){tm[name].internal+=hrs;tm[name].utilized+=hrs;}
      else                    {tm[name].billable+=hrs;tm[name].utilized+=hrs;}
      tm[name].jobs[jc]=(tm[name].jobs[jc]||0)+hrs;
      if(cat==='OOO') return;
      if(!pm[jc]) pm[jc]={name:jc,cat,client,hrs:0,mems:{}};
      pm[jc].hrs+=hrs; pm[jc].mems[name]=(pm[jc].mems[name]||0)+hrs;
    });
    Object.values(tm).forEach(m=>{
      m.effCap=40*nW-m.ooo;
      m.avail =m.effCap-m.utilized;
      m.util  =m.effCap>0?(m.utilized/m.effCap)*100:0;
      m.risk  =riskOf(m.util);
    });
    return{members:tm,projectsMap:pm};
  },[weekRows,teamF,selWeeks]);

  const S=useMemo(()=>{
    const ms=Object.values(members);
    const tC=ms.reduce((s,m)=>s+m.effCap,0);
    const tU=ms.reduce((s,m)=>s+m.utilized,0);
    return{n:ms.length,tB:ms.reduce((s,m)=>s+m.billable,0),tI:ms.reduce((s,m)=>s+m.internal,0),
      tO:ms.reduce((s,m)=>s+m.ooo,0),tU,tC,tA:ms.reduce((s,m)=>s+m.avail,0),
      avgU:tC>0?(tU/tC)*100:0,nOver:ms.filter(m=>m.risk==='Over').length,nUnder:ms.filter(m=>m.risk==='Under').length};
  },[members]);

  const totalBillHrs=useMemo(()=>Object.values(projectsMap).filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0),[projectsMap]);

  const allClients=useMemo(()=>{
    const s=new Set(Object.values(projectsMap).map(p=>p.client));
    return[...[...s].filter(c=>c!=='OOO')].sort();
  },[projectsMap]);

  // ── CLIENT GROUPS — all 5 deps correct ──
  const clientGroups=useMemo(()=>{
    const g={};
    Object.values(projectsMap).forEach(p=>{
      if(pType==='billable'    &&p.cat!=='Billable')    return;
      if(pType==='internal-bd' &&p.cat!=='Internal/BD') return;
      if(pClient!=='all'       &&p.client!==pClient)    return;
      if(pSearch&&!p.name.toLowerCase().includes(pSearch.toLowerCase())&&
         !p.client.toLowerCase().includes(pSearch.toLowerCase())) return;
      if(!g[p.client]) g[p.client]={client:p.client,total:0,projs:[]};
      g[p.client].projs.push(p); g[p.client].total+=p.hrs;
    });
    const dir=pSort.d==='desc'?-1:1;
    Object.values(g).forEach(cg=>cg.projs.sort((a,b)=>pSort.k==='hours'?dir*(b.hrs-a.hrs):dir*b.name.localeCompare(a.name)));
    return Object.values(g).sort((a,b)=>b.total-a.total);
  },[projectsMap,pType,pClient,pSearch,pSort]);

  const sortedTeam=useMemo(()=>{
    let ms=Object.values(members);
    if(tSearch.trim()) ms=ms.filter(m=>m.name.toLowerCase().includes(tSearch.toLowerCase()));
    return ms.sort((a,b)=>{
      const av=a[tSort.k]??a.util,bv=b[tSort.k]??b.util;
      return tSort.d==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  },[members,tSearch,tSort]);

  const clientHours=useMemo(()=>{
    const ch={};
    Object.values(projectsMap).filter(p=>p.cat==='Billable').forEach(p=>{ch[p.client]=(ch[p.client]||0)+p.hrs;});
    return Object.entries(ch).map(([c,h])=>({c,h:parseFloat(h.toFixed(1))})).sort((a,b)=>b.h-a.h).slice(0,10);
  },[projectsMap]);

  // ── GANTT: per-member, per-week util ──
  const ganttData=useMemo(()=>{
    const sortedW=[...weeks].sort((a,b)=>a.key.localeCompare(b.key));
    const allNames=Object.keys(members).sort();
    if(!allNames.length||!sortedW.length) return{names:[],weeks:[],grid:{}};

    // re-aggregate week by week
    const weeklyMem={};
    sortedW.forEach(wk=>{
      weeklyMem[wk.key]={};
      allNames.forEach(n=>{weeklyMem[wk.key][n]={billable:0,internal:0,ooo:0};});
    });
    rows.forEach(r=>{
      const name=`${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs=parseFloat(r.hours)||0;
      const jc=(r.jobcode||'').trim();
      if(!name||!hrs||!jc||!allNames.includes(name)) return;
      const d=new Date(r.local_date);if(isNaN(d))return;
      const diff=(d.getDay()||7)-1;
      const mon=new Date(d);mon.setDate(d.getDate()-diff);
      const wKey=mon.toISOString().slice(0,10);
      if(!weeklyMem[wKey]) return;
      const cat=catOf(jc);
      if(cat==='OOO')          weeklyMem[wKey][name].ooo+=hrs;
      else if(cat==='Internal/BD') weeklyMem[wKey][name].internal+=hrs;
      else                     weeklyMem[wKey][name].billable+=hrs;
    });

    const grid={};
    allNames.forEach(n=>{
      grid[n]={};
      sortedW.forEach(wk=>{
        const d=weeklyMem[wk.key][n]||{billable:0,internal:0,ooo:0};
        const utilized=d.billable+d.internal;
        const effCap=40-d.ooo;
        const util=effCap>0?(utilized/effCap)*100:utilized>0?100:null;
        grid[n][wk.key]={util,utilized,ooo:d.ooo,billable:d.billable,internal:d.internal};
      });
    });
    return{names:allNames,weeks:sortedW,grid};
  },[rows,members,weeks]);

  const tsP=k=>setPSort(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const tsT=k=>setTSort(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const arr=(cfg,k)=>cfg.k===k?(cfg.d==='desc'?'↓':'↑'):'';
  const weekLabel=()=>{
    if(!selWeeks.length||selWeeks.length===weeks.length) return 'All Weeks';
    if(selWeeks.length===1) return weeks.find(w=>w.key===selWeeks[0])?.label||'1 week';
    return `${selWeeks.length} weeks`;
  };
  const toggleWeek=k=>setSelWeeks(p=>p.includes(k)?(p.length===1?p:p.filter(x=>x!==k)):[...p,k]);
  const hasFilters=pClient!=='all'||pType!=='all'||pSearch;
  const SW=sideCollapsed?52:STOC.sideW;

  // ── LOADING / ERROR ──
  const spinKF='@keyframes spin{to{transform:rotate(360deg)}}';
  if(loading) return(
    <div style={{minHeight:'100vh',background:STOC.cloud,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{spinKF}</style>
      <div style={{textAlign:'center'}}>
        <div style={{width:32,height:32,border:`2px solid ${STOC.border}`,borderTopColor:STOC.blue,
          borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 14px'}}/>
        <img src="/logo.png" alt="STOC" style={{height:24,margin:'0 auto 10px',display:'block',opacity:.6}}/>
        <p style={{fontSize:13,color:STOC.slate}}>Loading staffing data…</p>
      </div>
    </div>
  );
  if(error) return(
    <div style={{minHeight:'100vh',background:STOC.cloud,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:STOC.white,border:`1px solid #FECACA`,borderRadius:6,padding:32,maxWidth:400,textAlign:'center'}}>
        <AlertCircle size={28} color={STOC.red} style={{margin:'0 auto 10px'}}/>
        <p style={{fontSize:14,fontWeight:600,color:STOC.ink,marginBottom:6}}>Could not load data</p>
        <p style={{fontSize:12,color:STOC.slate,marginBottom:16}}>{error}</p>
        <button onClick={load} style={{padding:'7px 20px',background:STOC.blue,color:'#fff',border:'none',borderRadius:4,fontSize:12,fontWeight:600,cursor:'pointer'}}>Try again</button>
      </div>
    </div>
  );

  // ── SHARED TABLE STYLES ──
  const tbl={width:'100%',borderCollapse:'collapse',fontSize:13};
  const th=(right,pl,w)=>({padding:'7px 12px',paddingLeft:pl||12,width:w,fontSize:10,fontWeight:700,
    textTransform:'uppercase',letterSpacing:'.06em',color:STOC.muted,background:STOC.cloud,
    borderBottom:`2px solid ${STOC.borderMid}`,textAlign:right?'right':'left',whiteSpace:'nowrap',
    userSelect:'none',cursor:'pointer'});
  const td=(right,bold,muted)=>({padding:'6px 12px',fontSize:13,color:muted?STOC.muted:bold?STOC.ink:STOC.slate,
    fontWeight:bold?600:400,textAlign:right?'right':'left',fontVariantNumeric:'tabular-nums',verticalAlign:'middle',
    borderBottom:`1px solid ${STOC.border}`});

  const NAV=[
    {id:'dashboard',icon:<LayoutDashboard size={16}/>,label:'Dashboard'},
    {id:'projects', icon:<FolderOpen size={16}/>,     label:'Projects'},
    {id:'team',     icon:<Users size={16}/>,           label:'Team'},
    {id:'exceptions',icon:<AlertTriangle size={16}/>,  label:'Exceptions'},
  ];

  // ─────────────────── RENDER ───────────────────────────
  return(
    <div style={{display:'flex',minHeight:'100vh',background:STOC.cloud,fontFamily:'Inter,-apple-system,BlinkMacSystemFont,sans-serif',color:STOC.ink}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        ${spinKF}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:${STOC.cloud}}
        ::-webkit-scrollbar-thumb{background:${STOC.borderMid};border-radius:3px}
        .nav-item:hover { background: rgba(184,201,230,.12) !important; }
        .nav-item.active { background: rgba(20,116,196,.15) !important; }
        .trow:hover td { background: #EBF4FB !important; }
        .proj-row:hover td { background: #F0F7FF !important; }
      `}</style>

      {/* ══ LEFT SIDEBAR ══ */}
      <div style={{width:SW,minWidth:SW,background:STOC.navy,display:'flex',flexDirection:'column',
        borderRight:`1px solid rgba(184,201,230,.15)`,transition:'width .2s',overflow:'hidden',
        position:'sticky',top:0,height:'100vh',flexShrink:0}}>

        {/* Logo area */}
        <div style={{padding:sideCollapsed?'18px 0':'18px 20px',borderBottom:'1px solid rgba(184,201,230,.15)',
          display:'flex',alignItems:'center',justifyContent:sideCollapsed?'center':'space-between'}}>
          {!sideCollapsed && <img src="/logo.png" alt="STOC" style={{height:28,filter:'brightness(0) invert(1)',opacity:.9}}/>}
          {sideCollapsed && <div style={{width:28,height:28,borderRadius:4,background:'rgba(184,201,230,.15)',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <LayoutDashboard size={14} color={STOC.sky}/>
          </div>}
          <button onClick={()=>setSideCollapsed(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',
            color:STOC.sky,opacity:.6,padding:2,display:'flex',alignItems:'center'}}>
            {sideCollapsed?<ChevronRight size={14}/>:<ChevronLeft size={14}/>}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{padding:'12px 8px',flex:1}}>
          {NAV.map(n=>(
            <button key={n.id} className={`nav-item${page===n.id?' active':''}`}
              onClick={()=>setPage(n.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 10px',
                borderRadius:5,border:'none',cursor:'pointer',marginBottom:2,
                background:page===n.id?'rgba(20,116,196,.15)':'transparent',
                color:page===n.id?STOC.sky:'rgba(255,255,255,.65)',
                transition:'background .15s',textAlign:'left',justifyContent:sideCollapsed?'center':'flex-start'}}>
              <span style={{flexShrink:0,color:page===n.id?STOC.sky:'rgba(255,255,255,.5)'}}>{n.icon}</span>
              {!sideCollapsed&&<span style={{fontSize:13,fontWeight:page===n.id?600:400,letterSpacing:'.01em'}}>{n.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: controls */}
        {!sideCollapsed&&(
          <div style={{padding:'12px 12px 16px',borderTop:'1px solid rgba(184,201,230,.12)'}}>
            <div style={{marginBottom:8}}>
              <p style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(184,201,230,.5)',marginBottom:6}}>Team</p>
              <select value={teamF} onChange={e=>setTeamF(e.target.value)} style={{width:'100%',height:28,padding:'0 6px',
                fontSize:11,border:'1px solid rgba(184,201,230,.2)',borderRadius:4,
                background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.8)',cursor:'pointer',outline:'none'}}>
                <option value="all">All Teams</option>
                <option value="tas">TAS</option>
                <option value="cds">CDS</option>
              </select>
            </div>
            {/* Week picker */}
            <p style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(184,201,230,.5)',marginBottom:6}}>Period</p>
            <div className="wdd" style={{position:'relative'}}>
              <button onClick={()=>setWeekDD(v=>!v)} style={{width:'100%',height:28,padding:'0 8px',fontSize:11,
                border:'1px solid rgba(184,201,230,.2)',borderRadius:4,background:'rgba(255,255,255,.06)',
                color:'rgba(255,255,255,.8)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',outline:'none'}}>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,textAlign:'left'}}>{weekLabel()}</span>
                <ChevronDown size={11} style={{flexShrink:0,marginLeft:4,transition:'.15s',transform:weekDD?'rotate(180deg)':'none'}}/>
              </button>
              {weekDD&&(
                <div style={{position:'absolute',bottom:'calc(100% + 4px)',left:0,right:0,background:STOC.navyMid,
                  border:'1px solid rgba(184,201,230,.2)',borderRadius:6,boxShadow:'0 -8px 24px rgba(0,0,0,.3)',zIndex:50,overflow:'hidden'}}>
                  <div style={{maxHeight:200,overflowY:'auto',padding:4}}>
                    {weeks.map(w=>(
                      <label key={w.key} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 8px',cursor:'pointer',
                        borderRadius:4,background:selWeeks.includes(w.key)?'rgba(20,116,196,.2)':'transparent'}}>
                        <input type="checkbox" checked={selWeeks.includes(w.key)} onChange={()=>toggleWeek(w.key)}
                          style={{width:12,height:12,accentColor:STOC.blue,cursor:'pointer',flexShrink:0}}/>
                        <span style={{fontSize:11,color:'rgba(255,255,255,.8)'}}>{w.label}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{borderTop:'1px solid rgba(184,201,230,.12)',display:'flex',padding:4,gap:4}}>
                    <button onClick={()=>setSelWeeks(weeks.map(w=>w.key))} style={{flex:1,padding:'3px 0',fontSize:10,fontWeight:500,color:STOC.sky,background:'none',border:'none',cursor:'pointer',borderRadius:3}}>All</button>
                    <button onClick={()=>weeks.length&&setSelWeeks([weeks[0].key])} style={{flex:1,padding:'3px 0',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.5)',background:'none',border:'none',cursor:'pointer',borderRadius:3}}>Latest</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>

        {/* Top header bar */}
        <div style={{background:STOC.white,borderBottom:`1px solid ${STOC.border}`,
          padding:'0 24px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between',
          position:'sticky',top:0,zIndex:20}}>
          <div>
            <h1 style={{fontFamily:'Playfair Display, serif',fontSize:18,fontWeight:500,color:STOC.navy,letterSpacing:'-.01em',margin:0}}>
              {NAV.find(n=>n.id===page)?.label}
            </h1>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={load} style={{height:30,padding:'0 12px',fontSize:12,border:`1px solid ${STOC.border}`,
              borderRadius:4,background:STOC.white,color:STOC.slate,cursor:'pointer',
              display:'flex',alignItems:'center',gap:5,outline:'none'}}>
              <RefreshCw size={11} color={STOC.muted}/> Refresh
            </button>
            {updatedAt&&<span style={{fontSize:11,color:STOC.muted}}>as of {updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}, {updatedAt.toLocaleTimeString()}</span>}
          </div>
        </div>

        {/* STAT STRIP */}
        <div style={{background:STOC.white,borderBottom:`1px solid ${STOC.border}`,padding:'0 24px',height:38,
          display:'flex',alignItems:'center',gap:0,overflow:'hidden'}}>
          {[
            {label:'Members',  val:S.n,             unit:'',  c:STOC.ink},
            {label:'Billable', val:S.tB.toFixed(0), unit:'h', c:STOC.blue},
            {label:'Internal', val:S.tI.toFixed(0), unit:'h', c:'#6D28D9'},
            {label:'OOO',      val:S.tO.toFixed(0), unit:'h', c:STOC.muted},
            {label:'Avg Util', val:S.avgU.toFixed(0),unit:'%',c:S.avgU>=95?STOC.red:S.avgU<60?STOC.blue:STOC.green},
            {label:'At Risk',  val:S.nOver,          unit:'',  c:S.nOver>0?STOC.red:STOC.muted},
            {label:'Bandwidth',val:Math.max(0,S.tA).toFixed(0),unit:'h',c:S.tA<0?STOC.red:STOC.ink},
          ].map((s,i)=>(
            <React.Fragment key={i}>
              {i>0&&<div style={{width:1,height:16,background:STOC.border,margin:'0 16px',flexShrink:0}}/>}
              <div style={{display:'flex',alignItems:'baseline',gap:4,whiteSpace:'nowrap',flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:STOC.muted}}>{s.label}</span>
                <span style={{fontSize:14,fontWeight:700,color:s.c,fontVariantNumeric:'tabular-nums'}}>{s.val}{s.unit}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* PAGE BODY */}
        <div style={{flex:1,padding:20,overflowY:'auto'}}>

          {/* ══════════════════════════════════════
              DASHBOARD — capacity lanes + chart
          ══════════════════════════════════════ */}
          {page==='dashboard'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16,alignItems:'start'}}>

              {/* Capacity lanes */}
              <div style={{background:STOC.white,border:`1px solid ${STOC.border}`,borderRadius:6,overflow:'hidden'}}>
                <div style={{padding:'12px 16px',borderBottom:`1px solid ${STOC.border}`,background:STOC.cloud,
                  display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:600,color:STOC.navy}}>Capacity Overview</span>
                    <span style={{fontSize:11,color:STOC.muted,marginLeft:8}}>Hover bar segments for detail</span>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    {[['#1474C4','Billable'],['#6D28D9','Internal/BD'],['#94A3B8','OOO'],['#E1E7F0','Available']].map(([c,l])=>(
                      <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
                        <div style={{width:9,height:9,borderRadius:2,background:c,border:l==='Available'?`1px solid ${STOC.border}`:'none'}}/>
                        <span style={{fontSize:10,color:STOC.muted}}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column headers */}
                <div style={{display:'grid',gridTemplateColumns:'168px 1fr 48px 80px',
                  padding:'5px 16px',borderBottom:`1px solid ${STOC.border}`,background:STOC.cloud,gap:10}}>
                  {['Name','Capacity','%','Status'].map((h,i)=>(
                    <span key={i} style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',
                      color:STOC.muted,textAlign:i===2?'right':'left'}}>{h}</span>
                  ))}
                </div>

                {Object.values(members).filter(m=>m.total>0).sort((a,b)=>b.util-a.util).map((m,i)=>{
                  const cap=40*Math.max(selWeeks.length,1);
                  const isOver=m.risk==='Over',isUnder=m.risk==='Under';
                  const rowBg=isOver?'#FFF8F8':isUnder?'#F8FBFF':i%2===1?STOC.cloud:STOC.white;
                  const utilColor=isOver?STOC.red:isUnder?STOC.blue:STOC.green;
                  return(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'168px 1fr 48px 80px',
                      padding:'7px 16px',gap:10,alignItems:'center',
                      borderBottom:`1px solid ${STOC.border}`,background:rowBg}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:STOC.ink,lineHeight:1.2}}>{m.name}</div>
                        <div style={{fontSize:10,color:STOC.muted,marginTop:1}}>{m.isCDS?'CDS':'TAS'}{m.ooo>0?` · ${m.ooo.toFixed(0)}h OOO`:''}</div>
                      </div>
                      <CapBar billable={m.billable} internal={m.internal} ooo={m.ooo} avail={Math.max(0,m.avail)} cap={cap}/>
                      <div style={{textAlign:'right',fontSize:12,fontWeight:700,color:utilColor,fontVariantNumeric:'tabular-nums'}}>
                        {m.util.toFixed(0)}%
                      </div>
                      <div><RiskChip r={m.risk}/></div>
                    </div>
                  );
                })}
              </div>

              {/* Right: chart + summary */}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{background:STOC.white,border:`1px solid ${STOC.border}`,borderRadius:6,overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',borderBottom:`1px solid ${STOC.border}`,background:STOC.cloud}}>
                    <span style={{fontSize:12,fontWeight:600,color:STOC.navy}}>Billable Hours by Client</span>
                  </div>
                  <div style={{padding:'10px 4px 6px'}}>
                    <ResponsiveContainer width="100%" height={clientHours.length*30+10}>
                      <BarChart data={clientHours} layout="vertical" margin={{top:0,right:40,bottom:0,left:4}} barCategoryGap="28%">
                        <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke={STOC.border}/>
                        <XAxis type="number" tick={{fontSize:10,fill:STOC.muted}} tickLine={false} axisLine={false}/>
                        <YAxis type="category" dataKey="c" tick={{fontSize:11,fill:STOC.ink}} tickLine={false} axisLine={false} width={72}/>
                        <Tooltip formatter={v=>[`${v}h`,'Hrs']} contentStyle={{fontSize:12,border:`1px solid ${STOC.border}`,borderRadius:4}} cursor={{fill:STOC.cloud}}/>
                        <Bar dataKey="h" radius={[0,3,3,0]} maxBarSize={15}>
                          {clientHours.map((r,i)=><Cell key={i} fill={getClientColor(r.c).bg} fillOpacity={.85}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{background:STOC.white,border:`1px solid ${STOC.border}`,borderRadius:6,overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',borderBottom:`1px solid ${STOC.border}`,background:STOC.cloud}}>
                    <span style={{fontSize:12,fontWeight:600,color:STOC.navy}}>Period Summary</span>
                  </div>
                  <table style={{...tbl,fontSize:12}}>
                    <tbody>
                      {[
                        ['Billable',`${S.tB.toFixed(0)}h`,STOC.blue],
                        ['Internal / BD',`${S.tI.toFixed(0)}h`,'#6D28D9'],
                        ['OOO',`${S.tO.toFixed(0)}h`,STOC.muted],
                        ['Avg utilization',`${S.avgU.toFixed(0)}%`,S.avgU>=95?STOC.red:S.avgU<60?STOC.blue:STOC.green],
                        ['Bandwidth',`${Math.max(0,S.tA).toFixed(0)}h`,STOC.blue],
                        ['At risk',`${S.nOver} people`,S.nOver>0?STOC.red:STOC.muted],
                        ['Underutilized',`${S.nUnder} people`,S.nUnder>0?STOC.blue:STOC.muted],
                      ].map(([l,v,c],i)=>(
                        <tr key={i} style={{borderBottom:`1px solid ${STOC.border}`}}>
                          <td style={{padding:'6px 14px',color:STOC.slate,fontSize:12}}>{l}</td>
                          <td style={{padding:'6px 14px',textAlign:'right',fontWeight:700,color:c,fontVariantNumeric:'tabular-nums',fontSize:12}}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              PROJECTS — flat table with color-coded clients
          ══════════════════════════════════════ */}
          {page==='projects'&&(
            <div style={{background:STOC.white,border:`1px solid ${STOC.border}`,borderRadius:6,overflow:'hidden'}}>
              {/* Toolbar */}
              <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:8,
                padding:'10px 16px',borderBottom:`1px solid ${STOC.border}`,background:STOC.cloud}}>
                <div style={{position:'relative',flexShrink:0}}>
                  <Search size={12} color={STOC.muted} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                  <input value={pSearch} onChange={e=>setPSearch(e.target.value)} placeholder="Search projects…"
                    style={{height:30,paddingLeft:27,paddingRight:pSearch?24:8,width:210,fontSize:12,
                      border:`1px solid ${STOC.border}`,borderRadius:4,background:STOC.white,color:STOC.ink,outline:'none',boxSizing:'border-box'}}/>
                  {pSearch&&<button onClick={()=>setPSearch('')} style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',cursor:'pointer',color:STOC.muted,display:'flex',alignItems:'center'}}><X size={12}/></button>}
                </div>

                {/* Client filter — shows color swatch */}
                <select value={pClient} onChange={e=>setPClient(e.target.value)} style={{
                  height:30,padding:'0 8px',fontSize:12,border:`1px solid ${pClient!=='all'?STOC.blue:STOC.border}`,
                  borderRadius:4,background:pClient!=='all'?'#EBF4FB':STOC.white,
                  color:pClient!=='all'?STOC.blue:STOC.slate,cursor:'pointer',outline:'none',minWidth:130,fontWeight:pClient!=='all'?600:400}}>
                  <option value="all">All clients</option>
                  {allClients.map(c=><option key={c} value={c}>{c}</option>)}
                </select>

                <select value={pType} onChange={e=>setPType(e.target.value)} style={{
                  height:30,padding:'0 8px',fontSize:12,border:`1px solid ${pType!=='all'?STOC.blue:STOC.border}`,
                  borderRadius:4,background:pType!=='all'?'#EBF4FB':STOC.white,
                  color:pType!=='all'?STOC.blue:STOC.slate,cursor:'pointer',outline:'none',fontWeight:pType!=='all'?600:400}}>
                  <option value="all">All types</option>
                  <option value="billable">Billable</option>
                  <option value="internal-bd">Internal / BD</option>
                </select>

                {hasFilters&&<button onClick={()=>{setPSearch('');setPClient('all');setPType('all');}}
                  style={{height:30,padding:'0 10px',fontSize:12,fontWeight:500,border:`1px solid #FECACA`,
                    borderRadius:4,background:'#FEF2F2',color:STOC.red,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                  <X size={11}/>Clear
                </button>}

                <span style={{marginLeft:'auto',fontSize:11,color:STOC.muted,whiteSpace:'nowrap'}}>
                  {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects · {clientGroups.length} clients
                </span>
              </div>

              {/* Table */}
              <div style={{overflowX:'auto'}}>
                <table style={tbl}>
                  <thead>
                    <tr>
                      <th style={{...th(false,16,320),cursor:'pointer'}} onClick={()=>tsP('name')}>Project {arr(pSort,'name')}</th>
                      <th style={{...th(true,12,80),cursor:'pointer'}} onClick={()=>tsP('hours')}>Hours {arr(pSort,'hours')}</th>
                      <th style={th(true,12,80)}>% Billable</th>
                      <th style={th(false,12,100)}>Type</th>
                      <th style={th(false,12)}>Assigned to</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientGroups.length===0&&(
                      <tr><td colSpan={5} style={{padding:'48px 16px',textAlign:'center',color:STOC.muted,fontSize:13}}>No projects match your filters</td></tr>
                    )}
                    {clientGroups.map((cg,ci)=>{
                      const isCollapsed=collapsed[cg.client];
                      const cc=getClientColor(cg.client);
                      const billTotal=cg.projs.filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0);
                      return(
                        <React.Fragment key={ci}>
                          {/* Client header row */}
                          <tr onClick={()=>setCollapsed(p=>({...p,[cg.client]:!p[cg.client]}))}
                            style={{background:'#F5F7FB',cursor:'pointer',borderTop:`2px solid ${STOC.borderMid}`}}>
                            <td colSpan={5} style={{padding:'8px 16px',borderBottom:`1px solid ${STOC.border}`}}>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                {/* Color bar */}
                                <div style={{width:3,height:16,borderRadius:2,background:cc.bg,flexShrink:0}}/>
                                {isCollapsed?<ChevronRight size={13} color={STOC.slate}/>:<ChevronDown size={13} color={STOC.slate}/>}
                                <span style={{fontSize:13,fontWeight:700,color:STOC.navy,letterSpacing:'-.01em'}}>{cg.client}</span>
                                <ClientTag client={cg.client}/>
                                <span style={{fontSize:11,color:STOC.muted}}>{cg.projs.length} project{cg.projs.length!==1?'s':''}</span>
                                <span style={{marginLeft:'auto',fontSize:13,fontWeight:700,color:STOC.ink,fontVariantNumeric:'tabular-nums'}}>{cg.total.toFixed(1)}h</span>
                                {totalBillHrs>0&&billTotal>0&&(
                                  <span style={{fontSize:12,color:STOC.muted,fontVariantNumeric:'tabular-nums',minWidth:36,textAlign:'right'}}>
                                    {pctFmt(billTotal,totalBillHrs)}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Project rows */}
                          {!isCollapsed&&cg.projs.map((p,pi)=>{
                            const mems=Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                            const isBill=p.cat==='Billable';
                            return(
                              <tr key={pi} className="proj-row" style={{
                                background:pi%2===0?STOC.white:'#FAFBFC',
                                borderBottom:`1px solid #F0F4F8`,
                                borderLeft:`3px solid ${cc.bg}`,
                              }}>
                                {/* Project name */}
                                <td style={{padding:'5px 12px',paddingLeft:22,fontSize:13,color:STOC.ink,verticalAlign:'middle'}}>
                                  {p.name}
                                </td>
                                {/* Hours */}
                                <td style={{padding:'5px 12px',textAlign:'right',fontWeight:600,fontSize:13,
                                  color:STOC.ink,fontVariantNumeric:'tabular-nums',verticalAlign:'middle',whiteSpace:'nowrap'}}>
                                  {p.hrs.toFixed(1)}
                                </td>
                                {/* % of billable */}
                                <td style={{padding:'5px 12px',textAlign:'right',fontSize:12,color:STOC.muted,
                                  fontVariantNumeric:'tabular-nums',verticalAlign:'middle'}}>
                                  {isBill?pctFmt(p.hrs,totalBillHrs):'—'}
                                </td>
                                {/* Type */}
                                <td style={{padding:'5px 12px',fontSize:12,fontWeight:500,verticalAlign:'middle',
                                  color:isBill?STOC.blue:'#6D28D9'}}>
                                  {pType==='all'?p.cat:''}
                                </td>
                                {/* Assigned to — CLEAN: first name + hours, dot separator */}
                                <td style={{padding:'5px 12px',verticalAlign:'middle'}}>
                                  <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'2px 0'}}>
                                    {mems.map(([n,h],mi)=>(
                                      <React.Fragment key={mi}>
                                        {mi>0&&<span style={{color:STOC.borderMid,margin:'0 5px',fontSize:12}}>·</span>}
                                        <span style={{fontSize:12,color:STOC.slate,whiteSpace:'nowrap'}}>
                                          {n.split(' ')[0]}
                                          <span style={{color:STOC.muted,marginLeft:3,fontVariantNumeric:'tabular-nums'}}>({h.toFixed(0)}h)</span>
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}

                    {/* Grand total */}
                    {clientGroups.length>0&&(
                      <tr style={{background:STOC.cloud,borderTop:`2px solid ${STOC.borderMid}`}}>
                        <td style={{padding:'7px 16px',fontSize:12,fontWeight:600,color:STOC.slate}}>
                          {clientGroups.length} clients · {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects
                        </td>
                        <td style={{padding:'7px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:STOC.ink,fontVariantNumeric:'tabular-nums'}}>
                          {clientGroups.reduce((s,g)=>s+g.total,0).toFixed(1)}
                        </td>
                        <td style={{padding:'7px 12px',textAlign:'right',fontSize:12,color:STOC.muted}}>100%</td>
                        <td colSpan={2}/>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TEAM — table + Gantt grid
          ══════════════════════════════════════ */}
          {page==='team'&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>

              {/* Team table */}
              <div style={{background:STOC.white,border:`1px solid ${STOC.border}`,borderRadius:6,overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',
                  borderBottom:`1px solid ${STOC.border}`,background:STOC.cloud}}>
                  <div style={{position:'relative'}}>
                    <Search size={12} color={STOC.muted} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                    <input value={tSearch} onChange={e=>setTSearch(e.target.value)} placeholder="Search…"
                      style={{height:30,paddingLeft:27,paddingRight:8,width:180,fontSize:12,
                        border:`1px solid ${STOC.border}`,borderRadius:4,background:STOC.white,color:STOC.ink,outline:'none',boxSizing:'border-box'}}/>
                  </div>
                  <span style={{marginLeft:'auto',fontSize:11,color:STOC.muted}}>{sortedTeam.length} members</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table style={tbl}>
                    <thead>
                      <tr>
                        <th style={{...th(false,16),cursor:'pointer'}} onClick={()=>tsT('name')}>Name {arr(tSort,'name')}</th>
                        <th style={th(false,12,56)}>Team</th>
                        <th style={{...th(true,12,80),cursor:'pointer'}} onClick={()=>tsT('billable')}>Billable {arr(tSort,'billable')}</th>
                        <th style={{...th(true,12,80),cursor:'pointer'}} onClick={()=>tsT('internal')}>Int/BD {arr(tSort,'internal')}</th>
                        <th style={{...th(true,12,60),cursor:'pointer'}} onClick={()=>tsT('ooo')}>OOO {arr(tSort,'ooo')}</th>
                        <th style={{...th(true,12,80),cursor:'pointer'}} onClick={()=>tsT('utilized')}>Utilized {arr(tSort,'utilized')}</th>
                        <th style={{...th(true,12,80),cursor:'pointer'}} onClick={()=>tsT('avail')}>Available {arr(tSort,'avail')}</th>
                        <th style={{...th(false,12,160),cursor:'pointer'}} onClick={()=>tsT('util')}>Utilization {arr(tSort,'util')}</th>
                        <th style={th(false,12,80)}>Status</th>
                        <th style={th(true,12,64)}>Projects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeam.map((m,i)=>{
                        const isOpen=openRow===m.name;
                        const projs=Object.entries(m.jobs).filter(([jc])=>catOf(jc)!=='OOO').sort(([,a],[,b])=>b-a);
                        const utilColor=m.risk==='Over'?STOC.red:m.risk==='Under'?STOC.blue:STOC.green;
                        const rowBg=isOpen?'#EBF4FB':m.risk==='Over'?'#FFF8F8':m.risk==='Under'?'#F8FBFF':i%2===1?STOC.cloud:STOC.white;
                        return(
                          <React.Fragment key={i}>
                            <tr className="trow" onClick={()=>setOpenRow(isOpen?null:m.name)}
                              style={{cursor:'pointer',background:rowBg}}>
                              <td style={{...td(false,false,false),paddingLeft:16}}>
                                <div style={{display:'flex',alignItems:'center',gap:6}}>
                                  {isOpen?<ChevronDown size={12} color={STOC.muted}/>:<ChevronRight size={12} color={STOC.muted}/>}
                                  <span style={{fontWeight:500,color:STOC.ink}}>{m.name}</span>
                                </div>
                              </td>
                              <td style={td()}>
                                <span style={{fontSize:10,fontWeight:700,padding:'1px 5px',borderRadius:3,
                                  background:m.isCDS?'#EDE9FE':'#DBEAFE',color:m.isCDS?'#5B21B6':STOC.blue}}>
                                  {m.isCDS?'CDS':'TAS'}
                                </span>
                              </td>
                              <td style={td(true)}>{m.billable.toFixed(1)}</td>
                              <td style={td(true)}>{m.internal.toFixed(1)}</td>
                              <td style={{...td(true,false,true)}}>{m.ooo.toFixed(1)}</td>
                              <td style={{...td(true,true)}}>{m.utilized.toFixed(1)}</td>
                              <td style={{...td(true,true),color:m.avail<0?STOC.red:m.avail<8?STOC.amber:STOC.ink}}>
                                {m.avail.toFixed(1)}
                              </td>
                              <td style={{...td(),padding:'6px 12px',minWidth:160}}>
                                <div style={{display:'flex',alignItems:'center',gap:8}}>
                                  <div style={{flex:1,height:5,background:STOC.border,borderRadius:2,overflow:'hidden'}}>
                                    <div style={{height:5,borderRadius:2,background:utilColor,width:`${Math.min(m.util,100)}%`}}/>
                                  </div>
                                  <span style={{fontSize:11,fontWeight:700,color:utilColor,fontVariantNumeric:'tabular-nums',minWidth:28,textAlign:'right'}}>
                                    {m.util.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td style={td()}><RiskChip r={m.risk}/></td>
                              <td style={{...td(true,false,true)}}>{projs.length}</td>
                            </tr>
                            {isOpen&&(
                              <tr style={{background:'#F0F7FF'}}>
                                <td colSpan={10} style={{padding:'0 16px 10px'}}>
                                  <div style={{marginLeft:20,marginTop:8,maxWidth:460}}>
                                    <table style={{...tbl,fontSize:12}}>
                                      <thead><tr style={{borderBottom:`1px solid ${STOC.border}`}}>
                                        <th style={{padding:'3px 8px',textAlign:'left',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:STOC.muted}}>Project</th>
                                        <th style={{padding:'3px 8px',textAlign:'right',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:STOC.muted}}>Hrs</th>
                                        <th style={{padding:'3px 8px',textAlign:'right',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:STOC.muted}}>%</th>
                                      </tr></thead>
                                      <tbody>
                                        {projs.map(([jc,hrs],j)=>(
                                          <tr key={j} style={{borderBottom:j<projs.length-1?`1px solid #F0F4F8`:'none'}}>
                                            <td style={{padding:'4px 8px',color:STOC.ink}}>{jc}</td>
                                            <td style={{padding:'4px 8px',textAlign:'right',fontWeight:600,color:STOC.ink,fontVariantNumeric:'tabular-nums'}}>{hrs.toFixed(1)}</td>
                                            <td style={{padding:'4px 8px',textAlign:'right',color:STOC.muted,fontVariantNumeric:'tabular-nums'}}>{m.utilized>0?Math.round((hrs/m.utilized)*100):0}%</td>
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
                      <tr style={{background:STOC.cloud,borderTop:`2px solid ${STOC.borderMid}`}}>
                        <td colSpan={2} style={{padding:'7px 16px',fontSize:12,fontWeight:700,color:STOC.navy}}>Total</td>
                        {[S.tB,S.tI,S.tO,S.tU].map((v,i)=>(
                          <td key={i} style={{padding:'7px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:STOC.ink,fontVariantNumeric:'tabular-nums',borderBottom:`1px solid ${STOC.border}`}}>{v.toFixed(1)}</td>
                        ))}
                        <td style={{padding:'7px 12px',textAlign:'right',fontSize:13,fontWeight:700,
                          color:S.tA<0?STOC.red:STOC.ink,fontVariantNumeric:'tabular-nums',borderBottom:`1px solid ${STOC.border}`}}>{S.tA.toFixed(1)}</td>
                        <td style={{padding:'7px 12px',borderBottom:`1px solid ${STOC.border}`}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{flex:1,height:5,background:STOC.border,borderRadius:2,overflow:'hidden'}}>
                              <div style={{height:5,borderRadius:2,background:STOC.blue,width:`${Math.min(S.avgU,100)}%`}}/>
                            </div>
                            <span style={{fontSize:11,fontWeight:700,color:STOC.ink,fontVariantNumeric:'tabular-nums',minWidth:28,textAlign:'right'}}>{S.avgU.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td colSpan={2} style={{borderBottom:`1px solid ${STOC.border}`}}/>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── GANTT / HEAT GRID ── */}
              {ganttData.names.length>0&&ganttData.weeks.length>0&&(
                <div style={{background:STOC.white,border:`1px solid ${STOC.border}`,borderRadius:6,overflow:'hidden'}}>
                  <div style={{padding:'10px 16px',borderBottom:`1px solid ${STOC.border}`,background:STOC.cloud,
                    display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontFamily:'Playfair Display, serif',fontSize:15,fontWeight:500,color:STOC.navy}}>
                      Utilization Heatmap — by Person &amp; Week
                    </span>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      {[['#FCA5A5','At risk ≥95%'],['#93C5FD','Healthy 75–95%'],['#86EFAC','Good 60–75%'],['#E2E8F0','Low <60%']].map(([c,l])=>(
                        <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
                          <div style={{width:10,height:10,borderRadius:2,background:c,flexShrink:0}}/>
                          <span style={{fontSize:10,color:STOC.muted}}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <table style={{...tbl,tableLayout:'fixed'}}>
                      <thead>
                        <tr style={{borderBottom:`2px solid ${STOC.borderMid}`}}>
                          <th style={{...th(false,16,160),position:'sticky',left:0,zIndex:2,background:STOC.cloud}}>Person</th>
                          {ganttData.weeks.map(w=>(
                            <th key={w.key} style={{...th(false,4),minWidth:64,padding:'6px 4px',fontSize:9,lineHeight:1.3,background:STOC.cloud}}>
                              <div style={{textAlign:'center',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:70}}>
                                {w.label.split(' – ')[0]}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ganttData.names.map((name,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${STOC.border}`,background:i%2===1?STOC.cloud:STOC.white}}>
                            <td style={{padding:'4px 16px',fontSize:12,fontWeight:500,color:STOC.ink,whiteSpace:'nowrap',
                              position:'sticky',left:0,zIndex:1,background:i%2===1?STOC.cloud:STOC.white,borderBottom:`1px solid ${STOC.border}`}}>
                              {name}
                            </td>
                            {ganttData.weeks.map(w=>{
                              const d=ganttData.grid[name]?.[w.key];
                              const util=d?.util??null;
                              return(
                                <td key={w.key} style={{padding:'3px 4px',borderBottom:`1px solid ${STOC.border}`}}
                                  title={d?`${name} · ${w.label}\nBillable: ${d.billable.toFixed(1)}h · Int/BD: ${d.internal.toFixed(1)}h · OOO: ${d.ooo.toFixed(1)}h`:''}>
                                  <HeatCell util={util}/>
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
            </div>
          )}

          {/* ══════════════════════════════════════
              EXCEPTIONS
          ══════════════════════════════════════ */}
          {page==='exceptions'&&(
            <div style={{background:STOC.white,border:`1px solid ${STOC.border}`,borderRadius:6,overflow:'hidden'}}>
              <table style={tbl}>
                <thead>
                  <tr>
                    <th style={th(false,16,130)}>Issue</th>
                    <th style={th(false,12,180)}>Team Member</th>
                    <th style={th(false,12)}>Details</th>
                    <th style={th(false,12,140)}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(members).filter(m=>m.avail<0).map((m,i)=>(
                    <tr key={`o${i}`} style={{borderBottom:`1px solid ${STOC.border}`,background:'#FFF8F8',borderLeft:`3px solid ${STOC.red}`}}>
                      <td style={{padding:'9px 12px',paddingLeft:13}}>
                        <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:3,background:'#FEE2E2',color:'#991B1B'}}>Overallocated</span>
                      </td>
                      <td style={{padding:'9px 12px',fontSize:13,fontWeight:500,color:STOC.ink}}>{m.name}</td>
                      <td style={{padding:'9px 12px',fontSize:13,color:STOC.slate}}>{Math.abs(m.avail).toFixed(1)}h over capacity · {m.util.toFixed(0)}% utilized</td>
                      <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:STOC.red}}>Rebalance work</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.total>0&&m.total<20).map((m,i)=>(
                    <tr key={`l${i}`} style={{borderBottom:`1px solid ${STOC.border}`,background:STOC.amberBg,borderLeft:'3px solid #D97706'}}>
                      <td style={{padding:'9px 12px',paddingLeft:13}}>
                        <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:3,background:'#FEF3C7',color:'#92400E'}}>Low Hours</span>
                      </td>
                      <td style={{padding:'9px 12px',fontSize:13,fontWeight:500,color:STOC.ink}}>{m.name}</td>
                      <td style={{padding:'9px 12px',fontSize:13,color:STOC.slate}}>Only {m.total.toFixed(1)}h logged this period</td>
                      <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:STOC.amber}}>Review entry</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.avail<0||m.total<20).length===0&&(
                    <tr><td colSpan={4} style={{padding:'48px 16px',textAlign:'center',fontSize:13,color:STOC.muted}}>No exceptions this period 🎉</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
