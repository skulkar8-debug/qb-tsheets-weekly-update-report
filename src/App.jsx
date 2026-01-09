import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, BarChart3, PieChart, Target, UserCheck, AlertTriangle, Search } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, Label, LabelList } from 'recharts';

// ============================================================================
// WEEKLY DATA - SINGLE SOURCE OF TRUTH
// Add new week's CSV data here. Weeks are in descending order (latest first).
// Schema: lname,fname,username,job_code,hours
// ============================================================================

const WEEK_DATA = {
  "Jan 4 – Jan 10, 2026": `lname,fname,username,job_code,hours
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,2
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,1
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,30
D,Ramya,rdamani@stocadvisory.com,Business Development,32.85
D,Ramya,rdamani@stocadvisory.com,Holiday,8
Egan,Sean,segan@stocadvisory.com,ADP - Tearsheet,16
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,4.5
Egan,Sean,segan@stocadvisory.com,CPC - Home Away From Home,9
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
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),1.98
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Capital Plaza (Dr. Amin),2
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,1.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Lifetime Vision Source,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Manhattan Vision & Queens Eye Associates,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Metropolitan Vision,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,1
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
Sheehy,Aidan,asheehy@stocadvisory.com,Administrative,5
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,32
Sheehy,Aidan,asheehy@stocadvisory.com,Holiday,9
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,12
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Chicago Eye Care Center,12
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,44.88
Singh,Jogendra,jrathore@stocadvisory.com,Holiday,10
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),25
Tuli,Rahul,rtuli@stocadvisory.com,Vacation,32`,

  "Dec 28, 2025 – Jan 3, 2026": `lname,fname,username,job_code,hours
D,Ramya,rdamani@stocadvisory.com,Business Development,22.05
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
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,3
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
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,10.53`,

  "Dec 21 – Dec 27, 2025": `lname,fname,username,job_code,hours
D,Ramya,rdamani@stocadvisory.com,Business Development,25.15
Egan,Sean,segan@stocadvisory.com,CPC - Home Away From Home,2.5
Egan,Sean,segan@stocadvisory.com,Holiday,8
Govind,Vaishnav,vgovind@stocadvisory.com,Administrative,3
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,30.55
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Emma Wu and Associates,1
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Tearsheet,16
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,15
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,6
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,5.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),2.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,10
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,35.05
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,8
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,3
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,8
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,3
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,32.55
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,16
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,4
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,8
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,10
Sharma,Mohit,msharma@stocadvisory.com,Business Development,36
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,2
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,35
Sundar,Barath,bsundar@stocadvisory.com,Holiday,16
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,8
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,8
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,4.5`,

  "Dec 14 – Dec 20, 2025": `lname,fname,username,job_code,hours
D,Ramya,rdamani@stocadvisory.com,Business Development,20
Egan,Sean,segan@stocadvisory.com,Holiday,8
Garg,Vishal,vgarg@stocadvisory.com,AEG - Child and Family Eye Care Center,8
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,28
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Corp Dev Support (Tearsheet),21
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Emma Wu and Associates,2
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Tearsheet,9
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,3.5
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,9
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,7.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),46.78
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,40
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Capital Plaza (Dr. Amin),2
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,1.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Lifetime Vision Source,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Manhattan Vision & Queens Eye Associates,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Metropolitan Vision,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,1
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Hawkins Psychiatry,5
Luetgers,Sam,sluetgers@stocadvisory.com,Sick,4
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,8
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,6
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,46.78
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,6
McFadden,Brandon,bmcfadden@stocadvisory.com,Holiday,8
McFadden,Brandon,bmcfadden@stocadvisory.com,Vacation,16
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,28
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,8
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Home Away From Home,2.5
Nguyen,Hung,hnguyen@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),21
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,32
Pandey,Sharvan,spandey@stocadvisory.com,Holiday,8
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,3.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,30
Sharma,Mohit,msharma@stocadvisory.com,Business Development,35
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,9
Sheehy,Aidan,asheehy@stocadvisory.com,Holiday,9
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,12
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Chicago Eye Care Center,12
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,22
Sundar,Barath,bsundar@stocadvisory.com,Holiday,8
Tuli,Rahul,rtuli@stocadvisory.com,Vacation,32`
};

