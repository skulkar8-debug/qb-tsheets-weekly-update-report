import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, BarChart3, PieChart, Target, UserCheck, AlertTriangle, Coffee } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine } from 'recharts';

//////////////////////////////////////////////////////////////////////////////////
// DATA SECTION - Last 4 weeks (12-15) for demo
// REPLACE with your full 15 weeks of CSV data (weeks 1-15)
//////////////////////////////////////////////////////////////////////////////////

const rawData12 = `lname,fname,username,job_code,hours
Sharma,Mohit,msharma@stocadvisory.com,Business Development,35
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,28
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,32
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,38
Singh,Jogendra,jsingh@stocadvisory.com,Administrative,15
D,Ramya,rdamani@stocadvisory.com,CDS - Tableau,25
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,42
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bergen Optometry,45
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care,20
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,35
Earp,Ryan,rearp@stocadvisory.com,SPUSA - Town Dentistry,40
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - DeBoer Family Eye Care,38
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Atlanta Endodontics,42
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Atlanta Endodontics,38
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Town Dentistry,40
Egan,Sean,segan@stocadvisory.com,SPUSA - Buckhead Family Dentistry,38
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Town Dentistry,42
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Buckhead Family Dentistry,40`;

const rawData13 = `lname,fname,username,job_code,hours
Sharma,Mohit,msharma@stocadvisory.com,Business Development,32
Nayak,Rakesh,rnayak@stocadvisory.com,CDS - Tableau,30
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,40
Govind,Vaishnav,vgovind@stocadvisory.com,Administrative,8
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bergen Optometry,38
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care,18
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,30
Earp,Ryan,rearp@stocadvisory.com,SPUSA - Town Dentistry,35
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Atlanta Endodontics,40
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Atlanta Endodontics,36
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Town Dentistry,38
Egan,Sean,segan@stocadvisory.com,SPUSA - Buckhead Family Dentistry,40
Garg,Vishal,vgarg@stocadvisory.com,Administrative,12`;

const rawData14 = `lname,fname,username,job_code,hours
Sharma,Mohit,msharma@stocadvisory.com,Business Development,28
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,36
Singh,Jogendra,jsingh@stocadvisory.com,Administrative,12
Luetgers,Sam,sluetgers@stocadvisory.com,Holiday,8
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care,22
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,28
Earp,Ryan,rearp@stocadvisory.com,SPUSA - Town Dentistry,42
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Atlanta Endodontics,38
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Town Dentistry,40
Egan,Sean,segan@stocadvisory.com,SPUSA - Buckhead Family Dentistry,35`;

const rawData15 = `lname,fname,username,job_code,hours
Sharma,Mohit,msharma@stocadvisory.com,Business Development,40
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,42
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,40
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bergen Optometry,40
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care,25
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,32
Earp,Ryan,rearp@stocadvisory.com,SPUSA - Town Dentistry,38
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Atlanta Endodontics,40
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Atlanta Endodontics,35
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Town Dentistry,42
Egan,Sean,segan@stocadvisory.com,SPUSA - Buckhead Family Dentistry,40
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Town Dentistry,38`;

