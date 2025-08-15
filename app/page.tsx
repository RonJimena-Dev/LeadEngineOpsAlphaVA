'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import TokenizedFilterInput, { FilterToken } from './components/TokenizedFilterInput';
import CollapsibleFilters from './components/CollapsibleFilters';
import ProgressTracker from './components/ProgressTracker';
import DarkModeToggle from './components/DarkModeToggle';
import MobileMenu from './components/MobileMenu';
import Card from './components/Card';
import Button from './components/Button';
import StatsCard from './components/StatsCard';

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
  const [filtersExpanded, setFiltersExpanded] = useState(true);

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
            
            {/* Mobile Menu */}
            <MobileMenu
              onNavigate={(view) => {
                if (view === 'dashboard') setShowAdvancedFilters(false);
                if (view === 'generate') setShowAdvancedFilters(true);
                if (view === 'leads') setShowLeadsTable(true);
              }}
              currentView={
                showAdvancedFilters ? 'generate' :
                showLeadsTable ? 'leads' : 'dashboard'
              }
            />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => setShowAdvancedFilters(false)}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
              >
                📊 Dashboard
              </button>
              <button 
                onClick={() => setShowAdvancedFilters(true)}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
              >
                🚀 Generate Leads
              </button>
              <button 
                onClick={() => setShowLeadsTable(true)}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
              >
                📋 My Leads
              </button>
              
              {/* Dark Mode Toggle */}
              <div className="ml-4">
                <DarkModeToggle />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showAdvancedFilters && !showLeadsTable ? (
          // Dashboard View
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatsCard
                icon="📊"
                title="Total Leads"
                value={stats.totalLeads.toLocaleString()}
                trend={{ value: 12, isPositive: true }}
              />
              
              <StatsCard
                icon="🆕"
                title="New This Week"
                value={stats.newThisWeek.toLocaleString()}
                trend={{ value: 8, isPositive: true }}
              />
              
              <StatsCard
                icon="⭐"
                title="High Quality"
                value={stats.highQuality.toLocaleString()}
                trend={{ value: 15, isPositive: true }}
              />
              
              <StatsCard
                icon="🏭"
                title="Industries"
                value={stats.industries.length}
              />
            </div>

            {/* Quick Actions */}
            <Card padding="lg" shadow="xl" hover>
              <div className="text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Generate High-Quality Leads?
                </h2>
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
                  Use our AI-powered scraper to find real business leads from Google Maps, LinkedIn, and more. 
                  No more fake data - get authentic leads with verified contact information.
                </p>
                
                <div className="text-center mt-6 lg:mt-8">
                  <Button
                    size="xl"
                    onClick={() => setShowAdvancedFilters(true)}
                    icon="🚀"
                    fullWidth={false}
                    className="w-full sm:w-auto"
                  >
                    Start Lead Generation
                  </Button>
                </div>
              </div>
            </Card>
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

            {/* Collapsible Filters */}
            <CollapsibleFilters
              filterTokens={filterTokens}
              onFilterTokensChange={setFilterTokens}
              onClearFilters={clearAllFilters}
              isExpanded={filtersExpanded}
              onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
            />

            {/* Enhanced Progress Tracker */}
            <ProgressTracker
              currentStep={
                generatedLeads.length > 0 ? 'results' :
                isLoading ? 'searching' : 'filters'
              }
              totalLeads={generatedLeads.length}
              isLoading={isLoading}
              hasFilters={filterTokens.length > 0}
            />

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <Button
                onClick={startScraping}
                disabled={isLoading || filterTokens.length === 0}
                size="xl"
                loading={isLoading}
                icon={isLoading ? '🔍' : '🚀'}
                fullWidth={false}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Searching...' : 'Generate Leads'}
              </Button>
              
              {isLoading && (
                <div className="text-blue-600 font-medium">
                  {jobStatus}
                </div>
              )}
            </div>

            {/* Results */}
            {generatedLeads.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🎯 Generated Leads ({generatedLeads.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Industry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lead Score</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {generatedLeads.map((lead, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lead.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.jobTitle}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.industry}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.leadScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              lead.leadScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Leads</h2>
              <button
                onClick={() => setShowLeadsTable(false)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📋 All Leads ({generatedLeads.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lead Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {generatedLeads.length > 0 ? (
                      generatedLeads.map((lead, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lead.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.jobTitle}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.industry}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.leadScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              lead.leadScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                              {lead.leadScore}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <span className="text-4xl mb-4 block">📭</span>
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads yet</p>
                            <p className="text-gray-500 dark:text-gray-400">Generate your first leads to see them here</p>
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