// ============================================================================
// SCHEDULE DATA - DAY-LEVEL ASSIGNMENTS
// Schedule data by week showing daily assignments with times and customers
// ============================================================================
const SCHEDULE_DATA_BY_WEEK = {
  "Jan 4 – Jan 10, 2026": [
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-06", end_date: "2026-01-06", day: "Tue", customer: "Lake Worth and Town & Country", employee: "Brandon McFadden", start_time: "8:30a", end_time: "10:30a", hours: 2, details: "(customer inferred from cell text; row label not visible)", start_datetime: "2026-01-06 8:30a", end_datetime: "2026-01-06 10:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-07", day: "Wed", customer: "SP - Southern Smiles", employee: "Hung Nguyen", start_time: "9:00a", end_time: "11:00a", hours: 2, details: "", start_datetime: "2026-01-07 9:00a", end_datetime: "2026-01-07 11:00a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-05", end_date: "2026-01-05", day: "Mon", customer: "AEG - Child and Family Eye Care Center", employee: "Brandon McFadden", start_time: "8:30a", end_time: "1:30p", hours: 5, details: "", start_datetime: "2026-01-05 8:30a", end_datetime: "2026-01-05 1:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-09", end_date: "2026-01-09", day: "Fri", customer: "AEG - Metropolitan Vision", employee: "Brandon McFadden", start_time: "8:30a", end_time: "12:30p", hours: 4, details: "", start_datetime: "2026-01-09 8:30a", end_datetime: "2026-01-09 12:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-05", end_date: "2026-01-06", day: "Mon", customer: "AEG - Sandy & Draper Vision", employee: "Pravin Jadhav", start_time: "10:30p", end_time: "3:30a", hours: 5, details: "Lake Worth and Town & Country (overnight)", start_datetime: "2026-01-05 10:30p", end_datetime: "2026-01-06 3:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-06", end_date: "2026-01-07", day: "Tue", customer: "AEG - Sandy & Draper Vision", employee: "Pravin Jadhav", start_time: "10:30p", end_time: "3:30a", hours: 5, details: "Lake Worth and Town & Country (overnight)", start_datetime: "2026-01-06 10:30p", end_datetime: "2026-01-07 3:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-08", day: "Wed", customer: "AEG - Sandy & Draper Vision", employee: "Pravin Jadhav", start_time: "10:30p", end_time: "3:30a", hours: 5, details: "AEG - Pascarella Eye Care and Contact Lenses (Dr. Pascarella) (overnight)", start_datetime: "2026-01-07 10:30p", end_datetime: "2026-01-08 3:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-09", day: "Thu", customer: "AEG - Sandy & Draper Vision", employee: "Pravin Jadhav", start_time: "10:30p", end_time: "3:30a", hours: 5, details: "AEG - Pascarella Eye Care and Contact Lenses (Dr. Pascarella) (overnight)", start_datetime: "2026-01-08 10:30p", end_datetime: "2026-01-09 3:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-05", end_date: "2026-01-05", day: "Mon", customer: "AEG - South Shore Eye Center", employee: "Brandon McFadden", start_time: "1:30p", end_time: "4:30p", hours: 3, details: "", start_datetime: "2026-01-05 1:30p", end_datetime: "2026-01-05 4:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-06", end_date: "2026-01-06", day: "Tue", customer: "AEG - South Shore Eye Center", employee: "Brandon McFadden", start_time: "12:30p", end_time: "4:30p", hours: 4, details: "", start_datetime: "2026-01-06 12:30p", end_datetime: "2026-01-06 4:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-07", day: "Wed", customer: "AEG - South Shore Eye Center", employee: "Brandon McFadden", start_time: "8:30a", end_time: "12:30p", hours: 4, details: "", start_datetime: "2026-01-07 8:30a", end_datetime: "2026-01-07 12:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-08", day: "Thu", customer: "AEG - South Shore Eye Center", employee: "Brandon McFadden", start_time: "12:30p", end_time: "4:30p", hours: 4, details: "", start_datetime: "2026-01-08 12:30p", end_datetime: "2026-01-08 4:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-07", day: "Wed", customer: "Archway - Connecticut Dental (Archway - DP)", employee: "Leah Hudson", start_time: "8:30a", end_time: "5:00p", hours: 8.5, details: "Archway - DP", start_datetime: "2026-01-07 8:30a", end_datetime: "2026-01-07 5:00p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-08", day: "Thu", customer: "Archway - Connecticut Dental (Archway - DP)", employee: "Leah Hudson", start_time: "8:30a", end_time: "5:00p", hours: 8.5, details: "Archway - DP", start_datetime: "2026-01-08 8:30a", end_datetime: "2026-01-08 5:00p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-09", end_date: "2026-01-09", day: "Fri", customer: "Archway - Connecticut Dental (Archway - DP)", employee: "Leah Hudson", start_time: "8:30a", end_time: "5:00p", hours: 8.5, details: "Archway - DP", start_datetime: "2026-01-09 8:30a", end_datetime: "2026-01-09 5:00p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-05", end_date: "2026-01-05", day: "Mon", customer: "Holiday", employee: "Sean Egan", start_time: "", end_time: "", hours: 8, details: "8hrs", start_datetime: "2026-01-05", end_datetime: "2026-01-05" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-06", end_date: "2026-01-06", day: "Tue", customer: "Holiday", employee: "Sean Egan", start_time: "", end_time: "", hours: 8, details: "8hrs", start_datetime: "2026-01-06", end_datetime: "2026-01-06" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-07", day: "Wed", customer: "Holiday", employee: "Barath Sundar", start_time: "", end_time: "", hours: 8, details: "8hrs", start_datetime: "2026-01-07", end_datetime: "2026-01-07" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-08", day: "Thu", customer: "Holiday", employee: "Barath Sundar", start_time: "", end_time: "", hours: 8, details: "8hrs", start_datetime: "2026-01-08", end_datetime: "2026-01-08" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-09", end_date: "2026-01-09", day: "Fri", customer: "Holiday", employee: "Barath Sundar", start_time: "", end_time: "", hours: 8, details: "8hrs", start_datetime: "2026-01-09", end_datetime: "2026-01-09" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-07", day: "Wed", customer: "Budget - FP&A", employee: "Jishnu Chiramkara", start_time: "9:00a", end_time: "5:00p", hours: 8, details: "", start_datetime: "2026-01-07 9:00a", end_datetime: "2026-01-07 5:00p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-08", day: "Thu", customer: "Budget - FP&A", employee: "Jishnu Chiramkara", start_time: "9:00a", end_time: "5:00p", hours: 8, details: "", start_datetime: "2026-01-08 9:00a", end_datetime: "2026-01-08 5:00p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-09", end_date: "2026-01-09", day: "Fri", customer: "Budget - FP&A", employee: "Jishnu Chiramkara", start_time: "9:00a", end_time: "5:00p", hours: 8, details: "", start_datetime: "2026-01-09 9:00a", end_datetime: "2026-01-09 5:00p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-07", day: "Wed", customer: "SALT - Alden Bridge Pediatric", employee: "Brandon McFadden", start_time: "1:00p", end_time: "4:30p", hours: 3.5, details: "", start_datetime: "2026-01-07 1:00p", end_datetime: "2026-01-07 4:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-09", day: "Thu", customer: "SALT - Alden Bridge Pediatric", employee: "Arjit Saxena", start_time: "10:30p", end_time: "7:30a", hours: 9, details: "Alden bridge (overnight)", start_datetime: "2026-01-08 10:30p", end_datetime: "2026-01-09 7:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-08", day: "Thu", customer: "SALT - Chesapeake Pediatric", employee: "Matthew Hottman", start_time: "8:30a", end_time: "4:30p", hours: 8, details: "", start_datetime: "2026-01-08 8:30a", end_datetime: "2026-01-08 4:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-07", day: "Wed", customer: "SALT - Haeger Orthodontics", employee: "Matthew Hottman", start_time: "8:30a", end_time: "4:30p", hours: 8, details: "", start_datetime: "2026-01-07 8:30a", end_datetime: "2026-01-07 4:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-08", day: "Thu", customer: "SALT - Haeger Orthodontics", employee: "Brandon McFadden", start_time: "8:30a", end_time: "12:30p", hours: 4, details: "", start_datetime: "2026-01-08 8:30a", end_datetime: "2026-01-08 12:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-09", end_date: "2026-01-09", day: "Fri", customer: "SALT - Haeger Orthodontics", employee: "Brandon McFadden", start_time: "8:30a", end_time: "12:30p", hours: 4, details: "", start_datetime: "2026-01-09 8:30a", end_datetime: "2026-01-09 12:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-07", end_date: "2026-01-08", day: "Wed", customer: "SALT - Haeger Orthodontics", employee: "Arjit Saxena", start_time: "10:30p", end_time: "7:30a", hours: 9, details: "Myortho and Haeger Ortho (overnight)", start_datetime: "2026-01-07 10:30p", end_datetime: "2026-01-08 7:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-06", end_date: "2026-01-06", day: "Tue", customer: "SALT - Houston OMS", employee: "Matthew Hottman", start_time: "8:30a", end_time: "4:30p", hours: 8, details: "", start_datetime: "2026-01-06 8:30a", end_datetime: "2026-01-06 4:30p" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-08", end_date: "2026-01-09", day: "Thu", customer: "SALT - Houston OMS", employee: "Rahul Tuli", start_time: "10:30p", end_time: "7:30a", hours: 9, details: "(overnight)", start_datetime: "2026-01-08 10:30p", end_datetime: "2026-01-09 7:30a" },
    { week: "Jan 4 – Jan 10, 2026", date: "2026-01-09", end_date: "2026-01-09", day: "Fri", customer: "SALT - MyOrthodontist", employee: "Matthew Hottman", start_time: "8:30a", end_time: "4:30p", hours: 8, details: "", start_datetime: "2026-01-09 8:30a", end_datetime: "2026-01-09 4:30p" }
  ],
  "Dec 28, 2025 – Jan 3, 2026": [],
  "Dec 21 – Dec 27, 2025": [],
  "Dec 14 – Dec 20, 2025": []
};


