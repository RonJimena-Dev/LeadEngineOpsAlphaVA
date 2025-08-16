'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newThisWeek: 0,
    highQuality: 0,
    industries: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showLeadsTable, setShowLeadsTable] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [jobStatus, setJobStatus] = useState('');
  const [generatedLeads, setGeneratedLeads] = useState<any[]>([]);
  
  // Multi-tag filter system
  const [industryTags, setIndustryTags] = useState<string[]>([]);
  const [countryTags, setCountryTags] = useState<string[]>([]);
  const [stateTags, setStateTags] = useState<string[]>([]);
  const [jobTitleTags, setJobTitleTags] = useState<string[]>([]);
  
  // Range sliders
  const [employeeRange, setEmployeeRange] = useState({ min: 1, max: 10000 });
  const [revenueRange, setRevenueRange] = useState({ min: 0, max: 10000000 });
  
  // Input states for new tags
  const [industryInput, setIndustryInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  
  // Suggestions
  const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalLeads: data.totalLeads || 0,
          newThisWeek: data.newThisWeek || 0,
          highQuality: data.highQuality || 0,
          industries: data.industries || []
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Add industry tag
  const addIndustryTag = (industry: string) => {
    if (industry && !industryTags.includes(industry)) {
      setIndustryTags([...industryTags, industry]);
      setIndustryInput('');
      setIndustrySuggestions([]);
    }
  };

  // Add country tag
  const addCountryTag = (country: string) => {
    if (country && !countryTags.includes(country)) {
      setCountryTags([...countryTags, country]);
      setCountryInput('');
      setCountrySuggestions([]);
    }
  };

  // Add state tag
  const addStateTag = (state: string) => {
    if (state && !stateTags.includes(state)) {
      setStateTags([...stateTags, state]);
      setStateInput('');
      setStateSuggestions([]);
    }
  };

  // Add job title tag
  const addJobTitleTag = (jobTitle: string) => {
    if (jobTitle && !jobTitleTags.includes(jobTitle)) {
      setJobTitleTags([...jobTitleTags, jobTitle]);
      setJobTitleInput('');
      setJobTitleSuggestions([]);
    }
  };

  // Remove tags
  const removeIndustryTag = (tag: string) => setIndustryTags(industryTags.filter(t => t !== tag));
  const removeCountryTag = (tag: string) => setCountryTags(countryTags.filter(t => t !== tag));
  const removeStateTag = (tag: string) => setStateTags(stateTags.filter(t => t !== tag));
  const removeJobTitleTag = (tag: string) => setJobTitleTags(jobTitleTags.filter(t => t !== tag));

  // Handle input changes with suggestions
  const handleIndustryInputChange = (value: string) => {
    setIndustryInput(value);
    if (value.length > 0) {
      const suggestions = ['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'Manufacturing', 'Real Estate', 'Education', 'Consulting', 'Legal', 'Non-Profit']
        .filter(industry => industry.toLowerCase().includes(value.toLowerCase()));
      setIndustrySuggestions(suggestions);
    } else {
      setIndustrySuggestions([]);
    }
  };

  const handleCountryInputChange = (value: string) => {
    setCountryInput(value);
    if (value.length > 0) {
      const suggestions = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'India', 'Brazil', 'Mexico']
        .filter(country => country.toLowerCase().includes(value.toLowerCase()));
      setCountrySuggestions(suggestions);
    } else {
      setCountrySuggestions([]);
    }
  };

  const handleStateInputChange = (value: string) => {
    setStateInput(value);
    if (value.length > 0) {
      const suggestions = [
        // All 50 USA States
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
        'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
        'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
        'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
        // Major Cities
        'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
        'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC',
        'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore',
        'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Atlanta', 'Kansas City', 'Long Beach', 'Colorado Springs', 'Miami',
        'Raleigh', 'Omaha', 'Minneapolis', 'Cleveland', 'Tulsa', 'Arlington', 'New Orleans', 'Wichita', 'Cleveland', 'Tampa',
        // International Cities
        'Toronto', 'Vancouver', 'Montreal', 'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Berlin', 'Munich', 'Hamburg',
        'Paris', 'Lyon', 'Marseille', 'Sydney', 'Melbourne', 'Brisbane', 'Tokyo', 'Osaka', 'Yokohama', 'Mumbai', 'Delhi', 'Bangalore'
      ].filter(state => state.toLowerCase().includes(value.toLowerCase()));
      setStateSuggestions(suggestions);
    } else {
      setStateSuggestions([]);
    }
  };

  const handleJobTitleInputChange = (value: string) => {
    setJobTitleInput(value);
    if (value.length > 0) {
      const suggestions = ['CEO', 'CTO', 'CFO', 'VP Engineering', 'Head of Tech', 'Product Manager', 'Sales Director', 'Marketing Manager', 'Operations Director', 'Founder']
        .filter(title => title.toLowerCase().includes(value.toLowerCase()));
      setJobTitleSuggestions(suggestions);
    } else {
      setJobTitleSuggestions([]);
    }
  };

  // Handle Enter key
  const handleIndustryKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && industryInput.trim()) {
      addIndustryTag(industryInput.trim());
    }
  };

  const handleCountryKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && countryInput.trim()) {
      addCountryTag(countryInput.trim());
    }
  };

  const handleStateKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && stateInput.trim()) {
      addStateTag(stateInput.trim());
    }
  };

  const handleJobTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && jobTitleInput.trim()) {
      addJobTitleTag(jobTitleInput.trim());
    }
  };

  // Check if any filters are set
  const hasFilters = industryTags.length > 0 || countryTags.length > 0 || stateTags.length > 0 || jobTitleTags.length > 0;
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 25;

  const startScraping = async () => {
    if (!hasFilters) {
      alert('Please set at least one filter before starting scraping.');
      return;
    }

    setIsLoading(true);
    setJobStatus('Starting lead generation...');
    setGeneratedLeads([]);

          // Prepare payload exactly as specified
      const filtersPayload = {
        industry: industryTags,
        employeeMin: employeeRange.min,
        employeeMax: employeeRange.max,
        revenueMin: revenueRange.min,
        revenueMax: revenueRange.max,
        countries: countryTags,
        states: stateTags,
        titles: jobTitleTags
      };

    console.log('Sending filters payload:', filtersPayload);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtersPayload),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentJob(data);
        setJobStatus(`Scraping started! Job ID: ${data.jobId}`);
        pollJobStatus(data.jobId);
      } else {
        const errorData = await response.json();
        setJobStatus(`Error: ${errorData.error || 'Failed to start scraping'}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error starting scraping:', error);
      setJobStatus('Error: Failed to start scraping');
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      console.log('Polling job status for:', jobId);
      const response = await fetch(`/api/scrape/status?jobId=${jobId}`);
      
      if (response.ok) {
        const status = await response.json();
        console.log('Job status response:', status);
        
        if (status.status === 'completed') {
          setIsLoading(false);
          setJobStatus(`Scraping completed! Found ${status.totalLeads || 0} leads`);
          
                     if (status.leads && status.leads.length > 0) {
             console.log('Setting generated leads:', status.leads);
             console.log('First lead structure:', status.leads[0]);
             setGeneratedLeads(status.leads);
           } else {
            setGeneratedLeads([]);
            setJobStatus('No leads found. Try different filters or check scraping logs.');
          }
          
        } else if (status.status === 'failed') {
          setIsLoading(false);
          setJobStatus(`Scraping failed: ${status.error || 'Unknown error'}`);
        } else {
          // Update status with progress
          setJobStatus(`Searching... ${status.progress || 0}% complete (${status.totalLeads || 0} leads found)`);
          // Continue polling
          setTimeout(() => pollJobStatus(jobId), 2000);
        }
      } else {
        console.error('Status response not ok:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        // Continue polling even on error
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      // Continue polling even on error
      setTimeout(() => pollJobStatus(jobId), 2000);
    }
  };

  const clearAllFilters = () => {
    setIndustryTags([]);
    setCountryTags([]);
    setStateTags([]);
    setJobTitleTags([]);
    setEmployeeRange({ min: 1, max: 10000 });
    setRevenueRange({ min: 0, max: 10000000 });
  };

  const exportToCSV = (data: any[]) => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Company', 'Social Links'],
      ...data.map(lead => [
        lead.contact_name || 'N/A',
        lead.contact_phone || 'N/A',
        lead.contact_email || 'N/A',
        lead.company_name || 'N/A',
        (lead.company_social?.linkedin || '') + ' ' + (lead.company_social?.twitter || '')
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_leads.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">L</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LeadEngine</h1>
                <p className="text-sm text-gray-500">Multi-Tag Lead Scraper</p>
              </div>
            </div>
            
                         <nav className="flex items-center space-x-4">
               <button 
                 onClick={() => setShowAdvancedFilters(false)}
                 className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all duration-300 border border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105"
               >
                 Dashboard
               </button>
               <button 
                 onClick={() => setShowAdvancedFilters(true)}
                 className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
               >
                 Generate Leads
               </button>
               <button 
                 onClick={() => setShowLeadsTable(true)}
                 className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-all duration-300 border border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105"
               >
                 My Leads
               </button>
             </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showAdvancedFilters && !showLeadsTable ? (
          // Dashboard View
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLeads.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-2xl">🆕</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.newThisWeek.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">High Quality</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.highQuality.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🏭</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Industries</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.industries.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Multi-Tag Lead Generation
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Use our advanced multi-tag filtering system to find precise leads. 
                  Set multiple industries, locations, job titles, and company criteria for targeted results.
                </p>
                
                <div className="text-center mt-8">
                                     <button 
                     className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-0"
                     onClick={() => setShowAdvancedFilters(true)}
                   >
                     Start Multi-Tag Scraping
                   </button>
                </div>
              </div>
            </div>
          </div>
        ) : showAdvancedFilters ? (
          // Multi-Tag Lead Generation View
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Multi-Tag Lead Generation
                </h2>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>

            {/* Multi-Tag Filters Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Multi-Tag Filters</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Industry (Multi-tag)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type industry and press Enter (e.g., SaaS, Fintech)"
                      value={industryInput}
                      onChange={(e) => handleIndustryInputChange(e.target.value)}
                      onKeyPress={handleIndustryKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {industrySuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {industrySuggestions.map(industry => (
                          <div
                            key={industry}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => addIndustryTag(industry)}
                          >
                            {industry}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {industryTags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {industryTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            onClick={() => removeIndustryTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No industries selected</p>
                  )}
                </div>

                                 {/* Country Filter */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">Country (Multi-tag)</label>
                   <div className="relative">
                     <input
                       type="text"
                       placeholder="Type country and press Enter (e.g., USA, Canada)"
                       value={countryInput}
                       onChange={(e) => handleCountryInputChange(e.target.value)}
                       onKeyPress={handleCountryKeyPress}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                     {countrySuggestions.length > 0 && (
                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                         {countrySuggestions.map(country => (
                           <div
                             key={country}
                             className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                             onClick={() => addCountryTag(country)}
                           >
                             {country}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                   {countryTags.length > 0 ? (
                     <div className="mt-3 flex flex-wrap gap-2">
                       {countryTags.map(tag => (
                         <span
                           key={tag}
                           className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                         >
                           {tag}
                           <button
                             onClick={() => removeCountryTag(tag)}
                             className="ml-2 text-green-600 hover:text-green-800 font-bold"
                           >
                             ×
                           </button>
                         </span>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 mt-2">No countries selected</p>
                   )}
                 </div>

                 {/* State Filter */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-3">State/City (Multi-tag)</label>
                   <div className="relative">
                     <input
                       type="text"
                       placeholder="Type state/city and press Enter (e.g., New York, London)"
                       value={stateInput}
                       onChange={(e) => handleStateInputChange(e.target.value)}
                       onKeyPress={handleStateKeyPress}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                     {stateSuggestions.length > 0 && (
                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                         {stateSuggestions.map(state => (
                           <div
                             key={state}
                             className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                             onClick={() => addStateTag(state)}
                           >
                             {state}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                   {stateTags.length > 0 ? (
                     <div className="mt-3 flex flex-wrap gap-2">
                       {stateTags.map(tag => (
                         <span
                           key={tag}
                           className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                         >
                           {tag}
                           <button
                             onClick={() => removeStateTag(tag)}
                             className="ml-2 text-orange-600 hover:text-orange-800 font-bold"
                           >
                             ×
                           </button>
                         </span>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 mt-2">No states/cities selected</p>
                   )}
                 </div>

                {/* Job Title Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Job Title (Multi-tag)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type job title and press Enter (e.g., CTO, Head of Tech)"
                      value={jobTitleInput}
                      onChange={(e) => handleJobTitleInputChange(e.target.value)}
                      onKeyPress={handleJobTitleKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {jobTitleSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {jobTitleSuggestions.map(title => (
                          <div
                            key={title}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => addJobTitleTag(title)}
                          >
                            {title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {jobTitleTags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {jobTitleTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {tag}
                          <button
                            onClick={() => removeJobTitleTag(tag)}
                            className="ml-2 text-purple-600 hover:text-purple-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No job titles selected</p>
                  )}
                </div>

                {/* Employee Count Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Employee Count Range</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Min: {employeeRange.min}</span>
                      <span className="text-sm text-gray-600">Max: {employeeRange.max}</span>
                    </div>
                    <div className="flex space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="10000"
                        value={employeeRange.min}
                        onChange={(e) => setEmployeeRange({ ...employeeRange, min: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="1"
                        max="10000"
                        value={employeeRange.max}
                        onChange={(e) => setEmployeeRange({ ...employeeRange, max: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Revenue Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Revenue Range (USD)</label>
                  <div className="space-y-3">
                                         <div className="flex items-center space-x-4">
                       <span className="text-sm text-gray-600">Min: ${(revenueRange.min).toLocaleString()}</span>
                       <span className="text-sm text-gray-600">Max: ${(revenueRange.max).toLocaleString()}</span>
                     </div>
                    <div className="flex space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="100000"
                        value={revenueRange.min}
                        onChange={(e) => setRevenueRange({ ...revenueRange, min: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000000"
                        step="100000"
                        value={revenueRange.max}
                        onChange={(e) => setRevenueRange({ ...revenueRange, max: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              {hasFilters && (
                <div className="mt-6">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Filter Summary */}
              {hasFilters && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
                  <div className="text-sm text-gray-600">
                                         {industryTags.length > 0 && <div>Industries: {industryTags.join(', ')}</div>}
                     {countryTags.length > 0 && <div>Countries: {countryTags.join(', ')}</div>}
                     {stateTags.length > 0 && <div>States/Cities: {stateTags.join(', ')}</div>}
                     {jobTitleTags.length > 0 && <div>Job Titles: {jobTitleTags.join(', ')}</div>}
                    <div>Employee Range: {employeeRange.min} - {employeeRange.max}</div>
                    <div>Revenue Range: ${revenueRange.min.toLocaleString()} - ${revenueRange.max.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Tracker */}
            <div className="mt-8 mb-10">
              <div className="flex items-center justify-center space-x-12">
                <div className={`flex items-center space-x-3 ${hasFilters ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${hasFilters ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-base font-semibold">Filters Set</span>
                </div>
                <div className="text-gray-400 text-2xl">→</div>
                <div className={`flex items-center space-x-3 ${isLoading ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${isLoading ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-base font-semibold">Searching...</span>
                </div>
                <div className="text-gray-400 text-2xl">→</div>
                <div className={`flex items-center space-x-3 ${generatedLeads.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${generatedLeads.length > 0 ? 'bg-green-600 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-base font-semibold">Found {generatedLeads.length} leads</span>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-lg text-blue-600 font-medium">{jobStatus}</span>
                </div>
              </div>
            )}

            {/* Success/Failure Notifications */}
            {!isLoading && generatedLeads.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-green-600 text-lg mr-2">✅</span>
                  <div>
                    <h4 className="text-green-800 font-medium">Scraping Completed Successfully!</h4>
                    <p className="text-green-700 text-sm">Found {generatedLeads.length} leads matching your criteria.</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && jobStatus.includes('Error') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-red-600 text-lg mr-2">❌</span>
                  <div>
                    <h4 className="text-red-800 font-medium">Scraping Failed</h4>
                    <p className="text-red-700 text-sm">{jobStatus}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="text-center space-y-4">
                             <button
                 onClick={startScraping}
                 disabled={!hasFilters || isLoading}
                 className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-0 disabled:transform-none disabled:cursor-not-allowed"
               >
                 {isLoading ? 'Searching...' : 'Generate Leads'}
               </button>
              
              {!hasFilters && (
                <p className="text-gray-500">Set at least one filter to enable generation</p>
              )}
              
              {isLoading && (
                <div className="text-blue-600 font-medium">
                  {jobStatus}
                </div>
              )}
            </div>

            {/* Results */}
            {generatedLeads.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generated Leads ({generatedLeads.length})
                  </h3>
                                     <button
                     onClick={() => exportToCSV(generatedLeads)}
                     className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 border-0"
                   >
                     <span>📥</span>
                     <span>Download CSV</span>
                   </button>
                </div>
                
                {/* Results Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Social Links</th>
                      </tr>
                    </thead>
                                         <tbody className="bg-white divide-y divide-gray-200">
                       {generatedLeads
                         .slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)
                         .map((lead, index) => (
                         <tr key={index} className="hover:bg-gray-50">
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                             {lead.contact_name || lead.name || 'N/A'}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {lead.contact_phone || lead.phone || 'N/A'}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {lead.contact_email || lead.email || 'N/A'}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {lead.company_name || lead.company || 'N/A'}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             <div className="flex items-center space-x-2">
                               {lead.company_social?.linkedin && (
                                 <a
                                   href={lead.company_social.linkedin}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-blue-600 hover:text-blue-800 transition-colors"
                                   title="LinkedIn"
                                 >
                                   <span className="text-lg">🔗</span>
                                 </a>
                               )}
                               {lead.company_social?.twitter && (
                                 <a
                                   href={lead.company_social.twitter}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-600 transition-colors"
                                   title="Twitter"
                                 >
                                   <span className="text-lg">🐦</span>
                                 </a>
                               )}
                               {!lead.company_social?.linkedin && !lead.company_social?.twitter && (
                                 <span className="text-gray-400">No social links</span>
                               )}
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {generatedLeads.length > resultsPerPage && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, generatedLeads.length)} of {generatedLeads.length} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-700">
                          Page {currentPage} of {Math.ceil(generatedLeads.length / resultsPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(Math.ceil(generatedLeads.length / resultsPerPage), currentPage + 1))}
                          disabled={currentPage >= Math.ceil(generatedLeads.length / resultsPerPage)}
                          className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Leads Table View
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">My Leads</h2>
              <button
                onClick={() => setShowLeadsTable(false)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Leads ({generatedLeads.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedLeads.length > 0 ? (
                      generatedLeads.map((lead, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.jobTitle}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.industry}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.leadScore >= 80 ? 'bg-green-100 text-green-800' :
                              lead.leadScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {lead.leadScore}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <div className="text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No leads yet</p>
                            <p className="text-gray-500">Generate your first leads to see them here</p>
                            <button
                              onClick={() => setShowAdvancedFilters(true)}
                              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Generate Leads
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
