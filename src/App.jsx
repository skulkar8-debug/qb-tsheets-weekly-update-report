import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// ─── LOGO PATH ───────────────────────────────────────────────────────────────
// CRA:   put logo.png in /public  → src="/logo.png"  ✓ (default below)
// Vite:  put logo.png in /public  → src="/logo.png"  ✓
// Next:  put logo.png in /public  → src="/logo.png"  ✓
// If your app is served from a sub-path e.g. /staffing/, change to '/staffing/logo.png'
// OR: import logoSrc from './logo.png' and replace LOGO_SRC with logoSrc
const LOGO_SRC = '/logo.png';
import {
  LayoutDashboard, Users, AlertTriangle, BarChart2,
  Search, RefreshCw, AlertCircle, ChevronDown, ChevronLeft, ChevronRight, X, Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell } from 'recharts';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv';
const CDS_TEAM = new Set(['Mohit Sharma','Rakesh Nayak','Sharvan Pandey','Stefan Joseph','Jogendra Singh','Ramya D','Vaishnav Govind']);

// ── STOC tokens ──
const S = {
  navy:'#041E42', navyMid:'#0A2447', blue:'#1474C4', sky:'#B8C9E6',
  cloud:'#F2F5FA', border:'#E1E7F0', borderM:'#C8D4E5',
  white:'#FFFFFF', ink:'#0A2447', slate:'#475569', slateL:'#64748B', muted:'#94A3B8',
  green:'#15803D', red:'#DC2626', amber:'#B45309',
};

// ── Client colors — dark enough to read white text, distinct enough to tell apart ──
// ── CLIENT COLORS ──────────────────────────────────────────────────────────────
// Each client gets a hue that is visually distinct from its neighbors.
// Rule: no two adjacent entries share the same hue family.
// bar  = solid color used in gantt cells, chart bars, left borders
// bg   = very light tint used in card headers / selected pill backgrounds
// text = dark shade of the same hue for readable text on bg
const CC = {
  // ── Billable clients ──────────────────────────────────────────
  'AEG':                  { bar:'#1d6fa8', bg:'#ddeeff', text:'#0d3d5e' }, // BLUE
  'SALT':                 { bar:'#b45309', bg:'#fef3e2', text:'#7c2d00' }, // AMBER  (was teal — now distinct from AEG)
  'ADP':                  { bar:'#7c3aed', bg:'#ede9fe', text:'#3b1480' }, // VIOLET
  'SP USA':               { bar:'#be185d', bg:'#fce7f3', text:'#831843' }, // PINK   (was brown/amber — now distinct from SALT)
  'CPC':                  { bar:'#0f766e', bg:'#ccfbf1', text:'#134e4a' }, // TEAL   (was dark blue — now in its own hue)
  'Riata':                { bar:'#15803d', bg:'#dcfce7', text:'#14532d' }, // GREEN
  'Beacon':               { bar:'#c2410c', bg:'#ffedd5', text:'#7c2d12' }, // ORANGE (was purple — now distinct from ADP)
  'Archway':              { bar:'#dc2626', bg:'#fee2e2', text:'#991b1b' }, // RED
  'Budget':               { bar:'#a16207', bg:'#fef9c3', text:'#713f12' }, // YELLOW-BROWN
  'LSC':                  { bar:'#0369a1', bg:'#e0f2fe', text:'#0c4a6e' }, // SKY BLUE (was teal — now lighter blue family)
  // ── Internal ──────────────────────────────────────────────────
  'Administrative':       { bar:'#6b7280', bg:'#f3f4f6', text:'#374151' }, // NEUTRAL GRAY
  'Business Development': { bar:'#4338ca', bg:'#e0e7ff', text:'#312e81' }, // INDIGO  (was gray — now distinct)
  'CDS Internal':         { bar:'#0e7490', bg:'#cffafe', text:'#155e75' }, // CYAN    (was blue — now distinct hue)
  // ── Catchalls ─────────────────────────────────────────────────
  'OOO':                  { bar:'#9ca3af', bg:'#f9fafb', text:'#4b5563' }, // LIGHT GRAY
  'Other':                { bar:'#64748b', bg:'#f1f5f9', text:'#334155' }, // SLATE
};
// Auto-assign colors for any client not in CC above.
// 12 hues that are all maximally distinct from each other:
const AUTO_PAL = [
  {bar:'#d97706',bg:'#fef3c7',text:'#92400e'}, // amber
  {bar:'#7c3aed',bg:'#ede9fe',text:'#4c1d95'}, // violet
  {bar:'#0891b2',bg:'#cffafe',text:'#164e63'}, // cyan
  {bar:'#16a34a',bg:'#dcfce7',text:'#14532d'}, // green
  {bar:'#db2777',bg:'#fce7f3',text:'#831843'}, // pink
  {bar:'#ea580c',bg:'#ffedd5',text:'#9a3412'}, // orange
  {bar:'#2563eb',bg:'#dbeafe',text:'#1e3a8a'}, // blue
  {bar:'#dc2626',bg:'#fee2e2',text:'#991b1b'}, // red
  {bar:'#0d9488',bg:'#ccfbf1',text:'#134e4a'}, // teal
  {bar:'#9333ea',bg:'#f3e8ff',text:'#581c87'}, // purple
  {bar:'#ca8a04',bg:'#fef9c3',text:'#713f12'}, // yellow
  {bar:'#0369a1',bg:'#e0f2fe',text:'#0c4a6e'}, // sky
];
const _autoMap = {}, _autoIdx = {v:0};
const cCol = c => {
  if(CC[c]) return CC[c];
  if(!_autoMap[c]) { _autoMap[c] = AUTO_PAL[_autoIdx.v % AUTO_PAL.length]; _autoIdx.v++; }
  return _autoMap[c];
};

// ── DATA HELPERS ──
const normalizeClient = j => {
  if(!j) return 'Other';
  const t = j.trim();
  if(/^(holiday|vacation|sick)$/i.test(t)) return 'OOO';
  if(/^administrative$/i.test(t)) return 'Administrative';
  if(/^business development/i.test(t)) return 'Business Development';
  if(/^cds\b/i.test(t) || /tableau/i.test(t)) return 'CDS Internal';
  if(/^AEG(\s|[-–]|$)/i.test(t)) return 'AEG';
  if(/^SALT(\s|[-–]|$)/i.test(t)) return 'SALT';
  if(/^ADP(\s|[-–]|$)/i.test(t)) return 'ADP';
  if(/^(SP\s*USA|SPUSA)(\s|[-–]|$)/i.test(t)) return 'SP USA';
  if(/^CPC(\s|[-–]|$)/i.test(t)) return 'CPC';
  if(/^RIATA(\s|[-–]|$)/i.test(t)) return 'Riata';
  if(/^BEACON/i.test(t)) return 'Beacon';
  if(/^ARCHWAY/i.test(t)) return 'Archway';
  if(/^BUDGET/i.test(t)) return 'Budget';
  if(/^LSC(\s|[-–]|$)/i.test(t)) return 'LSC';
  const m = t.match(/^(.+?)\s*[-–]\s*/);
  return m ? m[1].trim() : t;
};
const catOf = j => {
  if(!j) return 'Billable';
  const t = j.trim();
  if(/^(holiday|vacation|sick)$/i.test(t)) return 'OOO';
  if(/^administrative$/i.test(t) || /^business development/i.test(t) || /^cds\b/i.test(t) || /tableau/i.test(t)) return 'Internal/BD';
  return 'Billable';
};
const parseCSV = text => {
  const clean = text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const lines = clean.split('\n').filter(l => l.trim());
  if(lines.length < 2) return [];
  const pl = line => {
    const r=[]; let cur='',q=false;
    for(let i=0;i<line.length;i++){
      const c=line[i];
      if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}
      else if(c===','&&!q){r.push(cur.trim());cur='';}
      else cur+=c;
    }
    return r.push(cur.trim()),r;
  };
  const hdrs = pl(lines[0]).map(h => h.toLowerCase().replace(/\s+/g,'_'));
  return lines.slice(1)
    .map(line => { const v=pl(line),row={}; hdrs.forEach((h,i)=>{row[h]=v[i]??'';}); return row; })
    .filter(r => r.fname||r.lname||r.username);
};