// Backward compatibility: Keep rawData1 and rawData2 for any code that still references them
const rawData1 = WEEK_DATA["Jan 4 – Jan 10, 2026"];
const rawData2 = WEEK_DATA["Dec 28, 2025 – Jan 3, 2026"];

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

// CDS Team Members (final reconciled roster)
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
  const [selectedPeriods, setSelectedPeriods] = useState(['Jan 4 – Jan 10, 2026']); // Array for multiselect, default to latest
  const [selectedTeamMember, setSelectedTeamMember] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedTeamMembers, setExpandedTeamMembers] = useState({});
  const [teamMemberProjectSearch, setTeamMemberProjectSearch] = useState({}); // Search per team member
  const [teamMemberSearch, setTeamMemberSearch] = useState(''); // Search for team members by name
  const [projectsSearch, setProjectsSearch] = useState(''); // Global projects search
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [teamFilter, setTeamFilter] = useState('all'); // Global filter: all, tas, cds
  const [projectsFilter, setProjectsFilter] = useState('all'); // Projects section filter
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
  const [goForwardToday, setGoForwardToday] = useState(new Date().toISOString().split('T')[0]);
  const [goForwardTeamFilter, setGoForwardTeamFilter] = useState('all');
  const [goForwardProjectSearch, setGoForwardProjectSearch] = useState('');

  // Parse data
  const week1Data = useMemo(() => parseCSV(rawData1), []);
  const week2Data = useMemo(() => parseCSV(rawData2), []);
  
  // Time periods configuration (automatically generated from WEEK_DATA, sorted descending - latest first)
  const timePeriods = useMemo(() => {
    return Object.keys(WEEK_DATA).map(weekLabel => ({
      id: weekLabel, // Use the week label as the ID
      label: weekLabel,
      data: parseCSV(WEEK_DATA[weekLabel])
    }));
  }, []);
  
  // Combine data from selected periods
  const allData = useMemo(() => {
    const combined = [];
    timePeriods.forEach(period => {
      if (selectedPeriods.includes(period.id)) {
        period.data.forEach(entry => {
          combined.push({ ...entry, period: period.id, weekLabel: period.label });
        });
      }
    });
    return combined;
  }, [selectedPeriods, timePeriods]);

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

  // Categorization function - STEP 1: Standardize project categorization
  const categorizeEntry = (jobCode) => {
    // A. OOO
    if (jobCode === 'Holiday' || jobCode === 'Vacation' || jobCode === 'Sick') {
      return 'OOO';
    }
    
    // B. Internal/BD
    if (jobCode === 'Administrative' || jobCode === 'Business Development' || 
        jobCode === 'Business Development - STOC' || jobCode === 'CDS - Tableau') {
      return 'Internal/BD';
    }
    
    // C. Billable - everything else
    return 'Billable';
  };

  // Get client from job code
  const getClient = (jobCode) => {
    // Special buckets
    if (jobCode === 'Holiday' || jobCode === 'Vacation' || jobCode === 'Sick') {
      return 'OOO';
    }
    if (jobCode === 'Administrative') {
      return 'Administrative';
    }
    if (jobCode === 'Business Development' || jobCode === 'Business Development - STOC') {
      return 'Business Development';
    }
    if (jobCode === 'CDS - Tableau') {
      return 'CDS';
    }
    
    // Standard client extraction
    const parts = jobCode.split(' - ');
    return parts[0] || 'Other';
  };

  // Check if a person is in CDS team
  const isCDSMember = (name) => {
    return CDS_TEAM_MEMBERS.includes(name);
  };

  // Process data with proper categorization
  const processedData = useMemo(() => {
    const teamMembers = {};
    const projects = {};
    const periodData = {};
    
    allData.forEach((entry) => {
      const hours = parseFloat(entry.hours) || 0;
      const name = `${entry.fname} ${entry.lname}`;
      const jobCode = entry.job_code;
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
        return '#DC2626'; // muted red
      case 'Underutilized':
        return '#2563EB'; // muted blue
      case 'Healthy':
        return '#059669'; // muted green
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

  const getRiskAction = (riskLevel) => {
    switch (riskLevel) {
      case 'Burnout Risk':
        return 'Rebalance workload: shift tasks to underutilized team members or extend timelines to protect capacity.';
      case 'Underutilized':
        return 'Assign additional work: pull into active projects or allocate to upcoming initiatives.';
      case 'Healthy':
        return 'Maintain current allocation and monitor for changes in upcoming periods.';
      default:
        return 'Review allocation.';
    }
  };

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
    const numPeriods = selectedPeriods.length;
    
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
        
        // Role assignment (simplified - can be enhanced)
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
      .filter(m => m.usedHours > 0); // Hide people with 0 Used Hours
    
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

  // Chart data
  const utilizationData = useMemo(() => {
    return Object.values(processedData.teamMembers)
      .filter(member => member.totalHours > 0) // Hide team members with 0 logged hours
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

  // Top projects table data
  const topProjectsData = useMemo(() => {
    return Object.values(processedData.projects)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 10);
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

  // Clear selected team member if they get filtered out by search
  useEffect(() => {
    if (selectedTeamMember !== 'all') {
      const isStillVisible = sortedTeamMembers.some(member => member.name === selectedTeamMember);
      if (!isStillVisible) {
        setSelectedTeamMember('all');
      }
    }
  }, [sortedTeamMembers, selectedTeamMember]);

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
      return period ? period.label : '';
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

  return (
    <div className="min-h-screen bg-white p-6">

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-4">
  <img src="/logo.png" className="h-10 w-auto" />
  <div>
    <h1 className="text-3xl font-bold text-gray-900">STOC Staffing Tool</h1>
    <p className="text-gray-500 mt-1">Real-time visibility into team utilization and project allocation</p>
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
              
              {/* Time Period Multiselect Dropdown */}
              <div className="relative period-dropdown-container">
                <div 
                  className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700">{getSelectedPeriodsLabel()}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {showPeriodDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-2">
                      {timePeriods.map((period) => (
                        <div
                          key={period.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => togglePeriodSelection(period.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPeriods.includes(period.id)}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{period.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 p-2">
                      <button
                        onClick={() => {
                          setSelectedPeriods(timePeriods.map(p => p.id));
                        }}
                        className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPeriods([timePeriods[0].id]); // Reset to latest only
                        }}
                        className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        Reset to Latest
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {['overview', 'teams', 'projects', 'capacity', 'exceptions', 'schedule'].map((tab) => (
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
                      {/* Reference lines for risk zones */}
                      <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#6B7280" strokeDasharray="5 5" />
                      <line x1="95%" y1="0" x2="95%" y2="100%" stroke="#6B7280" strokeDasharray="5 5" />
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

              {/* Utilization Risk Table - Always Visible */}
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
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('internalHours')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Internal/BD Hours
                            {riskTableSortConfig.key === 'internalHours' && (
                              <span className="text-xs">{riskTableSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRiskTableSort('oooHours')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            OOO Hours
                            {riskTableSortConfig.key === 'oooHours' && (
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
                          <td className="py-3 px-4 text-sm text-gray-700 text-right">
                            {member.internalHours.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 text-right">
                            {member.oooHours.toFixed(1)}
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

              {/* Existing Overview Content Below */}
              {/* Utilization Chart */}
              <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Team Utilization</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                    />
                    <Legend />
                    <Bar dataKey="billable" stackId="a" fill="#60A5FA" name="Billable" />
                    <Bar dataKey="internal" stackId="a" fill="#A78BFA" name="Internal/BD" />
                    <Bar dataKey="available" stackId="a" fill="#D1D5DB" name="Available" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Project Distribution and Top Projects */}
              <div className="col-span-6 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Hour Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={projectDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="col-span-6 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Top Projects by Hours</h2>
                <div className="overflow-y-auto max-h-[300px]">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-sm">Project</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-sm">Category</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700 text-sm">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topProjectsData.map((project, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm text-gray-900 max-w-xs break-words">{project.name}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              project.category === 'Billable' ? 'bg-blue-50 text-blue-700' :
                              project.category === 'Internal/BD' ? 'bg-purple-50 text-purple-700' :
                              'bg-gray-50 text-gray-700'
                            }`}>
                              {project.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-sm font-medium text-gray-900">
                            {project.totalHours.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="col-span-12 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">Total</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{summaryStats.totalUtilized.toFixed(0)}</div>
                  <p className="text-sm text-blue-700 mt-1">Utilized Hours</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">Internal</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-900">{summaryStats.totalInternalHours.toFixed(0)}</div>
                  <p className="text-sm text-purple-700 mt-1">Non-Billable Hours</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">Time Off</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{summaryStats.totalOOOHours.toFixed(0)}</div>
                  <p className="text-sm text-gray-700 mt-1">OOO Hours</p>
                </div>
              </div>
            </>
          )}

          {/* GO-FORWARD SCHEDULE SECTION */}
          {activeTab === 'overview' && (() => {
            // Get schedule data for selected week (use first selected period)
            const selectedWeek = selectedPeriods[0] || 'Jan 4 – Jan 10, 2026';
            const scheduleRows = SCHEDULE_DATA_BY_WEEK[selectedWeek] || [];
            
            if (scheduleRows.length === 0) {
              return (
                <div className="col-span-12 bg-white rounded-xl shadow-lg p-6 mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Go-Forward Schedule</h2>
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No schedule data available for the selected week.</p>
                  </div>
                </div>
              );
            }

            // Parse today date and get end of selected week
            const todayDate = new Date(goForwardToday + 'T00:00:00');
            const weekRange = selectedWeek.split(' – ');
            const weekEndStr = weekRange[1]?.split(',')[0]?.trim();
            
            // Parse week end date
            let weekEndDate = new Date();
            if (weekEndStr) {
              const year = selectedWeek.match(/\d{4}/)?.[0] || new Date().getFullYear();
              weekEndDate = new Date(`${weekEndStr}, ${year}T23:59:59`);
            }

            // Filter to remaining schedule (dates AFTER today, within selected week)
            const remainingSchedule = scheduleRows.filter(row => {
              if (!row.date) return false;
              
              const shiftDate = new Date(row.date + 'T00:00:00');
              const isAfterToday = shiftDate > todayDate;
              const isWithinWeek = shiftDate <= weekEndDate;
              
              // Team filter
              const employeeName = row.employee || '';
              if (goForwardTeamFilter !== 'all') {
                const isTAS = TAS_MEMBERS.includes(employeeName);
                const isCDS = CDS_MEMBERS.includes(employeeName);
                if (goForwardTeamFilter === 'tas' && !isTAS) return false;
                if (goForwardTeamFilter === 'cds' && !isCDS) return false;
              }
              
              // Project search filter
              if (goForwardProjectSearch) {
                const searchLower = goForwardProjectSearch.toLowerCase();
                const projectMatch = (row.customer || '').toLowerCase().includes(searchLower);
                const employeeMatch = employeeName.toLowerCase().includes(searchLower);
                if (!projectMatch && !employeeMatch) return false;
              }
              
              return isAfterToday && isWithinWeek;
            });

            // Group by project/customer
            const projectGroups = {};
            remainingSchedule.forEach(row => {
              const project = row.customer || 'Unassigned';
              if (!projectGroups[project]) {
                projectGroups[project] = {
                  project,
                  totalHours: 0,
                  shifts: []
                };
              }
              
              const hours = parseFloat(row.hours) || 0;
              projectGroups[project].totalHours += hours;
              projectGroups[project].shifts.push({
                employee: row.employee || '',
                date: row.date,
                day: row.day,
                startTime: row.start_time,
                endTime: row.end_time,
                hours
              });
            });

            // Sort projects by total hours (desc)
            const sortedProjects = Object.values(projectGroups).sort(
              (a, b) => b.totalHours - a.totalHours
            );

            // Sort shifts within each project by date then time
            sortedProjects.forEach(group => {
              group.shifts.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                return (a.startTime || '').localeCompare(b.startTime || '');
              });
            });

            // Calculate KPIs
            const uniqueEmployees = new Set(remainingSchedule.map(r => r.employee || '')).size;
            const totalRemainingHours = remainingSchedule.reduce((sum, r) => 
              sum + (parseFloat(r.hours) || 0), 0
            );
            const uniqueDates = new Set(remainingSchedule.map(r => r.date)).size;

            return (
              <div className="col-span-12 bg-white rounded-xl shadow-lg p-6 mt-6">
                {/* Header with filters */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Go-Forward Schedule</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Remaining work from {new Date(goForwardToday).toLocaleDateString()} through {selectedWeek}
                    </p>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex items-center gap-3">
                    {/* Today Date Control */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">Today:</span>
                      <input
                        type="date"
                        value={goForwardToday}
                        onChange={(e) => setGoForwardToday(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Team Filter */}
                    <select
                      value={goForwardTeamFilter}
                      onChange={(e) => setGoForwardTeamFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Teams</option>
                      <option value="tas">TAS</option>
                      <option value="cds">CDS</option>
                    </select>
                    
                    {/* Project Search */}
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search projects or employees..."
                        value={goForwardProjectSearch}
                        onChange={(e) => setGoForwardProjectSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                {sortedProjects.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600 font-medium">Remaining Days</div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">{uniqueDates}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600 font-medium">Total Hours Scheduled</div>
                      <div className="text-2xl font-bold text-green-900 mt-1">{totalRemainingHours.toFixed(1)}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600 font-medium">Unique People</div>
                      <div className="text-2xl font-bold text-purple-900 mt-1">{uniqueEmployees}</div>
                    </div>
                  </div>
                )}

                {/* Schedule by Project */}
                {sortedProjects.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No remaining scheduled work found for the selected filters.</p>
                    <p className="text-sm mt-2">Try adjusting your "Today" date or filters.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedProjects.map((group, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Project Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{group.project}</h3>
                            <span className="text-sm font-semibold text-blue-700">
                              {group.totalHours.toFixed(1)} hours remaining
                            </span>
                          </div>
                        </div>
                        
                        {/* Shifts Table */}
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Day</th>
                              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                              <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase">Hours</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {group.shifts.map((shift, sIdx) => (
                              <tr key={sIdx} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                  {shift.employee}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {new Date(shift.date + 'T00:00:00').toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600 font-medium">
                                  {shift.day}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {shift.startTime && shift.endTime 
                                    ? `${shift.startTime} – ${shift.endTime}`
                                    : '—'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                                  {shift.hours.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

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
                      // Get distinct projects (unique by job_code)
                      const distinctProjects = Object.entries(member.projects)
                        .filter(([jobCode]) => categorizeEntry(jobCode) !== 'OOO') // Exclude OOO from percentage calc
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
                                            <span className="text-gray-700">{proj.jobCode}</span>
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
                      <tr className="bg-gray-50 font-semibold">
                        <td className="py-3 px-4 text-gray-900">Total</td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {(Object.keys(processedData.teamMembers).length * 40).toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalOOOHours.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalCapacity.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalUtilized.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{summaryStats.totalAvailable.toFixed(1)}</td>
                        <td className="py-3 px-4"></td>
                      </tr>
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

              <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold mb-3">Capacity Alerts</h3>
                <div className="space-y-2">
                  {Object.values(processedData.teamMembers)
                    .filter(m => m.availableBandwidth < 0)
                    .map((member, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm">
                          <span className="font-medium">{member.name}</span> is overallocated by {Math.abs(member.availableBandwidth).toFixed(1)} hours ({member.utilizationRate.toFixed(0)}% utilized)
                        </span>
                      </div>
                    ))}
                  {Object.values(processedData.teamMembers).filter(m => m.availableBandwidth < 0).length === 0 && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">No overallocated team members</span>
                    </div>
                  )}
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
                    <p className="font-semibold text-blue-900">Data Quality Score: {
                      (100 - (Object.values(processedData.teamMembers).filter(m => m.availableBandwidth < 0).length * 5) - 
                      (Object.values(processedData.teamMembers).filter(m => m.totalHours > 0 && m.totalHours < 20).length * 2)).toFixed(0)
                    }%</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Time entries are tracked. Monitor capacity allocation and address overallocated team members.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE SECTION */}
          {activeTab === 'schedule' && (
            <div className="col-span-12">
              {(() => {
                // Extract main client from customer name
                const extractMainClient = (customer) => {
                  if (!customer) return 'Unknown';
                  const dashIndex = customer.indexOf(' - ');
                  if (dashIndex > 0) {
                    return customer.substring(0, dashIndex);
                  }
                  return customer;
                };

                // Parse hours safely
                const parseHours = (row) => {
                  if (row.hours && !isNaN(parseFloat(row.hours))) {
                    return parseFloat(row.hours);
                  }
                  return 0;
                };

                // Format date for display
                const formatDate = (dateStr) => {
                  if (!dateStr) return '—';
                  try {
                    const date = new Date(`${dateStr}T00:00:00`);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } catch {
                    return dateStr;
                  }
                };

                // Get day of week (use row.day if available, otherwise compute safely)
                const getDayOfWeek = (row) => {
                  if (row.day) return row.day;
                  if (!row.date) return '—';
                  try {
                    const date = new Date(`${row.date}T00:00:00`);
                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    return days[date.getDay()];
                  } catch {
                    return '—';
                  }
                };

                // Check if shift is overnight
                const isOvernight = (row) => {
                  return row.end_date && row.date && row.end_date !== row.date;
                };

                // Format time display
                const formatTime = (row) => {
                  if (!row.start_time || !row.end_time) return '—';
                  const overnight = isOvernight(row);
                  return `${row.start_time} – ${row.end_time}${overnight ? ' (overnight)' : ''}`;
                };

                // Get schedule data for selected week
                if (selectedPeriods.length !== 1) {
                  return (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg text-gray-600">Please select exactly one week to view the schedule.</p>
                    </div>
                  );
                }

                const weekLabel = selectedPeriods[0];
                const scheduleData = SCHEDULE_DATA_BY_WEEK?.[weekLabel] || [];

                if (scheduleData.length === 0) {
                  return (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg text-gray-600">No schedule data available for the selected week.</p>
                    </div>
                  );
                }

                // Use goForwardToday for filtering (already exists in state)
                const todayDateObj = new Date(`${goForwardToday}T00:00:00`);
                todayDateObj.setHours(0, 0, 0, 0);

                // Filter for remaining days (strictly after today)
                const filteredRows = scheduleData.filter(row => {
                  if (!row.date || !row.employee || !row.customer) return false;
                  
                  try {
                    const rowDate = new Date(`${row.date}T00:00:00`);
                    rowDate.setHours(0, 0, 0, 0);
                    
                    // Only include dates strictly AFTER today
                    if (rowDate <= todayDateObj) return false;
                    
                    // Apply search filter if exists
                    if (goForwardProjectSearch && goForwardProjectSearch.trim()) {
                      const query = goForwardProjectSearch.toLowerCase();
                      const customerMatch = row.customer.toLowerCase().includes(query);
                      const employeeMatch = row.employee.toLowerCase().includes(query);
                      if (!customerMatch && !employeeMatch) return false;
                    }
                    
                    return true;
                  } catch {
                    return false;
                  }
                });

                // Get remaining dates
                const remainingDates = [...new Set(filteredRows.map(row => row.date))].sort();

                // Group by main client, then by project
                const mainClientGroups = {};
                
                filteredRows.forEach(row => {
                  const mainClient = extractMainClient(row.customer);
                  const project = row.customer;
                  
                  if (!mainClientGroups[mainClient]) {
                    mainClientGroups[mainClient] = {
                      mainClient,
                      totalHours: 0,
                      projects: {}
                    };
                  }
                  
                  if (!mainClientGroups[mainClient].projects[project]) {
                    mainClientGroups[mainClient].projects[project] = {
                      project,
                      totalHours: 0,
                      shifts: []
                    };
                  }
                  
                  const hours = parseHours(row);
                  mainClientGroups[mainClient].totalHours += hours;
                  mainClientGroups[mainClient].projects[project].totalHours += hours;
                  mainClientGroups[mainClient].projects[project].shifts.push(row);
                });

                // Sort main clients by total hours (desc)
                const sortedMainClients = Object.values(mainClientGroups).sort((a, b) => 
                  b.totalHours - a.totalHours
                );

                // Sort projects within each main client by total hours (desc)
                sortedMainClients.forEach(mainClientGroup => {
                  mainClientGroup.projectsArray = Object.values(mainClientGroup.projects).sort((a, b) => 
                    b.totalHours - a.totalHours
                  );
                  
                  // Sort shifts within each project by date, then time
                  mainClientGroup.projectsArray.forEach(project => {
                    project.shifts.sort((a, b) => {
                      const dateCompare = a.date.localeCompare(b.date);
                      if (dateCompare !== 0) return dateCompare;
                      return (a.start_time || '').localeCompare(b.start_time || '');
                    });
                  });
                });

                // Calculate KPIs
                const totalScheduledHours = filteredRows.reduce((sum, row) => sum + parseHours(row), 0);
                const uniquePeople = [...new Set(filteredRows.map(row => row.employee))].length;

                return (
                  <div className="space-y-6">
                    {/* KPI Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{remainingDates.length}</div>
                          <div className="text-sm text-gray-600">Remaining Days</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{totalScheduledHours.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Scheduled Hours Remaining</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{uniquePeople}</div>
                          <div className="text-sm text-gray-600">Unique People Scheduled</div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    {filteredRows.length === 0 ? (
                      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-400 mb-4">
                          <Calendar className="w-16 h-16 mx-auto" />
                        </div>
                        <p className="text-lg text-gray-600">No scheduled shifts found for the remaining days in this week.</p>
                        <p className="text-sm text-gray-500 mt-2">Try adjusting the "Today" date or search filters.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {sortedMainClients.map((mainClientGroup, idx) => (
                          <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {/* Main Client Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                              <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">{mainClientGroup.mainClient}</h2>
                                <span className="text-sm font-medium text-indigo-100">
                                  {mainClientGroup.totalHours.toFixed(1)} hours
                                </span>
                              </div>
                            </div>

                            {/* Projects */}
                            <div className="p-6 space-y-6">
                              {mainClientGroup.projectsArray.map((projectGroup, projIdx) => (
                                <div key={projIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Project Header */}
                                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <h3 className="font-semibold text-gray-900">{projectGroup.project}</h3>
                                      <span className="text-sm font-medium text-gray-600">
                                        {projectGroup.totalHours.toFixed(1)} hours
                                      </span>
                                    </div>
                                  </div>

                                  {/* Shifts Table */}
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Employee</th>
                                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Date</th>
                                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Day</th>
                                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Time</th>
                                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Hours</th>
                                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Details</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {projectGroup.shifts.map((shift, shiftIdx) => (
                                          <tr key={shiftIdx} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-900">{shift.employee}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{formatDate(shift.date)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 font-medium">{getDayOfWeek(shift)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{formatTime(shift)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                                              {parseHours(shift).toFixed(1)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500 italic">
                                              {shift.details || '—'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StocStaffingDashboard;
