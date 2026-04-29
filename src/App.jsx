import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
// ─── LOGO — embedded as base64 white PNG, no path config needed ──────────────
// Last updated: Apr 29, 2026 7:00 PM UTC
const BUILD_TIME = 'Apr 29, 2026 3:01 PM';
const LOGO_SRC = 'data:image/png;base64,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';
import {
  LayoutDashboard, Users, AlertTriangle, BarChart2,
  Search, AlertCircle, ChevronDown, ChevronLeft, ChevronRight, X, Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell, PieChart, Pie, Sector } from 'recharts';

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
  if(/^(holiday|vacation|sick|pto|leave|bereavement|time.?off|personal.?day|jury)/i.test(t)) return 'OOO';
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
  // Catch all time-off variants: Holiday, Vacation, Sick, PTO, Leave, Time Off, Bereavement, etc.
  if(/^(holiday|vacation|sick|pto|leave|bereavement|time.?off|personal.?day|jury)/i.test(t)) return 'OOO';
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

// ── GANTT CELL — every cell is the same fixed size regardless of content ──
const CELL_H = 36;
function GanttCell({ dayData, name, dayLabel }) {
  const [tip, setTip] = useState(false);
  const [tipPos, setTipPos] = useState({top:0,left:0});

  const clients = Object.entries(dayData.clients||{}).sort(([,a],[,b])=>b-a);
  const total = dayData.total || 0;
  const isEmpty = total === 0;
  const dominant = clients[0]?.[0] || null;
  const col = dominant ? cCol(dominant) : null;

  const onEnter = e => {
    const r = e.currentTarget.getBoundingClientRect();
    setTipPos({ top: r.bottom + window.scrollY + 4, left: Math.max(8, r.left + window.scrollX - 60) });
    setTip(true);
  };

  // Always the same outer wrapper — same height, same border, same radius
  return (
    <div style={{
        position:'relative',
        height:CELL_H, width:'100%',
        borderRadius:2,
        border:`1px solid ${isEmpty ? S.border : col.bar+'30'}`,
        background: isEmpty ? '#F8FAFC' : col.bg,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        cursor: isEmpty ? 'default' : 'pointer',
        gap:1, padding:'2px 3px', boxSizing:'border-box',
      }}
      onMouseEnter={isEmpty ? undefined : onEnter}
      onMouseLeave={isEmpty ? undefined : ()=>setTip(false)}>

      {isEmpty
        ? <span style={{fontSize:9,color:'#D1D5DB'}}>—</span>
        : <>
            <span style={{fontSize:12,fontWeight:700,color:col.text,fontVariantNumeric:'tabular-nums',lineHeight:1}}>
              {total % 1 === 0 ? total : total.toFixed(1)}h
            </span>
            {clients.length > 1 && (
              <div style={{display:'flex',gap:2,marginTop:1}}>
                {clients.slice(0,4).map(([cl],i)=>(
                  <div key={i} style={{width:6,height:3,borderRadius:1,background:cCol(cl).bar,opacity:.7}}/>
                ))}
              </div>
            )}
          </>
      }

      {tip && (
        <div style={{position:'fixed',top:tipPos.top-window.scrollY,left:tipPos.left,
          background:S.navy,color:'#fff',borderRadius:5,padding:'8px 11px',
          fontSize:11,zIndex:9999,minWidth:160,maxWidth:220,pointerEvents:'none',
          boxShadow:'0 4px 18px rgba(0,0,0,.35)',lineHeight:1.55}}>
          <div style={{fontWeight:700,fontSize:12,color:S.sky,marginBottom:2}}>{name}</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginBottom:6}}>{dayLabel}</div>
          {clients.map(([cl,h],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
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
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  // Sync calendar view to the end date when dateRange is first set (e.g. on load)
  React.useEffect(() => {
    if(dateRange.end) {
      const dt = new Date(dateRange.end+'T12:00:00');
      setViewYear(dt.getFullYear());
      setViewMonth(dt.getMonth());
    }
  }, [dateRange.end]);
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
  const [detailSearch, setDetailSearch] = useState('');
  const chartData = clientGroups.map(cg=>({client:cg.client,hours:parseFloat(cg.total.toFixed(1)),projs:cg.projs,total:cg.total}));
  const selGroup = clientGroups.find(cg=>cg.client===selClient);
  const detailProjs = selGroup
    ? (detailSearch.trim()
        ? selGroup.projs.filter(p=>p.name.toLowerCase().includes(detailSearch.toLowerCase()))
        : selGroup.projs)
    : [];
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
          {/* ── CHART: bar when ≤15 clients, pie when >15 ── */}
          {(()=>{
            const usePie = chartData.length > 15;
            const totalHours = chartData.reduce((s,d)=>s+d.hours,0);
            return (
              <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden',marginBottom:14}}>
                <div style={{padding:'10px 16px',borderBottom:`1px solid ${S.border}`,background:S.cloud,
                  display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,fontWeight:600,color:S.navy}}>Hours by Client</span>
                  <span style={{fontSize:11,color:S.muted}}>
                    {usePie ? 'Click a slice to filter the table below' : 'Click a bar to filter the table below'}
                  </span>
                </div>

                {/* ── BAR CHART (≤15 clients) ── */}
                {!usePie&&(
                  <div style={{padding:'16px 16px 8px',overflowX:'auto'}}>
                    <ResponsiveContainer width="100%" height={CHART_H}>
                      <BarChart data={chartData} margin={{top:16,right:16,bottom:70,left:8}} barCategoryGap="25%"
                        onClick={d=>{if(!d?.activePayload)return;const cl=d.activePayload[0]?.payload?.client;setSelClient(p=>{if(p===cl)return null;setDetailSearch('');return cl;})}}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={S.border}/>
                        <XAxis dataKey="client" height={52}
                          tick={({x,y,payload})=>{
                            const val=payload.value,words=val.split(' '),sel=selClient===val;
                            const lines=[];let cur='';
                            words.forEach(w=>{if(cur&&(cur+' '+w).length>12){lines.push(cur);cur=w;}else{cur=cur?cur+' '+w:w;}});
                            if(cur)lines.push(cur);
                            return(
                              <g transform={`translate(${x},${y+4})`}>
                                {lines.map((line,li)=>(
                                  <text key={li} x={0} y={li*13} dy={11} fontSize={10}
                                    fill={sel?S.blue:S.ink} fontFamily="Inter,sans-serif"
                                    fontWeight={sel?700:500} textAnchor="middle">{line}</text>
                                ))}
                              </g>
                            );
                          }}
                          tickLine={false} axisLine={false} interval={0}/>
                        <YAxis tick={{fontSize:10,fill:S.muted}} tickLine={false} axisLine={false}/>
                        <RTooltip cursor={{fill:'rgba(20,116,196,.06)'}}
                          content={({active,payload})=>{
                            if(!active||!payload?.length)return null;
                            const d=payload[0].payload;
                            return(
                              <div style={{background:S.navy,borderRadius:5,padding:'8px 12px',fontSize:11,boxShadow:'0 4px 16px rgba(0,0,0,.3)'}}>
                                <div style={{fontWeight:700,color:S.sky,marginBottom:3}}>{d.client}</div>
                                <div style={{color:'rgba(255,255,255,.85)'}}>{d.hours}h · {d.projs.length} projects</div>
                                <div style={{color:'rgba(255,255,255,.45)',fontSize:10,marginTop:2}}>Click to {selClient===d.client?'deselect':'filter table'} ↓</div>
                              </div>
                            );
                          }}/>
                        <Bar dataKey="hours" radius={[3,3,0,0]} maxBarSize={48}>
                          {chartData.map((entry,i)=>(
                            <Cell key={i} fill={cCol(entry.client).bar}
                              opacity={selClient&&selClient!==entry.client?0.25:0.9}
                              cursor="pointer"/>
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ── PIE CHART + LEGEND (>15 clients) ── */}
                {usePie&&(
                  <div style={{display:'flex',alignItems:'flex-start',gap:0,padding:'16px'}}>
                    {/* Pie */}
                    <div style={{flexShrink:0,width:260,height:260}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="hours"
                            nameKey="client"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={1}
                            onClick={(d)=>{const cl=d.client;setSelClient(p=>{if(p===cl)return null;setDetailSearch('');return cl;});}}
                            style={{cursor:'pointer'}}
                          >
                            {chartData.map((entry,i)=>(
                              <Cell key={i}
                                fill={cCol(entry.client).bar}
                                opacity={selClient&&selClient!==entry.client?0.25:0.92}
                                stroke={selClient===entry.client?S.white:'none'}
                                strokeWidth={selClient===entry.client?2:0}
                              />
                            ))}
                          </Pie>
                          <RTooltip
                            content={({active,payload})=>{
                              if(!active||!payload?.length)return null;
                              const d=payload[0].payload;
                              const pct=totalHours>0?((d.hours/totalHours)*100).toFixed(1):0;
                              return(
                                <div style={{background:S.navy,borderRadius:5,padding:'8px 12px',fontSize:11,
                                  boxShadow:'0 4px 16px rgba(0,0,0,.3)',pointerEvents:'none'}}>
                                  <div style={{fontWeight:700,color:S.sky,marginBottom:3}}>{d.client}</div>
                                  <div style={{color:'rgba(255,255,255,.85)'}}>{d.hours}h · {pct}% · {d.projs.length} projects</div>
                                  <div style={{color:'rgba(255,255,255,.45)',fontSize:10,marginTop:2}}>
                                    Click to {selClient===d.client?'deselect':'filter table'} ↓
                                  </div>
                                </div>
                              );
                            }}
                          />
                          {/* Center label */}
                          {selClient&&(()=>{
                            const sel=chartData.find(d=>d.client===selClient);
                            const pct=sel&&totalHours>0?((sel.hours/totalHours)*100).toFixed(0):0;
                            return(
                              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                                fontFamily="Inter,sans-serif">
                                <tspan x="50%" dy="-8" fontSize={18} fontWeight={700} fill={cCol(selClient).bar}>
                                  {pct}%
                                </tspan>
                                <tspan x="50%" dy={18} fontSize={10} fill={S.slateL}>
                                  {selClient.length>12?selClient.slice(0,11)+'…':selClient}
                                </tspan>
                              </text>
                            );
                          })()}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend — 2 column grid */}
                    <div style={{flex:1,minWidth:0,paddingLeft:16,overflowY:'auto',maxHeight:260}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px 12px'}}>
                        {chartData.map((entry,i)=>{
                          const pct=totalHours>0?((entry.hours/totalHours)*100).toFixed(1):0;
                          const isSel=selClient===entry.client;
                          const col=cCol(entry.client);
                          return(
                            <button key={i}
                              onClick={()=>{setSelClient(p=>{if(p===entry.client)return null;setDetailSearch('');return entry.client;});}}
                              style={{display:'flex',alignItems:'center',gap:7,padding:'5px 7px',
                                borderRadius:4,border:`1px solid ${isSel?col.bar:S.border}`,
                                background:isSel?col.bg:S.white,cursor:'pointer',textAlign:'left',
                                opacity:selClient&&!isSel?0.45:1,transition:'all .12s',minWidth:0}}>
                              <div style={{width:9,height:9,borderRadius:2,background:col.bar,flexShrink:0}}/>
                              <div style={{minWidth:0,flex:1}}>
                                <div style={{fontSize:11,fontWeight:isSel?700:500,color:isSel?col.text:S.ink,
                                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:1.2}}>
                                  {entry.client}
                                </div>
                                <div style={{fontSize:10,color:S.muted,fontVariantNumeric:'tabular-nums',lineHeight:1.2}}>
                                  {entry.hours}h · {pct}%
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── PROJECTS TABLE — always visible, filtered when a bar is clicked ── */}
          <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
            {/* Table header */}
            <div style={{padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud,
              display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {selClient
                  ? <>
                      <div style={{width:9,height:9,borderRadius:2,background:cCol(selClient).bar,flexShrink:0}}/>
                      <span style={{fontSize:12,fontWeight:700,color:cCol(selClient).text}}>{selClient}</span>
                      <span style={{fontSize:11,color:S.slateL}}>
                        {detailSearch
                          ? `${detailProjs.length} of ${selGroup?.projs.length} projects`
                          : `${selGroup?.projs.length} projects`}
                        {selGroup && ` · ${selGroup.total.toFixed(1)}h`}
                      </span>
                      <button onClick={()=>{setSelClient(null);setDetailSearch('');}}
                        style={{background:'none',border:'none',cursor:'pointer',color:S.muted,
                          display:'flex',alignItems:'center',padding:'0 2px',fontSize:11,gap:3}}>
                        <X size={11}/> Show all
                      </button>
                    </>
                  : <span style={{fontSize:12,fontWeight:600,color:S.navy}}>
                      All Projects
                      <span style={{fontWeight:400,color:S.muted,marginLeft:6}}>
                        {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects · {clientGroups.length} clients
                      </span>
                    </span>
                }
              </div>
              {/* Per-client search (only when a client is selected) */}
              {selClient&&(
                <div style={{position:'relative'}}>
                  <Search size={11} color={S.muted} style={{position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                  <input value={detailSearch} onChange={e=>setDetailSearch(e.target.value)}
                    placeholder="Filter projects…"
                    style={{height:26,paddingLeft:24,paddingRight:detailSearch?20:8,width:170,fontSize:11,
                      border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,outline:'none',boxSizing:'border-box'}}/>
                  {detailSearch&&(
                    <button onClick={()=>setDetailSearch('')}
                      style={{position:'absolute',right:5,top:'50%',transform:'translateY(-50%)',
                        background:'none',border:'none',cursor:'pointer',color:S.muted,display:'flex',alignItems:'center',padding:0}}>
                      <X size={10}/>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Table — either all clients expanded, or just the selected one */}
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
                <colgroup>
                  <col style={{width:'40%',minWidth:180}}/>{/* project name */}
                  <col style={{width:56}}/>{/* hours */}
                  <col style={{width:40}}/>{/* % */}
                  <col/>{/* members — takes remaining space, scrollable inside */}
                </colgroup>
                <thead>
                  <tr style={{borderBottom:`2px solid ${S.borderM}`}}>
                    <th style={{padding:'7px 14px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'.05em',color:S.muted,textAlign:'left',background:S.cloud,
                      position:'sticky',top:0}}>Project</th>
                    <th style={{padding:'7px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'.05em',color:S.muted,textAlign:'right',background:S.cloud,
                      position:'sticky',top:0}}>Hrs</th>
                    <th style={{padding:'7px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'.05em',color:S.muted,textAlign:'right',background:S.cloud,
                      position:'sticky',top:0}}>%</th>
                    <th style={{padding:'7px 10px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'.05em',color:S.muted,textAlign:'left',background:S.cloud,
                      position:'sticky',top:0}}>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {(selClient ? (selGroup ? [selGroup] : []) : clientGroups).map((cg,ci)=>{
                    const col = cCol(cg.client);
                    const projs = selClient
                      ? detailProjs                                      // filtered by search
                      : cg.projs;                                        // all for this client
                    const showClientHeader = !selClient;                 // only show when showing all

                    return(
                      <React.Fragment key={ci}>
                        {/* Client group header — only when showing all clients */}
                        {showClientHeader&&(
                          <tr style={{background:'#EEF2F8',borderTop:ci>0?`2px solid ${S.borderM}`:'none',
                            borderLeft:`4px solid ${col.bar}`}}>
                            <td colSpan={4} style={{padding:'7px 10px'}}>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <button onClick={()=>{setSelClient(cg.client);setDetailSearch('');}}
                                  style={{background:'none',border:'none',cursor:'pointer',
                                    display:'flex',alignItems:'center',gap:7,padding:0,textAlign:'left'}}>
                                  <div style={{width:8,height:8,borderRadius:2,background:col.bar,flexShrink:0}}/>
                                  <span style={{fontSize:13,fontWeight:700,color:col.text}}>{cg.client}</span>
                                </button>
                                <span style={{fontSize:11,color:S.slateL}}>{cg.projs.length} projects</span>
                                <span style={{marginLeft:'auto',fontSize:13,fontWeight:700,color:S.ink,
                                  fontVariantNumeric:'tabular-nums'}}>{cg.total.toFixed(1)}h</span>
                                <span style={{fontSize:11,color:S.muted,fontVariantNumeric:'tabular-nums',minWidth:36,textAlign:'right'}}>
                                  {totalBillHrs>0?pctFmt(cg.projs.filter(p=>p.cat==='Billable').reduce((s,p)=>s+p.hrs,0),totalBillHrs):''}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Project rows */}
                        {projs.length===0&&selClient&&(
                          <tr><td colSpan={4} style={{padding:'24px 14px',textAlign:'center',color:S.muted,fontSize:12}}>No projects match</td></tr>
                        )}
                        {projs.map((p,pi)=>{
                          const mems=Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                          const isBill=p.cat==='Billable';
                          const rowBg=pi%2===0?S.white:'#FAFBFC';
                          return(
                            <tr key={pi} style={{background:rowBg,borderBottom:`1px solid #EEF1F6`,
                              borderLeft:`3px solid ${col.bar}`}}>
                              {/* Name — truncates */}
                              <td style={{padding:'6px 14px',fontSize:13,color:S.ink,
                                overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',maxWidth:0}}
                                title={p.name}>{p.name}</td>
                              {/* Hrs */}
                              <td style={{padding:'6px 8px',textAlign:'right',fontWeight:600,fontSize:13,
                                color:S.ink,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{p.hrs.toFixed(1)}</td>
                              {/* % */}
                              <td style={{padding:'6px 8px',textAlign:'right',fontSize:11,
                                color:S.muted,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>
                                {isBill?pctFmt(p.hrs,totalBillHrs):'—'}
                              </td>
                              {/* Members — horizontally scrollable, all shown */}
                              <td style={{padding:'4px 10px',maxWidth:0}}>
                                <div style={{
                                  display:'flex',gap:3,
                                  overflowX:'auto',overflowY:'hidden',
                                  paddingBottom:3,
                                  /* thin scrollbar */
                                  scrollbarWidth:'thin',
                                  scrollbarColor:`${S.borderM} transparent`,
                                }}>
                                  {mems.map(([n,h],mi)=>(
                                    <span key={mi} style={{
                                      display:'inline-flex',alignItems:'center',gap:3,flexShrink:0,
                                      background:S.cloud,border:`1px solid ${S.border}`,
                                      borderRadius:3,padding:'2px 6px',fontSize:11,whiteSpace:'nowrap',
                                    }}>
                                      <span style={{color:S.ink,fontWeight:500}}>{n.split(' ')[0]}</span>
                                      <span style={{color:S.muted,fontVariantNumeric:'tabular-nums'}}>{h.toFixed(0)}h</span>
                                    </span>
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
                  <tr style={{background:S.cloud,borderTop:`2px solid ${S.borderM}`}}>
                    <td style={{padding:'6px 14px',fontSize:11,fontWeight:600,color:S.slateL}}>
                      {selClient
                        ? `${selGroup?.client} — ${(selGroup?.total||0).toFixed(1)}h total`
                        : `${clientGroups.length} clients · ${clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects`}
                    </td>
                    <td style={{padding:'6px 8px',textAlign:'right',fontSize:13,fontWeight:700,
                      color:S.ink,fontVariantNumeric:'tabular-nums'}}>
                      {selClient
                        ? (selGroup?.total||0).toFixed(1)
                        : clientGroups.reduce((s,g)=>s+g.total,0).toFixed(1)}
                    </td>
                    <td colSpan={2}/>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GANTT GRID — two-table layout: fixed left panel + scrolling right panel ──
// CSS position:sticky breaks inside any element with overflow set on both axes.
// Solution: split into two tables side by side. Left table never scrolls (Name+Total).
// Right table scrolls horizontally. Row heights are synced via useRef.
function GanttGrid({ ganttData, TH, S, cCol }) {
  const leftRef  = useRef(null);
  const rightRef = useRef(null);

  // Sync vertical scroll between left and right panels
  const onRightScroll = () => {
    if(leftRef.current && rightRef.current)
      leftRef.current.scrollTop = rightRef.current.scrollTop;
  };
  const onLeftScroll = () => {
    if(leftRef.current && rightRef.current)
      rightRef.current.scrollTop = leftRef.current.scrollTop;
  };

  const ROW_H   = CELL_H + 12;  // cell height + vertical padding (same both sides)
  const HDR1_H  = 26;  // week band header
  const HDR2_H  = 36;  // day name header
  const FOOT_H  = 34;  // footer totals
  const MAX_H   = 'calc(100vh - 240px)';

  // Week bands for right header
  const bands = [];
  ganttData.days.forEach(d=>{
    const last=bands[bands.length-1];
    if(last&&last.wk===d.weekKey){last.n++;last.endLabel=d.label;}
    else bands.push({wk:d.weekKey,startLabel:d.label,endLabel:d.label,n:1});
  });

  const grandTotal = ganttData.names.reduce((s,n)=>s+(ganttData.rowTotals[n]||0),0);

  const thStyle = {
    fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',
    color:S.muted,background:S.cloud,whiteSpace:'nowrap',userSelect:'none',
  };

  return (
    <div style={{display:'flex',overflow:'hidden'}}>

      {/* ── LEFT PANEL: Person + Total (never scrolls horizontally) ── */}
      <div style={{flexShrink:0,display:'flex',flexDirection:'column',
        borderRight:`3px solid ${S.borderM}`,
        boxShadow:'4px 0 8px -2px rgba(0,0,0,.1)',zIndex:3}}>

        {/* Week band spacer */}
        <div style={{height:HDR1_H,background:S.cloud,borderBottom:`1px solid ${S.borderM}`,flexShrink:0}}/>
        {/* Day header */}
        <div style={{height:HDR2_H,background:S.cloud,borderBottom:`2px solid ${S.borderM}`,
          display:'flex',alignItems:'center',flexShrink:0}}>
          <div style={{...thStyle,padding:'0 8px 0 16px',width:170,minWidth:170}}>Person</div>
          <div style={{...thStyle,padding:'0 8px',width:68,minWidth:68,textAlign:'right',
            borderLeft:`1px solid ${S.border}`}}>Total</div>
        </div>
        {/* Body rows */}
        <div ref={leftRef} onScroll={onLeftScroll}
          style={{overflowY:'auto',maxHeight:MAX_H,scrollbarWidth:'none',msOverflowStyle:'none'}}>
          <style>{'.left-scroll::-webkit-scrollbar{display:none}'}</style>
          <div className="left-scroll">
            {ganttData.names.map((name,i)=>{
              const rowBg=i%2===1?S.cloud:S.white;
              const rowTotal=ganttData.rowTotals[name]||0;
              return(
                <div key={i} style={{display:'flex',alignItems:'center',height:ROW_H,
                  background:rowBg,borderBottom:`1px solid ${S.border}`}}>
                  <div style={{width:170,minWidth:170,padding:'0 12px 0 16px',
                    fontSize:12,fontWeight:500,color:S.ink,
                    overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                    {name}
                  </div>
                  <div style={{width:68,minWidth:68,padding:'0 8px',textAlign:'right',
                    fontSize:12,fontWeight:700,fontVariantNumeric:'tabular-nums',
                    color:rowTotal>0?S.blue:S.muted,
                    borderLeft:`1px solid ${S.border}`,flexShrink:0}}>
                    {rowTotal>0?rowTotal.toFixed(1)+'h':'—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Footer */}
        <div style={{height:FOOT_H,background:'#EEF2F8',borderTop:`2px solid ${S.borderM}`,
          display:'flex',alignItems:'center',flexShrink:0}}>
          <div style={{width:170,minWidth:170,padding:'0 12px 0 16px',
            fontSize:11,fontWeight:700,color:S.navy}}>Total</div>
          <div style={{width:68,minWidth:68,padding:'0 8px',textAlign:'right',
            fontSize:12,fontWeight:700,color:S.navy,fontVariantNumeric:'tabular-nums',
            borderLeft:`1px solid ${S.border}`,flexShrink:0}}>
            {grandTotal.toFixed(1)}h
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Day columns (scrolls horizontally + vertically) ── */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Week band header — does NOT scroll vertically */}
        <div style={{overflowX:'hidden',flexShrink:0}}>
          <div ref={el=>{if(el&&rightRef.current)el.scrollLeft=rightRef.current.scrollLeft}}
            style={{display:'flex',height:HDR1_H,background:S.cloud,
              borderBottom:`1px solid ${S.borderM}`,overflowX:'hidden'}}>
            {bands.map((b,i)=>(
              <div key={i} style={{
                minWidth:b.n*80,width:b.n*80,
                padding:'4px 6px',fontSize:10,fontWeight:700,color:S.slate,
                textAlign:'center',whiteSpace:'nowrap',flexShrink:0,
                borderLeft:i>0?`2px solid ${S.borderM}`:`1px solid ${S.border}`,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                {b.startLabel}{b.n>1?` – ${b.endLabel}`:''}
              </div>
            ))}
          </div>
        </div>

        {/* Day name header — does NOT scroll vertically */}
        <div style={{overflowX:'hidden',flexShrink:0}}>
          <div id="gantt-hdr-right"
            style={{display:'flex',height:HDR2_H,background:S.cloud,
              borderBottom:`2px solid ${S.borderM}`,overflowX:'hidden'}}>
            {ganttData.days.map(d=>(
              <div key={d.key} style={{
                width:80,minWidth:76,padding:'4px',flexShrink:0,
                textAlign:'center',borderLeft:`1px solid ${S.border}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              }}>
                <div style={{fontSize:10,fontWeight:600,color:S.slate}}>{d.dow}</div>
                <div style={{fontSize:9,color:S.muted}}>{d.label.split(' ')[1]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body — scrolls both X and Y, syncs vertical with left panel */}
        <div ref={rightRef} onScroll={e=>{
            onRightScroll();
            // sync week band and day headers scroll position
            const hdr=document.getElementById('gantt-hdr-right');
            const wb=hdr?.previousElementSibling;
            if(hdr) hdr.scrollLeft=e.target.scrollLeft;
            if(wb)  wb.scrollLeft=e.target.scrollLeft;
          }}
          style={{overflowX:'auto',overflowY:'auto',maxHeight:MAX_H,flex:1}}>
          {ganttData.names.map((name,i)=>{
            const rowBg=i%2===1?S.cloud:S.white;
            return(
              <div key={i} style={{display:'flex',height:ROW_H,
                background:rowBg,borderBottom:`1px solid ${S.border}`}}>
                {ganttData.days.map(d=>{
                  const cell=ganttData.grid[name]?.[d.key]||{clients:{},total:0};
                  return(
                    <div key={d.key} style={{width:80,minWidth:76,flexShrink:0,
                      padding:'4px 4px',borderLeft:`1px solid ${S.border}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      boxSizing:'border-box'}}>
                      <GanttCell dayData={cell} name={name} dayLabel={`${d.dow} ${d.label}`}/>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer — day totals, scrolls X with body */}
        <div style={{overflowX:'hidden',flexShrink:0}}>
          <div id="gantt-footer-right"
            style={{display:'flex',height:FOOT_H,background:'#EEF2F8',
              borderTop:`2px solid ${S.borderM}`,overflowX:'hidden'}}>
            {ganttData.days.map(d=>{
              const t=ganttData.colTotals[d.key]||0;
              return(
                <div key={d.key} style={{width:80,minWidth:76,flexShrink:0,
                  padding:'0 4px',borderLeft:`1px solid ${S.border}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:11,fontWeight:600,color:t>0?S.blue:S.muted,
                  fontVariantNumeric:'tabular-nums'}}>
                  {t>0?t.toFixed(0)+'h':''}
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
  const [tRisk,     setTRisk]     = useState('all'); // all | Over | Under | OK
  const [tTeam,     setTTeam]     = useState('all'); // all | TAS | CDS
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
      setUpdatedAt(new Date()); // actual fetch time
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
    const h = e => {
      if(!e.target.closest('.wdd')) setCalOpen(false);
      // Click anywhere outside .team-row clears focused row
      if(openRow && !e.target.closest('.team-row')) setOpenRow(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [openRow]);

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
    if(tRisk!=='all')  ms = ms.filter(m=>m.risk===tRisk);
    if(tTeam!=='all')  ms = ms.filter(m=>tTeam==='CDS'?m.isCDS:!m.isCDS);
    return ms.sort((a,b)=>{
      const av=a[tSort.k]??a.util, bv=b[tSort.k]??b.util;
      return tSort.d==='asc'?(av>bv?1:-1):(av>bv?-1:1);
    });
  }, [members, tSearch, tSort, tRisk, tTeam]);

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

    // Tidy/long format — one row per person + date + client
    // Perfect for Excel pivot tables, Power BI, Tableau etc.
    // Columns: Person | Team | Date | Day | Week | Client | Hours
    const header = ['Person','Team','Date','Day','Week','Client','Hours'];
    const dataRows = [];

    ganttData.names.forEach(name => {
      const isCDS = members[name]?.isCDS;
      const team  = isCDS ? 'CDS' : 'TAS';
      ganttData.days.forEach(d => {
        const cell = ganttData.grid[name]?.[d.key] || {clients:{}};
        Object.entries(cell.clients||{}).forEach(([client, hrs]) => {
          if(hrs > 0) {
            dataRows.push([
              name,
              team,
              d.key,           // YYYY-MM-DD — sorts/groups cleanly
              d.dow,           // Mon, Tue…
              d.weekKey || mondayKey(d.key) || '',  // week starting date
              client,
              parseFloat(hrs.toFixed(2)),  // plain number, not "8h" — pivot-friendly
            ]);
          }
        });
      });
    });

    const clientPart = gClients.length>0 ? `-${gClients.join('+')}` : '';
    const teamPart   = teamF!=='all' ? `-${teamF}` : '';
    downloadCSV(
      `resource-grid-${dateRange.start||''}-${dateRange.end||''}${teamPart}${clientPart}.csv`,
      [header, ...dataRows]
    );
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
    const parts = ['dashboard'];
    if(pClient!=='all') parts.push(pClient.replace(/\s+/g,'-'));
    if(pType!=='all') parts.push(pType);
    if(pSearch.trim()) parts.push(pSearch.trim().replace(/\s+/g,'-'));
    parts.push(dateRange.start||new Date().toISOString().slice(0,10));
    if(dateRange.end && dateRange.end!==dateRange.start) parts.push(dateRange.end);
    downloadCSV(`${parts.join('_')}.csv`, [header, ...dataRows]);
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
          {!sideOff&&<img src={LOGO_SRC} alt="STOC" style={{height:36,maxWidth:140,objectFit:'contain',display:'block'}}/>}
          <button onClick={()=>setSideOff(v=>!v)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(184,201,230,.5)',padding:4,display:'flex',alignItems:'center'}}>
            {sideOff?<ChevronRight size={14}/>:<ChevronLeft size={14}/>}
          </button>
        </div>
        <nav style={{padding:'10px 8px',flex:1}}>
          {NAV.map(n=>(
            <button key={n.id} className={`ni${page===n.id?' on':''}`} onClick={()=>{setPage(n.id);setCalOpen(false);}}
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

          {/* RIGHT SIDE: Team filter + Week picker + build timestamp */}
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <span style={{fontSize:10,color:S.muted,whiteSpace:'nowrap',fontStyle:'italic'}}>Updated {BUILD_TIME}</span>
            <div style={{width:1,height:14,background:S.border}}/>
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
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden',position:'relative'}}>
              {/* Dim overlay — visible when a row is focused, click dismisses */}
              {openRow&&<div onClick={()=>setOpenRow(null)} style={{position:'absolute',inset:0,background:'rgba(255,255,255,.01)',zIndex:1,cursor:'default'}}/>}
              <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:7,padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud}}>
                {/* Search */}
                <div style={{position:'relative'}}>
                  <Search size={12} color={S.muted} style={{position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                  <input value={tSearch} onChange={e=>{setTSearch(e.target.value);setOpenRow(null);}} placeholder="Search members…"
                    style={{height:28,paddingLeft:25,paddingRight:tSearch?22:7,width:180,fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,outline:'none',boxSizing:'border-box'}}/>
                  {tSearch&&<button onClick={()=>setTSearch('')} style={{position:'absolute',right:5,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:S.muted,display:'flex',alignItems:'center',padding:0}}><X size={11}/></button>}
                </div>
                {/* Team filter */}
                <select value={tTeam} onChange={e=>{setTTeam(e.target.value);setOpenRow(null);}}
                  style={{height:28,padding:'0 7px',fontSize:12,border:`1px solid ${tTeam!=='all'?S.blue:S.border}`,borderRadius:4,background:tTeam!=='all'?'#EBF4FB':S.white,color:tTeam!=='all'?S.blue:S.ink,cursor:'pointer',outline:'none',fontWeight:tTeam!=='all'?600:400}}>
                  <option value="all">All teams</option>
                  <option value="TAS">TAS only</option>
                  <option value="CDS">CDS only</option>
                </select>
                {/* Risk filter */}
                <select value={tRisk} onChange={e=>{setTRisk(e.target.value);setOpenRow(null);}}
                  style={{height:28,padding:'0 7px',fontSize:12,border:`1px solid ${tRisk!=='all'?S.blue:S.border}`,borderRadius:4,background:tRisk!=='all'?'#EBF4FB':S.white,color:tRisk!=='all'?S.blue:S.ink,cursor:'pointer',outline:'none',fontWeight:tRisk!=='all'?600:400}}>
                  <option value="all">All statuses</option>
                  <option value="Over">At risk only</option>
                  <option value="Under">Underutilized</option>
                  <option value="OK">Healthy only</option>
                </select>
                {/* Clear */}
                {(tSearch||tRisk!=='all'||tTeam!=='all')&&(
                  <button onClick={()=>{setTSearch('');setTRisk('all');setTTeam('all');setOpenRow(null);}}
                    style={{height:28,padding:'0 9px',fontSize:11,fontWeight:500,border:'1px solid #FECACA',borderRadius:4,background:'#FEF2F2',color:S.red,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}>
                    <X size={11}/>Clear
                  </button>
                )}
                <span style={{marginLeft:'auto',fontSize:11,color:S.muted,whiteSpace:'nowrap'}}>{sortedTeam.length} members</span>
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
                      const stripeBg=i%2===1?S.cloud:S.white;
                      const rowBg=isOpen?'#EBF4FB':m.risk==='Over'?'#FFF8F8':m.risk==='Under'?'#F8FBFF':stripeBg;
                      const td0={borderBottom:`1px solid ${S.border}`,padding:'5px 12px',color:S.slate,fontVariantNumeric:'tabular-nums',verticalAlign:'middle'};
                      return(
                        <React.Fragment key={i}>
                          <tr className={`trow team-row${isOpen?' team-row-open':''}`} onClick={e=>{e.stopPropagation();setOpenRow(isOpen?null:m.name);}} style={{cursor:'pointer',background:rowBg,opacity:openRow&&!isOpen?0.35:1,transition:'opacity .18s'}}>
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
                            <tr className="team-row" style={{background:stripeBg}}>
                              <td colSpan={10} style={{padding:'0',borderBottom:`2px solid ${S.borderM}`}}>
                                {(()=>{
                                  // Group this person's jobs by client, sort by hours desc
                                  const byClient = {};
                                  projs.forEach(([jc,hrs])=>{
                                    const cl = normalizeClient(jc);
                                    if(!byClient[cl]) byClient[cl]={hrs:0,jobs:[]};
                                    byClient[cl].hrs+=hrs;
                                    byClient[cl].jobs.push([jc,hrs]);
                                  });
                                  const clientList = Object.entries(byClient).sort(([,a],[,b])=>b.hrs-a.hrs);
                                  const personTotal = projs.reduce((s,[,h])=>s+h,0);
                                  return(
                                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,tableLayout:'fixed'}}>
                                      <colgroup>
                                        <col style={{width:28}}/>{/* indent */}
                                        <col/>{/* project name */}
                                        <col style={{width:64}}/>{/* hrs */}
                                        <col style={{width:48}}/>{/* % of person */}
                                      </colgroup>
                                      <thead>
                                        <tr style={{background:S.cloud,borderBottom:`1px solid ${S.borderM}`}}>
                                          <th colSpan={2} style={{padding:'5px 14px',fontSize:9,fontWeight:700,
                                            textTransform:'uppercase',letterSpacing:'.06em',color:S.muted,textAlign:'left'}}>
                                            Client / Project
                                          </th>
                                          <th style={{padding:'5px 10px',fontSize:9,fontWeight:700,
                                            textTransform:'uppercase',letterSpacing:'.06em',color:S.muted,textAlign:'right'}}>
                                            Hrs
                                          </th>
                                          <th style={{padding:'5px 10px',fontSize:9,fontWeight:700,
                                            textTransform:'uppercase',letterSpacing:'.06em',color:S.muted,textAlign:'right'}}>
                                            % Total
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {/* ── Person total row ── */}
                                        <tr style={{background:'#EEF2F8',borderBottom:`1px solid ${S.borderM}`}}>
                                          <td colSpan={2} style={{padding:'6px 14px',fontWeight:700,color:S.navy,fontSize:12}}>
                                            {m.name} — Total
                                          </td>
                                          <td style={{padding:'6px 10px',textAlign:'right',fontWeight:700,
                                            color:S.navy,fontVariantNumeric:'tabular-nums'}}>
                                            {personTotal.toFixed(1)}
                                          </td>
                                          <td style={{padding:'6px 10px',textAlign:'right',fontWeight:700,
                                            color:S.navy,fontVariantNumeric:'tabular-nums'}}>
                                            100%
                                          </td>
                                        </tr>
                                        {/* ── Per-client groups ── */}
                                        {clientList.map(([cl,cd],ci)=>{
                                          const col = cCol(cl);
                                          const clientPct = personTotal>0?Math.round((cd.hrs/personTotal)*100):0;
                                          return(
                                            <React.Fragment key={ci}>
                                              {/* Client subtotal row */}
                                              <tr style={{background:col.bg,borderTop:`1px solid ${S.border}`,
                                                borderLeft:`3px solid ${col.bar}`}}>
                                                <td style={{padding:'5px 8px',width:28}}/>
                                                <td style={{padding:'5px 10px',fontWeight:700,fontSize:11}}>
                                                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                                                    <div style={{width:7,height:7,borderRadius:1,background:col.bar,flexShrink:0}}/>
                                                    <span style={{color:col.text}}>{cl}</span>
                                                  </div>
                                                </td>
                                                <td style={{padding:'5px 10px',textAlign:'right',fontWeight:700,
                                                  color:col.text,fontVariantNumeric:'tabular-nums',fontSize:11}}>
                                                  {cd.hrs.toFixed(1)}
                                                </td>
                                                <td style={{padding:'5px 10px',textAlign:'right',
                                                  color:S.slateL,fontVariantNumeric:'tabular-nums',fontSize:11}}>
                                                  {clientPct}%
                                                </td>
                                              </tr>
                                              {/* Individual project rows under this client */}
                                              {cd.jobs.sort(([,a],[,b])=>b-a).map(([jc,hrs],ji)=>{
                                                const projPct = personTotal>0?Math.round((hrs/personTotal)*100):0;
                                                const isLast = ji===cd.jobs.length-1;
                                                return(
                                                  <tr key={ji} style={{
                                                    borderBottom:`1px solid #EEF1F6`,
                                                    borderLeft:`3px solid ${col.bar}`,
                                                    background:ji%2===0?S.white:'#FAFBFC'
                                                  }}>
                                                    <td style={{padding:'4px 8px',width:28}}/>
                                                    <td style={{padding:'4px 10px',paddingLeft:22,color:S.slate,
                                                      overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',maxWidth:0}}
                                                      title={jc}>
                                                      {jc}
                                                    </td>
                                                    <td style={{padding:'4px 10px',textAlign:'right',
                                                      fontWeight:500,color:S.ink,fontVariantNumeric:'tabular-nums'}}>
                                                      {hrs.toFixed(1)}
                                                    </td>
                                                    <td style={{padding:'4px 10px',textAlign:'right',
                                                      color:S.muted,fontVariantNumeric:'tabular-nums'}}>
                                                      {projPct}%
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </React.Fragment>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  );
                                })()}
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
              {(dateRange.start&&dateRange.end)&&ganttData.days.length>65&&(
                <div style={{padding:'6px 14px',background:'#FFFBEB',borderBottom:`1px solid #FDE68A`,
                  fontSize:11,color:'#92400E',display:'flex',alignItems:'center',gap:6}}>
                  ⚠ {ganttData.days.length} days selected — consider narrowing the range for easier reading.
                  Showing all columns, scroll right →
                </div>
              )}

              {dateRange.start&&dateRange.end&&(
                <GanttGrid ganttData={ganttData} TH={TH} S={S} cCol={cCol}/>
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
