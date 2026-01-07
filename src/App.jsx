import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, Users, TrendingUp, AlertCircle, Clock, Briefcase, DollarSign, Activity, ChevronRight, ChevronDown, Filter, BarChart3, PieChart, Target, UserCheck, AlertTriangle, Coffee } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine } from 'recharts';

// Raw data embedded (parsed from CSVs)
// CSV Data for 15 weeks

// Week 1: Sep 28 - Oct 4
const rawData1 = `lname,fname,username,job_code,hours
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bergen Optometry,3
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care (Dr. Hornberger),46.61
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Bright Family Eye Care (Dr. Hornberger),1.5
Earp,Ryan,rearp@stocadvisory.com,AEG - ClearVue EyeCare,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - DeBoer Family Eye Care,4.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - DeBoer Family Eye Care,14
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Elliott Eye Doctors (Dr. Elliott),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Eye Care Associates of Charlotte,6
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Eye Was Framed (Dr. Nadel),13
 Haiar, Larson & Morrow),Luetgers,AEG - Eye-Site (Drs. Kollis,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Family Eye Care Center (Drs. Crouch & Crouch),0.5
Earp,Ryan,rearp@stocadvisory.com,AEG - Hopewell Eye Associates (Dr. Daniels),15
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Hopewell Eye Associates (Dr. Daniels),2
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Hopewell Eye Associates (Dr. Daniels),14
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),1
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),14
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),4.68
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Marshall EyeCare Physicians,3
 Mariscotti & Riegel),Luetgers,Sam,AEG - Morrison Eye Associates (Drs. McLin,0
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,1
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - The Eye Doctor (Dr. Falk),8
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - The Eye Site (Nielson),3
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,4
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,6
Sundar,Barath,bsundar@stocadvisory.com,Administrative,15
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,1
Gliniecki,John,jgliniecki@stocadvisory.com,Administrative,6.1
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,1
Egan,Sean,segan@stocadvisory.com,Administrative,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,1
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,1.5
Garg,Vishal,vgarg@stocadvisory.com,Administrative,3
Federico,Anne,afederico@stocadvisory.com,Allied - Alex Rabinovich,13
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral Partners - SunCoast,17
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral Partners - SunCoast,10
Thamsir,Thomson,tthamsir@stocadvisory.com,Beacon Behavioral Partners - SunCoast,22.5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,18
Sharma,Mohit,msharma@stocadvisory.com,Business Development,10.78
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,59.02
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,23.43
Sundar,Barath,bsundar@stocadvisory.com,CPC - Kingdom Canine,8
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Kingdom Canine,5
Gliniecki,John,jgliniecki@stocadvisory.com,CPC - Kingdom Canine,0.9
Hariram,Pradeep,phariram@stocadvisory.com,CPC - Kingdom Canine,3
Garg,Vishal,vgarg@stocadvisory.com,CPC - Kingdom Canine,4.5
Tuli,Rahul,rtuli@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,29
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,14
Federico,Anne,afederico@stocadvisory.com,SALT - Berkowitz Ortho,5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkowitz Ortho,16
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Berkowitz Ortho,6.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkowitz Ortho,8
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SALT - Berkowitz Ortho,4
Federico,Anne,afederico@stocadvisory.com,SALT - Julia Cerny,3
Federico,Anne,afederico@stocadvisory.com,SALT - Kirby Nelson,3
Federico,Anne,afederico@stocadvisory.com,SALT - MyOrthodontist,17
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,18
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,19
Tuli,Rahul,rtuli@stocadvisory.com,SALT - MyOrthodontist,25.68
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,3
Egan,Sean,segan@stocadvisory.com,SPUSA - AC Dentistry (Dr. Adam Cotant),1
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),13
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),1.5
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),21.5
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),9
Egan,Sean,segan@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),11.5
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),8
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Buckhead (Nia),8
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Buckhead Family Dentistry,4
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Buckhead Family Dentistry,18
Egan,Sean,segan@stocadvisory.com,SPUSA - Buckhead Family Dentistry,2.5
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Favia Family Dental,3
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Mentor and Salon Smiles,2.3
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Mentor and Salon Smiles,8
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,7.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SPUSA - Mentor and Salon Smiles,11
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),3
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),11.6
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),3
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),19
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SPUSA - Town Dentistry (Dr. Frodge),6.5
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),25.5
Earp,Ryan,rearp@stocadvisory.com,Vacation,24
Tuli,Rahul,rtuli@stocadvisory.com,Vacation,8
`;

// Week 2: Oct 5 - Oct 11
const rawData2 = `lname,fname,username,job_code,hours
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - A Visual Affair,2
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - A Visual Affair,1.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Blink Optometry (Drs. Fogg & Barseghian),0.5
Earp,Ryan,rearp@stocadvisory.com,AEG - Bright Eyes Family Vision,0.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Bright Family Eye Care (Dr. Hornberger),8.66
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Bright Family Eye Care (Dr. Hornberger),12.5
 Goodman, & Israel),Earp,AEG - Community Vision Optometric Center (Drs. Collins,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - DeBoer Family Eye Care,2.25
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - DeBoer Family Eye Care,10
Earp,Ryan,rearp@stocadvisory.com,AEG - Eye Care Associates of Charlotte,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Eye Was Framed (Dr. Nadel),8.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),7.11
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),25.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),2.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Hopewell Eye Associates (Dr. Daniels),14
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Hopewell Eye Associates (Dr. Daniels),10
Earp,Ryan,rearp@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),10.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),4
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),10
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Latrobe Vision (Dr. Carrarini),1
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),33.13
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),3.5
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),7.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),1.25
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),0.5
 Mariscotti & Riegel),Earp,Ryan,AEG - Morrison Eye Associates (Drs. McLin,0
 Mariscotti & Riegel),Luetgers,Sam,AEG - Morrison Eye Associates (Drs. McLin,0
 Mariscotti & Riegel),Thamsir,Thomson,AEG - Morrison Eye Associates (Drs. McLin,0
Earp,Ryan,rearp@stocadvisory.com,AEG - Northeast Eye Center (Dr. Martinez),2.75
Earp,Ryan,rearp@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),0.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,4
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,12
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Reckley Eye Center,0.5
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),1.5
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),1
 Kingwood, Rayford & Riverstone (Dr. Pham),Sundar,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Garg,AEG - TSO - Richmond Aliana,0
Earp,Ryan,rearp@stocadvisory.com,AEG - The Eye Doctor (Dr. Falk),6
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - The Eye Doctor (Dr. Falk),3
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - The Eye Doctor (Dr. Falk),10
Earp,Ryan,rearp@stocadvisory.com,AEG - Valley Vision Eye Care,12
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Valley Vision Eye Care,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,3.5
Federico,Anne,afederico@stocadvisory.com,Administrative,1
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,11
Sundar,Barath,bsundar@stocadvisory.com,Administrative,27
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,5
Gliniecki,John,jgliniecki@stocadvisory.com,Administrative,11.5
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,1
Earp,Ryan,rearp@stocadvisory.com,Administrative,2.5
Egan,Sean,segan@stocadvisory.com,Administrative,4.5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,2
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,1
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,0.75
Garg,Vishal,vgarg@stocadvisory.com,Administrative,4
Sundar,Barath,bsundar@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,5
Hariram,Pradeep,phariram@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,14
Thamsir,Thomson,tthamsir@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,0.5
Saxena,Arjit,asaxena@stocadvisory.com,Beacon Behavioral - Daytona (Frick),15
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Daytona (Frick),0.5
Thamsir,Thomson,tthamsir@stocadvisory.com,Beacon Behavioral - Daytona (Frick),0.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral Partners - SunCoast,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral Partners - SunCoast,11
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,11
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,52.24
Sharma,Mohit,msharma@stocadvisory.com,Business Development,57.19
D,Ramya,ramya@stocadvisory.com,Business Development,57.63
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,55.03
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,59.23
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,55.88
Sundar,Barath,bsundar@stocadvisory.com,CPC - Kingdom Canine,3
Hariram,Pradeep,phariram@stocadvisory.com,CPC - Kingdom Canine,8
Earp,Ryan,rearp@stocadvisory.com,CPC - Kingdom Canine,3
Egan,Sean,segan@stocadvisory.com,CPC - Kingdom Canine,10
Federico,Anne,afederico@stocadvisory.com,PTO,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,33
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,11.5
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,7.92
Federico,Anne,afederico@stocadvisory.com,SALT - Berkowitz Ortho,7
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkowitz Ortho,13
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkowitz Ortho,5.5
Federico,Anne,afederico@stocadvisory.com,SALT - Julia Cerny,11
Federico,Anne,afederico@stocadvisory.com,SALT - MyOrthodontist,13
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,24.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - MyOrthodontist,33.44
Gliniecki,John,jgliniecki@stocadvisory.com,SP USA - Weekly Sales Dashboard,3
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,3.5
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),11
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),8
Egan,Sean,segan@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),9.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SPUSA - Atlanta Endodontics (Dr. Slosberg),6
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Favia Family Dental,2.5
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - La Cantera Dental Group,11.4
Egan,Sean,segan@stocadvisory.com,SPUSA - La Cantera Dental Group,1.5
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - La Cantera Dental Group,21
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Mentor and Salon Smiles,3
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Mentor and Salon Smiles,15
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),1.7
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),15.5
`;

// Week 3: Oct 12 - Oct 18
const rawData3 = `lname,fname,username,job_code,hours
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Bright Family Eye Care (Dr. Hornberger),7.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - ClearVue EyeCare,2
Gliniecki,John,jgliniecki@stocadvisory.com,AEG - Community Eyecare,2.5
 Goodman, & Israel),Earp,AEG - Community Vision Optometric Center (Drs. Collins,0
 Goodman, & Israel),Luetgers,AEG - Community Vision Optometric Center (Drs. Collins,0
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Eye Care Associates of Charlotte,1.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Eye Was Framed (Dr. Nadel),11
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),1.62
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),23.75
Earp,Ryan,rearp@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),2.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),14
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),3.5
Earp,Ryan,rearp@stocadvisory.com,AEG - Focus Eye Care (Dr. Esperon),3
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Hopewell Eye Associates (Dr. Daniels),8
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),8
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),38.48
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),2.5
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),19.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),1.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,2.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,9.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Sound Beach Optiks,0.5
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),1.5
 Kingwood, Rayford & Riverstone (Dr. Pham),Saxena,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Sundar,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Tuli,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Garg,AEG - TSO - Richmond Aliana,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - The Eye Doctor (Dr. Falk),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - The Eye Site (Nielson),0.25
Earp,Ryan,rearp@stocadvisory.com,AEG - Valley Vision Eye Care,5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Valley Vision Eye Care,0.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,5.5
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,5
Sundar,Barath,bsundar@stocadvisory.com,Administrative,10
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,6
Gliniecki,John,jgliniecki@stocadvisory.com,Administrative,7.5
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,2.5
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,17
Earp,Ryan,rearp@stocadvisory.com,Administrative,1
Egan,Sean,segan@stocadvisory.com,Administrative,14
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,1.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,8
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,0.5
Saxena,Arjit,asaxena@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,2
Sundar,Barath,bsundar@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,16
Gliniecki,John,jgliniecki@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,15.5
Hariram,Pradeep,phariram@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,8
Egan,Sean,segan@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,2.5
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,5
Garg,Vishal,vgarg@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,6
Saxena,Arjit,asaxena@stocadvisory.com,Beacon Behavioral - Daytona (Frick),21
Gliniecki,John,jgliniecki@stocadvisory.com,Beacon Behavioral - Daytona (Frick),5.6
Egan,Sean,segan@stocadvisory.com,Beacon Behavioral - Daytona (Frick),1
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Daytona (Frick),3
Thamsir,Thomson,tthamsir@stocadvisory.com,Beacon Behavioral - Daytona (Frick),3
Garg,Vishal,vgarg@stocadvisory.com,Beacon Behavioral - Daytona (Frick),20
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral Partners - SunCoast,11
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral Partners - SunCoast,11
Thamsir,Thomson,tthamsir@stocadvisory.com,Beacon Behavioral Partners - SunCoast,1.5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,17
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,53.03
Sharma,Mohit,msharma@stocadvisory.com,Business Development,55.75
D,Ramya,ramya@stocadvisory.com,Business Development,55.15
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,55.42
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,54.79
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,56.52
Jadhav,Pravin,pjadhav@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,22
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,16.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,1
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkowitz Ortho,6
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkowitz Ortho,7
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Haeger Orthodontics,1
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Haeger Orthodontics,13.45
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Julia Cerny,5.5
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - MyOrthodontist,8.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,22
Tuli,Rahul,rtuli@stocadvisory.com,SALT - MyOrthodontist,23.58
Gliniecki,John,jgliniecki@stocadvisory.com,SP USA - Weekly Sales Dashboard,8.2
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,5
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),1
Egan,Sean,segan@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),4
Egan,Sean,segan@stocadvisory.com,SPUSA - Flanigan Dentistry (Dr. John Flanigan),3
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - La Cantera Dental Group,1
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Lakeview Smiles (Dr. Grace Lee),14
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,2
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),3.5
Egan,Sean,segan@stocadvisory.com,Vacation,4
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,13
`;