//////////////////////////////////////////////////////////////////////////////////
// END OF DATA SECTION
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
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedTeamMembers, setExpandedTeamMembers] = useState({});
  const [expandedClients, setExpandedClients] = useState({});
  const [teamSortConfig, setTeamSortConfig] = useState({ key: 'totalHours', direction: 'desc' });
  const [projectFilter, setProjectFilter] = useState('all');
  const [projectSortConfig, setProjectSortConfig] = useState({ key: 'totalHours', direction: 'desc' });
  const [capacitySortConfig, setCapacitySortConfig] = useState({ key: 'name', direction: 'asc' });
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
    } else {
      data = [...week12Data, ...week13Data, ...week14Data, ...week15Data];
    }
    
    if (businessUnitFilter !== 'all') {
      data = data.filter(entry => {
        const fullName = `${entry.fname} ${entry.lname}`;
        const isCDS = teamMembersByUnit.cds.includes(fullName);
        if (businessUnitFilter === 'cds') return isCDS;
        else if (businessUnitFilter === 'tas') return !isCDS;
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

  const getBusinessUnit = (jobCode) => {
    if (jobCode.includes('Holiday') || jobCode.includes('Vacation') || jobCode.includes('Sick') || jobCode.includes('Administrative')) return 'Administrative';
    if (jobCode.includes('Business Development') || jobCode.startsWith('CDS')) return 'CDS';
    if (jobCode.includes('SALT') || jobCode.includes('Riata') || jobCode.includes('SPUSA') || jobCode.includes('SP USA') || jobCode.includes('Beacon Behavioral')) return 'TAS';
    if (jobCode.includes('AEG') || jobCode.includes('CPC') || jobCode.includes('ADP')) return 'TAS+CDS';
    return 'Other';
  };

  const processedData = useMemo(() => {
    const teamMembers = {};
    const projects = {};
    const clients = {};

    allData.forEach(entry => {
      const name = `${entry.fname} ${entry.lname}`;
      const hours = parseFloat(entry.hours) || 0;
      const category = determineCategory(entry.job_code);
      const businessUnit = getBusinessUnit(entry.job_code);

      if (!teamMembers[name]) {
        teamMembers[name] = {
          name,
          totalHours: 0,
          billableHours: 0,
          internalHours: 0,
          oooHours: 0,
          projects: {},
          utilization: 0
        };
      }

      teamMembers[name].totalHours += hours;
      if (category === 'Billable') teamMembers[name].billableHours += hours;
      else if (category === 'Internal/BD') teamMembers[name].internalHours += hours;
      else if (category === 'OOO') teamMembers[name].oooHours += hours;
      
      if (!teamMembers[name].projects[entry.job_code]) {
        teamMembers[name].projects[entry.job_code] = 0;
      }
      teamMembers[name].projects[entry.job_code] += hours;

      if (!projects[entry.job_code]) {
        projects[entry.job_code] = {
          name: entry.job_code,
          totalHours: 0,
          category,
          businessUnit,
          teamMembers: {}
        };
      }
      projects[entry.job_code].totalHours += hours;
      if (!projects[entry.job_code].teamMembers[name]) {
        projects[entry.job_code].teamMembers[name] = 0;
      }
      projects[entry.job_code].teamMembers[name] += hours;

      const clientMatch = entry.job_code.match(/^([A-Z]+)\s*-/);
      if (clientMatch) {
        const clientName = clientMatch[1];
        if (!clients[clientName]) {
          clients[clientName] = {
            name: clientName,
            totalHours: 0,
            projects: {}
          };
        }
        clients[clientName].totalHours += hours;
        if (!clients[clientName].projects[entry.job_code]) {
          clients[clientName].projects[entry.job_code] = 0;
        }
        clients[clientName].projects[entry.job_code] += hours;
      }
    });

    const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
    Object.keys(teamMembers).forEach(name => {
      const member = teamMembers[name];
      const utilizedHours = member.billableHours + member.internalHours;
      const standardCapacity = 40 * weekCount;
      member.utilization = standardCapacity > 0 ? ((utilizedHours / standardCapacity) * 100) : 0;
    });

    return { teamMembers, projects, clients };
  }, [allData, selectedPeriod, selectedWeeks]);

  const metrics = useMemo(() => {
    const teamCount = Object.keys(processedData.teamMembers).length;
    const totalHours = Object.values(processedData.teamMembers).reduce((sum, m) => sum + m.totalHours, 0);
    const billableHours = Object.values(processedData.teamMembers).reduce((sum, m) => sum + m.billableHours, 0);
    const internalHours = Object.values(processedData.teamMembers).reduce((sum, m) => sum + m.internalHours, 0);
    const oooHours = Object.values(processedData.teamMembers).reduce((sum, m) => sum + m.oooHours, 0);
    const avgUtilization = teamCount > 0 ? Object.values(processedData.teamMembers).reduce((sum, m) => sum + m.utilization, 0) / teamCount : 0;
    const billablePercentage = totalHours > 0 ? ((billableHours / totalHours) * 100) : 0;
    
    return {
      teamCount,
      totalHours: totalHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      internalHours: internalHours.toFixed(1),
      oooHours: oooHours.toFixed(1),
      avgUtilization: avgUtilization.toFixed(1),
      billablePercentage: billablePercentage.toFixed(1)
    };
  }, [processedData]);

  const riskData = useMemo(() => {
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

  const sortedTeamMembers = useMemo(() => {
    const members = Object.values(processedData.teamMembers);
    return members.sort((a, b) => {
      const aValue = a[teamSortConfig.key];
      const bValue = b[teamSortConfig.key];
      if (teamSortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [processedData.teamMembers, teamSortConfig]);

  const filteredProjects = useMemo(() => {
    let projects = Object.values(processedData.projects);
    if (projectFilter !== 'all') {
      projects = projects.filter(p => p.category === projectFilter);
    }
    return projects.sort((a, b) => {
      const aValue = a[projectSortConfig.key];
      const bValue = b[projectSortConfig.key];
      if (projectSortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [processedData.projects, projectFilter, projectSortConfig]);

  const sortedCapacityMembers = useMemo(() => {
    const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
    const standardCapacity = 40 * weekCount;
    
    const members = Object.values(processedData.teamMembers).map(member => {
      const utilizedHours = member.billableHours + member.internalHours;
      const availableHours = Math.max(0, standardCapacity - utilizedHours);
      return {
        ...member,
        availableHours,
        standardCapacity
      };
    });
    
    return members.sort((a, b) => {
      const aValue = a[capacitySortConfig.key];
      const bValue = b[capacitySortConfig.key];
      if (capacitySortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [processedData.teamMembers, capacitySortConfig, selectedWeeks]);

  const getCategoryBadge = (category) => {
    const badges = {
      'Billable': { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', label: 'Billable' },
      'Internal/BD': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Internal/BD' },
      'OOO': { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'OOO' }
    };
    const badge = badges[category] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: category };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleTeamSort = (key) => {
    setTeamSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleProjectSort = (key) => {
    setProjectSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleCapacitySort = (key) => {
    setCapacitySortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">STOC Staffing Tool</h1>
            <p className="text-gray-500 mt-1">Real-time visibility into team utilization and project allocation</p>
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
            <div className="text-2xl font-bold text-gray-900">{metrics.teamCount}</div>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-700 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Billable</span>
            </div>
            <div className="text-2xl font-bold text-cyan-900">{metrics.billableHours}h</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Briefcase className="w-5 h-5" />
              <span className="text-sm font-medium">Internal/BD</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{metrics.internalHours}h</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Coffee className="w-5 h-5" />
              <span className="text-sm font-medium">OOO</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">{metrics.oooHours}h</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Utilization</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{metrics.avgUtilization}%</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100 shadow-sm">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Billable %</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{metrics.billablePercentage}%</div>
          </div>
        </div>

        <div className="flex gap-2 mt-6 border-b">
          {['overview', 'team', 'projects', 'capacity', 'exceptions'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="col-span-12 space-y-4 mb-6">
              {/* KPI Tiles */}
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Avg Team Utilization</div>
                  <div className="text-3xl font-bold text-gray-900">{riskData.kpis.avgUtilization}%</div>
                  <div className="text-xs text-gray-500 mt-1">Total Used ÷ Available</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Burnout Risk</div>
                  <div className="text-3xl font-bold text-red-600">{riskData.kpis.burnoutCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Utilization ≥95%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-amber-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Available Capacity</div>
                  <div className="text-3xl font-bold text-amber-600">{riskData.kpis.availableCapacityCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Utilization &lt;60%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Strategic Internal</div>
                  <div className="text-3xl font-bold text-purple-600">{riskData.kpis.strategicCount}</div>
                  <div className="text-xs text-gray-500 mt-1">CDS Internal Focus</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
                  <div className="text-sm font-medium text-gray-600 mb-1">Healthy / Balanced</div>
                  <div className="text-3xl font-bold text-green-600">{riskData.kpis.healthyCount}</div>
                  <div className="text-xs text-gray-500 mt-1">60-95% Utilization</div>
                </div>
              </div>

              {/* Utilization Risk Matrix - Scatter Plot */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">Utilization Risk Matrix</h2>
                  <span className="text-sm text-gray-600">
                    Showing {riskData.teamRiskData.length} team member{riskData.teamRiskData.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  X-axis: Total Hours Used | Y-axis: Utilization % | Click any dot for details
                </p>
                
                <div className="relative" style={{ height: '500px' }}>
                  <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid meet" className="border border-gray-200 rounded">
                    {/* Background zones */}
                    <rect x="80" y="20" width="1070" height="46" fill="#FEE2E2" opacity="0.3" />
                    <rect x="80" y="66" width="1070" height="161" fill="#D1FAE5" opacity="0.3" />
                    <rect x="80" y="227" width="1070" height="253" fill="#FEF3C7" opacity="0.3" />
                    
                    {/* Axes */}
                    <line x1="80" y1="20" x2="80" y2="480" stroke="#E5E7EB" strokeWidth="2" />
                    <line x1="80" y1="480" x2="1150" y2="480" stroke="#E5E7EB" strokeWidth="2" />
                    
                    {/* Y-axis labels */}
                    <text x="70" y="25" textAnchor="end" fontSize="12" fill="#6B7280">100%</text>
                    <text x="70" y="70" textAnchor="end" fontSize="12" fill="#EF4444" fontWeight="bold">95%</text>
                    <line x1="75" y1="66" x2="1150" y2="66" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="70" y="157" textAnchor="end" fontSize="12" fill="#6B7280">80%</text>
                    <text x="70" y="231" textAnchor="end" fontSize="12" fill="#F59E0B" fontWeight="bold">60%</text>
                    <line x1="75" y1="227" x2="1150" y2="227" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="70" y="318" textAnchor="end" fontSize="12" fill="#6B7280">40%</text>
                    <text x="70" y="405" textAnchor="end" fontSize="12" fill="#6B7280">20%</text>
                    <text x="70" y="483" textAnchor="end" fontSize="12" fill="#6B7280">0%</text>
                    
                    {/* Axis labels */}
                    <text x="40" y="250" textAnchor="middle" transform="rotate(-90 40 250)" fontSize="14" fontWeight="bold" fill="#374151">Utilization %</text>
                    <text x="615" y="498" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">Total Hours Used</text>
                    
                    {/* X-axis markers */}
                    {(() => {
                      const maxHours = Math.max(...riskData.teamRiskData.map(m => m.totalUsedHours), 160);
                      const markers = [0, 40, 80, 120, 160];
                      return markers.map(hours => {
                        const x = 80 + ((hours / maxHours) * 1070);
                        return (
                          <g key={hours}>
                            <line x1={x} y1="475" x2={x} y2="485" stroke="#9CA3AF" strokeWidth="1" />
                            <text x={x} y="498" textAnchor="middle" fontSize="11" fill="#6B7280">{hours}h</text>
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
                            onMouseEnter={(e) => e.target.setAttribute('r', '12')}
                            onMouseLeave={(e) => e.target.setAttribute('r', '8')}
                          />
                          <text 
                            x={x} 
                            y={y - 14} 
                            textAnchor="middle" 
                            fontSize="11"
                            fontWeight="600"
                            fill="#1F2937"
                            style={{ pointerEvents: 'none' }}
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
                
                {/* Legend */}
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

              {/* Risk Summary Table */}
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Available</th>
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
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{(member.standardCapacity - member.totalUsedHours).toFixed(1)}h</td>
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

              {/* Detail Panel */}
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
                        {Object.entries(selectedRiskPerson.projects).slice(0, 8).map(([project, hours], idx) => (
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

            {/* Top Projects Table */}
            <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Top Projects by Hours</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Project</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Total Hours</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Team Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProjects.slice(0, 10).map((project, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{project.name}</td>
                        <td className="px-4 py-3 text-center">{getCategoryBadge(project.category)}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{project.totalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right">{Object.keys(project.teamMembers).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Team Member Details</h2>
              <div className="text-sm text-gray-600">
                Total: {sortedTeamMembers.length} members
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleTeamSort('name')}>
                      Name {teamSortConfig.key === 'name' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleTeamSort('totalHours')}>
                      Total Hours {teamSortConfig.key === 'totalHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleTeamSort('billableHours')}>
                      Billable {teamSortConfig.key === 'billableHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleTeamSort('internalHours')}>
                      Internal/BD {teamSortConfig.key === 'internalHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleTeamSort('oooHours')}>
                      OOO {teamSortConfig.key === 'oooHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleTeamSort('utilization')}>
                      Utilization {teamSortConfig.key === 'utilization' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Projects</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedTeamMembers.map((member, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">{member.totalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right text-cyan-600">{member.billableHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right text-purple-600">{member.internalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right text-amber-600">{member.oooHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{member.utilization.toFixed(0)}%</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setExpandedTeamMembers(prev => ({ ...prev, [member.name]: !prev[member.name] }))}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center mx-auto"
                          >
                            {expandedTeamMembers[member.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {Object.keys(member.projects).length}
                          </button>
                        </td>
                      </tr>
                      {expandedTeamMembers[member.name] && (
                        <tr>
                          <td colSpan="7" className="px-4 py-3 bg-gray-50">
                            <div className="pl-8">
                              <h4 className="font-semibold text-sm mb-2">Projects:</h4>
                              <div className="space-y-1">
                                {Object.entries(member.projects).map(([project, hours], pidx) => (
                                  <div key={pidx} className="flex justify-between text-sm py-1">
                                    <span className="text-gray-700">{project}</span>
                                    <span className="font-medium text-gray-900">{hours.toFixed(1)}h</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="col-span-12 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Projects Overview</h2>
                <select className="px-4 py-2 border rounded-lg" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="Billable">Billable Only</option>
                  <option value="Internal/BD">Internal/BD Only</option>
                  <option value="OOO">OOO Only</option>
                </select>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleProjectSort('name')}>
                        Project Name {projectSortConfig.key === 'name' && (projectSortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleProjectSort('totalHours')}>
                        Total Hours {projectSortConfig.key === 'totalHours' && (projectSortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Team Members</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProjects.map((project, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.name}</td>
                          <td className="px-4 py-3 text-center">{getCategoryBadge(project.category)}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold">{project.totalHours.toFixed(1)}h</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setExpandedProjects(prev => ({ ...prev, [project.name]: !prev[project.name] }))}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center mx-auto"
                            >
                              {expandedProjects[project.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              {Object.keys(project.teamMembers).length}
                            </button>
                          </td>
                        </tr>
                        {expandedProjects[project.name] && (
                          <tr>
                            <td colSpan="4" className="px-4 py-3 bg-gray-50">
                              <div className="pl-8">
                                <h4 className="font-semibold text-sm mb-2">Team Members:</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(project.teamMembers).map(([member, hours], midx) => (
                                    <div key={midx} className="flex justify-between text-sm py-1">
                                      <span className="text-gray-700">{member}</span>
                                      <span className="font-medium text-gray-900">{hours.toFixed(1)}h</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clients Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Client Overview</h2>
              <div className="space-y-4">
                {Object.values(processedData.clients).sort((a, b) => b.totalHours - a.totalHours).map((client, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedClients(prev => ({ ...prev, [client.name]: !prev[client.name] }))}>
                      <div>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <p className="text-sm text-gray-600">{Object.keys(client.projects).length} projects</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{client.totalHours.toFixed(1)}h</span>
                        {expandedClients[client.name] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                    {expandedClients[client.name] && (
                      <div className="mt-4 pl-4 space-y-2 border-l-2 border-gray-200">
                        {Object.entries(client.projects).map(([project, hours], pidx) => (
                          <div key={pidx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{project}</span>
                            <span className="font-medium">{hours.toFixed(1)}h</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CAPACITY TAB */}
        {activeTab === 'capacity' && (
          <div className="col-span-12 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Capacity Planning</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing available hours based on {selectedWeeks.length > 0 ? selectedWeeks.length : 4} week(s) selected
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleCapacitySort('name')}>
                        Name {capacitySortConfig.key === 'name' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Standard Capacity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleCapacitySort('billableHours')}>
                        Billable {capacitySortConfig.key === 'billableHours' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleCapacitySort('internalHours')}>
                        Internal {capacitySortConfig.key === 'internalHours' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleCapacitySort('availableHours')}>
                        Available {capacitySortConfig.key === 'availableHours' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase cursor-pointer" onClick={() => handleCapacitySort('utilization')}>
                        Utilization % {capacitySortConfig.key === 'utilization' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedCapacityMembers.map((member, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{member.standardCapacity}h</td>
                        <td className="px-4 py-3 text-sm text-right text-cyan-600 font-medium">{member.billableHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right text-purple-600 font-medium">{member.internalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-bold">{member.availableHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          <span className={member.utilization >= 95 ? 'text-red-600' : member.utilization < 60 ? 'text-amber-600' : 'text-green-600'}>
                            {member.utilization.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Capacity Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Available for Staffing</h3>
                <p className="text-3xl font-bold text-green-700">
                  {sortedCapacityMembers.reduce((sum, m) => sum + m.availableHours, 0).toFixed(0)}h
                </p>
                <p className="text-sm text-green-600 mt-1">Total available hours across team</p>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-900 mb-2">Currently Billable</h3>
                <p className="text-3xl font-bold text-cyan-700">
                  {sortedCapacityMembers.reduce((sum, m) => sum + m.billableHours, 0).toFixed(0)}h
                </p>
                <p className="text-sm text-cyan-600 mt-1">Total billable hours logged</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Internal/BD Hours</h3>
                <p className="text-3xl font-bold text-purple-700">
                  {sortedCapacityMembers.reduce((sum, m) => sum + m.internalHours, 0).toFixed(0)}h
                </p>
                <p className="text-sm text-purple-600 mt-1">Time invested in growth</p>
              </div>
            </div>
          </div>
        )}

        {/* EXCEPTIONS TAB */}
        {activeTab === 'exceptions' && (
          <div className="col-span-12 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Exception Alerts</h2>
              
              <div className="grid grid-cols-3 gap-6">
                {/* Over-utilized */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Over-Utilized (&gt;40h/week avg)
                  </h3>
                  <div className="space-y-2">
                    {sortedTeamMembers
                      .filter(member => {
                        const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
                        const avgPerWeek = member.totalHours / weekCount;
                        return avgPerWeek > 40;
                      })
                      .map(member => {
                        const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
                        const avgPerWeek = member.totalHours / weekCount;
                        return (
                          <div key={member.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-600">{avgPerWeek.toFixed(1)}h per week average</div>
                            </div>
                            <span className="font-medium text-red-600">{member.totalHours.toFixed(1)}h</span>
                          </div>
                        );
                      })}
                    {sortedTeamMembers.filter(member => {
                      const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
                      return (member.totalHours / weekCount) > 40;
                    }).length === 0 && (
                      <div className="text-gray-500 text-sm">No over-utilization alerts</div>
                    )}
                  </div>
                </div>

                {/* High OOO */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-500" />
                    High OOO (&gt;20h)
                  </h3>
                  <div className="space-y-2">
                    {sortedTeamMembers
                      .filter(member => member.oooHours > 20)
                      .map(member => (
                        <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-600">{member.oooHours.toFixed(1)}h out of office</div>
                          </div>
                          <span className="font-medium text-gray-700">{member.oooHours.toFixed(1)}h</span>
                        </div>
                      ))}
                    {sortedTeamMembers.filter(member => member.oooHours > 20).length === 0 && (
                      <div className="text-gray-500 text-sm">No high OOO alerts</div>
                    )}
                  </div>
                </div>

                {/* High Billable Load */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-500" />
                    High Billable Load (&gt;40h/week avg)
                  </h3>
                  <div className="space-y-2">
                    {sortedTeamMembers
                      .filter(member => {
                        const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
                        const avgPerWeek = member.billableHours / weekCount;
                        return avgPerWeek > 40;
                      })
                      .map(member => {
                        const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
                        const avgPerWeek = member.billableHours / weekCount;
                        return (
                          <div key={member.name} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-600">{avgPerWeek.toFixed(1)}h billable per week</div>
                            </div>
                            <span className="font-medium text-gray-900">{member.billableHours.toFixed(1)}h</span>
                          </div>
                        );
                      })}
                    {sortedTeamMembers.filter(member => {
                      const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : 4;
                      return (member.billableHours / weekCount) > 40;
                    }).length === 0 && (
                      <div className="text-gray-500 text-sm">No high billable load alerts</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StocStaffingDashboard;
