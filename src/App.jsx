import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, FolderOpen, Users, AlertTriangle,
  Search, RefreshCw, AlertCircle, ChevronDown, ChevronRight, ChevronLeft, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv';
const CDS_TEAM = new Set(['Mohit Sharma','Rakesh Nayak','Sharvan Pandey','Stefan Joseph','Jogendra Singh','Ramya D','Vaishnav Govind']);

const S = {
  navy:'#041E42',navyMid:'#0A2447',blue:'#1474C4',sky:'#B8C9E6',cloud:'#F2F5FA',
  border:'#E1E7F0',borderM:'#C8D4E5',white:'#FFFFFF',ink:'#0A2447',
  slate:'#475569',slateL:'#64748B',muted:'#94A3B8',
  green:'#15803D',red:'#DC2626',amber:'#B45309',
  redBg:'#FEF2F2',amberBg:'#FFFBEB',
};
const CC={'AEG':'#1474C4','SALT':'#0D7377','ADP':'#6D28D9','SP USA':'#B45309','CPC':'#0369A1',
  'Riata':'#065F46','Beacon':'#7C3AED','Archway':'#9D174D','Budget':'#92400E',
  'Administrative':'#475569','Business Development':'#334155','CDS Internal':'#1E40AF','Other':'#6B7280'};
const cc = c => CC[c]||CC['Other'];

const normalizeClient = j => {
  if(!j) return 'Other';
  const t=j.trim();
  if(/^(holiday|vacation|sick)$/i.test(t)) return 'OOO';
  if(/^administrative$/i.test(t)) return 'Administrative';
  if(/^business development/i.test(t)) return 'Business Development';
  if(/^cds\b/i.test(t)||/tableau/i.test(t)) return 'CDS Internal';
  if(/^AEG(\s|[-–]|$)/i.test(t)) return 'AEG';
  if(/^SALT(\s|[-–]|$)/i.test(t)) return 'SALT';
  if(/^ADP(\s|[-–]|$)/i.test(t)) return 'ADP';
  if(/^(SP\s*USA|SPUSA)(\s|[-–]|$)/i.test(t)) return 'SP USA';
  if(/^CPC(\s|[-–]|$)/i.test(t)) return 'CPC';
  if(/^RIATA(\s|[-–]|$)/i.test(t)) return 'Riata';
  if(/^BEACON/i.test(t)) return 'Beacon';
  if(/^ARCHWAY/i.test(t)) return 'Archway';
  if(/^BUDGET/i.test(t)) return 'Budget';
  const m=t.match(/^(.+?)\s*[-–]\s*/); return m?m[1].trim():t;
};
const catOf=j=>{
  if(!j) return 'Billable';
  const t=j.trim();
  if(/^(holiday|vacation|sick)$/i.test(t)) return 'OOO';
  if(/^administrative$/i.test(t)||/^business development/i.test(t)||/^cds\b/i.test(t)||/tableau/i.test(t)) return 'Internal/BD';
  return 'Billable';
};
const parseCSV=text=>{
  const clean=text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const lines=clean.split('\n').filter(l=>l.trim());
  if(lines.length<2) return[];
  const pl=line=>{const r=[];let cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===','&&!q){r.push(cur.trim());cur='';}else cur+=c;}return r.push(cur.trim()),r;};
  const hdrs=pl(lines[0]).map(h=>h.toLowerCase().replace(/\s+/g,'_'));
  return lines.slice(1).map(line=>{const v=pl(line),row={};hdrs.forEach((h,i)=>{row[h]=v[i]??'';});return row;}).filter(r=>r.fname||r.lname||r.username);
};
const detectWeeks=rows=>{
  const m={};
  rows.forEach(r=>{
    const d=new Date(r.local_date);if(isNaN(d))return;
    const diff=(d.getDay()||7)-1;
    const mon=new Date(d);mon.setDate(d.getDate()-diff);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    const fmt=dt=>dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const key=mon.toISOString().slice(0,10);
    if(!m[key]) m[key]={key,label:`${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`};
  });
  return Object.values(m).sort((a,b)=>b.key.localeCompare(a.key));
};
const riskOf=u=>u>=95?'Over':u<60?'Under':'OK';
const pctFmt=(n,d)=>{if(!d||d===0)return'—';const p=(n/d)*100;return p<1?'<1%':`${Math.round(p)}%`;};

const RiskChip=({r})=>{
  const map={Over:{bg:'#FEE2E2',c:'#991B1B',t:'At risk'},Under:{bg:'#DBEAFE',c:'#1E40AF',t:'Under'},OK:{bg:'#DCFCE7',c:'#166534',t:'Healthy'}};
  const s=map[r]||map.OK;
  return<span style={{display:'inline-block',padding:'1px 7px',borderRadius:3,fontSize:11,fontWeight:600,background:s.bg,color:s.c}}>{s.t}</span>;
};

const CapBar=({billable,internal,ooo,avail,cap,height=14})=>{
  const [tip,setTip]=useState(null);
  const total=Math.max(cap,billable+internal+ooo);
  const segs=[{k:'Billable',v:billable,c:'#1474C4'},{k:'Internal/BD',v:internal,c:'#6D28D9'},{k:'OOO',v:ooo,c:'#94A3B8'},{k:'Available',v:Math.max(0,avail),c:'#E1E7F0'}];
  const isOver=(billable+internal)>cap;
  return(
    <div style={{position:'relative',flex:1,minWidth:0}}>
      <div style={{display:'flex',height,borderRadius:2,overflow:'hidden',border:`1px solid ${isOver?S.red:S.border}`}}>
        {segs.map(s=>s.v>0&&<div key={s.k} style={{width:`${Math.min((s.v/total)*100,100)}%`,background:s.c,flexShrink:0}} onMouseEnter={()=>setTip({label:s.k,value:s.v})} onMouseLeave={()=>setTip(null)}/>)}
      </div>
      {tip&&<div style={{position:'absolute',bottom:'calc(100% + 4px)',left:'50%',transform:'translateX(-50%)',background:S.ink,color:'#fff',padding:'3px 8px',borderRadius:3,fontSize:11,whiteSpace:'nowrap',zIndex:99,pointerEvents:'none'}}>{tip.label}: {tip.value.toFixed(1)}h</div>}
    </div>
  );
};