// Week 4: Oct 19 - Oct 25
const rawData4 = `lname,fname,username,job_code,hours
McFadden,Brandon,bmcfadden@stocadvisory.com,ADP - Childrens Dental of Hamden,13
Sundar,Barath,bsundar@stocadvisory.com,ADP - Childrens Dental of Hamden,8
Earp,Ryan,rearp@stocadvisory.com,ADP - Childrens Dental of Hamden,11.5
Nguyen,Hung,hnguyen@stocadvisory.com,ADP - Riverview Dental,1.5
Earp,Ryan,rearp@stocadvisory.com,ADP - Riverview Dental,5.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Blink Optometry (Drs. Fogg & Barseghian),1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Bright Family Eye Care (Dr. Hornberger),11.5
Earp,Ryan,rearp@stocadvisory.com,AEG - ClearVue EyeCare,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - ClearVue EyeCare,3
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Coffman Vision Clinic (Dr. Coffman),3.5
Earp,Ryan,rearp@stocadvisory.com,AEG - Community Eyecare,7
 Goodman, & Israel),Luetgers,AEG - Community Vision Optometric Center (Drs. Collins,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Dove Canyon Optometry (Dr. Kostura),0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Eye Was Framed (Dr. Nadel),3
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),0.36
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),4
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),4
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Focus Eye Care (Dr. Esperon),1.25
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),8
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),12.14
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),23
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),12
Earp,Ryan,rearp@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),9.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Northeast Eye Center (Dr. Martinez),2
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Northeast Eye Center (Dr. Martinez),8
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,1.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Somerville Family Eyecare,12
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Sound Beach Optiks,1
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),5.5
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),1
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),9.5
 Kingwood, Rayford & Riverstone (Dr. Pham),Jadhav,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
Earp,Ryan,rearp@stocadvisory.com,AEG - Valley Vision Eye Care,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Valley Vision Eye Care,5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,5
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,15
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,5
Gliniecki,John,jgliniecki@stocadvisory.com,Administrative,8.6
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,3.5
Earp,Ryan,rearp@stocadvisory.com,Administrative,1
Egan,Sean,segan@stocadvisory.com,Administrative,18.5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,1
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,8
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,1
Garg,Vishal,vgarg@stocadvisory.com,Administrative,10
Gliniecki,John,jgliniecki@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,1
Egan,Sean,segan@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,1.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral - Cedar Park Psychiatry,8
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,9
Thamsir,Thomson,tthamsir@stocadvisory.com,Beacon Behavioral - Cedar Park Psychiatry,2
Gliniecki,John,jgliniecki@stocadvisory.com,Beacon Behavioral - Daytona (Frick),12.9
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral - Daytona (Frick),7
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Daytona (Frick),2
Garg,Vishal,vgarg@stocadvisory.com,Beacon Behavioral - Daytona (Frick),4
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral Partners - SunCoast,10.5
Garg,Vishal,vgarg@stocadvisory.com,Beacon Behavioral Partners - SunCoast,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,12
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,41.8
Sharma,Mohit,msharma@stocadvisory.com,Business Development,32.6
D,Ramya,ramya@stocadvisory.com,Business Development,44.32
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,44.36
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,45.59
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,46.32
Saxena,Arjit,asaxena@stocadvisory.com,Holiday,8
Sundar,Barath,bsundar@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Holiday,8
Singh,Jogendra,jrathore@stocadvisory.com,Holiday,10
Sharma,Mohit,msharma@stocadvisory.com,Holiday,10
Hariram,Pradeep,phariram@stocadvisory.com,Holiday,8
Jadhav,Pravin,pjadhav@stocadvisory.com,Holiday,8
D,Ramya,ramya@stocadvisory.com,Holiday,8
Nayak,Rakesh,rnayak@stocadvisory.com,Holiday,10
Tuli,Rahul,rtuli@stocadvisory.com,Holiday,8
Joseph,Stefan,sjoseph@stocadvisory.com,Holiday,10
Garg,Vishal,vgarg@stocadvisory.com,Holiday,16
Govind,Vaishnav,vgovind@stocadvisory.com,Holiday,10
Tuli,Rahul,rtuli@stocadvisory.com,InReach - Project Rural,37.36
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Recruiting,2
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,19
Garg,Vishal,vgarg@stocadvisory.com,Riata - Government Window,5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,21
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Berkeley & Orinda Orthodontics,4
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,4
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkowitz Ortho,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,3
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,11
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,13.5
Gliniecki,John,jgliniecki@stocadvisory.com,SP USA - Weekly Sales Dashboard,3.1
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,3.5
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Alpine Dental,3.3
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Alpine Dental,8
Egan,Sean,segan@stocadvisory.com,SPUSA - Alpine Dental,4
Egan,Sean,segan@stocadvisory.com,SPUSA - Atlanta Endodontics (Dr. Slosberg),1
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SPUSA - Dental Health & Beauty (Dr. Polito),1
Gliniecki,John,jgliniecki@stocadvisory.com,SPUSA - Favia Family Dental,11.2
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Favia Family Dental,24
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,4.5
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),8
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),1.5
Egan,Sean,segan@stocadvisory.com,SPUSA - La Cantera Dental Group,2.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Lakeview Smiles (Dr. Grace Lee),0.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,3
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Mentor and Salon Smiles,3
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Pro Dentists of Buford (Dr. Curington),16
Egan,Sean,segan@stocadvisory.com,SPUSA - Pro Dentists of Buford (Dr. Curington),5
McFadden,Brandon,bmcfadden@stocadvisory.com,Training and Development,27
Hottman,Matthew,mhottman@stocadvisory.com,Vacation,16
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,8
`;

// Week 5: Oct 26 - Nov 1
const rawData5 = `lname,fname,username,job_code,hours
Earp,Ryan,rearp@stocadvisory.com,ADP - Childrens Dental of Hamden,1
Nguyen,Hung,hnguyen@stocadvisory.com,ADP - Riverview Dental,3.5
Earp,Ryan,rearp@stocadvisory.com,ADP - Riverview Dental,1
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Coffman Vision Clinic (Dr. Coffman),6.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Coffman Vision Clinic (Dr. Coffman),18
 PLLC (Dr. Arroyo),Luetgers,Sam,AEG - Eye Health Consultants of Texas,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Eye Was Framed (Dr. Nadel),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),9
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),14
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Federal Hill Eye Care,11.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,2
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),2.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),12
Earp,Ryan,rearp@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),10.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Northeast Eye Center (Dr. Martinez),7
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Northeast Eye Center (Dr. Martinez),8
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,4
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,AEG - Purchase Price Allocation,5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,4
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Reckley Eye Center,4
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Somerville Family Eyecare,2
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Somerville Family Eyecare,4
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Somerville Family Eyecare,2
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),14
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),17
 Kingwood, Rayford & Riverstone (Dr. Pham),Nguyen,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Jadhav,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Valley Vision Eye Care,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,3.5
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,3
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,18
Sundar,Barath,bsundar@stocadvisory.com,Administrative,13
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,16
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,14
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,2
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,7
Earp,Ryan,rearp@stocadvisory.com,Administrative,1
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,9.62
Egan,Sean,segan@stocadvisory.com,Administrative,8
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,10
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,1
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral - Daytona (Frick),11
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,10
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,52.24
Sharma,Mohit,msharma@stocadvisory.com,Business Development,43.04
D,Ramya,ramya@stocadvisory.com,Business Development,55.15
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,55.29
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,55.39
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,57.15
Tuli,Rahul,rtuli@stocadvisory.com,InReach - Project Rural,12.51
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Recruiting,5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,12
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,14
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,0.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkowitz Ortho,8
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Berkowitz Ortho,2
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,15
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,SALT - MyOrthodontist,5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,14
Tuli,Rahul,rtuli@stocadvisory.com,SALT - MyOrthodontist,18.28
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),11
Hariram,Pradeep,phariram@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),2
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,3
Egan,Sean,segan@stocadvisory.com,SPUSA - Alpine Dental,1.5
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Favia Family Dental,24
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,6
McFadden,Brandon,bmcfadden@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),10
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),16
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),9
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),33
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Lakeview Smiles (Dr. Grace Lee),2
Gliniecki,John,jgliniecki@stocadvisory.com,Vacation,40
Hottman,Matthew,mhottman@stocadvisory.com,Vacation,24
Sharma,Mohit,msharma@stocadvisory.com,Vacation,10
Egan,Sean,segan@stocadvisory.com,Vacation,16
`;

