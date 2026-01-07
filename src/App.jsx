import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, BarChart3, PieChart, Target, UserCheck, AlertTriangle, Coffee } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine } from 'recharts';

//////////////////////////////////////////////////////////////////////////////////
// REPLACE THIS SECTION WITH YOUR FULL CSV DATA FROM ALL 15 WEEKS
// Currently showing sample data for demonstration
//////////////////////////////////////////////////////////////////////////////////

const rawData12 = `lname,fname,username,job_code,hours
Egan,Sean,segan@stocadvisory.com,ADP - Emma Wu and Associates,3
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,9
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),46.78
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),15
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,15
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,3
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,32
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,40
Sharma,Mohit,msharma@stocadvisory.com,Business Development,35
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,38
Singh,Jogendra,jsingh@stocadvisory.com,Administrative,22
D,Ramya,rdamani@stocadvisory.com,CDS - Tableau,25
Earp,Ryan,rearp@stocadvisory.com,Vacation,8
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Atlanta Endodontics,42
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Atlanta Endodontics,38`;


const rawData13 = `lname,fname,username,job_code,hours
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,19
Sundar,Barath,bsundar@stocadvisory.com,ADP - Tearsheet,16
Egan,Sean,segan@stocadvisory.com,ADP - Tearsheet,2
Garg,Vishal,vgarg@stocadvisory.com,ADP - Tearsheet,16
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,30
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,38
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,35
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bergen Optometry,42
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care,40`;


const rawData14 = `lname,fname,username,job_code,hours
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Corp Dev Support (Tearsheet),21
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Emma Wu and Associates,2
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,32
Egan,Sean,segan@stocadvisory.com,ADP - Tearsheet,2
Sharma,Mohit,msharma@stocadvisory.com,Business Development,28
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,36
Luetgers,Sam,sluetgers@stocadvisory.com,Holiday,8
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care,44`;


const rawData15 = `lname,fname,username,job_code,hours
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,27
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Tearsheet,16
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),1.98
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,4.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,3
Sharma,Mohit,msharma@stocadvisory.com,Business Development,40
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,42
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bergen Optometry,40
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care,45`;

//////////////////////////////////////////////////////////////////////////////////
// END OF DATA SECTION - Rest of code handles all functionality
//////////////////////////////////////////////////////////////////////////////////

const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });
    return entry;
  });
};

const StocStaffingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [businessUnitFilter, setBusinessUnitFilter] = useState('all');
  const [selectedRiskPerson, setSelectedRiskPerson] = useState(null);
  const weekSelectorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (weekSelectorRef.current && !weekSelectorRef.current.contains(event.target)) {
        setShowWeekSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const teamMembersByUnit = {
    cds: ['Mohit Sharma', 'Rakesh Nayak', 'Sharvan Pandey', 'Stefan Joseph', 'Jogendra Singh', 'Ramya D', 'Vaishnav Govind']
  };

  const week12Data = useMemo(() => parseCSV(rawData12), []);
  const week13Data = useMemo(() => parseCSV(rawData13), []);
  const week14Data = useMemo(() => parseCSV(rawData14), []);
  const week15Data = useMemo(() => parseCSV(rawData15), []);

  const allData = useMemo(() => {
    let data = [];
    if (selectedWeeks.length > 0) {
      const weekDataMap = { 12: week12Data, 13: week13Data, 14: week14Data, 15: week15Data };
      selectedWeeks.forEach(weekNum => {
        if (weekDataMap[weekNum]) data = [...data, ...weekDataMap[weekNum]];
      });
    } else if (selectedPeriod === 'all') {
      data = [...week12Data, ...week13Data, ...week14Data, ...week15Data];
    } else if (selectedPeriod === 'week12') data = week12Data;
    else if (selectedPeriod === 'week13') data = week13Data;
    else if (selectedPeriod === 'week14') data = week14Data;
    else if (selectedPeriod === 'week15') data = week15Data;
    
    // Apply business unit filter
    if (businessUnitFilter !== 'all') {
      data = data.filter(entry => {
        const fullName = `${entry.fname} ${entry.lname}`;
        const isCDS = teamMembersByUnit.cds.includes(fullName);
        
        if (businessUnitFilter === 'cds') {
          return isCDS;
        } else if (businessUnitFilter === 'tas') {
          return !isCDS;
        }
        return true;
      });
    }
    
    return data;
  }, [week12Data, week13Data, week14Data, week15Data, selectedPeriod, selectedWeeks, businessUnitFilter, teamMembersByUnit]);

  const determineCategory = (jobCode) => {
    if (jobCode.includes('Holiday') || jobCode.includes('Vacation') || jobCode.includes('Sick')) return 'OOO';
    if (jobCode.includes('Administrative') || jobCode.includes('Business Development') || jobCode === 'CDS - Tableau') return 'Internal/BD';
    return 'Billable';
  };

  const processedData = useMemo(() => {
    const teamMembers = {};
    allData.forEach(entry => {
      const name = `${entry.fname} ${entry.lname}`;
      const hours = parseFloat(entry.hours) || 0;
      const category = determineCategory(entry.job_code);

      if (!teamMembers[name]) {
        teamMembers[name] = { name, totalHours: 0, billableHours: 0, internalHours: 0, oooHours: 0, projects: {} };
      }
      teamMembers[name].totalHours += hours;
      if (category === 'Billable') teamMembers[name].billableHours += hours;
      else if (category === 'Internal/BD') teamMembers[name].internalHours += hours;
      else if (category === 'OOO') teamMembers[name].oooHours += hours;
      
      if (!teamMembers[name].projects[entry.job_code]) teamMembers[name].projects[entry.job_code] = 0;
      teamMembers[name].projects[entry.job_code] += hours;
    });

    // Calculate week count: if specific weeks selected, use that count; otherwise use 4 for "all"
    const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
    Object.keys(teamMembers).forEach(name => {
      const member = teamMembers[name];
      const utilizedHours = member.billableHours + member.internalHours;
      const standardCapacity = 40 * weekCount;
      member.utilization = standardCapacity > 0 ? ((utilizedHours / standardCapacity) * 100) : 0;
    });

    return { teamMembers };
  }, [allData, selectedPeriod, selectedWeeks]);

  const riskData = useMemo(() => {
    // Calculate week count: if specific weeks selected, use that count; otherwise use 4 for "all"
    const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
    const standardCapacity = 40 * weekCount;
    
    const teamRiskData = Object.values(processedData.teamMembers)
      .map(member => {
        const totalUsedHours = member.billableHours + member.internalHours + member.oooHours;
        const utilizationPct = standardCapacity > 0 ? (totalUsedHours / standardCapacity) * 100 : 0;
        const billableMixPct = totalUsedHours > 0 ? (member.billableHours / totalUsedHours) * 100 : 0;
        const isCDS = teamMembersByUnit.cds.includes(member.name);
        
        let riskLevel = 'Healthy / Balanced';
        let riskColor = '#10B981';
        
        if (utilizationPct >= 95) {
          riskLevel = 'Burnout Risk';
          riskColor = '#EF4444';
        } else if (utilizationPct < 60) {
          riskLevel = 'Available Capacity';
          riskColor = '#F59E0B';
        } else if (isCDS && billableMixPct < 70) {
          riskLevel = 'Strategic Internal Allocation';
          riskColor = '#8B5CF6';
        }
        
        return {
          ...member,
          totalUsedHours,
          utilizationPct,
          billableMixPct,
          riskLevel,
          riskColor,
          standardCapacity
        };
      })
      .filter(member => member.totalUsedHours > 0)
      .sort((a, b) => b.utilizationPct - a.utilizationPct);
    
    const avgUtilization = teamRiskData.length > 0 ? teamRiskData.reduce((sum, m) => sum + m.utilizationPct, 0) / teamRiskData.length : 0;
    
    return {
      teamRiskData,
      kpis: {
        avgUtilization: avgUtilization.toFixed(1),
        burnoutCount: teamRiskData.filter(m => m.riskLevel === 'Burnout Risk').length,
        availableCapacityCount: teamRiskData.filter(m => m.riskLevel === 'Available Capacity').length,
        strategicCount: teamRiskData.filter(m => m.riskLevel === 'Strategic Internal Allocation').length,
        healthyCount: teamRiskData.filter(m => m.riskLevel === 'Healthy / Balanced').length
      }
    };
  }, [processedData, selectedPeriod, selectedWeeks, teamMembersByUnit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
  <img src="/logo.png" className="h-9 w-auto" />
  <div>
    <h1 className="text-3xl font-bold text-gray-900">STOC Staffing Tool</h1>
    <p className="text-gray-500 mt-1">Real-time visibility into team utilization and project allocation</p>
  </div>
</div>

          
          <div className="flex gap-3">
            <select className="px-4 py-2 border rounded-lg" value={businessUnitFilter} onChange={(e) => setBusinessUnitFilter(e.target.value)}>
              <option value="all">All Teams</option>
              <option value="tas">TAS</option>
              <option value="cds">CDS</option>
            </select>

            <div className="relative" ref={weekSelectorRef}>
              <button onClick={() => setShowWeekSelector(!showWeekSelector)} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between">
                <span className="text-sm">
                  {selectedWeeks.length === 0 || selectedWeeks.length === 4 ? 
                    'All Periods (4 weeks)' : 
                    `${selectedWeeks.length} week${selectedWeeks.length !== 1 ? 's' : ''} selected`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showWeekSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showWeekSelector && (
                <div className="absolute top-full mt-2 right-0 bg-white border rounded-lg shadow-xl z-50 w-[400px] max-h-[400px] overflow-y-auto">
                  <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-sm">Select Time Periods</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedWeeks([12,13,14,15]); setSelectedPeriod('all'); }} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">All</button>
                      <button onClick={() => { setSelectedWeeks([]); setSelectedPeriod('all'); }} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Clear</button>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      { num: 15, label: 'Jan 4 - Jan 10, 2026', value: 'week15' },
                      { num: 14, label: 'Dec 28, 2025 - Jan 3, 2026', value: 'week14' },
                      { num: 13, label: 'Dec 21 - Dec 27, 2025', value: 'week13' },
                      { num: 12, label: 'Dec 14 - Dec 20, 2025', value: 'week12' }
                    ].map(week => (
                      <label key={week.num} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedWeeks.includes(week.num)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newWeeks = [...selectedWeeks, week.num].sort((a, b) => a - b);
                              setSelectedWeeks(newWeeks);
                              setSelectedPeriod(newWeeks.length === 1 ? week.value : 'custom');
                            } else {
                              const newWeeks = selectedWeeks.filter(w => w !== week.num);
                              setSelectedWeeks(newWeeks);
                              setSelectedPeriod(newWeeks.length === 0 ? 'all' : newWeeks.length === 1 ? `week${newWeeks[0]}` : 'custom');
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{week.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Team Members</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{Object.keys(processedData.teamMembers).length}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Briefcase className="w-5 h-5" />
              <span className="text-sm font-medium">Internal/BD</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {Object.values(processedData.teamMembers).reduce((sum, m) => sum + m.internalHours, 0).toFixed(1)}h
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6 border-b">
          {['overview'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {activeTab === 'overview' && (
          <>
            <div className="col-span-12 space-y-4 mb-6">
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Avg Team Utilization</div>
                  <div className="text-3xl font-bold text-gray-900">{riskData.kpis.avgUtilization}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Burnout Risk</div>
                  <div className="text-3xl font-bold text-red-600">{riskData.kpis.burnoutCount}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-amber-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Available Capacity</div>
                  <div className="text-3xl font-bold text-amber-600">{riskData.kpis.availableCapacityCount}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Strategic Internal</div>
                  <div className="text-3xl font-bold text-purple-600">{riskData.kpis.strategicCount}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Healthy / Balanced</div>
                  <div className="text-3xl font-bold text-green-600">{riskData.kpis.healthyCount}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">Utilization Risk Matrix</h2>
                  <span className="text-sm text-gray-600">
                    Showing {riskData.teamRiskData.length} team member{riskData.teamRiskData.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  X-axis: Total Hours Used | Y-axis: Utilization % | Instantly see who is overloaded and who has capacity
                </p>
                
                <div className="relative" style={{ height: '500px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid meet" className="border border-gray-200 rounded">
                    {/* Grid lines and axes */}
                    <line x1="80" y1="20" x2="80" y2="480" stroke="#E5E7EB" strokeWidth="2" />
                    <line x1="80" y1="480" x2="1150" y2="480" stroke="#E5E7EB" strokeWidth="2" />
                    
                    {/* Horizontal reference zones */}
                    {/* Burnout zone (95-100%) - Red background */}
                    <rect x="80" y="20" width="1070" height="46" fill="#FEE2E2" opacity="0.3" />
                    {/* Healthy zone (60-95%) - Green background */}
                    <rect x="80" y="66" width="1070" height="161" fill="#D1FAE5" opacity="0.3" />
                    {/* Available zone (0-60%) - Amber background */}
                    <rect x="80" y="227" width="1070" height="253" fill="#FEF3C7" opacity="0.3" />
                    
                    {/* Y-axis labels (Utilization %) */}
                    <text x="70" y="25" textAnchor="end" className="text-xs fill-gray-600" fontSize="12">100%</text>
                    <text x="70" y="70" textAnchor="end" className="text-xs fill-red-600" fontSize="12" fontWeight="bold">95%</text>
                    <line x1="75" y1="66" x2="1150" y2="66" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="70" y="157" textAnchor="end" className="text-xs fill-gray-600" fontSize="12">80%</text>
                    <text x="70" y="231" textAnchor="end" className="text-xs fill-amber-600" fontSize="12" fontWeight="bold">60%</text>
                    <line x1="75" y1="227" x2="1150" y2="227" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="70" y="318" textAnchor="end" className="text-xs fill-gray-600" fontSize="12">40%</text>
                    <text x="70" y="405" textAnchor="end" className="text-xs fill-gray-600" fontSize="12">20%</text>
                    <text x="70" y="483" textAnchor="end" className="text-xs fill-gray-600" fontSize="12">0%</text>
                    
                    {/* Axis labels */}
                    <text x="40" y="250" textAnchor="middle" transform="rotate(-90 40 250)" className="text-sm font-semibold fill-gray-700" fontSize="14">Utilization %</text>
                    <text x="615" y="498" textAnchor="middle" className="text-sm font-semibold fill-gray-700" fontSize="14">Total Hours Used</text>
                    
                    {/* X-axis hour markers */}
                    {(() => {
                      const maxHours = Math.max(...riskData.teamRiskData.map(m => m.totalUsedHours), 160);
                      const markers = [0, 40, 80, 120, 160];
                      return markers.map(hours => {
                        const x = 80 + ((hours / maxHours) * 1070);
                        return (
                          <g key={hours}>
                            <line x1={x} y1="475" x2={x} y2="485" stroke="#9CA3AF" strokeWidth="1" />
                            <text x={x} y="498" textAnchor="middle" className="text-xs fill-gray-600" fontSize="11">{hours}h</text>
                          </g>
                        );
                      });
                    })()}
                    
                    {/* Plot points */}
                    {riskData.teamRiskData.map((member, idx) => {
                      const maxHours = Math.max(...riskData.teamRiskData.map(m => m.totalUsedHours), 160);
                      const x = 80 + ((member.totalUsedHours / maxHours) * 1070);
                      const y = 480 - ((member.utilizationPct / 100) * 460);
                      
                      return (
                        <g key={idx}>
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill={member.riskColor}
                            stroke="white"
                            strokeWidth="2.5"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedRiskPerson(member)}
                            onMouseEnter={(e) => {
                              e.target.setAttribute('r', '12');
                            }}
                            onMouseLeave={(e) => {
                              e.target.setAttribute('r', '8');
                            }}
                          />
                          <text 
                            x={x} 
                            y={y - 14} 
                            textAnchor="middle" 
                            className="text-xs font-semibold fill-gray-800 pointer-events-none"
                            fontSize="11"
                          >
                            {member.name.split(' ')[0]}
                          </text>
                          <title>
{member.name}
Billable: {member.billableHours.toFixed(1)}h
Internal/BD: {member.internalHours.toFixed(1)}h
OOO: {member.oooHours.toFixed(1)}h
Available: {(member.standardCapacity - member.totalUsedHours).toFixed(1)}h
Utilization: {member.utilizationPct.toFixed(1)}%
Billable Mix: {member.billableMixPct.toFixed(1)}%
Classification: {member.riskLevel}
                          </title>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                <div className="flex gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm">Burnout Risk (≥95%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Healthy / Balanced (60-95%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Available Capacity (&lt;60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Strategic Internal (CDS)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Risk Summary Table</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Classification</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Utilization</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Billable Mix</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Total Used</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {riskData.teamRiskData.map((member, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{member.name}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: member.riskColor + '20', color: member.riskColor }}>
                              {member.riskLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">{member.utilizationPct.toFixed(0)}%</td>
                          <td className="px-4 py-3 text-sm text-right">{member.billableMixPct.toFixed(0)}%</td>
                          <td className="px-4 py-3 text-sm text-right">{member.totalUsedHours.toFixed(1)}h</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => setSelectedRiskPerson(member)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRiskPerson && (
                <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedRiskPerson.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: selectedRiskPerson.riskColor + '20', color: selectedRiskPerson.riskColor }}>
                          {selectedRiskPerson.riskLevel}
                        </span>
                        <span className="text-sm text-gray-600">
                          {selectedRiskPerson.utilizationPct.toFixed(0)}% Utilized • {selectedRiskPerson.billableMixPct.toFixed(0)}% Billable Mix
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedRiskPerson(null)} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Hours Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Billable:</span>
                          <span className="font-medium text-cyan-600">{selectedRiskPerson.billableHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Internal/BD:</span>
                          <span className="font-medium text-purple-600">{selectedRiskPerson.internalHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OOO:</span>
                          <span className="font-medium text-amber-600">{selectedRiskPerson.oooHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-semibold">
                          <span>Total Used:</span>
                          <span>{selectedRiskPerson.totalUsedHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Available:</span>
                          <span className="font-semibold">{(selectedRiskPerson.standardCapacity - selectedRiskPerson.totalUsedHours).toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Standard Capacity:</span>
                          <span>{selectedRiskPerson.standardCapacity}h</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Current Projects</h3>
                      <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                        {Object.entries(selectedRiskPerson.projects).slice(0, 5).map(([project, hours], idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate flex-1">{project}</span>
                            <span className="font-medium ml-2">{hours.toFixed(1)}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StocStaffingDashboard;
