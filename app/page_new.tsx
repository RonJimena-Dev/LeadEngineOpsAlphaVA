'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import TokenizedFilterInput, { FilterToken } from './components/TokenizedFilterInput';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalLeads: number;
    newThisWeek: number;
    highQuality: number;
    industries: string[];
  }>({
    totalLeads: 0,
    newThisWeek: 0,
    highQuality: 0,
    industries: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showLeadsTable, setShowLeadsTable] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<string>('');
  const [generatedLeads, setGeneratedLeads] = useState<any[]>([]);
  
  // Tokenized filter system
  const [filterTokens, setFilterTokens] = useState<FilterToken[]>([]);

  useEffect(() => {
    // Load initial stats
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Try to fetch real stats from API
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
      // Keep default stats if API fails
    }
  };

  const startScraping = async () => {
    if (filterTokens.length === 0) {
      alert('Please select at least one filter before starting scraping.');
      return;
    }

    setIsLoading(true);
    setJobStatus('🚀 Starting lead generation...');
    setGeneratedLeads([]);

    try {
      // Convert tokens to the format expected by the API
      const industries = filterTokens.filter(t => t.type === 'industry').map(t => t.value);
      const locations = filterTokens.filter(t => t.type === 'location').map(t => t.value);
      const jobTitles = filterTokens.filter(t => t.type === 'jobTitle').map(t => t.value);
      const companySizes = filterTokens.filter(t => t.type === 'companySize').map(t => t.value);

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industries,
          locations,
          jobTitles,
          companySizes,
          sources: ['google_maps', 'linkedin']
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentJob(data);
        setJobStatus(`✅ Scraping started! Job ID: ${data.jobId}`);
        
        // Start polling for status
        pollJobStatus(data.jobId);
      } else {
        const errorData = await response.json();
        setJobStatus(`❌ Error: ${errorData.error || 'Failed to start scraping'}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error starting scraping:', error);
      setJobStatus('❌ Error: Failed to start scraping');
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/scrape/status?jobId=${jobId}`);
      if (response.ok) {
        const status = await response.json();
        
        if (status.status === 'completed') {
          setIsLoading(false);
          setJobStatus(`✅ Scraping completed! Found ${status.results?.totalLeads || 0} leads`);
          
          // Use ONLY real leads from scraping results
          if (status.results?.leads && status.results.leads.length > 0) {
            setGeneratedLeads(status.results.leads);
          } else {
            // No real leads found - show empty state
            setGeneratedLeads([]);
            setJobStatus(`❌ No leads found. Try different filters or check scraping logs.`);
          }
          
        } else if (status.status === 'failed') {
          setIsLoading(false);
          setJobStatus(`❌ Scraping failed: ${status.error || 'Unknown error'}`);
        } else {
          // Still running, continue polling
          setTimeout(() => pollJobStatus(jobId), 2000);
        }
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      setTimeout(() => pollJobStatus(jobId), 2000);
    }
  };

  const clearAllFilters = () => {
    setFilterTokens([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🚀</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LeadEngine</h1>
                <p className="text-sm text-gray-500">AI-Powered Lead Generation</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAdvancedFilters(false)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => setShowAdvancedFilters(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Generate Leads
              </button>
              <button 
                onClick={() => setShowLeadsTable(true)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📋 My Leads
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
                  Ready to Generate High-Quality Leads?
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Use our AI-powered scraper to find real business leads from Google Maps, LinkedIn, and more. 
                  No more fake data - get authentic leads with verified contact information.
                </p>
                
                <div className="text-center mt-8">
                  <button 
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 border-0"
                    onClick={() => setShowAdvancedFilters(true)}
                  >
                    🚀 Start Lead Generation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : showAdvancedFilters ? (
          // Lead Generation View
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Advanced Lead Generation
                </h2>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <span>{showAdvancedFilters ? '🔽 Collapse' : '🔼 Expand'}</span>
                  <span className="text-sm">({showAdvancedFilters ? 'Less' : 'More'} options)</span>
                </button>
              </div>
            </div>

            {/* Tokenized Filter Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3 text-lg">
                🎯 Advanced Filters
              </label>
              <TokenizedFilterInput
                tokens={filterTokens}
                onTokensChange={setFilterTokens}
                placeholder="Type to search job titles, locations, industries, etc."
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Type keywords and the system will automatically detect the filter type. 
                Press Enter or Tab to add filters, Backspace to remove.
              </p>
            </div>

            {/* Filter Summary */}
            {filterTokens.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Active Filters:</h3>
                <div className="flex flex-wrap gap-2">
                  {filterTokens.map((token) => (
                    <span
                      key={token.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {token.label}: {token.value}
                    </span>
                  ))}
                </div>
                <button
                  onClick={clearAllFilters}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  🗑️ Clear All Filters
                </button>
              </div>
            )}

            {/* Progress Tracker */}
            <div className="mt-8 mb-10">
              <div className="flex items-center justify-center space-x-12">
                <div className={`flex items-center space-x-3 ${filterTokens.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${filterTokens.length > 0 ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-base font-semibold">✅ Filters Accepted</span>
                </div>
                <div className="text-gray-400 text-2xl">→</div>
                <div className={`flex items-center space-x-3 ${isLoading ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${isLoading ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-base font-semibold">🔍 Searching...</span>
                </div>
                <div className="text-gray-400 text-2xl">→</div>
                <div className={`flex items-center space-x-3 ${generatedLeads.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${generatedLeads.length > 0 ? 'bg-green-600 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-base font-semibold">🎯 Found {generatedLeads.length} leads</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <button
                onClick={startScraping}
                disabled={isLoading || filterTokens.length === 0}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 border-0 disabled:transform-none disabled:shadow-lg"
              >
                {isLoading ? '🔍 Searching...' : '🚀 Generate Leads'}
              </button>
              
              {isLoading && (
                <div className="text-blue-600 font-medium">
                  {jobStatus}
                </div>
              )}
            </div>

            {/* Results */}
            {generatedLeads.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🎯 Generated Leads ({generatedLeads.length})
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
                      {generatedLeads.map((lead, index) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  📋 All Leads ({generatedLeads.length})
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
                            <span className="text-4xl mb-4 block">📭</span>
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