// Week 6: Nov 2 - Nov 8
const rawData6 = `lname,fname,username,job_code,hours
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bellmawr Eye Care,1
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Bellmawr Eye Care,20
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bright Family Eye Care (Dr. Hornberger),1
Earp,Ryan,rearp@stocadvisory.com,AEG - ClearVue EyeCare,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Coffman Vision Clinic (Dr. Coffman),18
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),2
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Federal Hill Eye Care,10
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,3
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Fields of Vision Eye Care,0.5
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Lifetime Vision Source,11
Hottman,Matthew,mhottman@stocadvisory.com,AEG - Lifetime Vision Source,7.5
Tuli,Rahul,rtuli@stocadvisory.com,AEG - Lifetime Vision Source,18.9
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Lifetime Vision Source,1.75
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),0.75
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),6
 Mariscotti & Riegel),Luetgers,Sam,AEG - Morrison Eye Associates (Drs. McLin,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Northeast Eye Center (Dr. Martinez),4.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),20
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Somerville Family Eyecare,3
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),25
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),1.75
Earp,Ryan,rearp@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),2
 Kingwood, Rayford & Riverstone (Dr. Pham),Nguyen,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Jadhav,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Luetgers,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,5
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,6
Sundar,Barath,bsundar@stocadvisory.com,Administrative,10
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,2.5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,3
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,1
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,7
Earp,Ryan,rearp@stocadvisory.com,Administrative,12
Egan,Sean,segan@stocadvisory.com,Administrative,11.5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,4
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,6
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,1.5
Garg,Vishal,vgarg@stocadvisory.com,Administrative,7
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral - Daytona (Frick),14
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Daytona (Frick),20
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,18
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,52.32
Sharma,Mohit,msharma@stocadvisory.com,Business Development,44.8
D,Ramya,ramya@stocadvisory.com,Business Development,55.37
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,54.27
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,58.08
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,58.11
Sundar,Barath,bsundar@stocadvisory.com,CPC - Canine Country Club,16
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,InReach - Project Rural,8
Tuli,Rahul,rtuli@stocadvisory.com,InReach - Project Rural,20.66
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Recruiting,4
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,13
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,3
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,1.87
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,8
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,5.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkowitz Ortho,2
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkowitz Ortho,6.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,1.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Hampton OMS,11.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Hampton OMS,8
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Hampton OMS,7
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Julia Cerny,1.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Julia Cerny,6
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Julia Cerny,1.15
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,17
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,1
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Suffolk Pedo Dentistry & Ortho,6.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,0.5
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - World of Smiles,1.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - World of Smiles,1
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,13
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - AC Dentistry (Dr. Adam Cotant),3
Egan,Sean,segan@stocadvisory.com,SPUSA - Alpine Dental,1
Egan,Sean,segan@stocadvisory.com,SPUSA - Dental Health & Beauty (Dr. Polito),1.5
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Favia Family Dental,6
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Favia Family Dental,23
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,10
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),8
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),5.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),5
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),9.5
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),23.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,2
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - StoneCreek,8
Egan,Sean,segan@stocadvisory.com,SPUSA - StoneCreek,6
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),1.5
Sharma,Mohit,msharma@stocadvisory.com,Vacation,10
`;

// Week 7: Nov 9 - Nov 15
const rawData7 = `lname,fname,username,job_code,hours
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Canby Eyecare,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Coffman Vision Clinic (Dr. Coffman),1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Coffman Vision Clinic (Dr. Coffman),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - DeBoer Family Eye Care,0.5
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Federal Hill Eye Care,5.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,2
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Fields of Vision Eye Care,27.12
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Fields of Vision Eye Care (Dr. Fields),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Focus Eye Care (Dr. Esperon),0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Hopewell Eye Associates (Dr. Daniels),0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Latham Family Vision (Dr. Loccisano & Ms. Basile),0.5
Saxena,Arjit,asaxena@stocadvisory.com,AEG - Lifetime Vision Source,6
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Lifetime Vision Source,5.5
Hottman,Matthew,mhottman@stocadvisory.com,AEG - Lifetime Vision Source,6.5
Tuli,Rahul,rtuli@stocadvisory.com,AEG - Lifetime Vision Source,7.47
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Lifetime Vision Source,2
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Los Altos Optometric Group & Pacific Eye Care Optometry,0.5
 Mariscotti & Riegel),Luetgers,Sam,AEG - Morrison Eye Associates (Drs. McLin,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),8
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,2
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,14.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),2.5
 Kingwood, Rayford & Riverstone (Dr. Pham),Nguyen,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Jadhav,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Luetgers,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,4.5
Garg,Vishal,vgarg@stocadvisory.com,AEG - Winchester Vision Care,3.5
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,8.5
Sundar,Barath,bsundar@stocadvisory.com,Administrative,8
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,8.5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,3
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,1.5
Egan,Sean,segan@stocadvisory.com,Administrative,5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,2
Garg,Vishal,vgarg@stocadvisory.com,Administrative,8
McFadden,Brandon,bmcfadden@stocadvisory.com,Archway - Westchester County,2
Hariram,Pradeep,phariram@stocadvisory.com,Archway - Westchester County,5
Egan,Sean,segan@stocadvisory.com,Archway - Westchester County,4
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Beacon Behavioral - Daytona (Frick),17
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Daytona (Frick),14
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,7
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,54.24
Sharma,Mohit,msharma@stocadvisory.com,Business Development,55.76
D,Ramya,ramya@stocadvisory.com,Business Development,56.58
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,55.86
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,58.17
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,58.49
Sundar,Barath,bsundar@stocadvisory.com,CPC - Canine Country Club,8
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Canine Country Club,3.5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,InReach - Project Rural,34
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,InReach - Project Rural,11.5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,7
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,13.5
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,33.62
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Berkeley & Orinda Orthodontics,2.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,5.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Haeger Orthodontics,2
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Haeger Orthodontics,4
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,4.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Haeger Orthodontics,10.66
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Hampton OMS,18
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Hampton OMS,15
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Hampton OMS,9.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,16
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,1
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),7
Hariram,Pradeep,phariram@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),2
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,4
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - AC Dentistry (Dr. Adam Cotant),8
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Dental Health & Beauty (Dr. Polito),6
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Dental Health & Beauty (Dr. Polito),5
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Favia Family Dental,1
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,10
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),8
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),3.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),1
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),8
Egan,Sean,segan@stocadvisory.com,SPUSA - Geise Dental,2
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Geise Dental,9
Egan,Sean,segan@stocadvisory.com,SPUSA - Grace Dental,2.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),1.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),8.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SPUSA - Kedron Village Dental (Dr. Turkiewicz),7
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),3.5
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - La Cantera Dental Group,8
Egan,Sean,segan@stocadvisory.com,SPUSA - La Cantera Dental Group,1
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Lakeview Smiles (Dr. Grace Lee),8
Egan,Sean,segan@stocadvisory.com,SPUSA - Lakeview Smiles (Dr. Grace Lee),4.5
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Landmark Dentistry,7
Egan,Sean,segan@stocadvisory.com,SPUSA - Landmark Dentistry,2
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,3
Egan,Sean,segan@stocadvisory.com,SPUSA - StoneCreek,1
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),1
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,8
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Vacation,40
`;

// Week 8: Nov 16 - Nov 22
const rawData8 = `lname,fname,username,job_code,hours
Egan,Sean,segan@stocadvisory.com,ADP - Riverview Dental,3.25
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bellmawr Eye Care,1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,1.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Canby Eyecare,23.52
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Canby Eyecare,0.5
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,2.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,0.5
Garg,Vishal,vgarg@stocadvisory.com,AEG - Child and Family Eye Care Center,16
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Federal Hill Eye Care,15
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,7
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Fields of Vision Eye Care,28.7
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Fields of Vision Eye Care (Dr. Fields),7
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,2
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,AEG - Purchase Price Allocation,3
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,15.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - TSO - Allen & Rockwall (Dr. Robertson),11
 Kingwood, Rayford & Riverstone (Dr. Pham),Nguyen,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Luetgers,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,3.5
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,6.5
Sundar,Barath,bsundar@stocadvisory.com,Administrative,8
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,14
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,3
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,1
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,9
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,3.15
Egan,Sean,segan@stocadvisory.com,Administrative,11
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,0.5
Garg,Vishal,vgarg@stocadvisory.com,Administrative,2
Hariram,Pradeep,phariram@stocadvisory.com,Archway - Plainville & Waterbury,2
Egan,Sean,segan@stocadvisory.com,Archway - Westchester County,3.25
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Daytona (Frick),5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,15
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,54.13
Sharma,Mohit,msharma@stocadvisory.com,Business Development,56.69
D,Ramya,ramya@stocadvisory.com,Business Development,53.82
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,56.73
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,61.63
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,57.12
Pandey,Sharvan,spandey@stocadvisory.com,Business Development - CBS,48
Luetgers,Sam,sluetgers@stocadvisory.com,Business Development - STOC,7
Sundar,Barath,bsundar@stocadvisory.com,CPC - Canine Country Club,24
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Canine Country Club,8
Hariram,Pradeep,phariram@stocadvisory.com,CPC - Canine Country Club,6
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,1
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,InReach - Project Rural,11
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,22
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,15
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,11.35
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,23
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,12.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Haeger Orthodontics,1
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Haeger Orthodontics,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,2.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Haeger Orthodontics,6.82
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Hampton OMS,7
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Hampton OMS,12.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Hampton OMS,8
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston OMS,2
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,1.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Houston OMS,21.9
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,9
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,0.5
Hariram,Pradeep,phariram@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),10
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,5.5
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Chelsea Comprehensive Dental (Dr. Draiss),4
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Chelsea Comprehensive Dental (Dr. Draiss),15
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Dental Associates of Boca Raton (Dr. Costabile),3.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Dental Health & Beauty (Dr. Polito),1.5
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Favia Family Dental,12
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,10.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SPUSA - Favia Family Dental,7
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Favia Family Dental,5
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),1
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),1
Egan,Sean,segan@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),2
Egan,Sean,segan@stocadvisory.com,SPUSA - Grace Dental,1.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),5
Egan,Sean,segan@stocadvisory.com,SPUSA - Landmark Dentistry,1.5
Egan,Sean,segan@stocadvisory.com,SPUSA - StoneCreek,2
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),1
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Welch Dentistry,8
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Welch Dentistry,3.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Vacation,40
`;

// Week 9: Nov 23 - Nov 29
const rawData9 = `lname,fname,username,job_code,hours
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,ADP - Riverview Dental,2
McFadden,Brandon,bmcfadden@stocadvisory.com,ADP - Valhalla,5.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Bellmawr Eye Care,20
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Blink Optometry (Drs. Fogg & Barseghian),0.5
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,2.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Canby Eyecare,31.1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,3
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Child and Family Eye Care Center,9.31
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - ClearVue EyeCare,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),3
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),20
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Family Eye Associates (Drs. Diering & Longo),0.5
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Fields of Vision Eye Care,12.03
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Fields of Vision Eye Care (Dr. Fields),9
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Somerville Family Eyecare,0.5
 Kingwood, Rayford & Riverstone (Dr. Pham),Luetgers,AEG - TSO - Richmond Aliana,0
 Kingwood, Rayford & Riverstone (Dr. Pham),Thamsir,AEG - TSO - Richmond Aliana,0
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Valley Vision Eye Care,0.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,3
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,1.5
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,4.5
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,11
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,2
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,0.5
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,23
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,4.22
Egan,Sean,segan@stocadvisory.com,Administrative,8
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,1.75
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,8
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,0.5
Garg,Vishal,vgarg@stocadvisory.com,Administrative,8
Sundar,Barath,bsundar@stocadvisory.com,Archway - Westchester County,8
Hariram,Pradeep,phariram@stocadvisory.com,Archway - Westchester County,13
Egan,Sean,segan@stocadvisory.com,Archway - Westchester County,1
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Daytona (Frick),9
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,7
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,53.85
Sharma,Mohit,msharma@stocadvisory.com,Business Development,45.42
D,Ramya,ramya@stocadvisory.com,Business Development,55.18
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,35.06
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,56.2
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,58.84
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,47.38
Sundar,Barath,bsundar@stocadvisory.com,CPC - Canine Country Club,16
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Canine Country Club,4
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,1
Garg,Vishal,vgarg@stocadvisory.com,CPC - Canine Country Club,7
McFadden,Brandon,bmcfadden@stocadvisory.com,Holiday,16
Hottman,Matthew,mhottman@stocadvisory.com,Holiday,16
Luetgers,Sam,sluetgers@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,32
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,11.5
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,27.09
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,14.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,2.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,2.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Haeger Orthodontics,5.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Haeger Orthodontics,1.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,1
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Haeger Orthodontics,1.14
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Hampton OMS,2.5
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Hampton OMS,7
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Hampton OMS,5.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston OMS,4
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston OMS,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,2.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Houston OMS,5.98
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,14.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,1
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,2.5
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Chelsea Comprehensive Dental (Dr. Draiss),4
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Chelsea Comprehensive Dental (Dr. Draiss),1
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Dental Associates of Boca Raton (Dr. Costabile),2
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,6
Egan,Sean,segan@stocadvisory.com,SPUSA - Foley Family Dentistry (Dr. Fetner),1
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Geise Dental,1
McFadden,Brandon,bmcfadden@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),1
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),3
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),4
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),1
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Welch Dentistry,14
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Welch Dentistry,5
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Welch Dentistry,2
Garg,Vishal,vgarg@stocadvisory.com,Sick,32
Sharma,Mohit,msharma@stocadvisory.com,Vacation,10
Nayak,Rakesh,rnayak@stocadvisory.com,Vacation,20
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,8
`;

