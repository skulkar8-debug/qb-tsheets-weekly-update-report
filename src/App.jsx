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
const CC = {
  'AEG':                  { bar:'#1d6fa8', bg:'#e8f3fb', text:'#0d3d5e' },
  'SALT':                 { bar:'#0f6b6e', bg:'#e6f4f4', text:'#0a4446' },
  'ADP':                  { bar:'#5b21b6', bg:'#f3effd', text:'#3b1480' },
  'SP USA':               { bar:'#92400e', bg:'#fef3e2', text:'#5a2800' },
  'CPC':                  { bar:'#0c5a8a', bg:'#e0f0fa', text:'#07375a' },
  'Riata':                { bar:'#065f46', bg:'#e6f7f1', text:'#03392a' },
  'Beacon':               { bar:'#6726b8', bg:'#f2ecfd', text:'#3d1580' },
  'Archway':              { bar:'#881337', bg:'#fde8ee', text:'#560b22' },
  'Budget':               { bar:'#7c3409', bg:'#fdf0e7', text:'#4a1f05' },
  'LSC':                  { bar:'#0e7490', bg:'#e0f7fa', text:'#064e5f' },
  'Administrative':       { bar:'#3d5166', bg:'#edf1f5', text:'#243040' },
  'Business Development': { bar:'#334155', bg:'#edf0f4', text:'#1e2a38' },
  'CDS Internal':         { bar:'#1e3fa0', bg:'#e8eefb', text:'#0f2060' },
  'OOO':                  { bar:'#94a3b8', bg:'#f1f5f9', text:'#475569' },
  'Other':                { bar:'#52606d', bg:'#f0f2f5', text:'#333d48' },
};
const AUTO_PAL = [
  {bar:'#b45309',bg:'#fef9ec',text:'#7c3900'},{bar:'#be185d',bg:'#fce7f3',text:'#831843'},
  {bar:'#047857',bg:'#ecfdf5',text:'#064e3b'},{bar:'#d97706',bg:'#fffbeb',text:'#92400e'},
  {bar:'#7c3aed',bg:'#f5f3ff',text:'#4c1d95'},{bar:'#0369a1',bg:'#e0f2fe',text:'#0c4a6e'},
  {bar:'#9a3412',bg:'#fff7ed',text:'#7c2d12'},{bar:'#166534',bg:'#f0fdf4',text:'#14532d'},
  {bar:'#1d4ed8',bg:'#eff6ff',text:'#1e3a8a'},{bar:'#a21caf',bg:'#fdf4ff',text:'#701a75'},
  {bar:'#0f766e',bg:'#f0fdfa',text:'#134e4a'},{bar:'#c2410c',bg:'#fff7ed',text:'#9a3412'},
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

// Gantt cell — colored segments + hover tooltip
const GanttCell = ({ segments, util, name, weekLabel }) => {
  const [tip, setTip] = useState(false);
  const [pos, setPos] = useState({top:0,left:0});
  const cellRef = useRef(null);

  const totalHrs = segments.reduce((s,sg) => s+sg.h, 0);
  const isEmpty = totalHrs === 0;

  const onEnter = e => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: Math.max(8, r.left + r.width/2 - 90) });
    setTip(true);
  };

  const utilColor = util===null?S.muted:util>=95?S.red:util>=75?S.blue:util>=60?S.green:S.muted;

  return (
    <div ref={cellRef} style={{position:'relative',minHeight:34}} onMouseEnter={onEnter} onMouseLeave={()=>setTip(false)}>
      {/* Bar */}
      <div style={{height:20,borderRadius:3,overflow:'hidden',border:`1px solid ${S.borderM}`,display:'flex',background:isEmpty?'#F8FAFC':S.white,cursor:isEmpty?'default':'pointer'}}>
        {isEmpty
          ? <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:9,color:S.muted}}>—</span></div>
          : segments.map((sg,i) => (
              <div key={i} style={{
                width:`${(sg.h/totalHrs)*100}%`, minWidth: sg.h>0?3:0,
                background: sg.isOoo ? '#CBD5E1' : cCol(sg.client).bar,
                flexShrink:0, opacity: 0.88,
              }}/>
            ))
        }
      </div>
      {/* Hours + util below */}
      {!isEmpty && (
        <div style={{display:'flex',justifyContent:'space-between',marginTop:2,paddingInline:1}}>
          <span style={{fontSize:9,color:S.slateL,fontVariantNumeric:'tabular-nums'}}>{totalHrs.toFixed(0)}h</span>
          {util!==null && <span style={{fontSize:9,fontWeight:700,color:utilColor,fontVariantNumeric:'tabular-nums'}}>{Math.round(util)}%</span>}
        </div>
      )}

      {/* Floating tooltip */}
      {tip && !isEmpty && (
        <div style={{position:'fixed',top:pos.top-window.scrollY,left:pos.left,
          background:S.navy,color:'#fff',borderRadius:5,padding:'8px 11px',
          fontSize:11,zIndex:9999,minWidth:170,maxWidth:230,pointerEvents:'none',
          boxShadow:'0 4px 18px rgba(0,0,0,.4)',lineHeight:1.55}}>
          <div style={{fontWeight:700,fontSize:12,color:S.sky,marginBottom:2}}>{name}</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginBottom:7}}>{weekLabel}</div>
          {segments.filter(sg=>sg.h>0).map((sg,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
              <div style={{width:9,height:9,borderRadius:2,background:sg.isOoo?'#CBD5E1':cCol(sg.client).bar,flexShrink:0,border:'1px solid rgba(255,255,255,.2)'}}/>
              <span style={{flex:1,color:'rgba(255,255,255,.88)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sg.isOoo?'OOO':sg.client}</span>
              <span style={{color:S.sky,fontWeight:600,fontVariantNumeric:'tabular-nums',flexShrink:0}}>{sg.h.toFixed(1)}h</span>
            </div>
          ))}
          <div style={{borderTop:'1px solid rgba(255,255,255,.15)',marginTop:5,paddingTop:5,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'rgba(255,255,255,.5)',fontSize:10}}>Total: {totalHrs.toFixed(1)}h</span>
            {util!==null&&<span style={{fontWeight:700,fontSize:11,color:util>=95?'#FCA5A5':util>=75?'#93C5FD':util>=60?'#86EFAC':'rgba(255,255,255,.45)'}}>{Math.round(util)}% util</span>}
          </div>
        </div>
      )}
    </div>
  );
};