// Normalize any date string to YYYY-MM-DD (handles M/D/YYYY and YYYY-MM-DD)
const normDate = dateStr => {
  if(!dateStr) return null;
  const s = dateStr.trim();
  // Already ISO format
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // M/D/YYYY or MM/DD/YYYY
  const parts = s.split('/');
  if(parts.length === 3) {
    const [m,d,y] = parts;
    return `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  // Fallback: parse and reformat (uses local time via T12:00:00 to avoid UTC shift)
  const dt = new Date(s + (s.includes('T')?'':'T12:00:00'));
  if(isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0,10);
};

// Convert any local_date value to a Monday-of-week key "YYYY-MM-DD"
const mondayKey = dateStr => {
  const iso = normDate(dateStr);
  if(!iso) return null;
  const [y,m,d] = iso.split('-').map(Number);
  const dt = new Date(y,m-1,d); // local, no UTC shift
  const dow = dt.getDay();
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diffToMon);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

const detectWeeks = rows => {
  const m = {};
  rows.forEach(r => {
    const key = mondayKey(r.local_date);
    if(!key) return;
    if(!m[key]) {
      const mon = new Date(key);
      const sun = new Date(mon); sun.setDate(mon.getDate()+6);
      const fmt = dt => dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
      m[key] = { key, label:`${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}` };
    }
  });
  return Object.values(m).sort((a,b) => b.key.localeCompare(a.key));
};

const riskOf = u => u>=95?'Over':u<60?'Under':'OK';
const pctFmt = (n,d) => { if(!d) return '—'; const p=(n/d)*100; return p<1?'<1%':`${Math.round(p)}%`; };

const downloadCSV = (filename, rows2d) => {
  const escape = v => { const s=String(v??''); return s.includes(',')||s.includes('"')||s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s; };
  const csv = rows2d.map(row => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

// ── MICRO COMPONENTS ──
const RiskChip = ({r}) => {
  const m={Over:{bg:'#FEE2E2',c:'#991B1B',t:'At risk'},Under:{bg:'#DBEAFE',c:'#1E40AF',t:'Under'},OK:{bg:'#DCFCE7',c:'#166534',t:'Healthy'}};
  const st=m[r]||m.OK;
  return <span style={{display:'inline-block',padding:'1px 7px',borderRadius:3,fontSize:11,fontWeight:600,background:st.bg,color:st.c}}>{st.t}</span>;
};

// ── GANTT CELL — solid pastel bg per dominant client, shows hours, hover detail ──
function GanttCell({ dayData, name, dayLabel }) {
  const [tip, setTip] = useState(false);
  const [tipPos, setTipPos] = useState({top:0,left:0});

  const clients = Object.entries(dayData.clients||{}).sort(([,a],[,b])=>b-a);
  const total = dayData.total || 0;
  const isEmpty = total === 0;

  // Dominant client determines cell color
  const dominant = clients[0]?.[0] || null;
  const col = dominant ? cCol(dominant) : null;

  const onEnter = e => {
    const r = e.currentTarget.getBoundingClientRect();
    setTipPos({ top: r.bottom + window.scrollY + 4, left: Math.max(8, r.left + window.scrollX - 60) });
    setTip(true);
  };

  if(isEmpty) return (
    <div style={{height:36,display:'flex',alignItems:'center',justifyContent:'center',
      background:'#F8FAFC',border:`1px solid ${S.border}`,borderRadius:2}}>
      <span style={{fontSize:9,color:'#CBD5E1'}}>—</span>
    </div>
  );

  return (
    <div style={{position:'relative'}} onMouseEnter={onEnter} onMouseLeave={()=>setTip(false)}>
      <div style={{
        height:36, borderRadius:2, border:`1px solid ${col.bar}20`,
        background: col.bg,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        cursor:'pointer', gap:1, padding:'2px 4px',
      }}>
        <span style={{fontSize:12, fontWeight:700, color:col.text, fontVariantNumeric:'tabular-nums', lineHeight:1}}>
          {total % 1 === 0 ? total : total.toFixed(1)}h
        </span>
        {clients.length > 1 && (
          <div style={{display:'flex', gap:2, marginTop:1}}>
            {clients.slice(0,4).map(([cl],i) => (
              <div key={i} style={{width:6,height:3,borderRadius:1,background:cCol(cl).bar,opacity:.7}}/>
            ))}
          </div>
        )}
      </div>
      {tip && (
        <div style={{position:'fixed', top:tipPos.top - window.scrollY, left:tipPos.left,
          background:S.navy, color:'#fff', borderRadius:5, padding:'8px 11px',
          fontSize:11, zIndex:9999, minWidth:160, maxWidth:220, pointerEvents:'none',
          boxShadow:'0 4px 18px rgba(0,0,0,.35)', lineHeight:1.55}}>
          <div style={{fontWeight:700, fontSize:12, color:S.sky, marginBottom:2}}>{name}</div>
          <div style={{fontSize:10, color:'rgba(255,255,255,.5)', marginBottom:6}}>{dayLabel}</div>
          {clients.map(([cl,h],i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:7, marginBottom:3}}>
              <div style={{width:8,height:8,borderRadius:2,background:cCol(cl).bar,flexShrink:0}}/>
              <span style={{flex:1,color:'rgba(255,255,255,.85)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cl}</span>
              <span style={{color:S.sky,fontWeight:600,fontVariantNumeric:'tabular-nums',flexShrink:0}}>{h.toFixed(1)}h</span>
            </div>
          ))}
          <div style={{borderTop:'1px solid rgba(255,255,255,.15)',marginTop:5,paddingTop:5,fontSize:10,color:'rgba(255,255,255,.5)'}}>
            Total: {total.toFixed(1)}h
          </div>
        </div>
      )}
    </div>
  );
}


// ── DATE RANGE PICKER ──
function DateRangePicker({ dateRange, setDateRange, allDays, minDate, maxDate, calOpen, setCalOpen, calHover, setCalHover }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(dateRange.end?new Date(dateRange.end+'T12:00:00').getFullYear():today.getFullYear());
  const [viewMonth, setViewMonth] = useState(dateRange.end?new Date(dateRange.end+'T12:00:00').getMonth():today.getMonth());
  const prev=()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const next=()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};
  const MO=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DO=['Su','Mo','Tu','We','Th','Fr','Sa'];
  const mkCells=(yr,mo)=>{const f=new Date(yr,mo,1).getDay(),l=new Date(yr,mo+1,0).getDate(),a=[];for(let i=0;i<f;i++)a.push(null);for(let d=1;d<=l;d++)a.push(d);return a;};
  const toKey=(yr,mo,d)=>`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const inR=k=>{const{start,end}=dateRange;return start&&end&&k>start&&k<end;};
  const inH=k=>{if(!dateRange.start||dateRange.end||!calHover)return false;const lo=dateRange.start<calHover?dateRange.start:calHover,hi=dateRange.start<calHover?calHover:dateRange.start;return k>lo&&k<hi;};
  const click=k=>{
    if(!allDays.includes(k))return;
    const{start,end}=dateRange;
    if(!start||(start&&end)){setDateRange({start:k,end:''});}
    else{if(k===start){setDateRange({start:'',end:''});return;}const lo=k<start?k:start,hi=k<start?start:k;setDateRange({start:lo,end:hi});setCalOpen(false);}
  };
  const fmt=d=>{if(!d)return'';const dt=new Date(d+'T12:00:00');return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'});};
  const lbl=()=>{const{start,end}=dateRange;if(!start&&!end)return'All dates';if(start&&end)return`${fmt(start)} – ${fmt(end)}`;return start?`From ${fmt(start)}`:`Until ${fmt(end)}`;};
  const todK=toKey(today.getFullYear(),today.getMonth(),today.getDate());
  const renderMo=(yr,mo)=>(
    <div style={{minWidth:200}}>
      <div style={{textAlign:'center',fontSize:12,fontWeight:600,color:S.ink,marginBottom:8}}>{MO[mo]} {yr}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {DO.map(d=><div key={d} style={{fontSize:9,fontWeight:700,color:S.muted,textAlign:'center',padding:'2px 0'}}>{d}</div>)}
        {mkCells(yr,mo).map((day,ci)=>{
          if(!day)return<div key={ci}/>;
          const k=toKey(yr,mo,day),has=allDays.includes(k);
          const isS=k===dateRange.start,isE=k===dateRange.end,mid=inR(k)||inH(k),isHE=!dateRange.end&&k===calHover&&has;
          const wknd=new Date(k+'T12:00:00').getDay()%6===0;
          let bg='transparent',col=has?(wknd?S.muted:S.ink):'#D1D5DB',fw=400,br=4;
          if(isS||isE){bg=S.blue;col='#fff';fw=700;}
          else if(isHE){bg='#93C5FD';col=S.navy;}
          else if(mid){bg='#DBEAFE';col=S.blue;br=0;}
          return(
            <div key={ci} onClick={()=>click(k)} onMouseEnter={()=>setCalHover(k)} onMouseLeave={()=>setCalHover(null)}
              style={{textAlign:'center',padding:'5px 2px',fontSize:11,borderRadius:br,background:bg,color:col,fontWeight:fw,
                cursor:has?'pointer':'default',boxShadow:k===todK&&!isS&&!isE?`inset 0 0 0 1px ${S.borderM}`:'none',
                opacity:has?1:0.3,userSelect:'none',transition:'background .08s'}}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
  const m2=viewMonth===11?0:viewMonth+1,y2=viewMonth===11?viewYear+1:viewYear;
  const now=new Date(),iso=d=>d.toISOString().slice(0,10);
  const mon0=()=>{const d=new Date(now),dw=now.getDay()||7;d.setDate(now.getDate()-(dw-1));return d;};
  const ps=(s,e)=>{setDateRange({start:s,end:e});setCalOpen(false);};
  return(
    <div className="wdd" style={{position:'relative',flexShrink:0}}>
      <button onClick={()=>setCalOpen(v=>!v)} style={{height:28,padding:'0 8px 0 10px',fontSize:12,
        border:`1px solid ${dateRange.start?S.blue:S.border}`,borderRadius:4,
        background:dateRange.start?'#EBF4FB':S.white,color:dateRange.start?S.blue:S.ink,
        cursor:'pointer',display:'flex',alignItems:'center',gap:5,outline:'none',minWidth:170,fontWeight:dateRange.start?600:400}}>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,textAlign:'left',fontSize:12}}>{lbl()}</span>
        {dateRange.start&&<span onClick={e=>{e.stopPropagation();setDateRange({start:'',end:''});setCalOpen(false);}} style={{display:'flex',alignItems:'center',cursor:'pointer',color:S.muted,flexShrink:0,padding:2}}><X size={10}/></span>}
        <ChevronDown size={11} style={{flexShrink:0,transform:calOpen?'rotate(180deg)':'none',transition:'.15s'}}/>
      </button>
      {calOpen&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,background:S.white,
          border:`1px solid ${S.border}`,borderRadius:8,boxShadow:'0 8px 32px rgba(0,0,0,.15)',zIndex:200,padding:14,userSelect:'none',minWidth:460}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <button onClick={prev} style={{background:'none',border:'none',cursor:'pointer',color:S.slate,padding:'2px 10px',fontSize:18}}>&#8249;</button>
            <span style={{fontSize:11,color:S.muted}}>
              {!dateRange.start&&'Click start date'}
              {dateRange.start&&!dateRange.end&&<span style={{color:S.blue,fontWeight:500}}>Click end date</span>}
              {dateRange.start&&dateRange.end&&<span style={{color:S.green,fontWeight:600}}>✓ {lbl()}</span>}
            </span>
            <button onClick={next} style={{background:'none',border:'none',cursor:'pointer',color:S.slate,padding:'2px 10px',fontSize:18}}>&#8250;</button>
          </div>
          <div style={{display:'flex',gap:24}}>{renderMo(viewYear,viewMonth)}{renderMo(y2,m2)}</div>
          <div style={{borderTop:`1px solid ${S.border}`,marginTop:10,paddingTop:8,display:'flex',gap:6,flexWrap:'wrap'}}>
            {[
              ['This week', ()=>{const m=mon0(),f=new Date(m);f.setDate(m.getDate()+4);ps(iso(m),iso(f));}],
              ['Last week', ()=>{const m=mon0(),lm=new Date(m);lm.setDate(m.getDate()-7);const lf=new Date(lm);lf.setDate(lm.getDate()+4);ps(iso(lm),iso(lf));}],
              ['Last 30d',  ()=>{const a=new Date(now);a.setDate(now.getDate()-30);ps(iso(a),iso(now));}],
              ['This month',()=>{ps(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`,iso(now));}],
              ['All data',  ()=>{ps(minDate,maxDate);}],
            ].map(([lb,fn])=>(
              <button key={lb} onClick={fn} style={{padding:'3px 10px',fontSize:11,fontWeight:500,border:`1px solid ${S.border}`,borderRadius:4,background:S.cloud,color:S.slate,cursor:'pointer'}}>{lb}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD PAGE ──
function DashboardPage({ clientGroups, totalBillHrs, pSearch, setPSearch, pClient, setPClient, pType, setPType, pSort, setPSort, allClients, hasFilters, downloadDashboard }) {
  const [selClient, setSelClient] = useState(null);
  const chartData = clientGroups.map(cg=>({client:cg.client,hours:parseFloat(cg.total.toFixed(1)),projs:cg.projs,total:cg.total}));
  const selGroup = clientGroups.find(cg=>cg.client===selClient);
  const CHART_H = Math.max(220, chartData.length*30+40);
  return(
    <div>
      {/* Toolbar */}
      <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:7,padding:'9px 14px',marginBottom:14,borderRadius:5,background:S.white,border:`1px solid ${S.border}`}}>
        <div style={{position:'relative',flexShrink:0}}>
          <Search size={12} color={S.muted} style={{position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
          <input value={pSearch} onChange={e=>setPSearch(e.target.value)} placeholder="Search projects…"
            style={{height:28,paddingLeft:25,paddingRight:pSearch?22:7,width:195,fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,outline:'none',boxSizing:'border-box'}}/>
          {pSearch&&<button onClick={()=>setPSearch('')} style={{position:'absolute',right:5,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:S.muted,display:'flex',alignItems:'center',padding:0}}><X size={11}/></button>}
        </div>
        <select value={pClient} onChange={e=>{setPClient(e.target.value);setSelClient(e.target.value==='all'?null:e.target.value);}} style={{height:28,padding:'0 7px',fontSize:12,minWidth:130,border:`1px solid ${pClient!=='all'?S.blue:S.border}`,borderRadius:4,background:S.white,color:S.ink,cursor:'pointer',outline:'none',fontWeight:pClient!=='all'?600:400}}>
          <option value="all">All clients</option>{allClients.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={pType} onChange={e=>setPType(e.target.value)} style={{height:28,padding:'0 7px',fontSize:12,border:`1px solid ${pType!=='all'?S.blue:S.border}`,borderRadius:4,background:S.white,color:S.ink,cursor:'pointer',outline:'none',fontWeight:pType!=='all'?600:400}}>
          <option value="all">All types</option><option value="billable">Billable</option><option value="internal-bd">Internal / BD</option>
        </select>
        <select value={pSort.k+'-'+pSort.d} onChange={e=>{const[k,d]=e.target.value.split('-');setPSort({k,d});}} style={{height:28,padding:'0 7px',fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,cursor:'pointer',outline:'none'}}>
          <option value="hours-desc">Hours ↓</option><option value="hours-asc">Hours ↑</option><option value="name-asc">Name A–Z</option>
        </select>
        {hasFilters&&<button onClick={()=>{setPSearch('');setPClient('all');setPType('all');setSelClient(null);}} style={{height:28,padding:'0 9px',fontSize:11,fontWeight:500,border:'1px solid #FECACA',borderRadius:4,background:'#FEF2F2',color:S.red,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}><X size={11}/>Clear</button>}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,color:S.muted,whiteSpace:'nowrap'}}>{clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects · {clientGroups.length} clients</span>
          <button onClick={downloadDashboard} style={{height:28,padding:'0 9px',fontSize:11,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.slate,cursor:'pointer',display:'flex',alignItems:'center',gap:4,outline:'none'}}><Download size={11}/> CSV</button>
        </div>
      </div>

      {clientGroups.length===0&&<div style={{padding:'60px 16px',textAlign:'center',color:S.muted,background:S.white,borderRadius:5,border:`1px solid ${S.border}`}}>No projects match filters</div>}

      {clientGroups.length>0&&(
        <div>
          {/* ── COLUMN CHART on top ── */}
          <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden',marginBottom:14}}>
            <div style={{padding:'10px 16px',borderBottom:`1px solid ${S.border}`,background:S.cloud,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:600,color:S.navy}}>Hours by Client</span>
              <span style={{fontSize:11,color:S.muted}}>Click a bar to expand projects below</span>
            </div>
            <div style={{padding:'16px 16px 8px',overflowX:'auto'}}>
              <ResponsiveContainer width="100%" height={CHART_H}>
                <BarChart data={chartData} margin={{top:16,right:16,bottom:60,left:8}} barCategoryGap="25%"
                  onClick={d=>{if(!d?.activePayload)return;const cl=d.activePayload[0]?.payload?.client;setSelClient(p=>p===cl?null:cl);}}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={S.border}/>
                  <XAxis dataKey="client"
                    tick={({x,y,payload})=>(
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={8} fontSize={11} fill={selClient===payload.value?S.navy:S.ink}
                          fontFamily="Inter,sans-serif" fontWeight={selClient===payload.value?700:400}
                          textAnchor="end" transform="rotate(-35)">
                          {payload.value.length>14?payload.value.slice(0,13)+'…':payload.value}
                        </text>
                      </g>
                    )}
                    tickLine={false} axisLine={false} interval={0}/>
                  <YAxis tick={{fontSize:10,fill:S.muted}} tickLine={false} axisLine={false}/>
                  <RTooltip
                    cursor={{fill:'rgba(20,116,196,.06)'}}
                    content={({active,payload})=>{
                      if(!active||!payload?.length)return null;
                      const d=payload[0].payload;
                      return(
                        <div style={{background:S.navy,borderRadius:5,padding:'8px 12px',fontSize:11,boxShadow:'0 4px 16px rgba(0,0,0,.3)'}}>
                          <div style={{fontWeight:700,color:S.sky,marginBottom:3}}>{d.client}</div>
                          <div style={{color:'rgba(255,255,255,.85)'}}>{d.hours}h · {d.projs.length} projects</div>
                          <div style={{color:'rgba(255,255,255,.45)',fontSize:10,marginTop:2}}>Click to {selClient===d.client?'close':'expand'} ↓</div>
                        </div>
                      );
                    }}/>
                  <Bar dataKey="hours" radius={[3,3,0,0]} maxBarSize={48}>
                    {chartData.map((entry,i)=>(
                      <Cell key={i}
                        fill={cCol(entry.client).bar}
                        opacity={selClient&&selClient!==entry.client?0.3:0.9}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── PROJECT DETAIL below chart ── */}
          {selGroup&&(
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden',borderTop:`3px solid ${cCol(selGroup.client).bar}`}}>
              <div style={{padding:'10px 14px',borderBottom:`1px solid ${S.border}`,background:cCol(selGroup.client).bg,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:9,height:9,borderRadius:2,background:cCol(selGroup.client).bar,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,color:cCol(selGroup.client).text}}>{selGroup.client}</span>
                  <span style={{fontSize:11,color:S.slateL}}>{selGroup.projs.length} projects · {selGroup.total.toFixed(1)}h</span>
                </div>
                <button onClick={()=>setSelClient(null)} style={{background:'none',border:'none',cursor:'pointer',color:S.muted,display:'flex',alignItems:'center',padding:2}}><X size={14}/></button>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
                <colgroup><col/><col style={{width:54}}/><col style={{width:40}}/></colgroup>
                <thead>
                  <tr style={{borderBottom:`1px solid ${S.border}`}}>
                    {['Project','Hrs','%'].map((h,i)=>(
                      <th key={i} style={{padding:'6px 14px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:S.muted,textAlign:i>0?'right':'left',background:S.cloud}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selGroup.projs.map((p,pi)=>{
                    const mems=Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                    const isBill=p.cat==='Billable';
                    return(
                      <React.Fragment key={pi}>
                        <tr style={{background:pi%2===0?S.white:'#FAFBFC',borderBottom:'none'}}>
                          <td style={{padding:'6px 14px',fontSize:12,color:S.ink,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',maxWidth:0}} title={p.name}>{p.name}</td>
                          <td style={{padding:'6px 8px',textAlign:'right',fontWeight:600,fontSize:13,color:S.ink,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{p.hrs.toFixed(1)}</td>
                          <td style={{padding:'6px 8px',textAlign:'right',fontSize:11,color:S.muted,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{isBill?pctFmt(p.hrs,totalBillHrs):'—'}</td>
                        </tr>
                        <tr style={{background:pi%2===0?S.white:'#FAFBFC',borderBottom:`1px solid #EEF1F6`}}>
                          <td colSpan={3} style={{padding:'0 14px 8px'}}>
                            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                              {mems.map(([n,h],mi)=>(
                                <span key={mi} style={{display:'inline-flex',alignItems:'center',gap:3,background:S.cloud,border:`1px solid ${S.border}`,borderRadius:3,padding:'2px 7px',fontSize:11,whiteSpace:'nowrap'}}>
                                  <span style={{color:S.ink,fontWeight:500}}>{n.split(' ')[0]}</span>
                                  <span style={{color:cCol(selGroup.client).bar,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{h.toFixed(0)}h</span>
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  const [rows,       setRows]      = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState(null);
  const [updatedAt,  setUpdatedAt] = useState(null);

  const [page,       setPage]      = useState('dashboard');
  const [teamF,      setTeamF]     = useState('all');
  const [dateRange,  setDateRange] = useState({start:'',end:''});
  const [calOpen,    setCalOpen]   = useState(false);
  const [calHover,   setCalHover]  = useState(null);
  const [sideOff,    setSideOff]   = useState(false);

  // Dashboard filters
  const [pSearch,   setPSearch]   = useState('');
  const [pClient,   setPClient]   = useState('all');
  const [pType,     setPType]     = useState('all');
  const [pSort,     setPSort]     = useState({k:'hours',d:'desc'});

  // Gantt filter
  const [gClients,  setGClients]  = useState([]);  // [] = all, else array of selected client names

  // Team
  const [tSearch,   setTSearch]   = useState('');
  const [tSort,     setTSort]     = useState({k:'util',d:'desc'});
  const [openRow,   setOpenRow]   = useState(null);

  // ── FETCH ──
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(SHEET_URL);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = parseCSV(await res.text());
      if(!data.length) throw new Error('No rows — is the sheet publicly shared?');
      setRows(data);
      setUpdatedAt(new Date());
      const dSet = new Set();
      data.forEach(r => { const d=normDate(r.local_date); if(d) dSet.add(d); });
      const allD = [...dSet].sort();
      if(allD.length) {
        const latest = allD[allD.length-1];
        const mon = mondayKey(latest) || latest;
        const [y,m,d] = mon.split('-').map(Number);
        const dt = new Date(y,m-1,d);
        const fri = new Date(dt); fri.setDate(dt.getDate()+4);
        const pad = n => String(n).padStart(2,'0');
        const friStr = `${fri.getFullYear()}-${pad(fri.getMonth()+1)}-${pad(fri.getDate())}`;
        setDateRange({start:mon, end:friStr});
      }
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const h = e => { if(!e.target.closest('.wdd')) setCalOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // All days normalized to YYYY-MM-DD for reliable string comparison
  const allDays = useMemo(() => {
    const s = new Set();
    rows.forEach(r => { const d=normDate(r.local_date); if(d) s.add(d); });
    return [...s].sort();
  }, [rows]);
  const minDate = allDays[0] || '';
  const maxDate = allDays[allDays.length-1] || '';
  const weekRows = useMemo(() => {
    const {start,end} = dateRange;
    if(!start && !end) return rows;
    return rows.filter(r => {
      const d = normDate(r.local_date);
      if(!d) return false;
      if(start && d < start) return false;
      if(end   && d > end)   return false;
      return true;
    });
  }, [rows, dateRange]);

  // ── AGGREGATE ──
  const { members, projectsMap } = useMemo(() => {
    const tm={}, pm={};
    const wkSet = new Set();
    weekRows.forEach(r => { const k=mondayKey(normDate(r.local_date)); if(k) wkSet.add(k); });
    const nW = Math.max(wkSet.size, 1);
    weekRows.forEach(r => {
      const name = `${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs = parseFloat(r.hours) || 0;
      const jc = (r.jobcode||'').trim();
      if(!name || !hrs || !jc) return;
      const cat = catOf(jc), client = normalizeClient(jc), isCDS = CDS_TEAM.has(name);
      if(teamF==='cds' && !isCDS) return;
      if(teamF==='tas' && isCDS) return;
      if(!tm[name]) tm[name] = {name,isCDS,total:0,billable:0,ooo:0,internal:0,utilized:0,jobs:{}};
      tm[name].total += hrs;
      if(cat==='OOO') tm[name].ooo += hrs;
      else if(cat==='Internal/BD') { tm[name].internal+=hrs; tm[name].utilized+=hrs; }
      else { tm[name].billable+=hrs; tm[name].utilized+=hrs; }
      tm[name].jobs[jc] = (tm[name].jobs[jc]||0) + hrs;
      if(cat==='OOO') return;
      if(!pm[jc]) pm[jc] = {name:jc,cat,client,hrs:0,mems:{}};
      pm[jc].hrs += hrs; pm[jc].mems[name] = (pm[jc].mems[name]||0)+hrs;
    });
    Object.values(tm).forEach(m => {
      m.effCap = 40*nW - m.ooo;
      m.avail  = m.effCap - m.utilized;
      m.util   = m.effCap>0 ? (m.utilized/m.effCap)*100 : 0;
      m.risk   = riskOf(m.util);
    });
    return { members:tm, projectsMap:pm };
  }, [weekRows, teamF, dateRange]);

  const ST = useMemo(() => {
    const ms = Object.values(members);
    const tC=ms.reduce((s,m)=>s+m.effCap,0), tU=ms.reduce((s,m)=>s+m.utilized,0);
    return {
      n:ms.length,
      tB:ms.reduce((s,m)=>s+m.billable,0), tI:ms.reduce((s,m)=>s+m.internal,0),
      tO:ms.reduce((s,m)=>s+m.ooo,0), tU, tC,
      tA:ms.reduce((s,m)=>s+m.avail,0),
      avgU: tC>0?(tU/tC)*100:0,
      nOver:ms.filter(m=>m.risk==='Over').length,
      nUnder:ms.filter(m=>m.risk==='Under').length,
    };
  }, [members]);

  const totalBillHrs = useMemo(() =>
    Object.values(projectsMap).filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0)
  , [projectsMap]);

  const allClients = useMemo(() =>
    [...new Set(Object.values(projectsMap).map(p=>p.client))].sort()
  , [projectsMap]);

  // Client groups for dashboard cards
  const clientGroups = useMemo(() => {
    const g={};
    Object.values(projectsMap).forEach(p => {
      if(pType==='billable'    && p.cat!=='Billable')    return;
      if(pType==='internal-bd' && p.cat!=='Internal/BD') return;
      if(pClient!=='all'       && p.client!==pClient)    return;
      if(pSearch && !p.name.toLowerCase().includes(pSearch.toLowerCase()) &&
                    !p.client.toLowerCase().includes(pSearch.toLowerCase())) return;
      if(!g[p.client]) g[p.client]={client:p.client,total:0,projs:[]};
      g[p.client].projs.push(p); g[p.client].total+=p.hrs;
    });
    const dir = pSort.d==='desc'?-1:1;
    Object.values(g).forEach(cg =>
      cg.projs.sort((a,b) => pSort.k==='hours' ? dir*(b.hrs-a.hrs) : dir*a.name.localeCompare(b.name))
    );
    return Object.values(g).sort((a,b)=>b.total-a.total);
  }, [projectsMap, pType, pClient, pSearch, pSort]);

  const sortedTeam = useMemo(() => {
    let ms = Object.values(members);
    if(tSearch.trim()) ms = ms.filter(m=>m.name.toLowerCase().includes(tSearch.toLowerCase()));
    return ms.sort((a,b)=>{
      const av=a[tSort.k]??a.util, bv=b[tSort.k]??b.util;
      return tSort.d==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  }, [members, tSearch, tSort]);

  // ── GANTT DATA — per-person, per DAY within selected weeks ──
  const ganttData = useMemo(() => {
    const allNames = Object.keys(members).sort();
    const {start,end} = dateRange;
    if(!allNames.length || (!start && !end)) return {names:[],days:[],grid:{},colTotals:{},rowTotals:{}};

    // Generate ALL weekdays in the range (no gaps, no skipped days)
    const weekdays = [];
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DOW_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const [sy,sm,sd] = start.split('-').map(Number);
    const [ey,em,ed] = end.split('-').map(Number);
    let cur = new Date(sy,sm-1,sd);
    const endDt = new Date(ey,em-1,ed);
    while(cur <= endDt) {
      const dow = cur.getDay();
      if(dow !== 0 && dow !== 6) { // skip Sat(6) and Sun(0)
        const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
        weekdays.push({
          key,
          dow: DOW_NAMES[dow],
          label: `${MONTH_NAMES[cur.getMonth()]} ${cur.getDate()}`,
          weekKey: mondayKey(key),
        });
      }
      cur.setDate(cur.getDate()+1);
    }
    if(!weekdays.length) return {names:[],days:[],grid:{},colTotals:{},rowTotals:{}};

    // Build grid — every person × every weekday, initialized to empty
    const grid = {};
    allNames.forEach(n => {
      grid[n] = {};
      weekdays.forEach(d => { grid[n][d.key] = {clients:{},total:0}; });
    });

    // Fill from rows — skip OOO/PTO, apply client filter
    rows.forEach(r => {
      const name = `${(r.fname||'').trim()} ${(r.lname||'').trim()}`.trim();
      const hrs = parseFloat(r.hours)||0;
      const jc  = (r.jobcode||'').trim();
      const dateStr = normDate(r.local_date);
      if(!name||!hrs||!jc||!dateStr||!grid[name]||!grid[name][dateStr]) return;
      const isCDS = CDS_TEAM.has(name);
      if(teamF==='cds'&&!isCDS) return;
      if(teamF==='tas'&& isCDS) return;
      const cat = catOf(jc), client = normalizeClient(jc);
      if(cat==='OOO') return; // hide OOO/PTO completely from gantt
      if(gClients.length>0 && !gClients.includes(client)) return;
      grid[name][dateStr].clients[client] = (grid[name][dateStr].clients[client]||0)+hrs;
      grid[name][dateStr].total += hrs;
    });

    // Column totals (per day) and row totals (per person)
    const colTotals = {};
    weekdays.forEach(d => { colTotals[d.key] = allNames.reduce((s,n)=>s+(grid[n][d.key]?.total||0),0); });
    const rowTotals = {};
    allNames.forEach(n => { rowTotals[n] = weekdays.reduce((s,d)=>s+(grid[n][d.key]?.total||0),0); });

    return { names:allNames, days:weekdays, grid, colTotals, rowTotals };
  }, [rows, members, dateRange, teamF, gClients]);

  // ── GANTT CSV DOWNLOAD ──
  const downloadGantt = () => {
    if(!ganttData.names.length) return;
    const header = ['Person',...ganttData.days.map(d=>`${d.dow} ${d.label}`),'TOTAL'];
    const dataRows = ganttData.names.map(name=>{
      const cells=ganttData.days.map(d=>{const cell=ganttData.grid[name]?.[d.key];return(!cell||cell.total===0)?'':cell.total.toFixed(1)+'h';});
      return [name,...cells,(ganttData.rowTotals[name]||0).toFixed(1)+'h'];
    });
    const tot=['TOTAL',...ganttData.days.map(d=>(ganttData.colTotals[d.key]||0).toFixed(1)+'h'),''];
    downloadCSV(`resource-grid-${(dateRange.start||'')}-${(dateRange.end||'')}.csv`,[header,...dataRows,tot]);
  };

  // Dashboard CSV download
  const downloadDashboard = () => {
    const header = ['Client','Project','Hours','% Billable','Type','Members'];
    const dataRows = [];
    clientGroups.forEach(cg => {
      cg.projs.forEach(p => {
        const mems = Object.entries(p.mems).sort(([,a],[,b])=>b-a).map(([n,h])=>`${n.split(' ')[0]}(${h.toFixed(0)}h)`).join('; ');
        const pct = p.cat==='Billable'?pctFmt(p.hrs,totalBillHrs):'—';
        dataRows.push([cg.client, p.name, p.hrs.toFixed(1), pct, p.cat, mems]);
      });
    });
    downloadCSV(`dashboard-${new Date().toISOString().slice(0,10)}.csv`, [header, ...dataRows]);
  };

  // ── UI HELPERS ──
  const tsT = k => setTSort(p=>({k,d:p.k===k&&p.d==='desc'?'asc':'desc'}));
  const arr = (cfg,k) => cfg.k===k?(cfg.d==='desc'?' ▾':' ▴'):'';
  const fmtDate = d => { if(!d) return ''; const dt=new Date(d+'T12:00:00'); return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'}); };
  const rangeLabel = () => {
    const {start,end} = dateRange;
    if(!start&&!end) return 'All dates';
    if(start&&end) return `${fmtDate(start)} – ${fmtDate(end)}`;
    if(start) return `From ${fmtDate(start)}`;
    return `Until ${fmtDate(end)}`;
  };
  const hasFilters = pClient!=='all'||pType!=='all'||!!pSearch;
  const SW = sideOff ? 52 : 220;

  const TH = (right,pl,w,click) => ({
    padding:'7px 12px', paddingLeft:pl||12, width:w,
    fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em',
    color:S.muted, background:S.cloud, borderBottom:`2px solid ${S.borderM}`,
    textAlign:right?'right':'left', whiteSpace:'nowrap',
    cursor:click?'pointer':'default', userSelect:'none',
  });

  const NAV = [
    {id:'dashboard', icon:<LayoutDashboard size={15}/>, label:'Dashboard'},
    {id:'team',      icon:<Users size={15}/>,            label:'Team'},
    {id:'gantt',     icon:<BarChart2 size={15}/>,        label:'Resource Grid'},
    {id:'exceptions',icon:<AlertTriangle size={15}/>,   label:'Exceptions'},
  ];


  // ── LOADING / ERROR ──
  if(loading) return (
    <div style={{minHeight:'100vh',background:S.cloud,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={{textAlign:'center'}}>
        <div style={{width:28,height:28,border:`2px solid ${S.border}`,borderTopColor:S.blue,borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 12px'}}/>
        <p style={{fontSize:13,color:S.slate}}>Loading staffing data…</p>
      </div>
    </div>
  );
  if(error) return (
    <div style={{minHeight:'100vh',background:S.cloud,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:S.white,border:'1px solid #FECACA',borderRadius:6,padding:32,maxWidth:400,textAlign:'center'}}>
        <AlertCircle size={26} color={S.red} style={{margin:'0 auto 10px'}}/>
        <p style={{fontSize:14,fontWeight:600,marginBottom:6}}>{error}</p>
        <button onClick={load} style={{padding:'7px 18px',background:S.blue,color:'#fff',border:'none',borderRadius:4,fontSize:12,fontWeight:600,cursor:'pointer'}}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',minHeight:'100vh',background:S.cloud,fontFamily:'Inter,-apple-system,sans-serif',color:S.ink,fontSize:13}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${S.cloud}}
        ::-webkit-scrollbar-thumb{background:${S.borderM};border-radius:3px}
        .ni:hover{background:rgba(184,201,230,.1)!important}
        .ni.on{background:rgba(20,116,196,.2)!important}
        .trow:hover>td{background:#EBF4FB!important}
        .prow:hover{background:#F5F9FF!important}
        select option{color:#0A2447!important;background:#fff!important}
      `}</style>

      {/* ══ SIDEBAR ══ */}
      <div style={{width:SW,minWidth:SW,background:S.navy,display:'flex',flexDirection:'column',
        transition:'width .18s',overflow:'hidden',position:'sticky',top:0,height:'100vh',flexShrink:0,
        borderRight:'1px solid rgba(184,201,230,.1)'}}>
        <div style={{height:52,display:'flex',alignItems:'center',
          justifyContent:sideOff?'center':'space-between',
          padding:sideOff?'0':'0 12px 0 18px',
          borderBottom:'1px solid rgba(184,201,230,.1)',flexShrink:0}}>
          {!sideOff&&<img src={LOGO_SRC} alt="STOC" style={{height:26,filter:'brightness(0) invert(1)',opacity:.85}} onError={e=>{e.target.style.display='none';}} />}
          <button onClick={()=>setSideOff(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(184,201,230,.5)',padding:4,display:'flex',alignItems:'center'}}>
            {sideOff?<ChevronRight size={14}/>:<ChevronLeft size={14}/>}
          </button>
        </div>
        <nav style={{padding:'10px 8px',flex:1}}>
          {NAV.map(n=>(
            <button key={n.id} className={`ni${page===n.id?' on':''}`} onClick={()=>setPage(n.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:sideOff?0:9,padding:'8px 10px',
                borderRadius:5,border:'none',cursor:'pointer',marginBottom:1,
                background:page===n.id?'rgba(20,116,196,.2)':'transparent',
                color:page===n.id?S.sky:'rgba(255,255,255,.58)',
                justifyContent:sideOff?'center':'flex-start'}}>
              <span style={{color:page===n.id?S.sky:'rgba(255,255,255,.42)',flexShrink:0}}>{n.icon}</span>
              {!sideOff&&<span style={{fontSize:13,fontWeight:page===n.id?600:400}}>{n.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* ══ MAIN ══ */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>

        {/* ── TOP HEADER ── */}
        <div style={{height:52,background:S.white,borderBottom:`1px solid ${S.border}`,
          padding:'0 20px',display:'flex',alignItems:'center',justifyContent:'space-between',
          position:'sticky',top:0,zIndex:20,flexShrink:0,gap:10}}>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:17,fontWeight:500,color:S.navy,margin:0,letterSpacing:'-.01em',flexShrink:0}}>
            {NAV.find(n=>n.id===page)?.label}
          </h1>

          {/* RIGHT SIDE: Team filter + Week picker + Refresh + timestamp */}
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            {/* Team filter */}
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:11,color:S.muted,fontWeight:500,whiteSpace:'nowrap'}}>Team</span>
              <select value={teamF} onChange={e=>setTeamF(e.target.value)}
                style={{height:28,padding:'0 6px',fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,
                  background:S.white,color:S.ink,cursor:'pointer',outline:'none',minWidth:90}}>
                <option value="all">All</option>
                <option value="tas">TAS</option>
                <option value="cds">CDS</option>
              </select>
            </div>

            <div style={{width:1,height:16,background:S.border}}/>

            {/* Week picker */}
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:11,color:S.muted,fontWeight:500,whiteSpace:'nowrap'}}>Date range</span>
              <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} allDays={allDays} minDate={minDate} maxDate={maxDate} calOpen={calOpen} setCalOpen={setCalOpen} calHover={calHover} setCalHover={setCalHover}/>
            </div>

            <div style={{width:1,height:16,background:S.border}}/>

            <button onClick={load} style={{height:28,padding:'0 10px',fontSize:12,border:`1px solid ${S.border}`,
              borderRadius:4,background:S.white,color:S.slate,cursor:'pointer',display:'flex',alignItems:'center',gap:5,outline:'none'}}>
              <RefreshCw size={11} color={S.muted}/> Refresh
            </button>
            {updatedAt&&<span style={{fontSize:11,color:S.muted,whiteSpace:'nowrap'}}>
              {updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}, {updatedAt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
            </span>}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{height:36,background:S.white,borderBottom:`1px solid ${S.border}`,padding:'0 20px',
          display:'flex',alignItems:'center',flexShrink:0,overflow:'hidden',gap:0}}>
          {[
            {l:'Members',  v:ST.n,                  u:'',  c:S.ink},
            {l:'Billable', v:ST.tB.toFixed(0),       u:'h', c:S.blue},
            {l:'Internal', v:ST.tI.toFixed(0),       u:'h', c:'#6D28D9'},
            {l:'OOO',      v:ST.tO.toFixed(0),       u:'h', c:S.muted},
            {l:'Avg Util', v:ST.avgU.toFixed(0),     u:'%', c:ST.avgU>=95?S.red:ST.avgU<60?S.blue:S.green},
            {l:'At Risk',  v:ST.nOver,               u:'',  c:ST.nOver>0?S.red:S.muted},
            {l:'Bandwidth',v:Math.max(0,ST.tA).toFixed(0), u:'h', c:ST.tA<0?S.red:S.ink},
          ].map((s,i)=>(
            <React.Fragment key={i}>
              {i>0&&<div style={{width:1,height:14,background:S.border,margin:'0 14px',flexShrink:0}}/>}
              <div style={{display:'flex',alignItems:'baseline',gap:4,flexShrink:0,whiteSpace:'nowrap'}}>
                <span style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:S.muted}}>{s.l}</span>
                <span style={{fontSize:13,fontWeight:700,color:s.c,fontVariantNumeric:'tabular-nums'}}>{s.v}{s.u}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ── PAGE BODY ── */}
        <div style={{flex:1,padding:16,overflowY:'auto'}}>

          {/* ══════════ DASHBOARD ══════════ */}
          {page==='dashboard'&&(
            <DashboardPage
              clientGroups={clientGroups}
              totalBillHrs={totalBillHrs}
              pSearch={pSearch} setPSearch={setPSearch}
              pClient={pClient} setPClient={setPClient}
              pType={pType} setPType={setPType}
              pSort={pSort} setPSort={setPSort}
              allClients={allClients}
              hasFilters={hasFilters}
              downloadDashboard={downloadDashboard}
            />
          )}
          {/* ══════════ TEAM ══════════ */}
          {page==='team'&&(
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud}}>
                <div style={{position:'relative'}}>
                  <Search size={12} color={S.muted} style={{position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                  <input value={tSearch} onChange={e=>setTSearch(e.target.value)} placeholder="Search…"
                    style={{height:28,paddingLeft:25,width:170,fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,outline:'none',boxSizing:'border-box'}}/>
                </div>
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
                    <th style={{...TH(false,12,150,true)}} onClick={()=>tsT('util')}>Utilization{arr(tSort,'util')}</th>
                    <th style={TH(false,12,74)}>Status</th>
                    <th style={TH(true,12,50)}>Projs</th>
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
                          <tr className="trow" onClick={()=>setOpenRow(isOpen?null:m.name)} style={{cursor:'pointer',background:rowBg}}>
                            <td style={{...td0,paddingLeft:14}}>
                              <div style={{display:'flex',alignItems:'center',gap:5}}>
                                {isOpen?<ChevronDown size={11} color={S.muted}/>:<ChevronRight size={11} color={S.muted}/>}
                                <span style={{fontWeight:500,color:S.ink,whiteSpace:'nowrap'}}>{m.name}</span>
                              </div>
                            </td>
                            <td style={td0}>
                              <span style={{fontSize:10,fontWeight:700,padding:'1px 5px',borderRadius:3,
                                background:m.isCDS?'#EDE9FE':'#DBEAFE',color:m.isCDS?'#5B21B6':S.blue}}>
                                {m.isCDS?'CDS':'TAS'}
                              </span>
                            </td>
                            <td style={{...td0,textAlign:'right'}}>{m.billable.toFixed(1)}</td>
                            <td style={{...td0,textAlign:'right'}}>{m.internal.toFixed(1)}</td>
                            <td style={{...td0,textAlign:'right',color:S.muted}}>{m.ooo.toFixed(1)}</td>
                            <td style={{...td0,textAlign:'right',fontWeight:600,color:S.ink}}>{m.utilized.toFixed(1)}</td>
                            <td style={{...td0,textAlign:'right',fontWeight:600,color:m.avail<0?S.red:m.avail<8?S.amber:S.ink}}>{m.avail.toFixed(1)}</td>
                            <td style={{...td0,minWidth:150}}>
                              <div style={{display:'flex',alignItems:'center',gap:7}}>
                                <div style={{flex:1,height:5,background:S.border,borderRadius:2,overflow:'hidden'}}>
                                  <div style={{height:5,borderRadius:2,background:uc,width:`${Math.min(m.util,100)}%`}}/>
                                </div>
                                <span style={{fontSize:11,fontWeight:700,color:uc,fontVariantNumeric:'tabular-nums',minWidth:27,textAlign:'right'}}>{m.util.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td style={td0}><RiskChip r={m.risk}/></td>
                            <td style={{...td0,textAlign:'right',color:S.muted}}>{projs.length}</td>
                          </tr>
                          {isOpen&&(
                            <tr style={{background:'#F0F7FF'}}>
                              <td colSpan={10} style={{padding:'0 14px 10px',borderBottom:`1px solid ${S.border}`}}>
                                <div style={{marginLeft:18,marginTop:8,maxWidth:460}}>
                                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                                    <thead><tr style={{borderBottom:`1px solid ${S.border}`}}>
                                      {['Project','Hrs','%'].map((h,i)=><th key={i} style={{padding:'3px 8px',textAlign:i>0?'right':'left',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:S.muted}}>{h}</th>)}
                                    </tr></thead>
                                    <tbody>
                                      {projs.map(([jc,hrs],j)=>(
                                        <tr key={j} style={{borderBottom:j<projs.length-1?`1px solid #EEF1F6`:'none'}}>
                                          <td style={{padding:'4px 8px',color:S.ink}}>{jc}</td>
                                          <td style={{padding:'4px 8px',textAlign:'right',fontWeight:600,color:S.ink,fontVariantNumeric:'tabular-nums'}}>{hrs.toFixed(1)}</td>
                                          <td style={{padding:'4px 8px',textAlign:'right',color:S.muted,fontVariantNumeric:'tabular-nums'}}>{m.utilized>0?Math.round((hrs/m.utilized)*100):0}%</td>
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
                    <tr style={{background:S.cloud,borderTop:`2px solid ${S.borderM}`}}>
                      <td colSpan={2} style={{padding:'6px 14px',fontSize:12,fontWeight:700,color:S.navy}}>Total</td>
                      {[ST.tB,ST.tI,ST.tO,ST.tU].map((v,i)=>(
                        <td key={i} style={{padding:'6px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:S.ink,fontVariantNumeric:'tabular-nums',borderBottom:`1px solid ${S.border}`}}>{v.toFixed(1)}</td>
                      ))}
                      <td style={{padding:'6px 12px',textAlign:'right',fontSize:13,fontWeight:700,color:ST.tA<0?S.red:S.ink,fontVariantNumeric:'tabular-nums',borderBottom:`1px solid ${S.border}`}}>{ST.tA.toFixed(1)}</td>
                      <td style={{padding:'6px 12px',borderBottom:`1px solid ${S.border}`}}>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <div style={{flex:1,height:5,background:S.border,borderRadius:2,overflow:'hidden'}}>
                            <div style={{height:5,borderRadius:2,background:S.blue,width:`${Math.min(ST.avgU,100)}%`}}/>
                          </div>
                          <span style={{fontSize:11,fontWeight:700,color:S.ink,minWidth:27,textAlign:'right'}}>{ST.avgU.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td colSpan={2} style={{borderBottom:`1px solid ${S.border}`}}/>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════ RESOURCE GRID ══════════ */}
          {page==='gantt'&&(
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>

              {/* Toolbar */}
              <div style={{padding:'10px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud,
                display:'flex',alignItems:'center',flexWrap:'wrap',gap:8,justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  {/* Multi-select client filter — checkbox pills */}
                  <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                    <span style={{fontSize:11,color:S.slateL,fontWeight:500,flexShrink:0}}>Show clients:</span>
                    {allClients.filter(c=>c!=='OOO').map(cl=>{
                      const on=gClients.includes(cl);
                      const col=cCol(cl);
                      return(
                        <button key={cl} onClick={()=>setGClients(p=>on?p.filter(x=>x!==cl):[...p,cl])}
                          style={{height:24,padding:'0 8px',fontSize:11,fontWeight:on?700:400,
                            border:`1px solid ${on?col.bar:S.border}`,borderRadius:12,cursor:'pointer',
                            background:on?col.bg:S.white,color:on?col.text:S.slateL,
                            display:'flex',alignItems:'center',gap:4,transition:'all .12s',whiteSpace:'nowrap'}}>
                          {on&&<div style={{width:6,height:6,borderRadius:'50%',background:col.bar,flexShrink:0}}/>}
                          {cl}
                        </button>
                      );
                    })}
                    {gClients.length>0&&(
                      <button onClick={()=>setGClients([])}
                        style={{height:24,padding:'0 8px',fontSize:11,border:'1px solid #FECACA',borderRadius:12,
                          background:'#FEF2F2',color:S.red,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}>
                        <X size={10}/>All
                      </button>
                    )}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <span style={{fontSize:11,color:S.muted}}>{ganttData.names.length} people · {ganttData.days.length} days</span>
                  <button onClick={downloadGantt}
                    style={{height:28,padding:'0 9px',fontSize:11,border:`1px solid ${S.border}`,borderRadius:4,
                      background:S.white,color:S.slate,cursor:'pointer',display:'flex',alignItems:'center',gap:4,outline:'none'}}>
                    <Download size={11}/> CSV
                  </button>
                </div>
              </div>

              {(!dateRange.start||!dateRange.end)&&(
                <div style={{padding:'48px 16px',textAlign:'center',color:S.muted}}>
                  Select a date range above to view the resource grid.
                </div>
              )}

              {dateRange.start&&dateRange.end&&(
                <div style={{overflowX:'auto',overflowY:'auto',maxHeight:'calc(100vh - 200px)'}}>
                  <table style={{borderCollapse:'collapse',tableLayout:'fixed'}}>
                    <colgroup>
                      <col style={{width:170,minWidth:160}}/>
                      {ganttData.days.map(d=><col key={d.key} style={{width:80,minWidth:76}}/>)}
                      <col style={{width:72}}/>
                    </colgroup>
                    <thead style={{position:'sticky',top:0,zIndex:4}}>
                      {/* Week band row */}
                      <tr style={{background:S.cloud}}>
                        <th style={{background:S.cloud,borderBottom:`1px solid ${S.borderM}`,position:'sticky',left:0,zIndex:5}}/>
                        {(()=>{
                          const bands=[];
                          ganttData.days.forEach(d=>{const last=bands[bands.length-1];if(last&&last.wk===d.weekKey){last.n++;}else bands.push({wk:d.weekKey,label:d.label,n:1});});
                          return bands.map((b,i)=>(
                            <th key={i} colSpan={b.n} style={{padding:'4px 6px',fontSize:10,fontWeight:700,color:S.slate,
                              textAlign:'center',background:S.cloud,borderBottom:`1px solid ${S.borderM}`,
                              borderLeft:`2px solid ${S.borderM}`,whiteSpace:'nowrap'}}>
                              {b.label.replace(' ','\u00a0')} ({b.n}d)
                            </th>
                          ));
                        })()}
                        <th style={{background:S.cloud,borderBottom:`1px solid ${S.borderM}`,borderLeft:`2px solid ${S.borderM}`}}/>
                      </tr>
                      {/* Day header row */}
                      <tr style={{background:S.cloud,borderBottom:`2px solid ${S.borderM}`}}>
                        <th style={{...TH(false,16),position:'sticky',left:0,zIndex:5,background:S.cloud,top:0}}>Person</th>
                        {ganttData.days.map(d=>(
                          <th key={d.key} style={{padding:'6px 4px',fontSize:10,fontWeight:600,
                            background:S.cloud,textAlign:'center',
                            borderLeft:`1px solid ${S.border}`,color:S.slate,whiteSpace:'nowrap',
                            borderBottom:'none'}}>
                            <div>{d.dow}</div>
                            <div style={{fontSize:9,fontWeight:400,color:S.muted}}>{d.label.split(' ')[1]}</div>
                          </th>
                        ))}
                        <th style={{padding:'6px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                          letterSpacing:'.05em',color:S.muted,background:S.cloud,textAlign:'right',
                          borderLeft:`2px solid ${S.borderM}`,whiteSpace:'nowrap'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ganttData.names.map((name,i)=>(
                        <tr key={i} style={{borderBottom:`1px solid ${S.border}`,background:i%2===1?S.cloud:S.white}}>
                          {/* Sticky name cell */}
                          <td style={{padding:'6px 16px',fontSize:12,fontWeight:500,color:S.ink,
                            whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                            position:'sticky',left:0,zIndex:1,
                            background:i%2===1?S.cloud:S.white,
                            borderBottom:`1px solid ${S.border}`,minHeight:50}}>
                            {name}
                          </td>
                          {/* Day cells */}
                          {ganttData.days.map(d=>{
                            const cell=ganttData.grid[name]?.[d.key]||{clients:{},total:0};
                            return(
                              <td key={d.key} style={{padding:'5px 5px',borderBottom:`1px solid ${S.border}`,
                                borderLeft:`1px solid ${S.border}`,verticalAlign:'middle',minWidth:76}}>
                                <GanttCell dayData={cell} name={name} dayLabel={`${d.dow} ${d.label}`}/>
                              </td>
                            );
                          })}
                          {/* Row total */}
                          <td style={{padding:'6px 10px',textAlign:'right',fontSize:12,fontWeight:700,
                            color:S.ink,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap',
                            borderLeft:`2px solid ${S.borderM}`,borderBottom:`1px solid ${S.border}`,
                            background:i%2===1?S.cloud:S.white}}>
                            {(ganttData.rowTotals[name]||0).toFixed(1)}h
                          </td>
                        </tr>
                      ))}
                      {/* Column totals row */}
                      <tr style={{background:'#EEF2F8',borderTop:`2px solid ${S.borderM}`,position:'sticky',bottom:0,zIndex:2}}>
                        <td style={{padding:'7px 16px',fontSize:11,fontWeight:700,color:S.navy,
                          position:'sticky',left:0,background:'#EEF2F8',zIndex:3}}>Total</td>
                        {ganttData.days.map(d=>{
                          const t=ganttData.colTotals[d.key]||0;
                          return(
                            <td key={d.key} style={{padding:'7px 5px',textAlign:'center',fontSize:11,fontWeight:600,
                              color:t>0?S.blue:S.muted,fontVariantNumeric:'tabular-nums',
                              borderLeft:`1px solid ${S.border}`}}>
                              {t>0?t.toFixed(0)+'h':''}
                            </td>
                          );
                        })}
                        <td style={{padding:'7px 10px',textAlign:'right',fontSize:12,fontWeight:700,
                          color:S.navy,fontVariantNumeric:'tabular-nums',borderLeft:`2px solid ${S.borderM}`}}>
                          {ganttData.names.reduce((s,n)=>s+(ganttData.rowTotals[n]||0),0).toFixed(1)}h
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════ EXCEPTIONS ══════════ */}
          {page==='exceptions'&&(
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>
                  {['Issue','Team Member','Details','Action'].map((h,i)=>(
                    <th key={i} style={TH(false,i===0?14:12,i===0?116:i===1?170:undefined)}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {Object.values(members).filter(m=>m.avail<0).map((m,i)=>(
                    <tr key={`o${i}`} style={{borderBottom:`1px solid ${S.border}`,background:'#FFF8F8',borderLeft:`3px solid ${S.red}`}}>
                      <td style={{padding:'8px 12px',paddingLeft:11}}>
                        <span style={{fontSize:11,fontWeight:600,padding:'1px 6px',borderRadius:3,background:'#FEE2E2',color:'#991B1B'}}>Overallocated</span>
                      </td>
                      <td style={{padding:'8px 12px',fontWeight:500,color:S.ink}}>{m.name}</td>
                      <td style={{padding:'8px 12px',color:S.slate}}>{Math.abs(m.avail).toFixed(1)}h over · {m.util.toFixed(0)}% utilized</td>
                      <td style={{padding:'8px 12px',fontWeight:600,color:S.red,fontSize:12}}>Rebalance work</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.total>0&&m.total<20).map((m,i)=>(
                    <tr key={`l${i}`} style={{borderBottom:`1px solid ${S.border}`,background:S.amberBg,borderLeft:'3px solid #D97706'}}>
                      <td style={{padding:'8px 12px',paddingLeft:11}}>
                        <span style={{fontSize:11,fontWeight:600,padding:'1px 6px',borderRadius:3,background:'#FEF3C7',color:'#92400E'}}>Low Hours</span>
                      </td>
                      <td style={{padding:'8px 12px',fontWeight:500,color:S.ink}}>{m.name}</td>
                      <td style={{padding:'8px 12px',color:S.slate}}>Only {m.total.toFixed(1)}h logged</td>
                      <td style={{padding:'8px 12px',fontWeight:600,color:S.amber,fontSize:12}}>Review entry</td>
                    </tr>
                  ))}
                  {Object.values(members).filter(m=>m.avail<0||m.total<20).length===0&&(
                    <tr><td colSpan={4} style={{padding:'44px 16px',textAlign:'center',color:S.muted}}>No exceptions this period 🎉</td></tr>
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