// Week 10: Nov 30 - Dec 6
const rawData10 = `lname,fname,username,job_code,hours
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Emma Wu and Associates,2
Garg,Vishal,vgarg@stocadvisory.com,ADP - Messenger Digital Dentistry (Dr. Messenger),16
McFadden,Brandon,bmcfadden@stocadvisory.com,ADP - Valhalla,4
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,ADP - Valhalla,1
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Valhalla,18
Egan,Sean,segan@stocadvisory.com,ADP - Valhalla,5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Alta Loma Optometric,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),1.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bellmawr Eye Care,1
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Bellmawr Eye Care,19
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Canby Eyecare,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Chicago Eye Care Center,1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),1
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),22
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Fields of Vision Eye Care (Dr. Fields),1.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Fields of Vision Eye Care (Dr. Fields),7.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - InFocus & American Eyecare (Dr. Krauchunas & Mr. McDonald),1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Lifetime Vision Source,12.5
Tuli,Rahul,rtuli@stocadvisory.com,AEG - Lifetime Vision Source,7.12
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Lifetime Vision Source,19
Nguyen,Hung,hnguyen@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),1.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Madison Eyes (Dr. Naftali),3
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,2
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,25
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Sound Beach Optiks,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,4
Sheehy,Aidan,asheehy@stocadvisory.com,Administrative,22
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,6
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,14
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,0.5
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,17
Egan,Sean,segan@stocadvisory.com,Administrative,10.5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,5
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,0.5
Garg,Vishal,vgarg@stocadvisory.com,Administrative,3.5
Hariram,Pradeep,phariram@stocadvisory.com,Archway - Westchester County,4
Egan,Sean,segan@stocadvisory.com,Archway - Westchester County,2.5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,10
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,53.57
Hottman,Matthew,mhottman@stocadvisory.com,Business Development,1
Sharma,Mohit,msharma@stocadvisory.com,Business Development,45.73
D,Ramya,ramya@stocadvisory.com,Business Development,56.05
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,56.9
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,59.39
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,56.71
Luetgers,Sam,sluetgers@stocadvisory.com,Business Development - STOC,6
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,CDS - Tableau,1
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,45.15
Sundar,Barath,bsundar@stocadvisory.com,CPC - Canine Country Club,30
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Canine Country Club,13.5
Hariram,Pradeep,phariram@stocadvisory.com,CPC - Canine Country Club,2
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,7
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,31
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,11
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,27.23
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,1
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,2
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Berkeley & Orinda Orthodontics,9.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,15
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,8.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Haeger Orthodontics,4
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Haeger Orthodontics,3
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,1
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Hampton OMS,1.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Hampton OMS,4
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Hampton OMS,8
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,2
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,29.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,2.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,2
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,1
Egan,Sean,segan@stocadvisory.com,SP - Chelsea Family,3.5
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),3
Egan,Sean,segan@stocadvisory.com,SP USA - Weekly Sales Dashboard,2
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,6
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Alongi Dental (Dr. Alongi),1.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Alongi Dental (Dr. Alongi),1
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Alongi Dental (Dr. Alongi),4.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SPUSA - Bloomfield Hills Dental Associates (Dr. Nafso),4
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Chelsea Comprehensive Dental (Dr. Draiss),1
Sheehy,Aidan,asheehy@stocadvisory.com,SPUSA - Cheyenne Mountain Dental Group (Dr. Davis),7
Egan,Sean,segan@stocadvisory.com,SPUSA - Cheyenne Mountain Dental Group (Dr. Davis),2
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Cheyenne Mountain Dental Group (Dr. Davis),8
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Favia Family Dental,0.5
Sheehy,Aidan,asheehy@stocadvisory.com,SPUSA - Geise Dental,8
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,0.5
Sheehy,Aidan,asheehy@stocadvisory.com,SPUSA - Welch Dentistry,6
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Welch Dentistry,6
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Welch Dentistry,6.5
Garg,Vishal,vgarg@stocadvisory.com,Sick,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Training and Development,1
Sharma,Mohit,msharma@stocadvisory.com,Vacation,10
Jadhav,Pravin,pjadhav@stocadvisory.com,Vacation,40
Egan,Sean,segan@stocadvisory.com,Vacation,4
`;

// Week 11: Dec 7 - Dec 13
const rawData11 = `lname,fname,username,job_code,hours
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Alan Wolkoff,1
Sundar,Barath,bsundar@stocadvisory.com,ADP - Alan Wolkoff,16
Nguyen,Hung,hnguyen@stocadvisory.com,ADP - Alan Wolkoff,0.5
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Emma Wu and Associates,13
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Emma Wu and Associates,8
Egan,Sean,segan@stocadvisory.com,ADP - Emma Wu and Associates,1
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Messenger Digital Dentistry (Dr. Messenger),9
Nguyen,Hung,hnguyen@stocadvisory.com,ADP - Messenger Digital Dentistry (Dr. Messenger),1
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Messenger Digital Dentistry (Dr. Messenger),5
Garg,Vishal,vgarg@stocadvisory.com,ADP - Messenger Digital Dentistry (Dr. Messenger),3
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Valhalla,2
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Valhalla,4
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),43.73
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),6.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Bellmawr Eye Care,11
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Bellmawr Eye Care,17
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,13
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Canby Eyecare,6.4
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Chicago Eye Care Center,1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,4
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,1
Garg,Vishal,vgarg@stocadvisory.com,AEG - Child and Family Eye Care Center,8
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),12
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Eyes of Hermosa (Dr. Pham),20
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Fields of Vision Eye Care (Dr. Fields),16.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Global Eyecare Optometry (Dr. Cheng),0.5
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Lifetime Vision Source,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Livermore Optometry Group (Drs. Faith & Kuntz),0.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,0.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,8
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Reckley Eye Center,0.25
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - South Shore Eye Center,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,4
Sheehy,Aidan,asheehy@stocadvisory.com,Administrative,20
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,5
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,16
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,3
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,1
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,10.24
Egan,Sean,segan@stocadvisory.com,Administrative,11.5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,6
Thamsir,Thomson,tthamsir@stocadvisory.com,Administrative,2
Garg,Vishal,vgarg@stocadvisory.com,Administrative,7
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,6
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,53.88
Sharma,Mohit,msharma@stocadvisory.com,Business Development,57.76
D,Ramya,ramya@stocadvisory.com,Business Development,54.78
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,54.99
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,60.83
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,53.87
Luetgers,Sam,sluetgers@stocadvisory.com,Business Development - STOC,8
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,49.62
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Home Away From Home,6
Garg,Vishal,vgarg@stocadvisory.com,CPC - Home Away From Home,25
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,39
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,12.5
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,22.24
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,16
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,1.5
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Alden Bridge Pediatric Dentistry,9
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,2
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,2.94
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,1.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,1.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,4.44
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Haeger Orthodontics,9.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Haeger Orthodontics,6
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,8
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Hampton OMS,2
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston OMS,1
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston OMS,5
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Houston OMS,4.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Houston OMS,2.23
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,10.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,2
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,3.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,3
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,0.5
Egan,Sean,segan@stocadvisory.com,SP USA - Weekly Sales Dashboard,4
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,6
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Alongi Dental (Dr. Alongi),2
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Alongi Dental (Dr. Alongi),2
Egan,Sean,segan@stocadvisory.com,SPUSA - Chelsea Comprehensive Dental (Dr. Draiss),1
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Cheyenne Mountain Dental Group (Dr. Davis),1.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,2
Egan,Sean,segan@stocadvisory.com,SPUSA - Geise Dental,6
Sheehy,Aidan,asheehy@stocadvisory.com,SPUSA - Great Florida Smiles and Orthodontics (Dr. O'Donnell),3
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Great Florida Smiles and Orthodontics (Dr. O'Donnell),22
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Great Florida Smiles and Orthodontics (Dr. O'Donnell),5
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Holly Dental,2
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Holly Dental,7
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),1
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Kreit Dental Offices (Dr. Kreit),5.5
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Kreit Dental Offices (Dr. Kreit),14
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,5
Egan,Sean,segan@stocadvisory.com,SPUSA - Town Dentistry (Dr. Frodge),3
Sundar,Barath,bsundar@stocadvisory.com,SPUSA - Welch Dentistry,2
Nguyen,Hung,hnguyen@stocadvisory.com,SPUSA - Welch Dentistry,1.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Welch Dentistry,2.5
Thamsir,Thomson,tthamsir@stocadvisory.com,Training and Development,1.5
Egan,Sean,segan@stocadvisory.com,Vacation,8
`;

// Week 12: Dec 14 - Dec 20
const rawData12 = `lname,fname,username,job_code,hours
Egan,Sean,segan@stocadvisory.com,ADP - Emma Wu and Associates,3
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,9
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),46.78
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),15
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,15
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Canby Eyecare,4.65
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Chicago Eye Care Center,30
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,3.5
Garg,Vishal,vgarg@stocadvisory.com,AEG - Child and Family Eye Care Center,4
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Fields of Vision Eye Care (Dr. Fields),6.5
Garg,Vishal,vgarg@stocadvisory.com,AEG - Hawks Prairie Vision Clinic,8
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Other Workstreams,1.5
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Purchase Price Allocation,9.5
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - South Shore Eye Center,1
Thamsir,Thomson,tthamsir@stocadvisory.com,AEG - Weekly Sales Dashboard,4
Sheehy,Aidan,asheehy@stocadvisory.com,Administrative,12
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,2.5
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,7
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,5
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,1
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,11
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,2.35
Egan,Sean,segan@stocadvisory.com,Administrative,16.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,10
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,3
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,53.37
Sharma,Mohit,msharma@stocadvisory.com,Business Development,56.02
D,Ramya,ramya@stocadvisory.com,Business Development,55.4
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,55.45
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,58.16
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,58.37
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Business Development - STOC,6.5
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,51.74
Sundar,Barath,bsundar@stocadvisory.com,CPC - Canine Country Club,16.5
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Canine Country Club,5.5
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,8
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Home Away From Home,15.5
Garg,Vishal,vgarg@stocadvisory.com,CPC - Home Away From Home,30
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,39
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,13
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,23.08
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,12
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,1.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkowitz Ortho,0.75
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,4.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,16.93
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Haeger Orthodontics,10
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Haeger Orthodontics,7.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,7
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Hampton OMS,8
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Hampton OMS,2.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Hampton OMS,4.75
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston OMS,16
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston OMS,5.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,6.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,4
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,1.5
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Suffolk Pedo Dentistry & Ortho,3.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,0.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SALT - Suffolk Pedo Dentistry & Ortho,3
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),22.5
Nguyen,Hung,hnguyen@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),11.5
Hariram,Pradeep,phariram@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),11
Egan,Sean,segan@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),7
Nguyen,Hung,hnguyen@stocadvisory.com,SP USA - Sage Import & Closing Recon,0.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,4
Sheehy,Aidan,asheehy@stocadvisory.com,SPUSA - Clocktower Family Dental,3
Egan,Sean,segan@stocadvisory.com,SPUSA - Favia Family Dental,2
Sheehy,Aidan,asheehy@stocadvisory.com,SPUSA - Great Florida Smiles and Orthodontics (Dr. O'Donnell),4
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Holly Dental,8
Egan,Sean,segan@stocadvisory.com,SPUSA - Kedron Village Dental (Dr. Turkiewicz),2
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Lakeview Smiles (Dr. Grace Lee),4
Egan,Sean,segan@stocadvisory.com,SPUSA - Lakeview Smiles (Dr. Grace Lee),2
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Mentor and Salon Smiles,5
Egan,Sean,segan@stocadvisory.com,SPUSA - Mentor and Salon Smiles,2
Egan,Sean,segan@stocadvisory.com,SPUSA - Welch Dentistry,1
Sheehy,Aidan,asheehy@stocadvisory.com,Vacation,16
`;