const HeatCell=({util,title})=>{
  const bg=util===null?S.cloud:util>=95?'#FCA5A5':util>=75?'#93C5FD':util>=60?'#86EFAC':util>0?'#E2E8F0':'#F8FAFC';
  const color=util===null?S.muted:util>=95?'#7F1D1D':util>=75?'#1E3A8A':util>=60?'#14532D':util>0?S.slate:S.muted;
  return<div title={title} style={{background:bg,color,fontSize:10,fontWeight:700,textAlign:'center',padding:'4px 2px',borderRadius:2,border:`1px solid ${S.border}`,minHeight:26,display:'flex',alignItems:'center',justifyContent:'center',fontVariantNumeric:'tabular-nums'}}>{util!==null&&util>0?`${Math.round(util)}%`:<span style={{color:S.muted,fontSize:9,fontWeight:400}}>—</span>}</div>;
};

export default function App(){
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [updatedAt,setUpdatedAt]=useState(null);
  const [page,setPage]=useState('projects');
  const [teamF,setTeamF]=useState('all');
  const [selWeeks,setSelWeeks]=useState([]);
  const [weekDD,setWeekDD]=useState(false);
  const [sideOff,setSideOff]=useState(false);
  const [pSearch,setPSearch]=useState('');
  const [pClient,setPClient]=useState('all');
  const [pType,setPType]=useState('all');
  const [pSort,setPSort]=useState({k:'hours',d:'desc'});
  const [collapsed,setCollapsed]=useState({});
  const [tSearch,setTSearch]=useState('');
  const [tSort,setTSort]=useState({k:'util',d:'desc'});
  const [openRow,setOpenRow]=useState(null);

  const load=async()=>{
    setLoading(true);setError(null);
    try{
      const res=await fetch(SHEET_URL);if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=parseCSV(await res.text());if(!data.length)throw new Error('No rows. Is the sheet public?');
      setRows(data);setUpdatedAt(new Date());
      const w=detectWeeks(data);if(w.length)setSelWeeks([w[0].key]);
    }catch(e){setError(e.message);}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
  useEffect(()=>{const h=e=>{if(!e.target.closest('.wdd'))setWeekDD(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  const weeks=useMemo(()=>detectWeeks(rows),[rows]);
  const weekRows=useMemo(()=>{
    if(!selWeeks.length)return rows;
    return rows.filter(r=>{
      const d=new Date(r.local_date);if(isNaN(d))return false;
      const diff=(d.getDay()||7)-1;const mon=new Date(d);mon.setDate(d.getDate()-diff);
      return selWeeks.includes(mon.toISOString().slice(0,10));
    });
  },[rows,selWeeks]);

  const {members,projectsMap}=useMemo(()=>{
    const tm={},pm={};const nW=Math.max(selWeeks.length,1);
    weekRows.forEach(r=>{
      const name=`${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs=parseFloat(r.hours)||0;const jc=(r.jobcode||'').trim();
      if(!name||!hrs||!jc)return;
      const cat=catOf(jc),client=normalizeClient(jc),isCDS=CDS_TEAM.has(name);
      if(teamF==='cds'&&!isCDS)return;if(teamF==='tas'&&isCDS)return;
      if(!tm[name])tm[name]={name,isCDS,total:0,billable:0,ooo:0,internal:0,utilized:0,jobs:{}};
      tm[name].total+=hrs;
      if(cat==='OOO'){tm[name].ooo+=hrs;}
      else if(cat==='Internal/BD'){tm[name].internal+=hrs;tm[name].utilized+=hrs;}
      else{tm[name].billable+=hrs;tm[name].utilized+=hrs;}
      tm[name].jobs[jc]=(tm[name].jobs[jc]||0)+hrs;
      if(cat==='OOO')return;
      if(!pm[jc])pm[jc]={name:jc,cat,client,hrs:0,mems:{}};
      pm[jc].hrs+=hrs;pm[jc].mems[name]=(pm[jc].mems[name]||0)+hrs;
    });
    Object.values(tm).forEach(m=>{m.effCap=40*nW-m.ooo;m.avail=m.effCap-m.utilized;m.util=m.effCap>0?(m.utilized/m.effCap)*100:0;m.risk=riskOf(m.util);});
    return{members:tm,projectsMap:pm};
  },[weekRows,teamF,selWeeks]);

  const ST=useMemo(()=>{
    const ms=Object.values(members);const tC=ms.reduce((s,m)=>s+m.effCap,0),tU=ms.reduce((s,m)=>s+m.utilized,0);
    return{n:ms.length,tB:ms.reduce((s,m)=>s+m.billable,0),tI:ms.reduce((s,m)=>s+m.internal,0),tO:ms.reduce((s,m)=>s+m.ooo,0),tU,tC,tA:ms.reduce((s,m)=>s+m.avail,0),avgU:tC>0?(tU/tC)*100:0,nOver:ms.filter(m=>m.risk==='Over').length,nUnder:ms.filter(m=>m.risk==='Under').length};
  },[members]);

  const totalBillHrs=useMemo(()=>Object.values(projectsMap).filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0),[projectsMap]);
  const allClients=useMemo(()=>[...new Set(Object.values(projectsMap).map(p=>p.client))].sort(),[projectsMap]);

  const clientGroups=useMemo(()=>{
    const g={};
    Object.values(projectsMap).forEach(p=>{
      if(pType==='billable'&&p.cat!=='Billable')return;
      if(pType==='internal-bd'&&p.cat!=='Internal/BD')return;
      if(pClient!=='all'&&p.client!==pClient)return;
      if(pSearch&&!p.name.toLowerCase().includes(pSearch.toLowerCase())&&!p.client.toLowerCase().includes(pSearch.toLowerCase()))return;
      if(!g[p.client])g[p.client]={client:p.client,total:0,projs:[]};
      g[p.client].projs.push(p);g[p.client].total+=p.hrs;
    });
    const dir=pSort.d==='desc'?-1:1;
    Object.values(g).forEach(cg=>cg.projs.sort((a,b)=>pSort.k==='hours'?dir*(b.hrs-a.hrs):dir*b.name.localeCompare(a.name)));
    return Object.values(g).sort((a,b)=>b.total-a.total);
  },[projectsMap,pType,pClient,pSearch,pSort]);

  const sortedTeam=useMemo(()=>{
    let ms=Object.values(members);
    if(tSearch.trim())ms=ms.filter(m=>m.name.toLowerCase().includes(tSearch.toLowerCase()));
    return ms.sort((a,b)=>{const av=a[tSort.k]??a.util,bv=b[tSort.k]??b.util;return tSort.d==='asc'?(av>bv?1:-1):(av>bv?-1:1);});
  },[members,tSearch,tSort]);

  const clientHours=useMemo(()=>{
    const ch={};Object.values(projectsMap).filter(p=>p.cat==='Billable').forEach(p=>{ch[p.client]=(ch[p.client]||0)+p.hrs;});
    return Object.entries(ch).map(([c,h])=>({c,h:parseFloat(h.toFixed(1))})).sort((a,b)=>b.h-a.h).slice(0,10);
  },[projectsMap]);

  const ganttData=useMemo(()=>{
    const sortedW=[...weeks].sort((a,b)=>a.key.localeCompare(b.key));
    const allNames=Object.keys(members).sort();
    if(!allNames.length||!sortedW.length)return{names:[],weeks:[],grid:{}};
    const weeklyMem={};
    sortedW.forEach(wk=>{weeklyMem[wk.key]={};allNames.forEach(n=>{weeklyMem[wk.key][n]={b:0,i:0,o:0};});});
    rows.forEach(r=>{
      const name=`${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs=parseFloat(r.hours)||0;const jc=(r.jobcode||'').trim();
      if(!name||!hrs||!jc||!allNames.includes(name))return;
      const d=new Date(r.local_date);if(isNaN(d))return;
      const diff=(d.getDay()||7)-1;const mon=new Date(d);mon.setDate(d.getDate()-diff);
      const wKey=mon.toISOString().slice(0,10);if(!weeklyMem[wKey])return;
      const cat=catOf(jc);
      if(cat==='OOO')weeklyMem[wKey][name].o+=hrs;
      else if(cat==='Internal/BD')weeklyMem[wKey][name].i+=hrs;
      else weeklyMem[wKey][name].b+=hrs;
    });
    const grid={};
    allNames.forEach(n=>{grid[n]={};sortedW.forEach(wk=>{const d=weeklyMem[wk.key][n]||{b:0,i:0,o:0};const utilized=d.b+d.i,effCap=40-d.o;const util=effCap>0?(utilized/effCap)*100:utilized>0?100:null;grid[n][wk.key]={util,b:d.b,i:d.i,o:d.o,utilized};});});
    return{names:allNames,weeks:sortedW,grid};
  },[rows,members,weeks]);

  const tsP=k=>setPSort(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const tsT=k=>setTSort(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const arr=(cfg,k)=>cfg.k===k?(cfg.d==='desc'?' ▾':' ▴'):'';
  const weekLabel=()=>{if(!selWeeks.length||selWeeks.length===weeks.length)return'All Weeks';if(selWeeks.length===1)return weeks.find(w=>w.key===selWeeks[0])?.label||'';return`${selWeeks.length} weeks`;};
  const toggleWeek=k=>setSelWeeks(p=>p.includes(k)?(p.length===1?p:p.filter(x=>x!==k)):[...p,k]);
  const hasFilters=pClient!=='all'||pType!=='all'||!!pSearch;
  const SW=sideOff?52:220;

  const TH=(right,pl,w,click)=>({padding:'7px 12px',paddingLeft:pl||12,width:w,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:S.muted,background:S.cloud,borderBottom:`2px solid ${S.borderM}`,textAlign:right?'right':'left',whiteSpace:'nowrap',cursor:click?'pointer':'default',userSelect:'none'});

  const NAV=[{id:'dashboard',icon:<LayoutDashboard size={15}/>,label:'Dashboard'},{id:'projects',icon:<FolderOpen size={15}/>,label:'Projects'},{id:'team',icon:<Users size={15}/>,label:'Team'},{id:'exceptions',icon:<AlertTriangle size={15}/>,label:'Exceptions'}];

  if(loading)return<div style={{minHeight:'100vh',background:S.cloud,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style><div style={{textAlign:'center'}}><div style={{width:28,height:28,border:`2px solid ${S.border}`,borderTopColor:S.blue,borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 12px'}}/><p style={{fontSize:13,color:S.slate}}>Loading…</p></div></div>;
  if(error)return<div style={{minHeight:'100vh',background:S.cloud,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}><div style={{background:S.white,border:'1px solid #FECACA',borderRadius:6,padding:32,maxWidth:400,textAlign:'center'}}><AlertCircle size={26} color={S.red} style={{margin:'0 auto 10px'}}/><p style={{fontSize:14,fontWeight:600,marginBottom:6}}>{error}</p><button onClick={load} style={{padding:'7px 18px',background:S.blue,color:'#fff',border:'none',borderRadius:4,fontSize:12,fontWeight:600,cursor:'pointer'}}>Retry</button></div></div>;

  return(
    <div style={{display:'flex',minHeight:'100vh',background:S.cloud,fontFamily:'Inter,-apple-system,sans-serif',color:S.ink,fontSize:13}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box}@keyframes spin{to{transform:rotate(360deg)}}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${S.cloud}}::-webkit-scrollbar-thumb{background:${S.borderM};border-radius:3px}.ni:hover{background:rgba(184,201,230,.1)!important}.ni.on{background:rgba(20,116,196,.18)!important}.pr:hover td,.pr:hover{background:#F0F7FF!important}.tr:hover td,.tr:hover>td{background:#EBF4FB!important}`}</style>

      {/* SIDEBAR */}
      <div style={{width:SW,minWidth:SW,background:S.navy,display:'flex',flexDirection:'column',transition:'width .18s',overflow:'hidden',position:'sticky',top:0,height:'100vh',flexShrink:0,borderRight:'1px solid rgba(184,201,230,.1)'}}>
        <div style={{height:52,display:'flex',alignItems:'center',justifyContent:sideOff?'center':'space-between',padding:sideOff?'0':'0 12px 0 18px',borderBottom:'1px solid rgba(184,201,230,.1)',flexShrink:0}}>
          {!sideOff&&<img src="/logo.png" alt="STOC" style={{height:26,filter:'brightness(0) invert(1)',opacity:.85}}/>}
          <button onClick={()=>setSideOff(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(184,201,230,.45)',padding:4,display:'flex',alignItems:'center',lineHeight:1}}>
            {sideOff?<ChevronRight size={14}/>:<ChevronLeft size={14}/>}
          </button>
        </div>
        <nav style={{padding:'10px 8px',flex:1}}>
          {NAV.map(n=>(
            <button key={n.id} className={`ni${page===n.id?' on':''}`} onClick={()=>setPage(n.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:sideOff?0:9,padding:'8px 10px',borderRadius:5,border:'none',cursor:'pointer',marginBottom:1,background:page===n.id?'rgba(20,116,196,.18)':'transparent',color:page===n.id?S.sky:'rgba(255,255,255,.55)',justifyContent:sideOff?'center':'flex-start'}}>
              <span style={{color:page===n.id?S.sky:'rgba(255,255,255,.4)',flexShrink:0}}>{n.icon}</span>
              {!sideOff&&<span style={{fontSize:13,fontWeight:page===n.id?600:400}}>{n.label}</span>}
            </button>
          ))}
        </nav>
        {!sideOff&&(
          <div style={{padding:'10px 12px 14px',borderTop:'1px solid rgba(184,201,230,.08)',flexShrink:0}}>
            <p style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(184,201,230,.38)',marginBottom:5}}>Team</p>
            <select value={teamF} onChange={e=>setTeamF(e.target.value)} style={{width:'100%',height:27,padding:'0 6px',fontSize:11,border:'1px solid rgba(184,201,230,.16)',borderRadius:4,background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.75)',cursor:'pointer',outline:'none',marginBottom:10}}>
              <option value="all">All Teams</option><option value="tas">TAS Only</option><option value="cds">CDS Only</option>
            </select>
            <p style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(184,201,230,.38)',marginBottom:5}}>Period</p>
            <div className="wdd" style={{position:'relative'}}>
              <button onClick={()=>setWeekDD(v=>!v)} style={{width:'100%',height:27,padding:'0 8px',fontSize:11,border:'1px solid rgba(184,201,230,.16)',borderRadius:4,background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.75)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',outline:'none'}}>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,textAlign:'left'}}>{weekLabel()}</span>
                <ChevronDown size={11} style={{flexShrink:0,marginLeft:4,transform:weekDD?'rotate(180deg)':'none',transition:'.15s'}}/>
              </button>
              {weekDD&&<div style={{position:'absolute',bottom:'calc(100% + 4px)',left:0,right:0,background:S.navyMid,border:'1px solid rgba(184,201,230,.16)',borderRadius:6,boxShadow:'0 -8px 24px rgba(0,0,0,.3)',zIndex:50,overflow:'hidden'}}>
                <div style={{maxHeight:190,overflowY:'auto',padding:4}}>
                  {weeks.map(w=><label key={w.key} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 8px',cursor:'pointer',borderRadius:4,background:selWeeks.includes(w.key)?'rgba(20,116,196,.22)':'transparent'}}><input type="checkbox" checked={selWeeks.includes(w.key)} onChange={()=>toggleWeek(w.key)} style={{width:12,height:12,accentColor:S.blue,cursor:'pointer',flexShrink:0}}/><span style={{fontSize:11,color:'rgba(255,255,255,.75)'}}>{w.label}</span></label>)}
                </div>
                <div style={{borderTop:'1px solid rgba(184,201,230,.08)',display:'flex',padding:4,gap:4}}>
                  <button onClick={()=>setSelWeeks(weeks.map(w=>w.key))} style={{flex:1,padding:'3px 0',fontSize:10,fontWeight:500,color:S.sky,background:'none',border:'none',cursor:'pointer'}}>All</button>
                  <button onClick={()=>weeks.length&&setSelWeeks([weeks[0].key])} style={{flex:1,padding:'3px 0',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.4)',background:'none',border:'none',cursor:'pointer'}}>Latest</button>
                </div>
              </div>}
            </div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        <div style={{height:52,background:S.white,borderBottom:`1px solid ${S.border}`,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:20,flexShrink:0}}>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:17,fontWeight:500,color:S.navy,margin:0,letterSpacing:'-.01em'}}>{NAV.find(n=>n.id===page)?.label}</h1>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={load} style={{height:28,padding:'0 10px',fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.slate,cursor:'pointer',display:'flex',alignItems:'center',gap:5,outline:'none'}}><RefreshCw size={11} color={S.muted}/> Refresh</button>
            {updatedAt&&<span style={{fontSize:11,color:S.muted}}>as of {updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}, {updatedAt.toLocaleTimeString()}</span>}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{height:36,background:S.white,borderBottom:`1px solid ${S.border}`,padding:'0 24px',display:'flex',alignItems:'center',flexShrink:0,overflow:'hidden'}}>
          {[{l:'Members',v:ST.n,u:'',c:S.ink},{l:'Billable',v:ST.tB.toFixed(0),u:'h',c:S.blue},{l:'Internal',v:ST.tI.toFixed(0),u:'h',c:'#6D28D9'},{l:'OOO',v:ST.tO.toFixed(0),u:'h',c:S.muted},{l:'Avg Util',v:ST.avgU.toFixed(0),u:'%',c:ST.avgU>=95?S.red:ST.avgU<60?S.blue:S.green},{l:'At Risk',v:ST.nOver,u:'',c:ST.nOver>0?S.red:S.muted},{l:'Bandwidth',v:Math.max(0,ST.tA).toFixed(0),u:'h',c:ST.tA<0?S.red:S.ink}].map((s,i)=>(
            <React.Fragment key={i}>
              {i>0&&<div style={{width:1,height:14,background:S.border,margin:'0 14px',flexShrink:0}}/>}
              <div style={{display:'flex',alignItems:'baseline',gap:4,flexShrink:0,whiteSpace:'nowrap'}}>
                <span style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:S.muted}}>{s.l}</span>
                <span style={{fontSize:13,fontWeight:700,color:s.c,fontVariantNumeric:'tabular-nums'}}>{s.v}{s.u}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{flex:1,padding:16,overflowY:'auto'}}>

          {/* DASHBOARD */}
          {page==='dashboard'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 255px',gap:14,alignItems:'start'}}>
              <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
                <div style={{padding:'10px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,fontWeight:600,color:S.navy}}>Capacity Overview</span>
                  <div style={{display:'flex',gap:12}}>{[['#1474C4','Billable'],['#6D28D9','Int/BD'],['#94A3B8','OOO'],['#E1E7F0','Available']].map(([c,l])=><div key={l} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:1,background:c,border:l==='Available'?`1px solid ${S.border}`:'none'}}/><span style={{fontSize:10,color:S.muted}}>{l}</span></div>)}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'160px 1fr 44px 74px',padding:'5px 14px',gap:8,borderBottom:`1px solid ${S.border}`,background:S.cloud}}>
                  {['Name','','Util','Status'].map((h,i)=><span key={i} style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:S.muted,textAlign:i===2?'right':'left'}}>{h}</span>)}
                </div>
                {Object.values(members).filter(m=>m.total>0).sort((a,b)=>b.util-a.util).map((m,i)=>{
                  const cap=40*Math.max(selWeeks.length,1);const uc=m.risk==='Over'?S.red:m.risk==='Under'?S.blue:S.green;
                  return<div key={i} style={{display:'grid',gridTemplateColumns:'160px 1fr 44px 74px',padding:'6px 14px',gap:8,alignItems:'center',borderBottom:`1px solid ${S.border}`,background:m.risk==='Over'?'#FFF8F8':m.risk==='Under'?'#F8FBFF':i%2===1?S.cloud:S.white}}>
                    <div><div style={{fontSize:12,fontWeight:500,color:S.ink,lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.name}</div><div style={{fontSize:10,color:S.muted,marginTop:1}}>{m.isCDS?'CDS':'TAS'}{m.ooo>0?` · ${m.ooo.toFixed(0)}h OOO`:''}</div></div>
                    <CapBar billable={m.billable} internal={m.internal} ooo={m.ooo} avail={Math.max(0,m.avail)} cap={cap}/>
                    <div style={{textAlign:'right',fontSize:12,fontWeight:700,color:uc,fontVariantNumeric:'tabular-nums'}}>{m.util.toFixed(0)}%</div>
                    <RiskChip r={m.risk}/>
                  </div>;
                })}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
                  <div style={{padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud}}><span style={{fontSize:12,fontWeight:600,color:S.navy}}>Billable by Client</span></div>
                  <div style={{padding:'10px 4px 6px'}}>
                    <ResponsiveContainer width="100%" height={clientHours.length*28+8}>
                      <BarChart data={clientHours} layout="vertical" margin={{top:0,right:36,bottom:0,left:4}} barCategoryGap="28%">
                        <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke={S.border}/>
                        <XAxis type="number" tick={{fontSize:9,fill:S.muted}} tickLine={false} axisLine={false}/>
                        <YAxis type="category" dataKey="c" tick={{fontSize:11,fill:S.ink}} tickLine={false} axisLine={false} width={68}/>
                        <Tooltip formatter={v=>[`${v}h`,'Hrs']} contentStyle={{fontSize:11,border:`1px solid ${S.border}`,borderRadius:3}} cursor={{fill:S.cloud}}/>
                        <Bar dataKey="h" radius={[0,3,3,0]} maxBarSize={13}>{clientHours.map((r,i)=><Cell key={i} fill={cc(r.c)} fillOpacity={.8}/>)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
                  <div style={{padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud}}><span style={{fontSize:12,fontWeight:600,color:S.navy}}>Summary</span></div>
                  <table style={{width:'100%',borderCollapse:'collapse'}}><tbody>
                    {[['Billable',`${ST.tB.toFixed(0)}h`,S.blue],['Internal/BD',`${ST.tI.toFixed(0)}h`,'#6D28D9'],['OOO',`${ST.tO.toFixed(0)}h`,S.muted],['Avg util',`${ST.avgU.toFixed(0)}%`,ST.avgU>=95?S.red:ST.avgU<60?S.blue:S.green],['Bandwidth',`${Math.max(0,ST.tA).toFixed(0)}h`,S.blue],['At risk',`${ST.nOver}`,ST.nOver>0?S.red:S.muted],['Under',`${ST.nUnder}`,ST.nUnder>0?S.blue:S.muted]].map(([l,v,c],i)=>(
                      <tr key={i} style={{borderBottom:`1px solid ${S.border}`}}><td style={{padding:'5px 14px',color:S.slate,fontSize:12}}>{l}</td><td style={{padding:'5px 14px',textAlign:'right',fontWeight:700,color:c,fontVariantNumeric:'tabular-nums',fontSize:12}}>{v}</td></tr>
                    ))}
                  </tbody></table>
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {page==='projects'&&(
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:7,padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud}}>
                <div style={{position:'relative',flexShrink:0}}>
                  <Search size={12} color={S.muted} style={{position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                  <input value={pSearch} onChange={e=>setPSearch(e.target.value)} placeholder="Search projects…" style={{height:28,paddingLeft:25,paddingRight:pSearch?22:7,width:200,fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,outline:'none',boxSizing:'border-box'}}/>
                  {pSearch&&<button onClick={()=>setPSearch('')} style={{position:'absolute',right:5,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:S.muted,display:'flex',alignItems:'center',padding:0}}><X size={11}/></button>}
                </div>
                <select value={pClient} onChange={e=>setPClient(e.target.value)} style={{height:28,padding:'0 7px',fontSize:12,minWidth:130,border:`1px solid ${pClient!=='all'?S.blue:S.border}`,borderRadius:4,background:pClient!=='all'?'#EBF4FB':S.white,color:pClient!=='all'?S.blue:S.slate,cursor:'pointer',outline:'none',fontWeight:pClient!=='all'?600:400}}>
                  <option value="all">All clients</option>{allClients.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select value={pType} onChange={e=>setPType(e.target.value)} style={{height:28,padding:'0 7px',fontSize:12,border:`1px solid ${pType!=='all'?S.blue:S.border}`,borderRadius:4,background:pType!=='all'?'#EBF4FB':S.white,color:pType!=='all'?S.blue:S.slate,cursor:'pointer',outline:'none',fontWeight:pType!=='all'?600:400}}>
                  <option value="all">All types</option><option value="billable">Billable</option><option value="internal-bd">Internal / BD</option>
                </select>
                {hasFilters&&<button onClick={()=>{setPSearch('');setPClient('all');setPType('all');}} style={{height:28,padding:'0 9px',fontSize:11,fontWeight:500,border:'1px solid #FECACA',borderRadius:4,background:'#FEF2F2',color:S.red,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><X size={11}/>Clear</button>}
                <span style={{marginLeft:'auto',fontSize:11,color:S.muted,whiteSpace:'nowrap'}}>{clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects · {clientGroups.length} clients</span>
              </div>

              {/* TABLE — fixed layout, 1 line per row */}
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,tableLayout:'fixed'}}>
                  <colgroup>
                    <col style={{width:340}}/>{/* Project name - truncates with ellipsis */}
                    <col style={{width:70}}/>{/* Hours */}
                    <col style={{width:72}}/>{/* % */}
                    <col style={{width:86}}/>{/* Type */}
                    <col/>{/* Members - flex */}
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{...TH(false,14),cursor:'pointer'}} onClick={()=>tsP('name')}>Project{arr(pSort,'name')}</th>
                      <th style={{...TH(true,12),cursor:'pointer'}} onClick={()=>tsP('hours')}>Hours{arr(pSort,'hours')}</th>
                      <th style={TH(true,12)}>% Bill.</th>
                      <th style={TH(false,12)}>Type</th>
                      <th style={TH(false,12)}>Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientGroups.length===0&&<tr><td colSpan={5} style={{padding:'44px 16px',textAlign:'center',color:S.muted}}>No projects match filters</td></tr>}
                    {clientGroups.map((cg,ci)=>{
                      const isCollapsed=collapsed[cg.client];
                      const clientCol=cc(cg.client);
                      const billTotal=cg.projs.filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0);
                      return(
                        <React.Fragment key={ci}>
                          {/* CLIENT ROW */}
                          <tr onClick={()=>setCollapsed(p=>({...p,[cg.client]:!p[cg.client]}))} style={{cursor:'pointer',background:'#EEF2F8',borderTop:`2px solid ${S.borderM}`,borderBottom:`1px solid ${S.borderM}`,borderLeft:`4px solid ${clientCol}`}}>
                            <td style={{padding:'7px 12px',paddingLeft:10}}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                {isCollapsed?<ChevronRight size={13} color={S.slate}/>:<ChevronDown size={13} color={S.slate}/>}
                                <span style={{fontSize:13,fontWeight:700,color:S.navy,whiteSpace:'nowrap'}}>{cg.client}</span>
                                <span style={{fontSize:11,color:S.slateL,whiteSpace:'nowrap'}}>({cg.projs.length})</span>
                              </div>
                            </td>
                            <td style={{padding:'7px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:S.ink,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{cg.total.toFixed(1)}</td>
                            <td style={{padding:'7px 12px',textAlign:'right',fontSize:11,color:S.slateL,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{totalBillHrs>0&&billTotal>0?pctFmt(billTotal,totalBillHrs):''}</td>
                            <td colSpan={2}/>
                          </tr>

                          {/* PROJECT ROWS — strictly 1 line each */}
                          {!isCollapsed&&cg.projs.map((p,pi)=>{
                            const mems=Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                            const isBill=p.cat==='Billable';
                            return(
                              <tr key={pi} className="pr" style={{background:pi%2===0?S.white:'#FAFBFC',borderBottom:`1px solid #EEF1F6`,borderLeft:`3px solid ${clientCol}`}}>

                                {/* Project name: truncates, never wraps */}
                                <td style={{padding:'5px 12px',paddingLeft:20,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',fontSize:13,color:S.ink,maxWidth:0}} title={p.name}>
                                  {p.name}
                                </td>

                                {/* Hours */}
                                <td style={{padding:'5px 12px',textAlign:'right',fontWeight:600,fontSize:13,color:S.ink,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>
                                  {p.hrs.toFixed(1)}
                                </td>

                                {/* % billable */}
                                <td style={{padding:'5px 12px',textAlign:'right',fontSize:12,color:S.muted,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>
                                  {isBill?pctFmt(p.hrs,totalBillHrs):'—'}
                                </td>

                                {/* Type */}
                                <td style={{padding:'5px 12px',fontSize:11,fontWeight:500,color:isBill?S.blue:'#6D28D9',whiteSpace:'nowrap'}}>
                                  {pType==='all'?p.cat:''}
                                </td>

                                {/* Members — inline compact chips, overflow hidden = never wraps */}
                                <td style={{padding:'5px 8px',overflow:'hidden',whiteSpace:'nowrap'}}>
                                  {mems.map(([n,h],mi)=>(
                                    <span key={mi} style={{display:'inline-flex',alignItems:'center',gap:3,background:S.cloud,border:`1px solid ${S.border}`,borderRadius:3,padding:'1px 5px',marginRight:4,flexShrink:0,fontSize:11,whiteSpace:'nowrap'}}>
                                      <span style={{color:S.ink,fontWeight:500}}>{n.split(' ')[0]}</span>
                                      <span style={{color:S.muted,fontVariantNumeric:'tabular-nums'}}>{h.toFixed(0)}h</span>
                                    </span>
                                  ))}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    {clientGroups.length>0&&(
                      <tr style={{background:S.cloud,borderTop:`2px solid ${S.borderM}`}}>
                        <td style={{padding:'6px 14px',fontSize:11,fontWeight:600,color:S.slateL,whiteSpace:'nowrap'}}>{clientGroups.length} clients · {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects</td>
                        <td style={{padding:'6px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:S.ink,fontVariantNumeric:'tabular-nums'}}>{clientGroups.reduce((s,g)=>s+g.total,0).toFixed(1)}</td>
                        <td colSpan={3}/>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TEAM */}
          {page==='team'&&(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud}}>
                  <div style={{position:'relative'}}><Search size={12} color={S.muted} style={{position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/><input value={tSearch} onChange={e=>setTSearch(e.target.value)} placeholder="Search…" style={{height:28,paddingLeft:25,paddingRight:7,width:170,fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,outline:'none',boxSizing:'border-box'}}/></div>
                  <span style={{marginLeft:'auto',fontSize:11,color:S.muted}}>{sortedTeam.length} members</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                    <thead><tr>
                      <th style={{...TH(false,14,undefined,true)}} onClick={()=>tsT('name')}>Name{arr(tSort,'name')}</th>
                      <th style={TH(false,12,54)}>Team</th>
                      <th style={{...TH(true,12,76,true)}} onClick={()=>tsT('billable')}>Billable{arr(tSort,'billable')}</th>
                      <th style={{...TH(true,12,70,true)}} onClick={()=>tsT('internal')}>Int/BD{arr(tSort,'internal')}</th>
                      <th style={{...TH(true,12,54,true)}} onClick={()=>tsT('ooo')}>OOO{arr(tSort,'ooo')}</th>
                      <th style={{...TH(true,12,74,true)}} onClick={()=>tsT('utilized')}>Utilized{arr(tSort,'utilized')}</th>
                      <th style={{...TH(true,12,70,true)}} onClick={()=>tsT('avail')}>Avail{arr(tSort,'avail')}</th>
                      <th style={{...TH(false,12,148,true)}} onClick={()=>tsT('util')}>Utilization{arr(tSort,'util')}</th>
                      <th style={TH(false,12,74)}>Status</th>
                      <th style={TH(true,12,52)}>Projs</th>
                    </tr></thead>
                    <tbody>
                      {sortedTeam.map((m,i)=>{
                        const isOpen=openRow===m.name;
                        const projs=Object.entries(m.jobs).filter(([jc])=>catOf(jc)!=='OOO').sort(([,a],[,b])=>b-a);
                        const uc=m.risk==='Over'?S.red:m.risk==='Under'?S.blue:S.green;
                        const rowBg=isOpen?'#EBF4FB':m.risk==='Over'?'#FFF8F8':m.risk==='Under'?'#F8FBFF':i%2===1?S.cloud:S.white;
                        const td0={borderBottom:`1px solid ${S.border}`,padding:'5px 12px',color:S.slate,fontVariantNumeric:'tabular-nums',verticalAlign:'middle'};
                        return(
                          <React.Fragment key={i}>
                            <tr className="tr" onClick={()=>setOpenRow(isOpen?null:m.name)} style={{cursor:'pointer',background:rowBg}}>
                              <td style={{...td0,paddingLeft:14}}><div style={{display:'flex',alignItems:'center',gap:5}}>{isOpen?<ChevronDown size={11} color={S.muted}/>:<ChevronRight size={11} color={S.muted}/>}<span style={{fontWeight:500,color:S.ink,whiteSpace:'nowrap'}}>{m.name}</span></div></td>
                              <td style={td0}><span style={{fontSize:10,fontWeight:700,padding:'1px 5px',borderRadius:3,background:m.isCDS?'#EDE9FE':'#DBEAFE',color:m.isCDS?'#5B21B6':S.blue}}>{m.isCDS?'CDS':'TAS'}</span></td>
                              <td style={{...td0,textAlign:'right'}}>{m.billable.toFixed(1)}</td>
                              <td style={{...td0,textAlign:'right'}}>{m.internal.toFixed(1)}</td>
                              <td style={{...td0,textAlign:'right',color:S.muted}}>{m.ooo.toFixed(1)}</td>
                              <td style={{...td0,textAlign:'right',fontWeight:600,color:S.ink}}>{m.utilized.toFixed(1)}</td>
                              <td style={{...td0,textAlign:'right',fontWeight:600,color:m.avail<0?S.red:m.avail<8?S.amber:S.ink}}>{m.avail.toFixed(1)}</td>
                              <td style={{...td0,minWidth:148}}><div style={{display:'flex',alignItems:'center',gap:7}}><div style={{flex:1,height:5,background:S.border,borderRadius:2,overflow:'hidden'}}><div style={{height:5,borderRadius:2,background:uc,width:`${Math.min(m.util,100)}%`}}/></div><span style={{fontSize:11,fontWeight:700,color:uc,fontVariantNumeric:'tabular-nums',minWidth:27,textAlign:'right'}}>{m.util.toFixed(0)}%</span></div></td>
                              <td style={td0}><RiskChip r={m.risk}/></td>
                              <td style={{...td0,textAlign:'right',color:S.muted}}>{projs.length}</td>
                            </tr>
                            {isOpen&&<tr style={{background:'#F0F7FF'}}><td colSpan={10} style={{padding:'0 14px 10px',borderBottom:`1px solid ${S.border}`}}>
                              <div style={{marginLeft:18,marginTop:8,maxWidth:440}}>
                                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr style={{borderBottom:`1px solid ${S.border}`}}>{['Project','Hrs','%'].map((h,i)=><th key={i} style={{padding:'3px 8px',textAlign:i>0?'right':'left',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:S.muted}}>{h}</th>)}</tr></thead>
                                  <tbody>{projs.map(([jc,hrs],j)=><tr key={j} style={{borderBottom:j<projs.length-1?`1px solid #EEF1F6`:'none'}}><td style={{padding:'4px 8px',color:S.ink}}>{jc}</td><td style={{padding:'4px 8px',textAlign:'right',fontWeight:600,color:S.ink,fontVariantNumeric:'tabular-nums'}}>{hrs.toFixed(1)}</td><td style={{padding:'4px 8px',textAlign:'right',color:S.muted,fontVariantNumeric:'tabular-nums'}}>{m.utilized>0?Math.round((hrs/m.utilized)*100):0}%</td></tr>)}</tbody>
                                </table>
                              </div>
                            </td></tr>}
                          </React.Fragment>
                        );
                      })}
                      <tr style={{background:S.cloud,borderTop:`2px solid ${S.borderM}`}}>
                        <td colSpan={2} style={{padding:'6px 14px',fontSize:12,fontWeight:700,color:S.navy}}>Total</td>
                        {[ST.tB,ST.tI,ST.tO,ST.tU].map((v,i)=><td key={i} style={{padding:'6px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:S.ink,fontVariantNumeric:'tabular-nums',borderBottom:`1px solid ${S.border}`}}>{v.toFixed(1)}</td>)}
                        <td style={{padding:'6px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:ST.tA<0?S.red:S.ink,fontVariantNumeric:'tabular-nums',borderBottom:`1px solid ${S.border}`}}>{ST.tA.toFixed(1)}</td>
                        <td style={{padding:'6px 12px',borderBottom:`1px solid ${S.border}`}}><div style={{display:'flex',alignItems:'center',gap:7}}><div style={{flex:1,height:5,background:S.border,borderRadius:2,overflow:'hidden'}}><div style={{height:5,borderRadius:2,background:S.blue,width:`${Math.min(ST.avgU,100)}%`}}/></div><span style={{fontSize:11,fontWeight:700,color:S.ink,fontVariantNumeric:'tabular-nums',minWidth:27,textAlign:'right'}}>{ST.avgU.toFixed(0)}%</span></div></td>
                        <td colSpan={2} style={{borderBottom:`1px solid ${S.border}`}}/>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HEATMAP */}
              {ganttData.names.length>0&&ganttData.weeks.length>0&&(
                <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
                  <div style={{padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontFamily:'Playfair Display,serif',fontSize:14,fontWeight:500,color:S.navy}}>Utilization Heatmap — by Person &amp; Week</span>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>{[['#FCA5A5','≥95%'],['#93C5FD','75–95%'],['#86EFAC','60–75%'],['#E2E8F0','<60%']].map(([c,l])=><div key={l} style={{display:'flex',alignItems:'center',gap:3}}><div style={{width:9,height:9,borderRadius:1,background:c}}/><span style={{fontSize:10,color:S.muted}}>{l}</span></div>)}</div>
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
                      <colgroup><col style={{width:164,minWidth:164}}/>{ganttData.weeks.map(w=><col key={w.key} style={{width:62,minWidth:54}}/>)}</colgroup>
                      <thead><tr style={{borderBottom:`2px solid ${S.borderM}`}}>
                        <th style={{...TH(false,14),position:'sticky',left:0,zIndex:2,background:S.cloud}}>Person</th>
                        {ganttData.weeks.map(w=><th key={w.key} style={{...TH(false,3),padding:'5px 3px',fontSize:9,background:S.cloud,textAlign:'center'}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:60}}>{w.label.replace(/,.*$/,'').split(' – ')[0]}</div></th>)}
                      </tr></thead>
                      <tbody>
                        {ganttData.names.map((name,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${S.border}`,background:i%2===1?S.cloud:S.white}}>
                            <td style={{padding:'3px 14px',fontSize:12,fontWeight:500,color:S.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',position:'sticky',left:0,zIndex:1,background:i%2===1?S.cloud:S.white,borderBottom:`1px solid ${S.border}`}}>{name}</td>
                            {ganttData.weeks.map(w=>{const d=ganttData.grid[name]?.[w.key];const tip=d?`${name}\n${w.label}\nBillable: ${d.b.toFixed(1)}h  Int/BD: ${d.i.toFixed(1)}h  OOO: ${d.o.toFixed(1)}h`:'';<td key={w.key} style={{padding:'3px 4px',borderBottom:`1px solid ${S.border}`}}><HeatCell util={d?.util??null} title={tip}/></td>})}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXCEPTIONS */}
          {page==='exceptions'&&(
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>{['Issue','Team Member','Details','Action'].map((h,i)=><th key={i} style={TH(false,i===0?14:12,i===0?116:i===1?170:undefined)}>{h}</th>)}</tr></thead>
                <tbody>
                  {Object.values(members).filter(m=>m.avail<0).map((m,i)=>(
                    <tr key={`o${i}`} style={{borderBottom:`1px solid ${S.border}`,background:'#FFF8F8',borderLeft:`3px solid ${S.red}`}}>
                      <td style={{padding:'8px 12px',paddingLeft:11}}><span style={{fontSize:11,fontWeight:600,padding:'1px 6px',borderRadius:3,background:'#FEE2E2',color:'#991B1B'}}>Overallocated</span></td>
                      <td style={{padding:'8px 12px',fontWeight:500,color:S.ink}}>{m.name}</td>
                      <td style={{padding:'8px 12px',color:S.slate}}>{Math.abs(m.avail).toFixed(1)}h over · {m.util.toFixed(0)}% utilized</td>
                      <td style={{padding:'8px 12px',fontWeight:600,color:S.red,fontSize:12}}>Rebalance work</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.total>0&&m.total<20).map((m,i)=>(
                    <tr key={`l${i}`} style={{borderBottom:`1px solid ${S.border}`,background:S.amberBg,borderLeft:'3px solid #D97706'}}>
                      <td style={{padding:'8px 12px',paddingLeft:11}}><span style={{fontSize:11,fontWeight:600,padding:'1px 6px',borderRadius:3,background:'#FEF3C7',color:'#92400E'}}>Low Hours</span></td>
                      <td style={{padding:'8px 12px',fontWeight:500,color:S.ink}}>{m.name}</td>
                      <td style={{padding:'8px 12px',color:S.slate}}>Only {m.total.toFixed(1)}h logged</td>
                      <td style={{padding:'8px 12px',fontWeight:600,color:S.amber,fontSize:12}}>Review entry</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.avail<0||m.total<20).length===0&&<tr><td colSpan={4} style={{padding:'44px 16px',textAlign:'center',color:S.muted}}>No exceptions this period 🎉</td></tr>}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
