import React, { useState, useMemo } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, BarChart3, PieChart, Target, UserCheck, AlertTriangle, Coffee } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Raw data embedded (parsed from CSVs)
const rawData1 = `lname,fname,username,job_code,hours
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,2
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,1
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,30
D,Ramya,ramya@stocadvisory.com,Business Development,32.85
D,Ramya,ramya@stocadvisory.com,Holiday,8
Egan,Sean,segan@stocadvisory.com,ADP - Tearsheet,2
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,4.5
Egan,Sean,segan@stocadvisory.com,CPC - Home Away From Home,4.5
Egan,Sean,segan@stocadvisory.com,SP USA - Sage Import & Closing Recon,5
Egan,Sean,segan@stocadvisory.com,SPUSA - Holly Dental,2
Garg,Vishal,vgarg@stocadvisory.com,ADP - Tearsheet,19.5
Garg,Vishal,vgarg@stocadvisory.com,AEG - Child and Family Eye Care Center,8
Garg,Vishal,vgarg@stocadvisory.com,Holiday,8
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,44.46
Govind,Vaishnav,vgovind@stocadvisory.com,Holiday,11
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Suffolk Pedo Dentistry & Ortho,7
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Corp Dev Support (Tearsheet),21
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Emma Wu and Associates,2
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Valhalla,1
Hariram,Pradeep,phariram@stocadvisory.com,CPC - Home Away From Home,8
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,3.5
Hottman,Matthew,mhottman@stocadvisory.com,Holiday,8
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,9
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,2
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,5.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,7.5
Hottman,Matthew,mhottman@stocadvisory.com,Vacation,3
Jadhav,Pravin,pjadhav@stocadvisory.com,Vacation,32
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Business Development - STOC,10.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,CPC - Home Away From Home,6.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SALT - Suffolk Pedo Dentistry & Ortho,0.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,0.5
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,46.57
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Alta Loma Optometric,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,1.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Lifetime Vision Source,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Manhattan Vision & Queens Eye Associates,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Metropolitan Vision,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),2
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Hawkins Psychiatry,5
Luetgers,Sam,sluetgers@stocadvisory.com,Sick,4
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,8
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,6
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,6
McFadden,Brandon,bmcfadden@stocadvisory.com,Holiday,8
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston OMS,3
McFadden,Brandon,bmcfadden@stocadvisory.com,Vacation,16
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,43.26
Nayak,Rakesh,rnayak@stocadvisory.com,Holiday,10
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,8
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Home Away From Home,2.5
Nguyen,Hung,hnguyen@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),21
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,41.6
Pandey,Sharvan,spandey@stocadvisory.com,Holiday,8
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,3.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,2.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Haeger Orthodontics,3
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston OMS,4
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,30
Sharma,Mohit,msharma@stocadvisory.com,Business Development,44.28
Sharma,Mohit,msharma@stocadvisory.com,Holiday,10
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,32
Sheehy,Aidan,asheehy@stocadvisory.com,Administrative,5
Sheehy,Aidan,asheehy@stocadvisory.com,Holiday,9
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Chicago Eye Care Center,12
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,12
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,44.88
Singh,Jogendra,jrathore@stocadvisory.com,Holiday,10
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),25
Tuli,Rahul,rtuli@stocadvisory.com,Vacation,32`;

const rawData2 = `lname,fname,username,job_code,hours
D,Ramya,ramya@stocadvisory.com,Business Development,22.05
Egan,Sean,segan@stocadvisory.com,Holiday,16
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,11.56
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,3
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,1.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,2
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,1.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),1.98
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,18.91
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,25.36
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,3
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,4.5
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - South Shore Eye Center,2.5
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,22.15
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,21.69
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,2
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,1
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Spokane Pediatric,5
Sharma,Mohit,msharma@stocadvisory.com,Business Development,23.37
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,27
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,10.78
Sundar,Barath,bsundar@stocadvisory.com,Holiday,24
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,1.55
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,6.98
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,10.53`;

// Parse CSV data
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
};

const StocStaffingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedTeamMembers, setExpandedTeamMembers] = useState({});
  const [teamSortConfig, setTeamSortConfig] = useState({ key: 'totalHours', direction: 'desc' });

  // Parse data
  const week1Data = useMemo(() => parseCSV(rawData1), []);
  const week2Data = useMemo(() => parseCSV(rawData2), []);
  
  // Combine data from both weeks - filtered by selected period
  const allData = useMemo(() => {
    if (selectedPeriod === 'week1') return week1Data;
    if (selectedPeriod === 'week2') return week2Data;
    return [...week1Data, ...week2Data];
  }, [week1Data, week2Data, selectedPeriod]);

  // Helper function to determine project category
  function determineCategory(projectName) {
    // OOO: Holiday, Vacation, Sick
    const oooKeywords = ['Holiday', 'Vacation', 'Sick'];
    if (oooKeywords.some(keyword => projectName.includes(keyword))) {
      return 'ooo';
    }
    
    // Internal/BD: Administrative, Business Development (including Business Development - STOC)
    const internalKeywords = ['Administrative', 'Business Development'];
    if (internalKeywords.some(keyword => projectName.includes(keyword))) {
      return 'internal';
    }
    
    // Everything else is billable
    return 'billable';
  }

  // Process data for analytics
  const processedData = useMemo(() => {
    const teamMembers = {};
    const projects = {};
    const categories = {
      billable: 0,
      internal: 0,
      ooo: 0
    };

    allData.forEach(entry => {
      const fullName = `${entry.fname} ${entry.lname}`;
      const hours = parseFloat(entry.hours) || 0;
      const project = entry.job_code;

      // Team member aggregation
      if (!teamMembers[fullName]) {
        teamMembers[fullName] = {
          name: fullName,
          email: entry.username,
          totalHours: 0,
          billableHours: 0,
          internalHours: 0,
          oooHours: 0,
          projects: {},
          utilization: 0
        };
      }
      
      teamMembers[fullName].totalHours += hours;

      // Project aggregation
      if (!projects[project]) {
        projects[project] = {
          name: project,
          totalHours: 0,
          teamMembers: new Set(),
          category: determineCategory(project)
        };
      }
      
      projects[project].totalHours += hours;
      projects[project].teamMembers.add(fullName);

      // Add to team member's projects
      if (!teamMembers[fullName].projects[project]) {
        teamMembers[fullName].projects[project] = 0;
      }
      teamMembers[fullName].projects[project] += hours;

      // Category classification
      const category = determineCategory(project);
      if (category === 'billable') {
        teamMembers[fullName].billableHours += hours;
        categories.billable += hours;
      } else if (category === 'internal') {
        teamMembers[fullName].internalHours += hours;
        categories.internal += hours;
      } else if (category === 'ooo') {
        teamMembers[fullName].oooHours += hours;
        categories.ooo += hours;
      }
    });

    // Calculate utilization (billable + internal as utilized, ooo as non-utilized)
    Object.values(teamMembers).forEach(member => {
      const utilizedHours = member.billableHours + member.internalHours;
      member.utilization = member.totalHours > 0 
        ? Math.round((utilizedHours / member.totalHours) * 100) 
        : 0;
    });

    return { teamMembers, projects, categories };
  }, [allData]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const { teamMembers, categories } = processedData;
    const totalHours = Object.values(categories).reduce((sum, hours) => sum + hours, 0);
    const utilizedHours = categories.billable + categories.internal;
    const teamCount = Object.keys(teamMembers).length;
    const avgUtilization = teamCount > 0 ? Math.round(
      Object.values(teamMembers).reduce((sum, member) => sum + member.utilization, 0) / teamCount
    ) : 0;
    
    return {
      totalHours: totalHours.toFixed(1),
      billableHours: categories.billable.toFixed(1),
      internalHours: categories.internal.toFixed(1),
      oooHours: categories.ooo.toFixed(1),
      teamCount,
      avgUtilization,
      billablePercentage: utilizedHours > 0 ? Math.round((categories.billable / utilizedHours) * 100) : 0,
      utilizedHours: utilizedHours.toFixed(1)
    };
  }, [processedData]);

  // Prepare chart data - using first names
  const utilizationChartData = useMemo(() => {
    return Object.values(processedData.teamMembers)
      .sort((a, b) => b.utilization - a.utilization)
      .map(member => ({
        name: member.name.split(' ')[0],
        utilization: member.utilization,
        billable: member.billableHours,
        internal: member.internalHours,
        ooo: member.oooHours
      }));
  }, [processedData]);

  const categoryPieData = useMemo(() => {
    const { categories } = processedData;
    return [
      { name: 'Billable', value: categories.billable, color: '#10b981' },
      { name: 'Internal/BD', value: categories.internal, color: '#6366f1' },
      { name: 'OOO', value: categories.ooo, color: '#ef4444' }
    ].filter(cat => cat.value > 0);
  }, [processedData]);

  const projectBurnData = useMemo(() => {
    return Object.values(processedData.projects)
      .filter(project => project.category === 'billable')
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 8)
      .map(project => ({
        name: project.name.length > 30 ? project.name.substring(0, 30) + '...' : project.name,
        hours: project.totalHours,
        teamSize: project.teamMembers.size
      }));
  }, [processedData]);

  const toggleProjectExpansion = (projectName) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }));
  };

  const toggleTeamMemberExpansion = (memberName) => {
    setExpandedTeamMembers(prev => ({
      ...prev,
      [memberName]: !prev[memberName]
    }));
  };

  const handleTeamSort = (key) => {
    setTeamSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

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

  const getCategoryBadge = (category) => {
    const badges = {
      billable: { color: 'bg-green-100 text-green-800', label: 'Billable' },
      internal: { color: 'bg-indigo-100 text-indigo-800', label: 'Internal/BD' },
      ooo: { color: 'bg-red-100 text-red-800', label: 'OOO' }
    };
    const badge = badges[category];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">STOC Staffing Tool</h1>
              <p className="text-gray-500 mt-1">Real-time visibility into team utilization and project allocation</p>
            </div>
          </div>

          <div className="flex gap-3">
            <select 
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">All Periods</option>
              <option value="week1">Dec 28 - Jan 3</option>
              <option value="week2">Jan 4 - Jan 10</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Team Members</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.teamCount}</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalHours}</div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Coffee className="w-5 h-5" />
              <span className="text-sm font-medium">Internal/BD</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.internalHours}</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Billable Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.billableHours}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Utilization</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.avgUtilization}%</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Billable %</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.billablePercentage}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-6 border-b border-gray-200">
          {['overview', 'team', 'projects', 'capacity', 'exceptions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-12 gap-6">
        {activeTab === 'overview' && (
          <>
            {/* Utilization Chart */}
            <div className="col-span-8 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Team Utilization</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="billable" stackId="a" fill="#10b981" name="Billable Hours" />
                  <Bar dataKey="internal" stackId="a" fill="#6366f1" name="Internal/BD Hours" />
                  <Bar dataKey="ooo" stackId="a" fill="#ef4444" name="OOO Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="col-span-4 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Time Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={entry => `${entry.name}: ${entry.value.toFixed(0)}h`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Project Burn */}
            <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Top Projects by Hours</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectBurnData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'team' && (
          <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Team Member Details</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleTeamSort('name')}>
                      Name {teamSortConfig.key === 'name' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleTeamSort('totalHours')}>
                      Total Hours {teamSortConfig.key === 'totalHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleTeamSort('billableHours')}>
                      Billable {teamSortConfig.key === 'billableHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleTeamSort('internalHours')}>
                      Internal/BD {teamSortConfig.key === 'internalHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleTeamSort('oooHours')}>
                      OOO {teamSortConfig.key === 'oooHours' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleTeamSort('utilization')}>
                      Utilization {teamSortConfig.key === 'utilization' && (teamSortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTeamMembers.map(member => (
                    <React.Fragment key={member.name}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{member.totalHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">{member.billableHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 font-medium">{member.internalHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">{member.oooHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${member.utilization}%`}}></div>
                            </div>
                            <span className="text-sm font-medium">{member.utilization}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button 
                            onClick={() => toggleTeamMemberExpansion(member.name)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedTeamMembers[member.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {expandedTeamMembers[member.name] && (
                        <tr>
                          <td colSpan="7" className="px-4 py-3 bg-gray-50">
                            <div className="pl-8">
                              <h4 className="font-medium mb-2">Projects:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(member.projects).map(([project, hours]) => {
                                  const category = determineCategory(project);
                                  return (
                                    <div key={project} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{project}</span>
                                        {getCategoryBadge(category)}
                                      </div>
                                      <span className="text-sm font-medium">{hours.toFixed(1)}h</span>
                                    </div>
                                  );
                                })}
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

        {activeTab === 'projects' && (
          <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Project Details</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(processedData.projects)
                    .sort((a, b) => b.totalHours - a.totalHours)
                    .map(project => (
                      <React.Fragment key={project.name}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getCategoryBadge(project.category)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{project.totalHours.toFixed(1)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{project.teamMembers.size}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button 
                              onClick={() => toggleProjectExpansion(project.name)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {expandedProjects[project.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                        {expandedProjects[project.name] && (
                          <tr>
                            <td colSpan="5" className="px-4 py-3 bg-gray-50">
                              <div className="pl-8">
                                <h4 className="font-medium mb-2">Team Members:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {Array.from(project.teamMembers).map(member => (
                                    <span key={member} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {member}
                                    </span>
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

        {activeTab === 'capacity' && (
          <div className="col-span-12 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Team Capacity Analysis</h2>
              
              {/* Capacity Overview Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Billable Capacity</h3>
                  <div className="text-2xl font-bold text-green-900">{metrics.billableHours}h</div>
                  <div className="text-sm text-green-600 mt-1">{metrics.billablePercentage}% of utilized hours</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <h3 className="text-sm font-medium text-indigo-800 mb-2">Internal/BD Capacity</h3>
                  <div className="text-2xl font-bold text-indigo-900">{metrics.internalHours}h</div>
                  <div className="text-sm text-indigo-600 mt-1">{Math.round((parseFloat(metrics.internalHours) / parseFloat(metrics.utilizedHours)) * 100)}% of utilized hours</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="text-sm font-medium text-red-800 mb-2">OOO Hours</h3>
                  <div className="text-2xl font-bold text-red-900">{metrics.oooHours}h</div>
                  <div className="text-sm text-red-600 mt-1">{Math.round((parseFloat(metrics.oooHours) / parseFloat(metrics.totalHours)) * 100)}% of total hours</div>
                </div>
              </div>

              {/* Detailed Capacity Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billable</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internal/BD</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OOO</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTeamMembers.map(member => (
                      <tr key={member.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">{member.billableHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 font-medium">{member.internalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">{member.oooHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{member.totalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${member.utilization}%`}}></div>
                            </div>
                            <span className="text-sm font-medium">{member.utilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exceptions' && (
          <div className="col-span-12 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Exceptions & Alerts</h2>
              
              {/* Low Utilization Alerts */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Low Utilization (&lt;70%)
                </h3>
                <div className="space-y-2">
                  {sortedTeamMembers
                    .filter(member => member.utilization < 70)
                    .map(member => (
                      <div key={member.name} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.utilization}% utilized ({member.billableHours.toFixed(1)}h billable, {member.internalHours.toFixed(1)}h internal)</div>
                        </div>
                        <span className="text-yellow-600 font-medium">{member.utilization}%</span>
                      </div>
                    ))}
                  {sortedTeamMembers.filter(member => member.utilization < 70).length === 0 && (
                    <div className="text-gray-500 text-sm">No low utilization alerts</div>
                  )}
                </div>
              </div>

              {/* High OOO Hours */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  High OOO Hours (&gt;20h)
                </h3>
                <div className="space-y-2">
                  {sortedTeamMembers
                    .filter(member => member.oooHours > 20)
                    .map(member => (
                      <div key={member.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.oooHours.toFixed(1)}h out of office</div>
                        </div>
                        <span className="text-red-600 font-medium">{member.oooHours.toFixed(1)}h</span>
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
                  <Activity className="w-5 h-5 text-green-500" />
                  High Billable Load (&gt;40h)
                </h3>
                <div className="space-y-2">
                  {sortedTeamMembers
                    .filter(member => member.billableHours > 40)
                    .map(member => (
                      <div key={member.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.billableHours.toFixed(1)}h billable hours</div>
                        </div>
                        <span className="text-green-600 font-medium">{member.billableHours.toFixed(1)}h</span>
                      </div>
                    ))}
                  {sortedTeamMembers.filter(member => member.billableHours > 40).length === 0 && (
                    <div className="text-gray-500 text-sm">No high billable load alerts</div>
                  )}
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