// Week 13: Dec 21 - Dec 27
const rawData13 = `lname,fname,username,job_code,hours
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,19
Sundar,Barath,bsundar@stocadvisory.com,ADP - Tearsheet,16
Egan,Sean,segan@stocadvisory.com,ADP - Tearsheet,2
Garg,Vishal,vgarg@stocadvisory.com,ADP - Tearsheet,16
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),6.17
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,1.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Chicago Eye Care Center,12
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,4
Garg,Vishal,vgarg@stocadvisory.com,AEG - Child and Family Eye Care Center,8
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,15.19
Sheehy,Aidan,asheehy@stocadvisory.com,Administrative,9
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,7
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,2
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,5
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,13
Egan,Sean,segan@stocadvisory.com,Administrative,4
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,12
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,2
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,43.23
Sharma,Mohit,msharma@stocadvisory.com,Business Development,45.84
D,Ramya,ramya@stocadvisory.com,Business Development,44
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,32.76
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,49
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,46.57
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Business Development - STOC,5
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,45.76
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,4
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,CPC - Canine Country Club,5.5
Egan,Sean,segan@stocadvisory.com,CPC - Home Away From Home,3.5
Garg,Vishal,vgarg@stocadvisory.com,CPC - Home Away From Home,7
Sheehy,Aidan,asheehy@stocadvisory.com,Holiday,16
McFadden,Brandon,bmcfadden@stocadvisory.com,Holiday,20
Sundar,Barath,bsundar@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Holiday,8
Singh,Jogendra,jrathore@stocadvisory.com,Holiday,10
Hottman,Matthew,mhottman@stocadvisory.com,Holiday,16
Sharma,Mohit,msharma@stocadvisory.com,Holiday,10
Hariram,Pradeep,phariram@stocadvisory.com,Holiday,8
Nayak,Rakesh,rnayak@stocadvisory.com,Holiday,10
Pandey,Sharvan,spandey@stocadvisory.com,Holiday,8
Garg,Vishal,vgarg@stocadvisory.com,Holiday,8
Govind,Vaishnav,vgovind@stocadvisory.com,Holiday,10
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,24
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,5
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,17.37
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,1
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,6.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,0.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Haeger Orthodontics,4.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,3.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston OMS,12.5
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston OMS,2
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,0.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,4
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston Pediatric Dental Specialists,1
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,16
Hottman,Matthew,mhottman@stocadvisory.com,SALT - MyOrthodontist,1.5
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),14
Egan,Sean,segan@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),4.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,0.5
Hariram,Pradeep,phariram@stocadvisory.com,SPUSA - Kreit Dental Offices (Dr. Kreit),11
Garg,Vishal,vgarg@stocadvisory.com,SPUSA - Kreit Dental Offices (Dr. Kreit),1.5
Hariram,Pradeep,phariram@stocadvisory.com,Sick,8
Nguyen,Hung,hnguyen@stocadvisory.com,Vacation,24
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Vacation,8
Hottman,Matthew,mhottman@stocadvisory.com,Vacation,8
Jadhav,Pravin,pjadhav@stocadvisory.com,Vacation,16
Nayak,Rakesh,rnayak@stocadvisory.com,Vacation,10
Tuli,Rahul,rtuli@stocadvisory.com,Vacation,16
Egan,Sean,segan@stocadvisory.com,Vacation,8
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,24
`;

// Week 14: Dec 28 - Jan 3
const rawData14 = `lname,fname,username,job_code,hours
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Corp Dev Support (Tearsheet),21
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Emma Wu and Associates,2
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,32
Egan,Sean,segan@stocadvisory.com,ADP - Tearsheet,2
Garg,Vishal,vgarg@stocadvisory.com,ADP - Tearsheet,19.5
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Valhalla,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Alta Loma Optometric,1
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Canby Eyecare,1
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,AEG - Chicago Eye Care Center,12
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,6
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,1.5
Garg,Vishal,vgarg@stocadvisory.com,AEG - Child and Family Eye Care Center,8
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Federal Hill Eye Care,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Lifetime Vision Source,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Manhattan Vision & Queens Eye Associates,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Metropolitan Vision,0.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Optometric Images Vision Center (Drs. Ramsey & Ozaki),1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,1
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - TSO - Capital Plaza (Dr. Amin),2
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,3.5
Sheehy,Aidan,asheehy@stocadvisory.com,Administrative,5
McFadden,Brandon,bmcfadden@stocadvisory.com,Administrative,6
Nguyen,Hung,hnguyen@stocadvisory.com,Administrative,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Administrative,2
Hottman,Matthew,mhottman@stocadvisory.com,Administrative,3.5
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,3.5
Siddiqui,Saqib,ssiddiqui@stocadvisory.com,Administrative,12
Luetgers,Sam,sluetgers@stocadvisory.com,Beacon Behavioral - Hawkins Psychiatry,5
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Business Development,1
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,44.88
Sharma,Mohit,msharma@stocadvisory.com,Business Development,44.28
D,Ramya,ramya@stocadvisory.com,Business Development,32.85
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,43.26
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,46.57
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,44.46
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,Business Development - STOC,10.5
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,41.6
Egan,Sean,segan@stocadvisory.com,CPC - Canine Country Club,4.5
Nguyen,Hung,hnguyen@stocadvisory.com,CPC - Home Away From Home,2.5
Hariram,Pradeep,phariram@stocadvisory.com,CPC - Home Away From Home,8
Egan,Sean,segan@stocadvisory.com,CPC - Home Away From Home,4.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,CPC - Home Away From Home,6.5
Sheehy,Aidan,asheehy@stocadvisory.com,Holiday,9
McFadden,Brandon,bmcfadden@stocadvisory.com,Holiday,8
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Holiday,8
Singh,Jogendra,jrathore@stocadvisory.com,Holiday,10
Hottman,Matthew,mhottman@stocadvisory.com,Holiday,8
Sharma,Mohit,msharma@stocadvisory.com,Holiday,10
D,Ramya,ramya@stocadvisory.com,Holiday,8
Nayak,Rakesh,rnayak@stocadvisory.com,Holiday,10
Pandey,Sharvan,spandey@stocadvisory.com,Holiday,8
Garg,Vishal,vgarg@stocadvisory.com,Holiday,8
Govind,Vaishnav,vgovind@stocadvisory.com,Holiday,11
Chiramkara,Jishnu,jchiramkara@stocadvisory.com,Riata - Government Window,30
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,9
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,2.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,1
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Haeger Orthodontics,3
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,2
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Houston OMS,4
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Houston OMS,3
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,5.5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - MyOrthodontist,5
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,30
Gupta,Kirti,kirti.g@bpsanalytics.co.in,SALT - Suffolk Pedo Dentistry & Ortho,7
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,7.5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SALT - Suffolk Pedo Dentistry & Ortho,0.5
Sundar,Barath,bsundar@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),25
Nguyen,Hung,hnguyen@stocadvisory.com,SP USA - Practice Analysis (Pre-LOI),21
Egan,Sean,segan@stocadvisory.com,SP USA - Sage Import & Closing Recon,5
Jhingan,Siddharth,siddharth.j@bpsanalytics.co.in,SP USA - Weekly Sales Dashboard,0.5
Egan,Sean,segan@stocadvisory.com,SPUSA - Holly Dental,2
Luetgers,Sam,sluetgers@stocadvisory.com,Sick,4
McFadden,Brandon,bmcfadden@stocadvisory.com,Vacation,16
Hottman,Matthew,mhottman@stocadvisory.com,Vacation,3
Jadhav,Pravin,pjadhav@stocadvisory.com,Vacation,32
Tuli,Rahul,rtuli@stocadvisory.com,Vacation,32
Luetgers,Sam,sluetgers@stocadvisory.com,Vacation,8
`;

