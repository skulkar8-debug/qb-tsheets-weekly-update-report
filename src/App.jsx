import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, BarChart3, PieChart, Target, UserCheck, AlertTriangle } from 'lucide-react';
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
  const [selectedTeamMember, setSelectedTeamMember] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedTeamMembers, setExpandedTeamMembers] = useState({});
  const [showOnlyActive, setShowOnlyActive] = useState(false);
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

  // Process data for analytics
  const processedData = useMemo(() => {
    const teamMembers = {};
    const projects = {};
    const categories = {
      billable: 0,
      nonBillable: 0,
      holiday: 0,
      vacation: 0,
      administrative: 0,
      businessDev: 0
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
          nonBillableHours: 0,
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
      } else {
        teamMembers[fullName].nonBillableHours += hours;
        if (project.includes('Holiday')) categories.holiday += hours;
        else if (project.includes('Vacation')) categories.vacation += hours;
        else if (project.includes('Administrative')) categories.administrative += hours;
        else if (project.includes('Business Development')) categories.businessDev += hours;
        else categories.nonBillable += hours;
      }
    });

    // Calculate utilization
    Object.values(teamMembers).forEach(member => {
      member.utilization = member.totalHours > 0 
        ? Math.round((member.billableHours / member.totalHours) * 100) 
        : 0;
    });

    return { teamMembers, projects, categories };
  }, [allData]);

  // Helper function to determine if project is billable
  function determineCategory(projectName) {
    const nonBillableKeywords = ['Holiday', 'Vacation', 'Administrative', 'Business Development', 'Sick'];
    return nonBillableKeywords.some(keyword => projectName.includes(keyword)) ? 'non-billable' : 'billable';
  }

  // Calculate key metrics
  const metrics = useMemo(() => {
    const { teamMembers, categories } = processedData;
    const totalHours = Object.values(categories).reduce((sum, hours) => sum + hours, 0);
    const teamCount = Object.keys(teamMembers).length;
    const avgUtilization = Math.round(
      Object.values(teamMembers).reduce((sum, member) => sum + member.utilization, 0) / teamCount
    );
    
    return {
      totalHours: totalHours.toFixed(1),
      billableHours: categories.billable.toFixed(1),
      teamCount,
      avgUtilization,
      billablePercentage: Math.round((categories.billable / totalHours) * 100)
    };
  }, [processedData]);

  // Prepare chart data - using first names
  const utilizationChartData = useMemo(() => {
    return Object.values(processedData.teamMembers)
      .sort((a, b) => b.utilization - a.utilization)
      .map(member => ({
        name: member.name.split(' ')[0], // First name only for chart
        utilization: member.utilization,
        billable: member.billableHours,
        nonBillable: member.nonBillableHours
      }));
  }, [processedData]);

  const categoryPieData = useMemo(() => {
    const { categories } = processedData;
    return [
      { name: 'Billable', value: categories.billable, color: '#10b981' },
      { name: 'Business Dev', value: categories.businessDev, color: '#6366f1' },
      { name: 'Administrative', value: categories.administrative, color: '#f59e0b' },
      { name: 'Holiday', value: categories.holiday, color: '#8b5cf6' },
      { name: 'Vacation', value: categories.vacation, color: '#ef4444' }
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
        <div className="grid grid-cols-5 gap-4 mt-6">
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
                  <Bar dataKey="nonBillable" stackId="a" fill="#f59e0b" name="Non-Billable Hours" />
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
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search team member..."
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowOnlyActive(!showOnlyActive)}
                  className={`px-4 py-2 rounded-lg transition ${
                    showOnlyActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Active Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th 
                      className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleTeamSort('totalHours')}
                    >
                      Total Hours {teamSortConfig.key === 'totalHours' && (teamSortConfig.direction === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleTeamSort('billableHours')}
                    >
                      Billable {teamSortConfig.key === 'billableHours' && (teamSortConfig.direction === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleTeamSort('nonBillableHours')}
                    >
                      Non-Billable {teamSortConfig.key === 'nonBillableHours' && (teamSortConfig.direction === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleTeamSort('utilization')}
                    >
                      Utilization {teamSortConfig.key === 'utilization' && (teamSortConfig.direction === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeamMembers.map((member, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-medium">{member.name}</td>
                        <td className="py-3 px-4 text-center">{member.totalHours.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center text-green-600 font-medium">
                          {member.billableHours.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center text-orange-600">
                          {member.nonBillableHours.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.utilization >= 75 ? 'bg-green-100 text-green-700' :
                            member.utilization >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {member.utilization}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleTeamMemberExpansion(member.name)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto"
                          >
                            {expandedTeamMembers[member.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {Object.keys(member.projects).length} active
                          </button>
                        </td>
                      </tr>
                      {expandedTeamMembers[member.name] && (
                        <tr>
                          <td colSpan="6" className="py-3 px-4 bg-gray-50">
                            <div className="pl-8">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Project Distribution:</p>
                              <div className="space-y-1">
                                {Object.entries(member.projects)
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([projectName, hours], idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-700">{projectName}</span>
                                      <div className="flex items-center gap-4">
                                        <div className="w-48 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${(hours / member.totalHours) * 100}%` }}
                                          />
                                        </div>
                                        <span className="text-gray-600 font-medium w-16 text-right">
                                          {hours.toFixed(1)}h ({((hours / member.totalHours) * 100).toFixed(0)}%)
                                        </span>
                                      </div>
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

        {activeTab === 'projects' && (
          <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Project Allocation</h2>
              <div className="flex gap-2">
                <select className="px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="all">All Projects</option>
                  <option value="billable">Billable Only</option>
                  <option value="non-billable">Non-Billable Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {Object.values(processedData.projects)
                .sort((a, b) => b.totalHours - a.totalHours)
                .map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <div 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => toggleProjectExpansion(project.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedProjects[project.name] ? 
                            <ChevronDown className="w-4 h-4 text-gray-500" /> :
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          }
                          <span className="font-medium">{project.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.category === 'billable' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm">
                            <span className="text-gray-500">Team Size:</span>
                            <span className="ml-2 font-medium">{project.teamMembers.size}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Total Hours:</span>
                            <span className="ml-2 font-bold text-blue-600">{project.totalHours.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedProjects[project.name] && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Team Members:</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(project.teamMembers).map((member, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'capacity' && (
          <>
            <div className="col-span-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Capacity Analysis</h2>
              <div className="space-y-4">
                {Object.values(processedData.teamMembers)
                  .sort((a, b) => b.totalHours - a.totalHours)
                  .slice(0, 8)
                  .map((member, index) => {
                    const maxHours = 80; // Assuming 80 hours for 2 weeks
                    const capacityUsed = (member.totalHours / maxHours) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-gray-600">{member.totalHours.toFixed(1)} / {maxHours}h</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              capacityUsed > 90 ? 'bg-red-500' :
                              capacityUsed > 75 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(capacityUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="col-span-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Availability Status</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.totalHours < 60).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Available</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <Activity className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.totalHours >= 60 && m.totalHours < 75).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Near Capacity</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.totalHours >= 75).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Over Capacity</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Capacity Alerts</h3>
                <div className="space-y-2">
                  {Object.values(processedData.teamMembers)
                    .filter(m => m.totalHours >= 75)
                    .map((member, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">
                          <span className="font-medium">{member.name}</span> is at {((member.totalHours / 80) * 100).toFixed(0)}% capacity
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'exceptions' && (
          <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Time Entry Exceptions & Alerts</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-700 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Missing Entries</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Team members with 0 hours logged</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-700 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Low Hours</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Below 20 hours/week</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Unmapped Time</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Generic project codes used</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Team Member</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Missing Entry
                      </span>
                    </td>
                    <td className="py-3 px-4">Ryan Earp</td>
                    <td className="py-3 px-4 text-sm text-gray-600">No hours logged for Jan 1-2, 5-6</td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Low Hours
                      </span>
                    </td>
                    <td className="py-3 px-4">Kirti Gupta</td>
                    <td className="py-3 px-4 text-sm text-gray-600">Only 7 hours logged last week</td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Review
                      </button>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Unmapped
                      </span>
                    </td>
                    <td className="py-3 px-4">Multiple</td>
                    <td className="py-3 px-4 text-sm text-gray-600">178 hours under "Business Development"</td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Classify
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Data Quality Score: 78%</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Time entries are mostly complete but could benefit from more specific project allocation. 
                  </p>
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
