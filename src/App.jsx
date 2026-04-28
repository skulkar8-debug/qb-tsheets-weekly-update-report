import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, BarChart3, PieChart, Target, UserCheck, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, Label, LabelList } from 'recharts';

// ============================================================================
// LIVE DATA CONFIGURATION
// Configure your Google Sheets data source
// ============================================================================

const GOOGLE_SHEETS_CONFIG = {
  // Your Google Sheet ID (from the URL)
  sheetId: '18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA',
  // Default sheet name - will try this first
  sheetName: 'Sheet1',
  // Direct CSV export URL for your sheet
  directUrl: 'https://docs.google.com/spreadsheets/d/18vkNRZv5A2Xz3CVAFDExX5vbgM_jyLu0bPh0XzoQYDA/export?format=csv'
};

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

// Data fetching functions
const fetchGoogleSheetData = async (config) => {
  try {
    let url;
    if (config.directUrl) {
      url = config.directUrl;
    } else {
      // Construct Google Sheets CSV export URL
      url = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(config.sheetName)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
};

// Parse CSV data with better error handling
const parseCSV = (csvText) => {
  try {
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Clean headers (remove quotes and extra spaces)
    const headers = lines[0].split(',').map(header => 
      header.replace(/"/g, '').trim().toLowerCase()
    );
    
    return lines.slice(1).map((line, index) => {
      try {
        // Handle CSV parsing with quoted values
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(value => 
          value.replace(/^"(.*)"$/, '$1').trim()
        );
        
        const row = {};
        headers.forEach((header, i) => {
          row[header] = cleanValues[i] || '';
        });
        
        // Normalize column names for compatibility
        if (row.first_name && !row.fname) row.fname = row.first_name;
        if (row.firstname && !row.fname) row.fname = row.firstname;
        if (row.last_name && !row.lname) row.lname = row.last_name;
        if (row.lastname && !row.lname) row.lname = row.lastname;
        if (row.email && !row.username) row.username = row.email;
        if (row.project && !row.job_code) row.job_code = row.project;
        if (row.task && !row.job_code) row.job_code = row.task;
        if (row.time && !row.hours) row.hours = row.time;
        if (row.duration && !row.hours) row.hours = row.duration;
        
        return row;
      } catch (err) {
        console.warn(`Error parsing row ${index + 2}:`, line, err);
        return null;
      }
    }).filter(row => row !== null);
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

// Smart date period detection from live data
const detectDatePeriods = (data) => {
  // Look for date-related fields in the data
  const dateFields = ['date', 'week', 'period', 'week_start', 'week_end'];
  const detectedPeriods = new Set();
  
  data.forEach(row => {
    dateFields.forEach(field => {
      if (row[field]) {
        detectedPeriods.add(row[field]);
      }
    });
  });
  
  // If no explicit date fields, create periods based on data grouping patterns
  // For now, return a single period representing "Current Data"
  if (detectedPeriods.size === 0) {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    const periodLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    return [periodLabel];
  }
  
  return Array.from(detectedPeriods).sort().reverse(); // Latest first
};

// ============================================================================
// CDS TEAM MEMBERS (adjust based on your actual team structure)
// ============================================================================
const CDS_TEAM_MEMBERS = [
  'Mohit Sharma',
  'Rakesh Nayak',
  'Sharvan Pandey',
  'Stefan Joseph',
  'Jogendra Singh',
  'Ramya D',
  'Vaishnav Govind'
];

const StocStaffingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriods, setSelectedPeriods] = useState([]); // Will be populated after data load
  const [selectedTeamMember, setSelectedTeamMember] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedTeamMembers, setExpandedTeamMembers] = useState({});
  const [teamMemberProjectSearch, setTeamMemberProjectSearch] = useState({});
  const [teamMemberSearch, setTeamMemberSearch] = useState('');
  const [projectsSearch, setProjectsSearch] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [teamFilter, setTeamFilter] = useState('all');
  const [projectsFilter, setProjectsFilter] = useState('all');
  const [teamsSortConfig, setTeamsSortConfig] = useState({ key: 'utilized', direction: 'desc' });
  const [projectsSortConfig, setProjectsSortConfig] = useState({ key: 'totalHours', direction: 'desc' });
  const [capacitySortConfig, setCapacitySortConfig] = useState({ key: 'availableBandwidth', direction: 'desc' });
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  
  // Utilization Risk Dashboard state
  const [selectedRiskMember, setSelectedRiskMember] = useState(null);
  const [riskRoleFilter, setRiskRoleFilter] = useState('all');
  const [riskClientFilter, setRiskClientFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [riskTableSortConfig, setRiskTableSortConfig] = useState({ key: 'utilization', direction: 'desc' });

  // Schedule section state
  const [goForwardToday, setGoForwardToday] = useState('2026-01-05');
  const [goForwardProjectSearch, setGoForwardProjectSearch] = useState('');
  const [goForwardEmployeeFilter, setGoForwardEmployeeFilter] = useState('all');
  const [showAvailablePeople, setShowAvailablePeople] = useState(false);

  // Data state management
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [availablePeriods, setAvailablePeriods] = useState(['all']);
  
  // Time periods (dynamically generated from live data)
  const timePeriods = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    const periods = detectDatePeriods(rawData);
    return periods.map(period => ({
      id: period,
      label: period,
      data: rawData // For simplicity, all data is in one period for now
    }));
  }, [rawData]);

  // Load data from Google Sheets
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchGoogleSheetData(GOOGLE_SHEETS_CONFIG);
      setRawData(data);
      setLastUpdated(new Date());
      
      // Set initial selected periods (latest only)
      const periods = detectDatePeriods(data);
      if (periods.length > 0 && selectedPeriods.length === 0) {
        setSelectedPeriods([periods[0]]); // Select latest period by default
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPeriodDropdown && !event.target.closest('.period-dropdown-container')) {
        setShowPeriodDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPeriodDropdown]);

  // Combine data from selected periods
  const allData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    // For now, since we're pulling from a single sheet, just add period metadata
    return rawData.map(entry => ({
      ...entry,
      period: timePeriods[0]?.id || 'Current Data',
      weekLabel: timePeriods[0]?.label || 'Current Data'
    }));
  }, [rawData, timePeriods]);

  // Categorization function - STEP 1: Standardize project categorization
  const categorizeEntry = (jobCode) => {
    const jobLower = jobCode.toLowerCase();
    
    // A. OOO
    if (jobLower.includes('holiday') || jobLower.includes('vacation') || jobLower.includes('sick')) {
      return 'OOO';
    }
    
    // B. Internal/BD
    if (jobLower.includes('administrative') || jobLower.includes('business development') || 
        jobLower.includes('cds') || jobLower.includes('tableau')) {
      return 'Internal/BD';
    }
    
    // C. Billable - everything else
    return 'Billable';
  };

  // Get client from job code
  const getClient = (jobCode) => {
    const jobLower = jobCode.toLowerCase();
    
    // Special buckets
    if (jobLower.includes('holiday') || jobLower.includes('vacation') || jobLower.includes('sick')) {
      return 'OOO';
    }
    if (jobLower.includes('administrative')) {
      return 'Administrative';
    }
    if (jobLower.includes('business development')) {
      return 'Business Development';
    }
    if (jobLower.includes('cds') || jobLower.includes('tableau')) {
      return 'CDS';
    }
    
    // Standard client extraction (e.g., "AEG - Child and Family" -> "AEG")
    const parts = jobCode.split(' - ');
    if (parts.length > 1) {
      return parts[0].trim();
    }
    
    // Extract client patterns
    const upperJob = jobCode.toUpperCase();
    if (upperJob.includes('AEG')) return 'AEG';
    if (upperJob.includes('SALT')) return 'SALT';
    if (upperJob.includes('ADP')) return 'ADP';
    if (upperJob.includes('SP USA') || upperJob.includes('SPUSA')) return 'SP USA';
    if (upperJob.includes('CPC')) return 'CPC';
    if (upperJob.includes('RIATA')) return 'RIATA';
    if (upperJob.includes('BEACON')) return 'BEACON';
    
    return 'Other';
  };

  // Check if a person is in CDS team
  const isCDSMember = (name) => {
    return CDS_TEAM_MEMBERS.includes(name);
  };

  // Process data with proper categorization
  const processedData = useMemo(() => {
    if (!allData || allData.length === 0) {
      return { 
        teamMembers: {}, 
        projects: {}, 
        periodData: {} 
      };
    }

    const teamMembers = {};
    const projects = {};
    const periodData = {};
    
    allData.forEach((entry) => {
      // Handle different possible column names
      const firstName = entry.fname || entry.first_name || entry.firstname || '';
      const lastName = entry.lname || entry.last_name || entry.lastname || '';
      const name = `${firstName} ${lastName}`.trim();
      const hours = parseFloat(entry.hours || entry.time || entry.duration || 0);
      const jobCode = entry.job_code || entry.project || entry.task || 'Unknown Project';
      
      if (!name || name === ' ' || hours === 0) return; // Skip invalid rows
      
      const category = categorizeEntry(jobCode);
      const client = getClient(jobCode);
      const isCDS = isCDSMember(name);
      
      // Apply global team filter
      if (teamFilter === 'cds' && !isCDS) return;
      if (teamFilter === 'tas' && isCDS) return;
      
      // Initialize team member
      if (!teamMembers[name]) {
        teamMembers[name] = {
          name,
          isCDS,
          totalHours: 0,
          billableHours: 0,
          oooHours: 0,
          internalHours: 0,
          utilized: 0,
          projects: {},
          entries: []
        };
      }
      
      // Update team member data
      teamMembers[name].totalHours += hours;
      teamMembers[name].entries.push({ jobCode, hours, category, client });
      
      if (category === 'OOO') {
        teamMembers[name].oooHours += hours;
      } else if (category === 'Internal/BD') {
        teamMembers[name].internalHours += hours;
        teamMembers[name].utilized += hours;
      } else if (category === 'Billable') {
        teamMembers[name].billableHours += hours;
        teamMembers[name].utilized += hours;
      }
      
      if (!teamMembers[name].projects[jobCode]) {
        teamMembers[name].projects[jobCode] = 0;
      }
      teamMembers[name].projects[jobCode] += hours;
      
      // Initialize project
      if (!projects[jobCode]) {
        projects[jobCode] = {
          name: jobCode,
          category,
          client,
          totalHours: 0,
          teamMembers: {}
        };
      }
      
      // Update project data
      projects[jobCode].totalHours += hours;
      if (!projects[jobCode].teamMembers[name]) {
        projects[jobCode].teamMembers[name] = 0;
      }
      projects[jobCode].teamMembers[name] += hours;
    });

    // Calculate capacity metrics for each team member
    Object.values(teamMembers).forEach(member => {
      const weeklyTargetHours = 40;
      member.effectiveCapacity = weeklyTargetHours - member.oooHours;
      member.availableBandwidth = member.effectiveCapacity - member.utilized;
      member.utilizationRate = member.effectiveCapacity > 0 
        ? (member.utilized / member.effectiveCapacity) * 100 
        : 0;
    });

    return { teamMembers, projects, periodData };
  }, [allData, teamFilter]);

  // Group projects by client for Project Allocation section
  const projectsByClient = useMemo(() => {
    const grouped = {};
    
    Object.values(processedData.projects).forEach(project => {
      // Apply projects filter
      if (projectsFilter === 'ooo' && project.category !== 'OOO') return;
      if (projectsFilter === 'administrative') {
        // Include both Administrative and OOO when Administrative is selected
        if (project.client !== 'Administrative' && project.category !== 'OOO') return;
      }
      if (projectsFilter === 'internal-bd' && project.category !== 'Internal/BD') return;
      if (projectsFilter === 'billable' && project.category !== 'Billable') return;
      
      // Apply search filter
      if (projectsSearch && !project.name.toLowerCase().includes(projectsSearch.toLowerCase())) {
        return;
      }
      
      const client = project.client;
      if (!grouped[client]) {
        grouped[client] = {
          client,
          projects: [],
          totalHours: 0
        };
      }
      
      grouped[client].projects.push(project);
      grouped[client].totalHours += project.totalHours;
    });
    
    return Object.values(grouped).sort((a, b) => b.totalHours - a.totalHours);
  }, [processedData.projects, projectsFilter, projectsSearch]);

  // Helper function to highlight search matches
  const highlightText = (text, search) => {
    if (!search) return text;
    
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Risk dashboard helpers
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Burnout Risk':
        return '#DC2626';
      case 'Underutilized':
        return '#2563EB';
      case 'Healthy':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  const getRiskExplanation = (member) => {
    if (member.riskLevel === 'Burnout Risk') {
      return `${member.name} is at burnout risk with ${member.utilization.toFixed(0)}% utilization. They are working ${member.usedHours.toFixed(0)} hours against ${member.availableHours.toFixed(0)} available hours, exceeding healthy capacity thresholds.`;
    } else if (member.riskLevel === 'Underutilized') {
      return `${member.name} is underutilized with ${member.utilization.toFixed(0)}% utilization. They have logged ${member.usedHours.toFixed(0)} hours against ${member.availableHours.toFixed(0)} available hours, indicating capacity for additional work.`;
    } else {
      return `${member.name} has healthy utilization at ${member.utilization.toFixed(0)}%. They are working ${member.usedHours.toFixed(0)} hours against ${member.availableHours.toFixed(0)} available hours, which is within optimal range.`;
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const members = Object.values(processedData.teamMembers);
    const totalBillable = members.reduce((sum, m) => sum + m.billableHours, 0);
    const totalInternal = members.reduce((sum, m) => sum + m.internalHours, 0);
    const totalOOO = members.reduce((sum, m) => sum + m.oooHours, 0);
    const totalUtilized = members.reduce((sum, m) => sum + m.utilized, 0);
    const totalAvailable = members.reduce((sum, m) => sum + m.availableBandwidth, 0);
    const totalCapacity = members.reduce((sum, m) => sum + m.effectiveCapacity, 0);
    
    return {
      totalTeamMembers: members.length,
      totalBillableHours: totalBillable,
      totalInternalHours: totalInternal,
      totalOOOHours: totalOOO,
      totalUtilized: totalUtilized,
      totalAvailable: totalAvailable,
      totalCapacity: totalCapacity,
      avgUtilization: totalCapacity > 0 ? (totalUtilized / totalCapacity) * 100 : 0
    };
  }, [processedData.teamMembers]);

  // Utilization Risk Dashboard calculations
  const riskDashboardData = useMemo(() => {
    const weeklyTargetHours = 40;
    const numPeriods = selectedPeriods.length || 1;
    
    const riskMembers = Object.values(processedData.teamMembers)
      .map(member => {
        // Used Hours = Billable + Internal/BD
        const usedHours = member.billableHours + member.internalHours;
        
        // Available Hours = (WeeklyTargetHours × number_of_selected_periods) − OOO Hours
        const targetHours = weeklyTargetHours * numPeriods;
        const availableHours = targetHours - member.oooHours;
        
        // Utilization % = Used / Available
        const utilization = availableHours > 0 ? (usedHours / availableHours) * 100 : 0;
        
        // Risk category
        let riskLevel = 'Healthy';
        if (utilization >= 95) {
          riskLevel = 'Burnout Risk';
        } else if (utilization < 60) {
          riskLevel = 'Underutilized';
        }
        
        // Get client from projects (most common client)
        const clientCounts = {};
        member.entries.forEach(entry => {
          const client = getClient(entry.jobCode);
          clientCounts[client] = (clientCounts[client] || 0) + entry.hours;
        });
        const primaryClient = Object.entries(clientCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Multiple';
        
        // Role assignment
        const role = member.isCDS ? 'CDS' : 'TAS';
        
        return {
          name: member.name,
          isCDS: member.isCDS,
          usedHours,
          billableHours: member.billableHours,
          internalHours: member.internalHours,
          oooHours: member.oooHours,
          availableHours,
          targetHours,
          utilization,
          riskLevel,
          primaryClient,
          role,
          entries: member.entries
        };
      })
      .filter(m => m.usedHours > 0);
    
    // Apply filters
    let filteredMembers = riskMembers;
    
    if (riskRoleFilter !== 'all') {
      filteredMembers = filteredMembers.filter(m => m.role === riskRoleFilter);
    }
    
    if (riskClientFilter !== 'all') {
      filteredMembers = filteredMembers.filter(m => m.primaryClient === riskClientFilter);
    }
    
    if (riskLevelFilter !== 'all') {
      filteredMembers = filteredMembers.filter(m => m.riskLevel === riskLevelFilter);
    }
    
    // Calculate KPIs
    const avgUtilization = filteredMembers.length > 0 
      ? filteredMembers.reduce((sum, m) => sum + m.utilization, 0) / filteredMembers.length 
      : 0;
    
    const burnoutCount = filteredMembers.filter(m => m.riskLevel === 'Burnout Risk').length;
    const underutilizedCount = filteredMembers.filter(m => m.riskLevel === 'Underutilized').length;
    const healthyCount = filteredMembers.filter(m => m.riskLevel === 'Healthy').length;
    
    // Get unique roles and clients for filters
    const roles = [...new Set(riskMembers.map(m => m.role))].sort();
    const clients = [...new Set(riskMembers.map(m => m.primaryClient))].sort();
    
    return {
      members: filteredMembers,
      avgUtilization,
      burnoutCount,
      underutilizedCount,
      healthyCount,
      roles,
      clients
    };
  }, [processedData.teamMembers, selectedPeriods, teamFilter, riskRoleFilter, riskClientFilter, riskLevelFilter]);

  // Custom scatter chart tooltip
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-sm">
          <div className="font-semibold text-gray-900 mb-2">{data.name}</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Used Hours:</span>
              <span className="font-medium text-gray-900">{data.usedHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Billable:</span>
              <span className="text-gray-700">{data.billableHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Internal/BD:</span>
              <span className="text-gray-700">{data.internalHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">OOO:</span>
              <span className="text-gray-700">{data.oooHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Available:</span>
              <span className="text-gray-700">{data.availableHours.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-gray-200">
              <span className="text-gray-600">Utilization:</span>
              <span className="font-semibold text-gray-900">{data.utilization.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`font-medium ${
                data.riskLevel === 'Burnout Risk' ? 'text-red-600' :
                data.riskLevel === 'Underutilized' ? 'text-blue-600' :
                'text-green-600'
              }`}>
                {data.riskLevel}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Chart data
  const utilizationData = useMemo(() => {
    return Object.values(processedData.teamMembers)
      .filter(member => member.totalHours > 0)
      .sort((a, b) => b.utilized - a.utilized)
      .slice(0, 10)
      .map(member => ({
        name: member.name.split(' ')[0],
        fullName: member.name,
        billable: member.billableHours,
        internal: member.internalHours,
        available: member.availableBandwidth
      }));
  }, [processedData.teamMembers]);

  const projectDistributionData = useMemo(() => {
    const categoryTotals = {};
    Object.values(processedData.projects).forEach(project => {
      const cat = project.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + project.totalHours;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [processedData.projects]);

  // Sorting handlers
  const handleTeamsSort = (key) => {
    setTeamsSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleProjectsSort = (key) => {
    setProjectsSortConfig(prev => ({
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

  const handleRiskTableSort = (key) => {
    setRiskTableSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Sorted data
  const sortedTeamMembers = useMemo(() => {
    let members = Object.values(processedData.teamMembers);
    
    // Apply search filter
    if (teamMemberSearch.trim()) {
      const searchLower = teamMemberSearch.toLowerCase();
      members = members.filter(member => {
        const nameLower = member.name.toLowerCase();
        return nameLower.includes(searchLower);
      });
    }
    
    // Sort the filtered members
    return members.sort((a, b) => {
      const aVal = a[teamsSortConfig.key];
      const bVal = b[teamsSortConfig.key];
      if (teamsSortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal > bVal ? -1 : 1;
    });
  }, [processedData.teamMembers, teamsSortConfig, teamMemberSearch]);

  const sortedCapacityMembers = useMemo(() => {
    const members = Object.values(processedData.teamMembers);
    return members.sort((a, b) => {
      const aVal = a[capacitySortConfig.key];
      const bVal = b[capacitySortConfig.key];
      if (capacitySortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal > bVal ? -1 : 1;
    });
  }, [processedData.teamMembers, capacitySortConfig]);

  const sortedRiskTableData = useMemo(() => {
    return [...riskDashboardData.members].sort((a, b) => {
      const aVal = a[riskTableSortConfig.key];
      const bVal = b[riskTableSortConfig.key];
      if (riskTableSortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal > bVal ? -1 : 1;
    });
  }, [riskDashboardData.members, riskTableSortConfig]);

  // Handle period selection toggle
  const togglePeriodSelection = (periodId) => {
    setSelectedPeriods(prev => {
      if (prev.includes(periodId)) {
        // Don't allow deselecting all periods
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== periodId);
      } else {
        return [...prev, periodId];
      }
    });
  };

  // Get selected periods label for display
  const getSelectedPeriodsLabel = () => {
    if (selectedPeriods.length === timePeriods.length) {
      return 'All Periods';
    }
    if (selectedPeriods.length === 1) {
      const period = timePeriods.find(p => p.id === selectedPeriods[0]);
      return period ? period.label : 'Current Data';
    }
    return `${selectedPeriods.length} Periods Selected`;
  };

  const COLORS = ['#6B7280', '#3B82F6', '#10B981', '#F59E0B'];

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value.toFixed(1)} hours ({((payload[0].value / summaryStats.totalUtilized) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-700">Loading STOC Staffing Data...</h2>
          <p className="text-gray-500 mt-2">Fetching live data from Google Sheets</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <p><strong>Setup Checklist:</strong></p>
            <p>1. Make your Google Sheet public</p>
            <p>2. Verify columns: fname, lname, username, job_code, hours</p>
            <p>3. Check the GOOGLE_SHEETS_CONFIG in code</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">STOC Staffing Tool</h1>
                <p className="text-gray-500 mt-1">Real-time visibility into team utilization and project allocation</p>
                {lastUpdated && (
                  <p className="text-sm text-gray-400 mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Global Team Filter */}
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="border-none bg-transparent font-medium text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Teams</option>
                    <option value="tas">TAS</option>
                    <option value="cds">CDS</option>
                  </select>
                </div>
              </div>
              
              {/* Data Source Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={loadData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  disabled={loading}
                  title="Refresh data from Google Sheets"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {['overview', 'teams', 'projects', 'capacity', 'exceptions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.totalTeamMembers}</div>
            <p className="text-sm text-gray-600 mt-1">Team Members</p>
          </div>

          <div className="bg-white border border-blue-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Billable</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.totalBillableHours.toFixed(0)}</div>
            <p className="text-sm text-gray-600 mt-1">Billable Hours</p>
          </div>

          <div className="bg-white border border-purple-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.avgUtilization.toFixed(0)}%</div>
            <p className="text-sm text-gray-600 mt-1">Avg Utilization</p>
          </div>

          <div className="bg-white border border-green-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Available</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{summaryStats.totalAvailable.toFixed(0)}</div>
            <p className="text-sm text-gray-600 mt-1">Hours Bandwidth</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {activeTab === 'overview' && (
            <>
              {/* Utilization Risk Dashboard - FIRST COMPONENT */}
              <div className="col-span-12 bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Utilization Risk Dashboard</h2>
                  
                  {/* Risk Dashboard Filters */}
                  <div className="flex items-center gap-3">
                    <select
                      value={riskRoleFilter}
                      onChange={(e) => setRiskRoleFilter(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Roles</option>
                      {riskDashboardData.roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    
                    <select
                      value={riskClientFilter}
                      onChange={(e) => setRiskClientFilter(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Clients</option>
                      {riskDashboardData.clients.map(client => (
                        <option key={client} value={client}>{client}</option>
                      ))}
                    </select>
                    
                    <select
                      value={riskLevelFilter}
                      onChange={(e) => setRiskLevelFilter(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Risk Levels</option>
                      <option value="Burnout Risk">Burnout Risk</option>
                      <option value="Healthy">Healthy</option>
                      <option value="Underutilized">Underutilized</option>
                    </select>
                  </div>
                </div>

                {/* KPI Tiles */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700 font-medium mb-1">Avg Team Utilization</div>
                    <div className="text-3xl font-bold text-blue-900">
                      {riskDashboardData.avgUtilization.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-700 font-medium mb-1">Burnout Risk</div>
                    <div className="text-3xl font-bold text-red-900">
                      {riskDashboardData.burnoutCount}
                    </div>
                    <div className="text-xs text-red-600 mt-1">≥95% utilization</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-700 font-medium mb-1">Healthy</div>
                    <div className="text-3xl font-bold text-green-900">
                      {riskDashboardData.healthyCount}
                    </div>
                    <div className="text-xs text-green-600 mt-1">60-95% utilization</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
                    <div className="text-sm text-indigo-700 font-medium mb-1">Underutilized</div>
                    <div className="text-3xl font-bold text-indigo-900">
                      {riskDashboardData.underutilizedCount}
                    </div>
                    <div className="text-xs text-indigo-600 mt-1">&lt;60% utilization</div>
                  </div>
                </div>

                {/* Scatter Chart */}
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={450}>
                    <ScatterChart margin={{ top: 20, right: 80, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        type="number" 
                        dataKey="utilization" 
                        name="Utilization"
                        unit="%"
                        label={{ value: 'Utilization %', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="usedHours" 
                        name="Used Hours"
                        label={{ value: 'Used Hours', angle: -90, position: 'insideLeft' }}
                      />
                      <ZAxis range={[100, 100]} />
                      <Tooltip content={<CustomScatterTooltip />} />
                      <Scatter
                        name="Team Members"
                        data={riskDashboardData.members}
                        fill="#8884d8"
                        onClick={(data) => setSelectedRiskMember(data)}
                        style={{ cursor: 'pointer' }}
                      >
                        {riskDashboardData.members.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskLevel)} />
                        ))}
                        <LabelList 
                          dataKey="name" 
                          position="right"
                          content={(props) => {
                            const { x, y, value, index } = props;
                            const entry = riskDashboardData.members[index];
                            const firstName = value.split(' ')[0] || value.split(' ')[1]?.charAt(0) + value.split(' ')[0]?.charAt(0) || value;
                            const isSelected = selectedRiskMember?.name === entry.name;
                            const topMembers = riskDashboardData.members
                              .sort((a, b) => b.utilization - a.utilization)
                              .slice(0, 12)
                              .map(m => m.name);
                            const isTopUtilization = topMembers.includes(entry.name);
                            
                            if (!isTopUtilization && !isSelected) return null;
                            
                            return (
                              <text
                                x={x + 12}
                                y={y + 4}
                                textAnchor="start"
                                fill="#374151"
                                fontSize="11"
                                fontWeight={isSelected ? "600" : "400"}
                              >
                                {firstName}
                              </text>
                            );
                          }}
                        />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
                      <span className="text-sm text-gray-700">Burnout Risk (≥95%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#059669' }}></div>
                      <span className="text-sm text-gray-700">Healthy (60-95%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2563EB' }}></div>
                      <span className="text-sm text-gray-700">Underutilized (&lt;60%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Panel - Inline below chart when member selected */}
              {selectedRiskMember && (
                <div className="col-span-12 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedRiskMember.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedRiskMember.riskLevel === 'Burnout Risk' ? 'bg-red-100 text-red-700' :
                          selectedRiskMember.riskLevel === 'Underutilized' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {selectedRiskMember.riskLevel}
                        </span>
                        <span className="text-sm text-gray-600">{selectedRiskMember.role}</span>
                        <span className="text-sm text-gray-600">• {selectedRiskMember.primaryClient}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRiskMember(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Metrics Summary */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Utilization Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Used Hours:</span>
                          <span className="font-semibold text-gray-900">{selectedRiskMember.usedHours.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available Hours:</span>
                          <span className="font-medium text-gray-700">{selectedRiskMember.availableHours.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Hours:</span>
                          <span className="text-gray-700">{selectedRiskMember.targetHours.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">OOO Hours:</span>
                          <span className="text-gray-700">{selectedRiskMember.oooHours.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Utilization:</span>
                          <span className="font-bold text-gray-900">{selectedRiskMember.utilization.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Analysis</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {getRiskExplanation(selectedRiskMember)}
                      </p>
                    </div>
                  </div>

                  {/* Hours Breakdown */}
                  <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Hours Breakdown</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Billable Hours:</span>
                          <span className="font-medium text-gray-900">{selectedRiskMember.billableHours.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(selectedRiskMember.billableHours / selectedRiskMember.usedHours) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Internal/BD Hours:</span>
                          <span className="font-medium text-gray-900">{selectedRiskMember.internalHours.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(selectedRiskMember.internalHours / selectedRiskMember.usedHours) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Utilization Risk Table */}
              <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Utilization Risk Table</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th 
                          className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Name
                            {riskTableSortConfig.key === 'name' && (
                              <span className="text-xs">{riskTableSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('riskLevel')}
                        >
                          <div className="flex items-center gap-1">
                            Risk Label
                            {riskTableSortConfig.key === 'riskLevel' && (
                              <span className="text-xs">{riskTableSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('utilization')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Utilization %
                            {riskTableSortConfig.key === 'utilization' && (
                              <span className="text-xs">{riskTableSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('usedHours')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Used Hours
                            {riskTableSortConfig.key === 'usedHours' && (
                              <span className="text-xs">{riskTableSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('availableHours')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Available Hours
                            {riskTableSortConfig.key === 'availableHours' && (
                              <span className="text-xs">{riskTableSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('billableHours')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Billable Hours
                            {riskTableSortConfig.key === 'billableHours' && (
                              <span className="text-xs">{riskTableSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRiskTableData.map((member, index) => (
                        <tr 
                          key={index}
                          className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedRiskMember?.name === member.name ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedRiskMember(member)}
                        >
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">{member.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.riskLevel === 'Burnout Risk' ? 'bg-red-100 text-red-700' :
                              member.riskLevel === 'Underutilized' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {member.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                            {member.utilization.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-right">
                            {member.usedHours.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-right">
                            {member.availableHours.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-right">
                            {member.billableHours.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sortedRiskTableData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No team members match the current filters
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Team Member Details</h2>
                
                {/* Search Bar */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={teamMemberSearch}
                    onChange={(e) => setTeamMemberSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {teamMemberSearch && (
                    <button
                      onClick={() => setTeamMemberSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                      <th 
                        className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTeamsSort('billableHours')}
                      >
                        Billable {teamsSortConfig.key === 'billableHours' && (teamsSortConfig.direction === 'desc' ? '↓' : '↑')}
                      </th>
                      <th 
                        className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTeamsSort('internalHours')}
                      >
                        Internal/BD {teamsSortConfig.key === 'internalHours' && (teamsSortConfig.direction === 'desc' ? '↓' : '↑')}
                      </th>
                      <th 
                        className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTeamsSort('oooHours')}
                      >
                        OOO {teamsSortConfig.key === 'oooHours' && (teamsSortConfig.direction === 'desc' ? '↓' : '↑')}
                      </th>
                      <th 
                        className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTeamsSort('utilized')}
                      >
                        Utilized {teamsSortConfig.key === 'utilized' && (teamsSortConfig.direction === 'desc' ? '↓' : '↑')}
                      </th>
                      <th 
                        className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTeamsSort('availableBandwidth')}
                      >
                        Available {teamsSortConfig.key === 'availableBandwidth' && (teamsSortConfig.direction === 'desc' ? '↓' : '↑')}
                      </th>
                      <th 
                        className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTeamsSort('utilizationRate')}
                      >
                        Utilization {teamsSortConfig.key === 'utilizationRate' && (teamsSortConfig.direction === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Projects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedTeamMembers.map((member, index) => {
                      // Get distinct projects
                      const distinctProjects = Object.entries(member.projects)
                        .filter(([jobCode]) => categorizeEntry(jobCode) !== 'OOO')
                        .map(([jobCode, hours]) => ({
                          jobCode,
                          hours,
                          percentage: member.utilized > 0 ? (hours / member.utilized) * 100 : 0
                        }))
                        .sort((a, b) => b.hours - a.hours);
                      
                      const totalProjectCount = distinctProjects.length;
                      
                      // Apply search filter if exists for this member
                      const searchTerm = teamMemberProjectSearch[member.name] || '';
                      const filteredProjects = searchTerm 
                        ? distinctProjects.filter(proj => 
                            proj.jobCode.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                        : distinctProjects;
                      
                      const filteredProjectCount = filteredProjects.length;
                      
                      return (
                        <React.Fragment key={index}>
                          <tr className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{member.name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.isCDS ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {member.isCDS ? 'CDS' : 'TAS'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-600">{member.billableHours.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{member.internalHours.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{member.oooHours.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{member.utilized.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-medium ${
                                member.availableBandwidth < 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {member.availableBandwidth.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.utilizationRate >= 90 ? 'bg-red-50 text-red-700' :
                                member.utilizationRate >= 75 ? 'bg-yellow-50 text-yellow-700' :
                                'bg-green-50 text-green-700'
                              }`}>
                                {member.utilizationRate.toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {totalProjectCount > 0 ? (
                                <button
                                  onClick={() => setExpandedTeamMembers({
                                    ...expandedTeamMembers,
                                    [member.name]: !expandedTeamMembers[member.name]
                                  })}
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                                >
                                  {searchTerm ? `${filteredProjectCount} of ${totalProjectCount}` : totalProjectCount}
                                  {expandedTeamMembers[member.name] ? 
                                    <ChevronDown className="w-4 h-4" /> : 
                                    <ChevronRight className="w-4 h-4" />
                                  }
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm">0</span>
                              )}
                            </td>
                          </tr>
                          {expandedTeamMembers[member.name] && totalProjectCount > 0 && (
                            <tr>
                              <td colSpan="9" className="py-3 px-4 bg-gray-50">
                                <div className="ml-8 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                      <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={teamMemberProjectSearch[member.name] || ''}
                                        onChange={(e) => setTeamMemberProjectSearch({
                                          ...teamMemberProjectSearch,
                                          [member.name]: e.target.value
                                        })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                    {searchTerm && (
                                      <button
                                        onClick={() => setTeamMemberProjectSearch({
                                          ...teamMemberProjectSearch,
                                          [member.name]: ''
                                        })}
                                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                                      >
                                        Clear
                                      </button>
                                    )}
                                  </div>
                                  
                                  {filteredProjectCount > 0 ? (
                                    <>
                                      <div className="font-medium text-sm text-gray-700">
                                        Project Breakdown (% of Utilized Hours):
                                      </div>
                                      <div className="space-y-1">
                                        {filteredProjects.map((proj, pIdx) => (
                                          <div key={pIdx} className="flex justify-between text-sm py-1">
                                            <span className="text-gray-700">{highlightText(proj.jobCode, searchTerm)}</span>
                                            <span className="text-gray-900 font-medium">
                                              {proj.hours.toFixed(1)}h ({proj.percentage.toFixed(1)}%)
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-sm text-gray-500 italic">
                                      No projects match your search
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-3 px-4 text-gray-900">Total</td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalBillableHours.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalInternalHours.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalOOOHours.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalUtilized.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalAvailable.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{summaryStats.avgUtilization.toFixed(0)}%</td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Project Allocation</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectsSearch}
                      onChange={(e) => setProjectsSearch(e.target.value)}
                      className="w-64 pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {projectsSearch && (
                      <button
                        onClick={() => setProjectsSearch('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={projectsFilter}
                      onChange={(e) => setProjectsFilter(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Projects</option>
                      <option value="billable">Billable</option>
                      <option value="internal-bd">Internal/BD</option>
                      <option value="administrative">Administrative (+ OOO)</option>
                      <option value="ooo">OOO Only</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {projectsByClient.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No projects match your search criteria
                </div>
              ) : (
                <div className="space-y-4">
                  {projectsByClient.map((clientGroup, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => setExpandedProjects({
                          ...expandedProjects,
                          [clientGroup.client]: !expandedProjects[clientGroup.client]
                        })}
                      >
                        <div className="flex items-center gap-2">
                          {expandedProjects[clientGroup.client] ? 
                            <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          }
                          <span className="font-semibold text-gray-900">
                            {highlightText(clientGroup.client, projectsSearch)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {clientGroup.totalHours.toFixed(1)} hours
                        </span>
                      </div>
                      
                      {expandedProjects[clientGroup.client] && (
                        <div className="p-4 space-y-2">
                          {clientGroup.projects.map((project, pIdx) => (
                            <div key={pIdx} className={`border-l-4 pl-4 py-2 ${
                              project.category === 'Billable' ? 'border-blue-400 bg-blue-50' :
                              project.category === 'Internal/BD' ? 'border-purple-400 bg-purple-50' :
                              'border-gray-400 bg-gray-50'
                            }`}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 pr-4">
                                  <div className="font-medium text-gray-900 break-words">
                                    {highlightText(project.name, projectsSearch)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-gray-900">
                                    {project.totalHours.toFixed(1)}h
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3 space-y-1">
                                {Object.entries(project.teamMembers)
                                  .sort(([, a], [, b]) => b - a)
                                  .map(([memberName, hours], mIdx) => (
                                    <div key={mIdx} className="flex justify-between text-sm">
                                      <span className="text-gray-700">{memberName}</span>
                                      <span className="text-gray-600 font-medium">{hours.toFixed(1)}h</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Capacity Tab */}
          {activeTab === 'capacity' && (
            <>
              <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Capacity & Bandwidth Analysis</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Team Member</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Target Hours</th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCapacitySort('oooHours')}
                        >
                          OOO {capacitySortConfig.key === 'oooHours' && (capacitySortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCapacitySort('effectiveCapacity')}
                        >
                          Effective Capacity {capacitySortConfig.key === 'effectiveCapacity' && (capacitySortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCapacitySort('utilized')}
                        >
                          Utilized {capacitySortConfig.key === 'utilized' && (capacitySortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCapacitySort('availableBandwidth')}
                        >
                          Available {capacitySortConfig.key === 'availableBandwidth' && (capacitySortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedCapacityMembers.map((member, index) => {
                        const weeklyTarget = 40;
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{member.name}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{weeklyTarget.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{member.oooHours.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{member.effectiveCapacity.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{member.utilized.toFixed(1)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-medium ${
                                member.availableBandwidth < 0 ? 'text-red-600' : 
                                member.availableBandwidth < 10 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {member.availableBandwidth.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {member.availableBandwidth < 0 ? (
                                <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                  Overallocated
                                </span>
                              ) : member.availableBandwidth < 10 ? (
                                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                                  Near Capacity
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                  Available
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-span-12 grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.availableBandwidth >= 10).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Available Capacity</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <Target className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.availableBandwidth >= 0 && m.availableBandwidth < 10).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Near Capacity</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.availableBandwidth < 0).length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Over Capacity</p>
                </div>
              </div>
            </>
          )}

          {/* Exceptions Tab */}
          {activeTab === 'exceptions' && (
            <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Time Entry Exceptions & Alerts</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Low Hours</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers).filter(m => m.totalHours > 0 && m.totalHours < 20).length}
                  </p>
                  <p className="text-sm text-gray-600">Below 20 hours/week</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Near Capacity</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers).filter(m => m.availableBandwidth < 10 && m.availableBandwidth >= 0).length}
                  </p>
                  <p className="text-sm text-gray-600">Less than 10h available</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Overallocated</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(processedData.teamMembers).filter(m => m.availableBandwidth < 0).length}
                  </p>
                  <p className="text-sm text-gray-600">Over capacity</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Team Member</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.availableBandwidth < 0)
                      .map((member, idx) => (
                        <tr key={`over-${idx}`} className="border-t border-gray-100">
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Overallocated
                            </span>
                          </td>
                          <td className="py-3 px-4">{member.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {Math.abs(member.availableBandwidth).toFixed(1)}h over capacity ({member.utilizationRate.toFixed(0)}% utilized)
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-red-600 text-sm font-medium">Action Required</span>
                          </td>
                        </tr>
                      ))}
                    {Object.values(processedData.teamMembers)
                      .filter(m => m.totalHours > 0 && m.totalHours < 20)
                      .map((member, idx) => (
                        <tr key={`low-${idx}`} className="border-t border-gray-100">
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              Low Hours
                            </span>
                          </td>
                          <td className="py-3 px-4">{member.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            Only {member.totalHours.toFixed(1)} hours logged
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-yellow-600 text-sm font-medium">Review</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      Data Quality Score: {
                        (100 - (Object.values(processedData.teamMembers).filter(m => m.availableBandwidth < 0).length * 5) - 
                        (Object.values(processedData.teamMembers).filter(m => m.totalHours > 0 && m.totalHours < 20).length * 2)).toFixed(0)
                      }%
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Data refreshed from Google Sheets. 
                      Last update: {lastUpdated?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StocStaffingDashboard;