// Week 15: Jan 4 - Jan 10
const rawData15 = `lname,fname,username,job_code,hours
Sheehy,Aidan,asheehy@stocadvisory.com,ADP - Tearsheet,27
Hariram,Pradeep,phariram@stocadvisory.com,ADP - Tearsheet,16
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Alta Loma Optometric (Dr. Morton),1.98
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - Child and Family Eye Care Center,4.5
Luetgers,Sam,sluetgers@stocadvisory.com,AEG - Child and Family Eye Care Center,3
Jadhav,Pravin,pjadhav@stocadvisory.com,AEG - Sandy & Draper Vision Care Center,23.86
McFadden,Brandon,bmcfadden@stocadvisory.com,AEG - South Shore Eye Center,7
Saxena,Arjit,asaxena@stocadvisory.com,Administrative,2
Hariram,Pradeep,phariram@stocadvisory.com,Administrative,7
Jadhav,Pravin,pjadhav@stocadvisory.com,Administrative,5.55
Tuli,Rahul,rtuli@stocadvisory.com,Administrative,1.55
Luetgers,Sam,sluetgers@stocadvisory.com,Administrative,1
Singh,Jogendra,jrathore@stocadvisory.com,Business Development,32.17
Sharma,Mohit,msharma@stocadvisory.com,Business Development,23.37
D,Ramya,ramya@stocadvisory.com,Business Development,34.61
Nayak,Rakesh,rnayak@stocadvisory.com,Business Development,33.01
Joseph,Stefan,sjoseph@stocadvisory.com,Business Development,38.41
Govind,Vaishnav,vgovind@stocadvisory.com,Business Development,11.56
Pandey,Sharvan,spandey@stocadvisory.com,CDS - Tableau,32.36
Sundar,Barath,bsundar@stocadvisory.com,Holiday,24
Egan,Sean,segan@stocadvisory.com,Holiday,16
Hottman,Matthew,mhottman@stocadvisory.com,Riata - Government Window,3
Tuli,Rahul,rtuli@stocadvisory.com,Riata - Government Window,6.98
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,1
McFadden,Brandon,bmcfadden@stocadvisory.com,SALT - Alden Bridge Pediatric Dentistry,1
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Berkeley & Orinda Orthodontics,1.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Chesapeake Pediatric Dental Group,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Haeger Orthodontics,0.5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Houston OMS,2
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Houston OMS,3.99
Saxena,Arjit,asaxena@stocadvisory.com,SALT - Spokane Pediatric,5
Hottman,Matthew,mhottman@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,1.5
Tuli,Rahul,rtuli@stocadvisory.com,SALT - Suffolk Pedo Dentistry & Ortho,14.46
`;

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
  const [riskFilters, setRiskFilters] = useState({
    team: 'all',
    riskLevel: 'all'
  });
  
  // Ref for week selector dropdown
  const weekSelectorRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (weekSelectorRef.current && !weekSelectorRef.current.contains(event.target)) {
        setShowWeekSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse data
  const week1Data = useMemo(() => parseCSV(rawData1), []);
  const week2Data = useMemo(() => parseCSV(rawData2), []);
  const week3Data = useMemo(() => parseCSV(rawData3), []);
  const week4Data = useMemo(() => parseCSV(rawData4), []);
  const week5Data = useMemo(() => parseCSV(rawData5), []);
  const week6Data = useMemo(() => parseCSV(rawData6), []);
  const week7Data = useMemo(() => parseCSV(rawData7), []);
  const week8Data = useMemo(() => parseCSV(rawData8), []);
  const week9Data = useMemo(() => parseCSV(rawData9), []);
  const week10Data = useMemo(() => parseCSV(rawData10), []);
  const week11Data = useMemo(() => parseCSV(rawData11), []);
  const week12Data = useMemo(() => parseCSV(rawData12), []);
  const week13Data = useMemo(() => parseCSV(rawData13), []);
  const week14Data = useMemo(() => parseCSV(rawData14), []);
  const week15Data = useMemo(() => parseCSV(rawData15), []);
  
  // Define team members by business unit
  const teamMembersByUnit = {
    cds: [
      'Mohit Sharma',
      'Rakesh Nayak',
      'Sharvan Pandey',
      'Stefan Joseph',
      'Jogendra Singh',
      'Ramya D',
      'Vaishnav Govind'
    ],
    tas: [
      // TAS team members (everyone not in CDS)
    ]
  };

  // Combine data from both weeks - filtered by selected period and business unit
  const allData = useMemo(() => {
    let data = [];
    
    // Handle multiple week selection
    if (selectedWeeks.length > 0) {
      const weekDataMap = {
        1: week1Data, 2: week2Data, 3: week3Data, 4: week4Data, 5: week5Data,
        6: week6Data, 7: week7Data, 8: week8Data, 9: week9Data, 10: week10Data,
        11: week11Data, 12: week12Data, 13: week13Data, 14: week14Data, 15: week15Data
      };
      selectedWeeks.forEach(weekNum => {
        if (weekDataMap[weekNum]) {
          data = [...data, ...weekDataMap[weekNum]];
        }
      });
    }
    // Handle "all" periods
    else if (selectedPeriod === 'all') {
      data = [...week1Data, ...week2Data, ...week3Data, ...week4Data, ...week5Data, ...week6Data, ...week7Data, ...week8Data, ...week9Data, ...week10Data, ...week11Data, ...week12Data, ...week13Data, ...week14Data, ...week15Data];
    }
    // Handle individual week selection
    else if (selectedPeriod === 'week1') data = week1Data;
    else if (selectedPeriod === 'week2') data = week2Data;
    else if (selectedPeriod === 'week3') data = week3Data;
    else if (selectedPeriod === 'week4') data = week4Data;
    else if (selectedPeriod === 'week5') data = week5Data;
    else if (selectedPeriod === 'week6') data = week6Data;
    else if (selectedPeriod === 'week7') data = week7Data;
    else if (selectedPeriod === 'week8') data = week8Data;
    else if (selectedPeriod === 'week9') data = week9Data;
    else if (selectedPeriod === 'week10') data = week10Data;
    else if (selectedPeriod === 'week11') data = week11Data;
    else if (selectedPeriod === 'week12') data = week12Data;
    else if (selectedPeriod === 'week13') data = week13Data;
    else if (selectedPeriod === 'week14') data = week14Data;
    else if (selectedPeriod === 'week15') data = week15Data;
    
    // Filter by business unit team membership if not "all"
    if (businessUnitFilter !== 'all') {
      const teamMembersToInclude = new Set();
      
      if (businessUnitFilter === 'cds') {
        // CDS: ONLY these specific team members
        teamMembersByUnit.cds.forEach(name => teamMembersToInclude.add(name));
      } else if (businessUnitFilter === 'tas') {
        // TAS: Everyone EXCEPT CDS team members
        const allMembers = new Set(data.map(d => `${d.fname} ${d.lname}`));
        allMembers.forEach(name => {
          if (!teamMembersByUnit.cds.includes(name)) {
            teamMembersToInclude.add(name);
          }
        });
      }
      
      // Filter to ONLY include the selected team members (no expanding to others)
      data = data.filter(entry => {
        const fullName = `${entry.fname} ${entry.lname}`;
        return teamMembersToInclude.has(fullName);
      });
    }
    
    return data;
  }, [week1Data, week2Data, week3Data, week4Data, week5Data, week6Data, week7Data, week8Data, week9Data, week10Data, week11Data, week12Data, week13Data, week14Data, week15Data, selectedPeriod, selectedWeeks, businessUnitFilter]);

  // Helper function to determine project category
  function determineCategory(projectName) {
    // OOO: Holiday, Vacation, Sick
    const oooKeywords = ['Holiday', 'Vacation', 'Sick'];
    if (oooKeywords.some(keyword => projectName.includes(keyword))) {
      return 'ooo';
    }
    
    // CDS - Tableau is specifically NON-billable (check this first before other internal keywords)
    if (projectName.includes('CDS - Tableau')) {
      return 'internal';
    }
    
    // Internal/BD: Administrative, Business Development
    const internalKeywords = ['Administrative', 'Business Development'];
    if (internalKeywords.some(keyword => projectName.includes(keyword))) {
      return 'internal';
    }
    
    // Everything else is billable
    return 'billable';
  }

  // Helper function to extract client from project name
  function extractClient(projectName) {
    // Special cases
    if (['Holiday', 'Vacation', 'Sick'].some(keyword => projectName.includes(keyword))) {
      return 'OOO (Out of Office)';
    }
    if (projectName === 'Administrative') {
      return 'Administrative';
    }
    if (projectName.includes('Business Development')) {
      return 'Business Development';
    }
    
    // Extract client from "CLIENT - Project Name" pattern
    const match = projectName.match(/^([A-Z\s]+)(?:\s*-|$)/);
    if (match) {
      const client = match[1].trim();
      // Normalize SP USA and SPUSA to the same client
      if (client === 'SP USA' || client === 'SPUSA') {
        return 'SP USA';
      }
      return client;
    }
    
    // If no pattern match, return the project name itself
    return projectName;
  }

  // Helper function to determine business unit
  function getBusinessUnit(clientName) {
    if (clientName === 'OOO (Out of Office)') return 'administrative'; // OOO shows under Administrative filter
    if (clientName === 'Administrative') return 'administrative';
    if (clientName === 'Business Development') return 'cds'; // Business Development is part of CDS
    
    // CDS projects: anything starting with CDS
    if (clientName.startsWith('CDS')) return 'cds';
    
    // TAS only: SALT, Riata, SP, Beacon Behavioral
    const tasOnly = ['SALT', 'Riata', 'SP USA', 'SP', 'SPUSA', 'Beacon Behavioral'];
    if (tasOnly.some(tas => clientName.includes(tas))) return 'tas';
    
    // Both TAS + CDS: AEG, CPC, ADP
    const tasCds = ['AEG', 'CPC', 'ADP'];
    if (tasCds.some(tc => clientName.includes(tc))) return 'tas_cds';
    
    return 'other';
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

    // Group projects by client
    const clientGroups = {};
    Object.values(projects).forEach(project => {
      const client = extractClient(project.name);
      if (!clientGroups[client]) {
        clientGroups[client] = {
          name: client,
          projects: [],
          totalHours: 0,
          teamMembers: new Set(),
          category: project.category
        };
      }
      clientGroups[client].projects.push(project);
      clientGroups[client].totalHours += project.totalHours;
      project.teamMembers.forEach(member => clientGroups[client].teamMembers.add(member));
    });

    return { teamMembers, projects, categories, clientGroups };
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
    const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : (selectedPeriod === 'all' ? 15 : 1);
    const standardCapacity = 40 * weekCount;
    
    return Object.values(processedData.teamMembers)
      .filter(member => {
        // Only include team members who have logged hours
        return member.billableHours > 0 || member.internalHours > 0 || member.oooHours > 0;
      })
      .sort((a, b) => b.utilization - a.utilization)
      .map(member => {
        const utilizedHours = member.billableHours + member.internalHours;
        const available = Math.max(0, standardCapacity - utilizedHours);
        
        return {
          name: member.name.split(' ')[0],
          utilization: member.utilization,
          billable: member.billableHours,
          internal: member.internalHours,
          ooo: member.oooHours,
          available: available
        };
      });
  }, [processedData, selectedPeriod, selectedWeeks]);

  const categoryPieData = useMemo(() => {
    const { categories } = processedData;
    const total = categories.billable + categories.internal + categories.ooo;
    return [
      { 
        name: 'Billable', 
        value: categories.billable, 
        percentage: total > 0 ? Math.round((categories.billable / total) * 100) : 0,
        color: '#0891B2' // Cyan 600 - modest teal
      },
      { 
        name: 'Internal/BD', 
        value: categories.internal, 
        percentage: total > 0 ? Math.round((categories.internal / total) * 100) : 0,
        color: '#7C3AED' // Violet 600 - softer purple
      },
      { 
        name: 'OOO', 
        value: categories.ooo, 
        percentage: total > 0 ? Math.round((categories.ooo / total) * 100) : 0,
        color: '#F59E0B' // Amber 500 - modest yellow/orange
      }
    ].filter(cat => cat.value > 0);
  }, [processedData]);

  const projectBurnData = useMemo(() => {
    return Object.values(processedData.projects)
      .filter(project => project.category !== 'ooo') // Exclude OOO, but show billable AND internal
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 8)
      .map(project => ({
        name: project.name,
        hours: project.totalHours,
        teamSize: project.teamMembers.size,
        category: project.category
      }));
  }, [processedData]);

  const toggleProjectExpansion = (projectName) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }));
  };

  const toggleClientExpansion = (clientName) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientName]: !prev[clientName]
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

  // Risk Dashboard Data Calculations
  const riskData = useMemo(() => {
    const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : (selectedPeriod === 'all' ? 15 : 1);
    const standardCapacity = 40 * weekCount;
    
    const teamRiskData = Object.values(processedData.teamMembers)
      .map(member => {
        const totalUsedHours = member.billableHours + member.internalHours + member.oooHours;
        const availableHours = standardCapacity;
        const utilizationPct = standardCapacity > 0 ? (totalUsedHours / standardCapacity) * 100 : 0;
        const billableMixPct = totalUsedHours > 0 ? (member.billableHours / totalUsedHours) * 100 : 0;
        
        // Check if member is in CDS team
        const isCDS = teamMembersByUnit.cds.includes(member.name);
        
        // Determine risk category with new logic
        let riskLevel = 'Healthy / Balanced';
        let riskColor = '#10B981'; // Green
        
        // Burnout Risk: utilization >= 95%
        if (utilizationPct >= 95) {
          riskLevel = 'Burnout Risk';
          riskColor = '#EF4444'; // Red
        }
        // Available Capacity: utilization < 60%
        else if (utilizationPct < 60) {
          riskLevel = 'Available Capacity';
          riskColor = '#F59E0B'; // Amber
        }
        // Strategic Internal Allocation: CDS team members with < 70% billable (more internal focus)
        else if (isCDS && billableMixPct < 70) {
          riskLevel = 'Strategic Internal Allocation';
          riskColor = '#8B5CF6'; // Purple
        }
        
        // Generate explanation and action
        let explanation = '';
        let suggestedAction = '';
        
        if (riskLevel === 'Burnout Risk') {
          explanation = `${member.name} is working at ${utilizationPct.toFixed(0)}% capacity. This extremely high utilization creates significant burnout risk and quality concerns.`;
          suggestedAction = 'IMMEDIATE ACTION REQUIRED: Reduce workload immediately. Redistribute assignments to available team members, defer non-critical work, or schedule time off. Monitor daily for signs of stress or quality degradation.';
        } else if (riskLevel === 'Available Capacity') {
          explanation = `${member.name} is only at ${utilizationPct.toFixed(0)}% capacity with ${(standardCapacity - totalUsedHours).toFixed(0)} hours available. They have significant bandwidth for additional work.`;
          suggestedAction = 'OPPORTUNITY: Assign to new billable projects, provide training/development opportunities, or involve in business development. Review pipeline for immediate staffing needs.';
        } else if (riskLevel === 'Strategic Internal Allocation') {
          explanation = `${member.name} (CDS team) is spending ${billableMixPct.toFixed(0)}% of time on billable work and ${(100-billableMixPct).toFixed(0)}% on internal/BD activities. This is a strategic allocation for business development and internal initiatives.`;
          suggestedAction = 'STRATEGIC: Continue monitoring internal project progress. Ensure internal work aligns with strategic priorities. Consider timeline for transitioning to more billable work if business goals change.';
        } else {
          explanation = `${member.name} is operating at a healthy ${utilizationPct.toFixed(0)}% capacity with a ${billableMixPct.toFixed(0)}% billable mix. Their workload is balanced and sustainable.`;
          suggestedAction = 'MAINTAIN: Continue current trajectory and project allocations. This is the target state. Monitor for changes in upcoming weeks.';
        }
        
        return {
          ...member,
          totalUsedHours,
          availableHours,
          utilizationPct,
          billableMixPct,
          riskLevel,
          riskColor,
          explanation,
          suggestedAction,
          standardCapacity,
          isCDS
        };
      })
      .filter(member => member.totalUsedHours > 0) // Hide zero-hour members
      .sort((a, b) => b.utilizationPct - a.utilizationPct); // Sort by highest utilization
    
    // Calculate KPIs
    const avgUtilization = teamRiskData.length > 0 
      ? teamRiskData.reduce((sum, m) => sum + m.utilizationPct, 0) / teamRiskData.length 
      : 0;
    const burnoutCount = teamRiskData.filter(m => m.riskLevel === 'Burnout Risk').length;
    const availableCapacityCount = teamRiskData.filter(m => m.riskLevel === 'Available Capacity').length;
    const strategicCount = teamRiskData.filter(m => m.riskLevel === 'Strategic Internal Allocation').length;
    const healthyCount = teamRiskData.filter(m => m.riskLevel === 'Healthy / Balanced').length;
    
    return {
      teamRiskData,
      kpis: {
        avgUtilization: avgUtilization.toFixed(1),
        burnoutCount,
        availableCapacityCount,
        strategicCount,
        healthyCount
      }
    };
  }, [processedData, selectedPeriod, selectedWeeks, teamMembersByUnit]);

  // Apply risk filters
  const filteredRiskData = useMemo(() => {
    return riskData.teamRiskData.filter(member => {
      // Team filter
      if (riskFilters.team !== 'all') {
        const isCDS = teamMembersByUnit.cds.includes(member.name);
        if (riskFilters.team === 'cds' && !isCDS) return false;
        if (riskFilters.team === 'tas' && isCDS) return false;
      }
      
      // Risk level filter
      if (riskFilters.riskLevel !== 'all' && member.riskLevel !== riskFilters.riskLevel) {
        return false;
      }
      
      return true;
    });
  }, [riskData, riskFilters, teamMembersByUnit]);

  const getCategoryBadge = (category) => {
    const badges = {
      billable: { color: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Billable' },
      internal: { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Internal/BD' },
      ooo: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'OOO' }
    };
    const badge = badges[category];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${badge.color}`}>
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
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>STOC Staffing Tool</h1>
              <p className="text-gray-500 mt-1">Real-time visibility into team utilization and project allocation</p>
            </div>
          </div>

          <div className="flex gap-3">
            <select 
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
            >
              <option value="all">All Teams</option>
              <option value="tas">TAS</option>
              <option value="cds">CDS</option>
            </select>
            
            {/* Multiselect Time Period Dropdown */}
            <div className="relative" ref={weekSelectorRef}>
              <button
                onClick={() => setShowWeekSelector(!showWeekSelector)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between"
              >
                <span className="text-sm">
                  {selectedWeeks.length === 0 ? 'All Periods (15 weeks)' : 
                   selectedWeeks.length === 15 ? 'All Periods (15 weeks)' :
                   selectedWeeks.length === 1 ? `1 week selected` :
                   `${selectedWeeks.length} weeks selected`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showWeekSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showWeekSelector && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-[400px] max-h-[500px] overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <span className="font-semibold text-sm">Select Time Periods</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedWeeks([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
                          setSelectedPeriod('all');
                        }}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWeeks([]);
                          setSelectedPeriod('all');
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      { num: 15, label: 'Jan 4 - Jan 10, 2026', value: 'week15' },
                      { num: 14, label: 'Dec 28, 2025 - Jan 3, 2026', value: 'week14' },
                      { num: 13, label: 'Dec 21 - Dec 27, 2025', value: 'week13' },
                      { num: 12, label: 'Dec 14 - Dec 20, 2025', value: 'week12' },
                      { num: 11, label: 'Dec 7 - Dec 13, 2025', value: 'week11' },
                      { num: 10, label: 'Nov 30 - Dec 6, 2025', value: 'week10' },
                      { num: 9, label: 'Nov 23 - Nov 29, 2025', value: 'week9' },
                      { num: 8, label: 'Nov 16 - Nov 22, 2025', value: 'week8' },
                      { num: 7, label: 'Nov 9 - Nov 15, 2025', value: 'week7' },
                      { num: 6, label: 'Nov 2 - Nov 8, 2025', value: 'week6' },
                      { num: 5, label: 'Oct 26 - Nov 1, 2025', value: 'week5' },
                      { num: 4, label: 'Oct 19 - Oct 25, 2025', value: 'week4' },
                      { num: 3, label: 'Oct 12 - Oct 18, 2025', value: 'week3' },
                      { num: 2, label: 'Oct 5 - Oct 11, 2025', value: 'week2' },
                      { num: 1, label: 'Sep 28 - Oct 4, 2025', value: 'week1' }
                    ].map(week => {
                      const isChecked = selectedWeeks.includes(week.num);
                      return (
                        <label
                          key={week.num}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
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
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
        
        
        {/* Key Metrics */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Team Members</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.teamCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalHours}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Coffee className="w-5 h-5" />
              <span className="text-sm font-medium">Internal/BD</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.internalHours}</div>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-700 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Billable Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.billableHours}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Utilization</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.avgUtilization}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
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
            {/* RISK DASHBOARD - Executive View */}
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

              {/* Utilization Risk Matrix */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-2">Team Utilization Overview</h2>
                <div className="text-sm text-gray-600 mb-4">
                  Sorted by utilization % | Color-coded by risk level | Click any bar for details
                </div>
                
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={riskData.teamRiskData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
                              <p className="font-bold text-gray-900 mb-2">{data.name}</p>
                              <p className="text-sm text-gray-600">Billable: {data.billableHours.toFixed(1)}h</p>
                              <p className="text-sm text-gray-600">Internal/BD: {data.internalHours.toFixed(1)}h</p>
                              <p className="text-sm text-gray-600">OOO: {data.oooHours.toFixed(1)}h</p>
                              <p className="text-sm text-gray-600">Available: {(data.standardCapacity - data.totalUsedHours).toFixed(1)}h</p>
                              <p className="text-sm font-semibold text-gray-900 mt-2">Utilization: {data.utilizationPct.toFixed(1)}%</p>
                              <p className="text-sm text-gray-600">Billable Mix: {data.billableMixPct.toFixed(1)}%</p>
                              <p className="text-sm font-semibold mt-2" style={{ color: data.riskColor }}>
                                {data.riskLevel}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={95} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "95% Burnout", position: "right", fill: "#EF4444" }} />
                    <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "60% Available", position: "right", fill: "#F59E0B" }} />
                    <Bar 
                      dataKey="utilizationPct" 
                      onClick={(data) => setSelectedRiskPerson(data)}
                      cursor="pointer"
                    >
                      {riskData.teamRiskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.riskColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="flex gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm text-gray-700">Burnout Risk (≥95%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500"></div>
                    <span className="text-sm text-gray-700">Available Capacity (&lt;60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <span className="text-sm text-gray-700">Strategic Internal (CDS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm text-gray-700">Healthy / Balanced</span>
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
                    <tbody className="divide-y divide-gray-200">
                      {riskData.teamRiskData.map((member, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
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
                            <button
                              onClick={() => setSelectedRiskPerson(member)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
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
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-700">Burnout Risk (≥95%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-gray-700">Available Capacity (&lt;60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-700">Strategic Internal (CDS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">Healthy / Balanced</span>
                  </div>
                </div>
              </div>

              {/* Detail Panel */}
              {selectedRiskPerson && (
                <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedRiskPerson.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: selectedRiskPerson.riskColor + '20', color: selectedRiskPerson.riskColor }}>
                          {selectedRiskPerson.riskLevel}
                        </span>
                        <span className="text-sm text-gray-600">
                          {selectedRiskPerson.utilizationPct.toFixed(0)}% Utilized • {selectedRiskPerson.billableMixPct.toFixed(0)}% Billable Mix
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRiskPerson(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {/* Hours Breakdown */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Hours Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Billable:</span>
                          <span className="font-medium text-cyan-600">{selectedRiskPerson.billableHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Internal/BD:</span>
                          <span className="font-medium text-purple-600">{selectedRiskPerson.internalHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">OOO:</span>
                          <span className="font-medium text-amber-600">{selectedRiskPerson.oooHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-gray-600">Total Used:</span>
                          <span className="font-semibold">{selectedRiskPerson.totalUsedHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-semibold text-green-600">{(selectedRiskPerson.standardCapacity - selectedRiskPerson.totalUsedHours).toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium text-gray-500">{selectedRiskPerson.standardCapacity}h</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Split */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Utilization</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Used</span>
                            <span className="font-medium">{selectedRiskPerson.utilizationPct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="h-3 rounded-full" style={{ width: `${Math.min(selectedRiskPerson.utilizationPct, 100)}%`, backgroundColor: selectedRiskPerson.riskColor }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Billable Mix</span>
                            <span className="font-medium">{selectedRiskPerson.billableMixPct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-cyan-500 h-3 rounded-full" style={{ width: `${selectedRiskPerson.billableMixPct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projects */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Current Projects</h3>
                      <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                        {selectedRiskPerson.projects && Object.keys(selectedRiskPerson.projects).length > 0 ? (
                          Object.entries(selectedRiskPerson.projects).slice(0, 5).map(([project, hours], idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-gray-600 truncate flex-1">{project}</span>
                              <span className="font-medium ml-2">{hours.toFixed(1)}h</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No projects</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Explanation and Action */}
                  <div className="mt-6 pt-6 border-t space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">⚠️ Analysis</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedRiskPerson.explanation}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">💡 Manager Action</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedRiskPerson.suggestedAction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Utilization Chart - Full Width */}
            <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Team Utilization</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={utilizationChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="billable" stackId="a" fill="#0891B2" name="Billable Hours" />
                  <Bar dataKey="internal" stackId="a" fill="#7C3AED" name="Internal/BD Hours" />
                  <Bar dataKey="ooo" stackId="a" fill="#F59E0B" name="OOO Hours" />
                  <Bar dataKey="available" stackId="a" fill="#E5E7EB" name="Available Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Time Distribution & Top Projects Side by Side */}
            <div className="col-span-5 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Time Distribution</h2>
              <ResponsiveContainer width="100%" height={350}>
                <RePieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={entry => `${entry.name}: ${entry.value.toFixed(0)}h (${entry.percentage}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value.toFixed(0)}h (${props.payload.percentage}%)`, name]} />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-7 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Top Projects by Hours</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Hours</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Team Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projectBurnData.map((project, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{project.name}</td>
                        <td className="px-4 py-3 text-sm">{getCategoryBadge(project.category)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{project.hours.toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{project.teamSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                      <tr className="hover:bg-blue-50/20 even:bg-gray-50/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{member.totalHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-cyan-700">{member.billableHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-700">{member.internalHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-amber-700">{member.oooHours.toFixed(1)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${member.utilization}%`}}></div>
                            </div>
                            <span className="text-sm font-medium">{member.utilization}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button 
                            onClick={() => toggleTeamMemberExpansion(member.name)}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <span className="text-sm font-medium">{Object.keys(member.projects).length}</span>
                            {expandedTeamMembers[member.name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {expandedTeamMembers[member.name] && (
                        <tr>
                          <td colSpan="7" className="px-4 py-3 bg-gray-50">
                            <div className="pl-8">
                              <h4 className="font-medium mb-2">Projects Breakdown:</h4>
                              <div className="space-y-2">
                                {Object.entries(member.projects)
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([project, hours]) => {
                                    const category = determineCategory(project);
                                    const percentage = member.totalHours > 0 ? Math.round((hours / member.totalHours) * 100) : 0;
                                    return (
                                      <div key={project} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                                        <div className="flex items-center gap-2 flex-1">
                                          <span className="text-sm">{project}</span>
                                          {getCategoryBadge(category)}
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                              <div 
                                                className="bg-indigo-600 h-2 rounded-full" 
                                                style={{width: `${percentage}%`}}
                                              ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 w-12">{percentage}%</span>
                                          </div>
                                          <span className="text-sm font-bold text-gray-900 w-16 text-right">{hours.toFixed(1)}h</span>
                                        </div>
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
              <h2 className="text-xl font-bold">Project Allocation by Client</h2>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="cds">CDS</option>
                <option value="administrative">Administrative & OOO</option>
              </select>
            </div>

            <div className="space-y-3">
              {Object.values(processedData.clientGroups)
                .filter(client => {
                  if (projectFilter === 'all') return true;
                  const unit = getBusinessUnit(client.name);
                  return unit === projectFilter;
                })
                .sort((a, b) => {
                  // First apply special sorting
                  if (a.name === 'OOO (Out of Office)') return -1;
                  if (b.name === 'OOO (Out of Office)') return 1;
                  if (a.name === 'Administrative') return -1;
                  if (b.name === 'Administrative') return 1;
                  if (a.name === 'Business Development') return -1;
                  if (b.name === 'Business Development') return 1;
                  
                  // Then apply user's sort preference
                  const aValue = projectSortConfig.key === 'name' ? a.name : 
                                 projectSortConfig.key === 'projects' ? a.projects.length :
                                 projectSortConfig.key === 'teamSize' ? a.teamMembers.size :
                                 a.totalHours;
                  const bValue = projectSortConfig.key === 'name' ? b.name :
                                 projectSortConfig.key === 'projects' ? b.projects.length :
                                 projectSortConfig.key === 'teamSize' ? b.teamMembers.size :
                                 b.totalHours;
                  
                  if (projectSortConfig.direction === 'asc') {
                    return aValue > bValue ? 1 : -1;
                  } else {
                    return aValue < bValue ? 1 : -1;
                  }
                })
                .map(client => {
                  return (
                    <div key={client.name} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Client Header */}
                      <div 
                        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => toggleClientExpansion(client.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button className="text-gray-600">
                              {expandedClients[client.name] ? 
                                <ChevronDown className="w-5 h-5" /> : 
                                <ChevronRight className="w-5 h-5" />
                              }
                            </button>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                              <p className="text-sm text-gray-600">
                                {client.projects.length} project{client.projects.length !== 1 ? 's' : ''} • {client.teamMembers.size} team member{client.teamMembers.size !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">{client.totalHours.toFixed(1)}h</div>
                              <div className="text-sm text-gray-500">Total Hours</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Projects */}
                      {expandedClients[client.name] && (
                        <div className="bg-white">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Project Name
                                </th>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleProjectSort('totalHours')}
                                >
                                  Hours {projectSortConfig.key === 'totalHours' && (projectSortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleProjectSort('teamSize')}
                                >
                                  Team Size {projectSortConfig.key === 'teamSize' && (projectSortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Details
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {client.projects
                                .sort((a, b) => b.totalHours - a.totalHours)
                                .map(project => (
                                  <React.Fragment key={project.name}>
                                    <tr className="hover:bg-blue-50/20 even:bg-gray-50/50">
                                      <td className="px-4 py-3 text-sm text-gray-900">{project.name}</td>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.totalHours.toFixed(1)}h</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{project.teamMembers.size} member{project.teamMembers.size !== 1 ? 's' : ''}</td>
                                      <td className="px-4 py-3">
                                        <button 
                                          onClick={() => toggleProjectExpansion(project.name)}
                                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                        >
                                          {expandedProjects[project.name] ? 'Hide Team' : 'View Team'}
                                        </button>
                                      </td>
                                    </tr>
                                    {expandedProjects[project.name] && (
                                      <tr>
                                        <td colSpan="4" className="px-4 py-3 bg-gray-50">
                                          <div className="pl-8">
                                            <h4 className="font-medium mb-2 text-sm text-gray-700">Team Members:</h4>
                                            <div className="flex flex-wrap gap-2">
                                              {Array.from(project.teamMembers).map(member => (
                                                <span key={member} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-200">
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
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'capacity' && (
          <div className="col-span-12 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Team Capacity Analysis</h2>
              
              {/* Capacity Overview Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100 shadow-sm">
                  <h3 className="text-sm font-medium text-cyan-800 mb-2">Billable Capacity</h3>
                  <div className="text-2xl font-bold text-gray-900">{metrics.billableHours}h</div>
                  <div className="text-sm text-gray-600 mt-1">{metrics.billablePercentage}% of utilized hours</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm">
                  <h3 className="text-sm font-medium text-purple-800 mb-2">Internal/BD Capacity</h3>
                  <div className="text-2xl font-bold text-gray-900">{metrics.internalHours}h</div>
                  <div className="text-sm text-gray-600 mt-1">{Math.round((parseFloat(metrics.internalHours) / parseFloat(metrics.utilizedHours)) * 100)}% of utilized hours</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 shadow-sm">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">OOO Hours</h3>
                  <div className="text-2xl font-bold text-gray-900">{metrics.oooHours}h</div>
                  <div className="text-sm text-gray-600 mt-1">{Math.round((parseFloat(metrics.oooHours) / parseFloat(metrics.totalHours)) * 100)}% of total hours</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 shadow-sm">
                  <h3 className="text-sm font-medium text-indigo-800 mb-2">Available Bandwidth</h3>
                  <div className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : (selectedPeriod === 'all' ? 15 : 1);
                      const totalCapacity = metrics.teamCount * 40 * weekCount;
                      const utilized = parseFloat(metrics.utilizedHours);
                      const available = Math.max(0, totalCapacity - utilized);
                      return available.toFixed(1);
                    })()}h
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Based on {selectedWeeks.length > 0 ? `${selectedWeeks.length} week${selectedWeeks.length !== 1 ? 's' : ''}` : (selectedPeriod === 'all' ? '15 weeks' : '1 week')} @ 40h/week
                  </div>
                </div>
              </div>

              {/* Detailed Capacity Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCapacitySort('name')}
                      >
                        Team Member {capacitySortConfig.key === 'name' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCapacitySort('billableHours')}
                      >
                        Billable {capacitySortConfig.key === 'billableHours' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCapacitySort('internalHours')}
                      >
                        Internal/BD {capacitySortConfig.key === 'internalHours' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCapacitySort('oooHours')}
                      >
                        OOO {capacitySortConfig.key === 'oooHours' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCapacitySort('totalHours')}
                      >
                        Total {capacitySortConfig.key === 'totalHours' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCapacitySort('utilization')}
                      >
                        Utilization {capacitySortConfig.key === 'utilization' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCapacitySort('available')}
                      >
                        Available {capacitySortConfig.key === 'available' && (capacitySortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTeamMembers
                      .map(member => {
                        const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : (selectedPeriod === 'all' ? 15 : 1);
                        const standardCapacity = 40 * weekCount;
                        const utilizedHours = member.billableHours + member.internalHours;
                        const availableBandwidth = Math.max(0, standardCapacity - utilizedHours);
                        const capacityUtilization = standardCapacity > 0 ? Math.round((utilizedHours / standardCapacity) * 100) : 0;
                        
                        return { ...member, availableBandwidth, capacityUtilization };
                      })
                      .sort((a, b) => {
                        let aValue, bValue;
                        
                        if (capacitySortConfig.key === 'available') {
                          aValue = a.availableBandwidth;
                          bValue = b.availableBandwidth;
                        } else if (capacitySortConfig.key === 'utilization') {
                          aValue = a.capacityUtilization;
                          bValue = b.capacityUtilization;
                        } else {
                          aValue = a[capacitySortConfig.key];
                          bValue = b[capacitySortConfig.key];
                        }
                        
                        if (capacitySortConfig.direction === 'asc') {
                          return aValue > bValue ? 1 : -1;
                        } else {
                          return aValue < bValue ? 1 : -1;
                        }
                      })
                      .map(({ availableBandwidth, capacityUtilization, ...member }) => {
                      return (
                        <tr key={member.name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-cyan-700">{member.billableHours.toFixed(1)}h</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-700">{member.internalHours.toFixed(1)}h</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-amber-700">{member.oooHours.toFixed(1)}h</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{member.totalHours.toFixed(1)}h</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${Math.min(capacityUtilization, 100)}%`}}></div>
                              </div>
                              <span className="text-sm font-medium">{capacityUtilization}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm font-bold ${availableBandwidth > 10 ? 'text-cyan-600' : availableBandwidth > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                              {availableBandwidth.toFixed(1)}h
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                      <td className="px-4 py-3 text-sm font-medium text-cyan-700">{metrics.billableHours}h</td>
                      <td className="px-4 py-3 text-sm font-medium text-purple-700">{metrics.internalHours}h</td>
                      <td className="px-4 py-3 text-sm font-medium text-amber-700">{metrics.oooHours}h</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{metrics.totalHours}h</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{metrics.avgUtilization}%</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {(() => {
                          const weekCount = selectedWeeks.length > 0 ? selectedWeeks.length : (selectedPeriod === 'all' ? 15 : 1);
                          const totalCapacity = metrics.teamCount * 40 * weekCount;
                          const utilized = parseFloat(metrics.utilizedHours);
                          const available = Math.max(0, totalCapacity - utilized);
                          return available.toFixed(1);
                        })()}h
                      </td>
                    </tr>
                  </tfoot>
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
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Low Utilization (&lt;70%)
                </h3>
                <div className="space-y-2">
                  {sortedTeamMembers
                    .filter(member => member.utilization < 70)
                    .map(member => (
                      <div key={member.name} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.utilization}% utilized ({member.billableHours.toFixed(1)}h billable, {member.internalHours.toFixed(1)}h internal)</div>
                        </div>
                        <span className="text-amber-600 font-medium">{member.utilization}%</span>
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
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  High OOO Hours (&gt;20h)
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
                  High Billable Load (&gt;40h)
                </h3>
                <div className="space-y-2">
                  {sortedTeamMembers
                    .filter(member => member.billableHours > 40)
                    .map(member => (
                      <div key={member.name} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.billableHours.toFixed(1)}h billable hours</div>
                        </div>
                        <span className="font-medium text-gray-900">{member.billableHours.toFixed(1)}h</span>
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