// ── DASHBOARD PAGE — bar chart overview + click-to-expand detail ──
function DashboardPage({ clientGroups, totalBillHrs, pSearch, setPSearch, pClient, setPClient,
  pType, setPType, pSort, setPSort, allClients, hasFilters, downloadDashboard }) {

  const [selectedClient, setSelectedClient] = useState(null);

  // Build bar chart data — one bar per client, sorted by hours
  const chartData = clientGroups.map(cg => ({
    client: cg.client,
    hours:  parseFloat(cg.total.toFixed(1)),
    projs:  cg.projs,
    total:  cg.total,
  }));

  const handleBarClick = (data) => {
    if(!data) return;
    const client = data.activePayload?.[0]?.payload?.client || data.client;
    setSelectedClient(prev => prev===client ? null : client);
  };

  const selectedGroup = clientGroups.find(cg => cg.client===selectedClient);

  const CHART_H = Math.max(280, chartData.length * 32 + 60);

  // Custom bar label showing hours
  const BarLabel = (props) => {
    const { x, y, width, height, value } = props;
    if(width < 28) return null;
    return (
      <text x={x+width+6} y={y+height/2+1} fill={S.slateL} fontSize={11}
        dominantBaseline="middle" fontFamily="Inter,sans-serif" fontVariantNumeric="tabular-nums">
        {value}h
      </text>
    );
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:7,
        padding:'9px 14px',marginBottom:14,borderRadius:5,background:S.white,border:`1px solid ${S.border}`}}>
        <div style={{position:'relative',flexShrink:0}}>
          <Search size={12} color={S.muted} style={{position:'absolute',left:7,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
          <input value={pSearch} onChange={e=>setPSearch(e.target.value)} placeholder="Search projects…"
            style={{height:28,paddingLeft:25,paddingRight:pSearch?22:7,width:195,fontSize:12,
              border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.ink,outline:'none',boxSizing:'border-box'}}/>
          {pSearch&&<button onClick={()=>setPSearch('')} style={{position:'absolute',right:5,top:'50%',transform:'translateY(-50%)',
            background:'none',border:'none',cursor:'pointer',color:S.muted,display:'flex',alignItems:'center',padding:0}}><X size={11}/></button>}
        </div>
        <select value={pClient} onChange={e=>{setPClient(e.target.value);setSelectedClient(e.target.value==='all'?null:e.target.value);}}
          style={{height:28,padding:'0 7px',fontSize:12,minWidth:130,
            border:`1px solid ${pClient!=='all'?S.blue:S.border}`,borderRadius:4,
            background:S.white,color:S.ink,cursor:'pointer',outline:'none',fontWeight:pClient!=='all'?600:400}}>
          <option value="all">All clients</option>
          {allClients.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={pType} onChange={e=>setPType(e.target.value)}
          style={{height:28,padding:'0 7px',fontSize:12,
            border:`1px solid ${pType!=='all'?S.blue:S.border}`,borderRadius:4,
            background:S.white,color:S.ink,cursor:'pointer',outline:'none',fontWeight:pType!=='all'?600:400}}>
          <option value="all">All types</option>
          <option value="billable">Billable</option>
          <option value="internal-bd">Internal / BD</option>
        </select>
        <select value={pSort.k+'-'+pSort.d} onChange={e=>{const[k,d]=e.target.value.split('-');setPSort({k,d});}}
          style={{height:28,padding:'0 7px',fontSize:12,border:`1px solid ${S.border}`,borderRadius:4,
            background:S.white,color:S.ink,cursor:'pointer',outline:'none'}}>
          <option value="hours-desc">Hours ↓</option>
          <option value="hours-asc">Hours ↑</option>
          <option value="name-asc">Name A–Z</option>
        </select>
        {hasFilters&&<button onClick={()=>{setPSearch('');setPClient('all');setPType('all');setSelectedClient(null);}}
          style={{height:28,padding:'0 9px',fontSize:11,fontWeight:500,border:'1px solid #FECACA',borderRadius:4,
            background:'#FEF2F2',color:S.red,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}>
          <X size={11}/>Clear
        </button>}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,color:S.muted,whiteSpace:'nowrap'}}>
            {clientGroups.reduce((s,g)=>s+g.projs.length,0)} projects · {clientGroups.length} clients
          </span>
          <button onClick={downloadDashboard}
            style={{height:28,padding:'0 9px',fontSize:11,border:`1px solid ${S.border}`,borderRadius:4,
              background:S.white,color:S.slate,cursor:'pointer',display:'flex',alignItems:'center',gap:4,outline:'none'}}>
            <Download size={11}/> CSV
          </button>
        </div>
      </div>

      {clientGroups.length===0&&(
        <div style={{padding:'60px 16px',textAlign:'center',color:S.muted,background:S.white,borderRadius:5,border:`1px solid ${S.border}`}}>
          No projects match filters
        </div>
      )}

      {clientGroups.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:selectedGroup?'1fr 1fr':'1fr',gap:14,alignItems:'start'}}>

          {/* ── LEFT: Horizontal bar chart ── */}
          <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden'}}>
            <div style={{padding:'10px 16px',borderBottom:`1px solid ${S.border}`,background:S.cloud,
              display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:600,color:S.navy}}>Hours by Client</span>
              <span style={{fontSize:11,color:S.muted}}>Click a bar to see project detail</span>
            </div>
            <div style={{padding:'12px 8px 8px 0',overflowX:'hidden'}}>
              <ResponsiveContainer width="100%" height={CHART_H}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{top:4, right:60, bottom:4, left:8}}
                  barCategoryGap="22%"
                  onClick={handleBarClick}
                  style={{cursor:'pointer'}}
                >
                  <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke={S.border}/>
                  <XAxis type="number" tick={{fontSize:10,fill:S.muted}} tickLine={false} axisLine={false}/>
                  <YAxis type="category" dataKey="client" width={130}
                    tick={({x,y,payload})=>(
                      <g transform={`translate(${x},${y})`}>
                        <rect x={-130} y={-9} width={8} height={18} rx={2}
                          fill={selectedClient===payload.value?cCol(payload.value).bar:cCol(payload.value).bar}
                          opacity={selectedClient&&selectedClient!==payload.value?0.35:1}/>
                        <text x={-116} y={0} dy={4} fontSize={11} fill={selectedClient===payload.value?S.navy:S.ink}
                          fontFamily="Inter,sans-serif" fontWeight={selectedClient===payload.value?700:400}
                          textAnchor="start">
                          {payload.value.length>16?payload.value.slice(0,15)+'…':payload.value}
                        </text>
                      </g>
                    )}
                    tickLine={false} axisLine={false}
                  />
                  <RTooltip
                    cursor={{fill:'rgba(20,116,196,.06)'}}
                    content={({active,payload})=>{
                      if(!active||!payload?.length) return null;
                      const d=payload[0].payload;
                      return(
                        <div style={{background:S.navy,border:'none',borderRadius:5,padding:'8px 12px',fontSize:11,
                          boxShadow:'0 4px 16px rgba(0,0,0,.3)'}}>
                          <div style={{fontWeight:700,color:S.sky,marginBottom:4}}>{d.client}</div>
                          <div style={{color:'rgba(255,255,255,.85)'}}>{d.hours}h across {d.projs.length} projects</div>
                          <div style={{color:'rgba(255,255,255,.5)',fontSize:10,marginTop:2}}>Click to expand ↓</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="hours" radius={[0,3,3,0]} maxBarSize={22} label={<BarLabel/>}>
                    {chartData.map((entry,i)=>(
                      <Cell key={i}
                        fill={cCol(entry.client).bar}
                        opacity={selectedClient && selectedClient!==entry.client ? 0.3 : 0.88}
                        stroke={selectedClient===entry.client ? cCol(entry.client).bar : 'none'}
                        strokeWidth={selectedClient===entry.client ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── RIGHT: Project detail panel ── */}
          {selectedGroup&&(
            <div style={{background:S.white,border:`1px solid ${S.border}`,borderRadius:5,overflow:'hidden',
              borderTop:`3px solid ${cCol(selectedGroup.client).bar}`}}>
              <div style={{padding:'10px 14px',borderBottom:`1px solid ${S.border}`,
                background:cCol(selectedGroup.client).bg,
                display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:9,height:9,borderRadius:2,background:cCol(selectedGroup.client).bar,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,color:cCol(selectedGroup.client).text}}>{selectedGroup.client}</span>
                  <span style={{fontSize:11,color:S.slateL}}>{selectedGroup.projs.length} projects · {selectedGroup.total.toFixed(1)}h</span>
                </div>
                <button onClick={()=>setSelectedClient(null)}
                  style={{background:'none',border:'none',cursor:'pointer',color:S.muted,display:'flex',alignItems:'center',padding:2}}>
                  <X size={14}/>
                </button>
              </div>

              {/* Project rows */}
              <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
                <colgroup>
                  <col/>{/* project name */}
                  <col style={{width:54}}/>{/* hours */}
                  <col style={{width:40}}/>{/* % */}
                </colgroup>
                <thead>
                  <tr style={{borderBottom:`1px solid ${S.border}`}}>
                    <th style={{padding:'6px 14px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'.05em',color:S.muted,textAlign:'left',background:S.cloud}}>Project</th>
                    <th style={{padding:'6px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'.05em',color:S.muted,textAlign:'right',background:S.cloud}}>Hrs</th>
                    <th style={{padding:'6px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',
                      letterSpacing:'.05em',color:S.muted,textAlign:'right',background:S.cloud}}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.projs.map((p,pi)=>{
                    const mems = Object.entries(p.mems).sort(([,a],[,b])=>b-a);
                    const isBill = p.cat==='Billable';
                    return(
                      <React.Fragment key={pi}>
                        <tr style={{background:pi%2===0?S.white:'#FAFBFC',
                          borderBottom:`1px solid #EEF1F6`}}>
                          <td style={{padding:'6px 14px',fontSize:12,color:S.ink,
                            overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',maxWidth:0}}
                            title={p.name}>
                            {p.name}
                          </td>
                          <td style={{padding:'6px 8px',textAlign:'right',fontWeight:600,
                            fontSize:13,color:S.ink,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>
                            {p.hrs.toFixed(1)}
                          </td>
                          <td style={{padding:'6px 8px',textAlign:'right',fontSize:11,
                            color:S.muted,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>
                            {isBill?pctFmt(p.hrs,totalBillHrs):'—'}
                          </td>
                        </tr>
                        {/* Members row */}
                        <tr style={{background:pi%2===0?S.white:'#FAFBFC',
                          borderBottom:pi<selectedGroup.projs.length-1?`1px solid #EEF1F6`:'none'}}>
                          <td colSpan={3} style={{padding:'0 14px 7px',paddingTop:0}}>
                            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                              {mems.map(([n,h],mi)=>(
                                <span key={mi} style={{display:'inline-flex',alignItems:'center',gap:3,
                                  background:S.cloud,border:`1px solid ${S.border}`,
                                  borderRadius:3,padding:'2px 7px',fontSize:11,whiteSpace:'nowrap'}}>
                                  <span style={{color:S.ink,fontWeight:500}}>{n.split(' ')[0]}</span>
                                  <span style={{color:cCol(selectedGroup.client).bar,fontWeight:600,
                                    fontVariantNumeric:'tabular-nums'}}>{h.toFixed(0)}h</span>
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
  const [gClient,   setGClient]   = useState('all');

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
    if(!allNames.length || (!start && !end)) return {names:[],days:[],grid:{}};
    const daySet = new Set();
    rows.forEach(r => {
      const d = normDate(r.local_date);
      if(!d) return;
      if(start && d < start) return;
      if(end   && d > end)   return;
      daySet.add(d);
    });
    // Sort days chronologically
    const sortedDays = [...daySet].sort((a,b) => new Date(a)-new Date(b));
    if(!sortedDays.length) return {names:[],days:[],grid:{}};

    // Build grid: grid[name][dateStr] = { clients:{}, ooo:0, total:0 }
    const grid = {};
    allNames.forEach(n => {
      grid[n] = {};
      sortedDays.forEach(d => { grid[n][d] = {clients:{},ooo:0,total:0}; });
    });

    // Scan rows — each row is already one person+day+jobcode
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
      if(cat==='OOO') {
        grid[name][dateStr].ooo += hrs;
      } else {
        if(gClient!=='all' && client!==gClient) return;
        grid[name][dateStr].clients[client] = (grid[name][dateStr].clients[client]||0)+hrs;
        grid[name][dateStr].total += hrs;
      }
    });

    // Compute util per cell (8h day = 100% capacity; OOO reduces capacity)
    Object.values(grid).forEach(pg => {
      Object.values(pg).forEach(cell => {
        const dayCapacity = 8 - cell.ooo;
        cell.util = dayCapacity>0
          ? (cell.total/dayCapacity)*100
          : cell.total>0 ? 100 : null;
      });
    });

    // Build day meta for column headers
    const dayMeta = sortedDays.map(d => {
      const dt = new Date(d);
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return {
        key: d,
        dow: dayNames[dt.getDay()],
        label: `${monthNames[dt.getMonth()]} ${dt.getDate()}`,
        isWeekend: dt.getDay()===0||dt.getDay()===6,
        weekKey: mondayKey(d),
      };
    });

    const filteredNames = gClient==='all'
      ? allNames
      : allNames.filter(n => sortedDays.some(d => grid[n][d].total>0));

    return { names:filteredNames, days:dayMeta, grid };
  }, [rows, members, dateRange, teamF, gClient]);

  // ── GANTT CSV DOWNLOAD ──
  const downloadGantt = () => {
    if(!ganttData.names.length) return;
    const header = ['Person', ...ganttData.days.map(d=>`${d.dow} ${d.label}`)];
    const dataRows = ganttData.names.map(name => {
      const cells = ganttData.days.map(d => {
        const cell = ganttData.grid[name]?.[d.key];
        if(!cell || cell.total===0) return '';
        return `${cell.total.toFixed(1)}h`;
      });
      return [name, ...cells];
    });
    downloadCSV(`resource-grid-${new Date().toISOString().slice(0,10)}.csv`, [header, ...dataRows]);
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

  // ── DATE RANGE PICKER ──
  const DateRangePicker = () => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
    const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const buildCells = (yr,mo) => {
      const first = new Date(yr,mo,1).getDay();
      const last  = new Date(yr,mo+1,0).getDate();
      const cells = [];
      for(let i=0;i<first;i++) cells.push(null);
      for(let d=1;d<=last;d++) cells.push(d);
      return cells;
    };
    const toKey = (yr,mo,d) => `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const inRange = k => { const {start,end}=dateRange; return start&&end&&k>start&&k<end; };
    const inHover = k => { if(!dateRange.start||dateRange.end||!calHover) return false; const lo=dateRange.start<calHover?dateRange.start:calHover, hi=dateRange.start<calHover?calHover:dateRange.start; return k>lo&&k<hi; };
    const handleClick = k => {
      if(!allDays.includes(k)) return;
      const {start,end} = dateRange;
      if(!start||(start&&end)) { setDateRange({start:k,end:''}); }
      else { if(k===start){setDateRange({start:'',end:''});return;} const lo=k<start?k:start,hi=k<start?start:k; setDateRange({start:lo,end:hi}); setCalOpen(false); }
    };
    const renderMonth = (yr,mo) => {
      const cells = buildCells(yr,mo);
      return (
        <div style={{minWidth:196}}>
          <div style={{textAlign:'center',fontSize:12,fontWeight:600,color:S.ink,marginBottom:8,padding:'0 2px'}}>{MONTHS[mo]} {yr}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
            {DAYS.map(d=><div key={d} style={{fontSize:9,fontWeight:700,color:S.muted,textAlign:'center',padding:'2px 0'}}>{d}</div>)}
            {cells.map((day,ci)=>{
              if(!day) return <div key={ci}/>;
              const k=toKey(yr,mo,day);
              const hasDat=allDays.includes(k);
              const isS=k===dateRange.start, isE=k===dateRange.end;
              const mid=inRange(k)||inHover(k);
              const isHE=!dateRange.end&&k===calHover&&hasDat;
              const isTod=k===today.toISOString().slice(0,10);
              const isWknd=new Date(k).getDay()===0||new Date(k).getDay()===6;
              let bg='transparent',col=hasDat?(isWknd?S.muted:S.ink):'#CBD5E1',fw=400,br=4;
              if(isS||isE)    {bg=S.blue;col='#fff';fw=700;}
              else if(isHE)   {bg='#93C5FD';col=S.navy;}
              else if(mid)    {bg='#DBEAFE';col=S.blue;br=0;}
              return (
                <div key={ci} onClick={()=>handleClick(k)}
                  onMouseEnter={()=>setCalHover(k)} onMouseLeave={()=>setCalHover(null)}
                  style={{textAlign:'center',padding:'4px 2px',fontSize:11,borderRadius:br,
                    background:bg,color:col,fontWeight:fw,
                    cursor:hasDat?'pointer':'default',
                    boxShadow:isTod&&!isS&&!isE?`inset 0 0 0 1px ${S.borderM}`:'none',
                    opacity:hasDat?1:0.25,userSelect:'none',transition:'background .08s'}}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      );
    };
    const m2=viewMonth===11?0:viewMonth+1, y2=viewMonth===11?viewYear+1:viewYear;
    return (
      <div className="wdd" style={{position:'relative',flexShrink:0}}>
        <button onClick={()=>setCalOpen(v=>!v)}
          style={{height:28,padding:'0 8px 0 10px',fontSize:12,
            border:`1px solid ${dateRange.start?S.blue:S.border}`,borderRadius:4,
            background:dateRange.start?'#EBF4FB':S.white,
            color:dateRange.start?S.blue:S.ink,cursor:'pointer',
            display:'flex',alignItems:'center',gap:5,outline:'none',minWidth:170,maxWidth:260,
            fontWeight:dateRange.start?600:400}}>
          <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,textAlign:'left',fontSize:12}}>{rangeLabel()}</span>
          {dateRange.start&&<span onClick={e=>{e.stopPropagation();setDateRange({start:'',end:''});}}
            style={{display:'flex',alignItems:'center',cursor:'pointer',color:S.muted,flexShrink:0,padding:2}}><X size={10}/></span>}
          <ChevronDown size={11} style={{flexShrink:0,transform:calOpen?'rotate(180deg)':'none',transition:'.15s'}}/>
        </button>
        {calOpen&&(
          <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,background:S.white,
            border:`1px solid ${S.border}`,borderRadius:8,
            boxShadow:'0 8px 32px rgba(0,0,0,.15)',zIndex:200,padding:14,userSelect:'none',minWidth:440}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <button onClick={prevMonth} style={{background:'none',border:'none',cursor:'pointer',color:S.slate,padding:'2px 8px',borderRadius:3,fontSize:16,lineHeight:1}}>‹</button>
              <div style={{fontSize:11,color:S.muted}}>
                {!dateRange.start&&!dateRange.end&&'Click a start date'}
                {dateRange.start&&!dateRange.end&&<span style={{color:S.blue,fontWeight:500}}>Now click an end date</span>}
                {dateRange.start&&dateRange.end&&<span style={{color:S.green,fontWeight:600}}>✓ {rangeLabel()}</span>}
              </div>
              <button onClick={nextMonth} style={{background:'none',border:'none',cursor:'pointer',color:S.slate,padding:'2px 8px',borderRadius:3,fontSize:16,lineHeight:1}}>›</button>
            </div>
            <div style={{display:'flex',gap:20}}>{renderMonth(viewYear,viewMonth)}{renderMonth(y2,m2)}</div>
            <div style={{borderTop:`1px solid ${S.border}`,marginTop:10,paddingTop:8,display:'flex',gap:6,flexWrap:'wrap'}}>
              {[
                ['This week',()=>{const n=new Date(),dw=n.getDay()||7,m=new Date(n);m.setDate(n.getDate()-(dw-1));const f=new Date(m);f.setDate(m.getDate()+4);setDateRange({start:m.toISOString().slice(0,10),end:f.toISOString().slice(0,10)});setCalOpen(false);}],
                ['Last week',()=>{const n=new Date(),dw=n.getDay()||7,m=new Date(n);m.setDate(n.getDate()-(dw-1));const lm=new Date(m);lm.setDate(m.getDate()-7);const lf=new Date(lm);lf.setDate(lm.getDate()+4);setDateRange({start:lm.toISOString().slice(0,10),end:lf.toISOString().slice(0,10)});setCalOpen(false);}],
                ['Last 30d',()=>{const n=new Date(),a=new Date();a.setDate(n.getDate()-30);setDateRange({start:a.toISOString().slice(0,10),end:n.toISOString().slice(0,10)});setCalOpen(false);}],
                ['This month',()=>{const n=new Date();const s=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01`;setDateRange({start:s,end:n.toISOString().slice(0,10)});setCalOpen(false);}],
                ['All data',()=>{setDateRange({start:minDate,end:maxDate});setCalOpen(false);}],
              ].map(([lbl,fn])=>(
                <button key={lbl} onClick={fn} style={{padding:'3px 9px',fontSize:11,fontWeight:500,border:`1px solid ${S.border}`,borderRadius:4,background:S.cloud,color:S.slate,cursor:'pointer'}}>{lbl}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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
              <DateRangePicker/>
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
              <div style={{padding:'9px 14px',borderBottom:`1px solid ${S.border}`,background:S.cloud,
                display:'flex',alignItems:'center',flexWrap:'wrap',gap:8,justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <select value={gClient} onChange={e=>setGClient(e.target.value)}
                    style={{height:28,padding:'0 7px',fontSize:12,minWidth:140,
                      border:`1px solid ${gClient!=='all'?S.blue:S.border}`,borderRadius:4,
                      background:S.white,color:S.ink,cursor:'pointer',outline:'none',fontWeight:gClient!=='all'?600:400}}>
                    <option value="all">All clients</option>
                    {allClients.filter(c=>c!=='OOO').map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  {gClient!=='all'&&(
                    <button onClick={()=>setGClient('all')}
                      style={{height:28,padding:'0 9px',fontSize:11,fontWeight:500,border:'1px solid #FECACA',borderRadius:4,background:'#FEF2F2',color:S.red,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}>
                      <X size={11}/>Clear
                    </button>
                  )}
                  {/* Active-client legend */}
                  <div style={{display:'flex',flexWrap:'wrap',gap:'3px 10px',marginLeft:4}}>
                    {[...new Set(
                      ganttData.names.flatMap(n =>
                        ganttData.days.flatMap(d => Object.keys(ganttData.grid[n]?.[d.key]?.clients||{}))
                      )
                    )].map(c=>(
                      <div key={c} style={{display:'flex',alignItems:'center',gap:3}}>
                        <div style={{width:9,height:9,borderRadius:2,background:cCol(c).bar,flexShrink:0}}/>
                        <span style={{fontSize:10,color:S.slateL}}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                  <span style={{fontSize:11,color:S.muted}}>{ganttData.names.length} people · {ganttData.days.length} days</span>
                  <button onClick={downloadGantt}
                    style={{height:28,padding:'0 9px',fontSize:11,border:`1px solid ${S.border}`,borderRadius:4,background:S.white,color:S.slate,cursor:'pointer',display:'flex',alignItems:'center',gap:4,outline:'none'}}>
                    <Download size={11}/> CSV
                  </button>
                </div>
              </div>

              {ganttData.names.length===0&&(
                <div style={{padding:'48px 16px',textAlign:'center',color:S.muted}}>
                  No data for selected period. Select weeks using the Period picker above.
                </div>
              )}

              {ganttData.names.length>0&&(
                <div style={{overflowX:'auto'}}>
                  <table style={{borderCollapse:'collapse',tableLayout:'fixed',minWidth:'100%'}}>
                    <colgroup>
                      <col style={{width:174,minWidth:150}}/>
                      {ganttData.days.map(d=><col key={d.key} style={{minWidth:d.isWeekend?28:52,width:d.isWeekend?28:52}}/>)}
                    </colgroup>
                    <thead>
                      {/* Month/week separator row */}
                      <tr style={{background:S.cloud}}>
                        <th style={{...TH(false,16),position:'sticky',left:0,zIndex:3,background:S.cloud,borderBottom:'none'}}/>
                        {(() => {
                          // Group consecutive days by week for a "week band" header
                          const bands = [];
                          ganttData.days.forEach(d => {
                            const last = bands[bands.length-1];
                            if(last && last.weekKey===d.weekKey) { last.count++; last.endLabel=d.label; }
                            else bands.push({weekKey:d.weekKey, label:d.label, endLabel:d.label, count:1});
                          });
                          return bands.map((b,i)=>(
                            <th key={i} colSpan={b.count}
                              style={{padding:'3px 4px',fontSize:9,fontWeight:700,color:S.slate,
                                textAlign:'center',background:S.cloud,
                                borderBottom:`1px solid ${S.borderM}`,
                                borderLeft:`1px solid ${S.borderM}`,whiteSpace:'nowrap'}}>
                              {b.label}{b.count>1?` – ${b.endLabel}`:''}
                            </th>
                          ));
                        })()}
                      </tr>
                      {/* Day header row */}
                      <tr style={{borderBottom:`2px solid ${S.borderM}`}}>
                        <th style={{...TH(false,16),position:'sticky',left:0,zIndex:3,background:S.cloud}}>Person</th>
                        {ganttData.days.map(d=>(
                          <th key={d.key}
                            style={{...TH(false,2),padding:'4px 2px',fontSize:9,
                              background:d.isWeekend?'#F0F0F4':S.cloud,
                              textAlign:'center',lineHeight:1.2,
                              borderLeft:`1px solid ${S.border}`,
                              color:d.isWeekend?S.muted:S.slate}}>
                            <div style={{fontWeight:600}}>{d.dow}</div>
                            {!d.isWeekend&&<div style={{fontWeight:400,fontSize:8,color:S.muted}}>{d.label.split(' ')[1]}</div>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ganttData.names.map((name,i)=>(
                        <tr key={i} style={{borderBottom:`1px solid ${S.border}`,background:i%2===1?S.cloud:S.white}}>
                          <td style={{padding:'4px 16px',fontSize:12,fontWeight:500,color:S.ink,
                            whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                            position:'sticky',left:0,zIndex:1,
                            background:i%2===1?S.cloud:S.white,
                            borderBottom:`1px solid ${S.border}`}}>
                            {name}
                          </td>
                          {ganttData.days.map(d=>{
                            const cell = ganttData.grid[name]?.[d.key]||{clients:{},ooo:0,total:0,util:null};
                            if(d.isWeekend){
                              // Weekend — just a shaded cell, no bar
                              return <td key={d.key} style={{background:'#F0F0F4',borderLeft:`1px solid ${S.border}`,borderBottom:`1px solid ${S.border}`}}/>;
                            }
                            const segments = Object.entries(cell.clients)
                              .map(([client,h])=>({client,h}))
                              .sort((a,b)=>b.h-a.h);
                            if(cell.ooo>0) segments.push({client:'OOO',h:cell.ooo,isOoo:true});
                            return(
                              <td key={d.key} style={{padding:'3px 3px',borderBottom:`1px solid ${S.border}`,borderLeft:`1px solid ${S.border}`,verticalAlign:'top'}}>
                                <GanttCell segments={segments} util={cell.util} name={name} weekLabel={`${d.dow} ${d.label}`}/>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
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
