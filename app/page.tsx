'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newThisWeek: 0,
    highQuality: 0,
    industries: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    // Load initial stats
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // This would fetch from your API
      setStats({
        totalLeads: 1250,
        newThisWeek: 47,
        highQuality: 892,
        industries: ['Real Estate', 'Healthcare', 'Legal', 'Finance', 'Marketing']
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async (searchParams: any) => {
    // This would trigger the scraping process
    console.log('Search triggered:', searchParams);
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Search completed:', searchParams);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="lead-engine-gradient text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/Logo.PNG"
                alt="OpsAlpha VA Logo"
                width={50}
                height={50}
                className="rounded-lg"
                priority
              />
              <div>
                <h1 className="text-2xl font-bold">Lead Engine</h1>
                <p className="text-blue-100 text-sm">Professional Lead Generation Platform</p>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-white hover:text-blue-100">Dashboard</a>
              <a href="#" className="text-white hover:text-blue-100">Generate Leads</a>
              <a href="#" className="text-white hover:text-blue-100">My Leads</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Generate High-Quality Leads Like a Pro
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover, enrich, and manage business leads from multiple sources with our 
            intelligent scraping engine. Target any industry, anywhere in the world.
          </p>
        </div>

        {/* Simple Stats Overview */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Leads */}
            <div className="lead-engine-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalLeads.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Total Leads</div>
              <div className="text-sm text-gray-500 mt-1">All time</div>
            </div>

            {/* New This Week */}
            <div className="lead-engine-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                +{stats.newThisWeek}
              </div>
              <div className="text-gray-600 font-medium">New This Week</div>
              <div className="text-sm text-gray-500 mt-1">Last 7 days</div>
            </div>

            {/* High Quality Leads */}
            <div className="lead-engine-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.highQuality.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">High Quality</div>
              <div className="text-sm text-gray-500 mt-1">Score 80+</div>
            </div>

            {/* Active Industries */}
            <div className="lead-engine-card rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.industries.length}
              </div>
              <div className="text-gray-600 font-medium">Industries</div>
              <div className="text-sm text-gray-500 mt-1">Targeted</div>
            </div>
          </div>
        </div>

        {/* Advanced Search Panel */}
        <div className="mb-12">
          <div className="lead-engine-card rounded-xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Advanced Lead Generation
            </h3>
            
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Industry</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Industry</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="legal">Legal</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                  <option value="technology">Technology</option>
                  <option value="construction">Construction</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="consulting">Consulting</option>
                  <option value="non-profit">Non-Profit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Location</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Location</option>
                  <option value="florida">Florida</option>
                  <option value="new-york">New York</option>
                  <option value="california">California</option>
                  <option value="texas">Texas</option>
                  <option value="illinois">Illinois</option>
                  <option value="pennsylvania">Pennsylvania</option>
                  <option value="ohio">Ohio</option>
                  <option value="georgia">Georgia</option>
                  <option value="north-carolina">North Carolina</option>
                  <option value="michigan">Michigan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Company Size</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Any Size</option>
                  <option value="startup">Startup (1-10 employees)</option>
                  <option value="small">Small Business (11-50 employees)</option>
                  <option value="mid-market">Mid-Market (51-200 employees)</option>
                  <option value="enterprise">Enterprise (200+ employees)</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="text-center mb-6">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                <svg className={`ml-2 w-4 h-4 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="space-y-6 border-t pt-6">
                {/* Revenue & Funding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Revenue Range</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any Revenue</option>
                      <option value="under-1m">Under $1M</option>
                      <option value="1m-10m">$1M - $10M</option>
                      <option value="10m-100m">$10M - $100M</option>
                      <option value="100m-plus">$100M+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Funding Stage</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any Funding</option>
                      <option value="bootstrapped">Bootstrapped</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="series-c-plus">Series C+</option>
                    </select>
                  </div>
                </div>

                {/* Technology & Industry Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Technology Stack</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any Technology</option>
                      <option value="react">React/JavaScript</option>
                      <option value="python">Python</option>
                      <option value="nodejs">Node.js</option>
                      <option value="aws">AWS</option>
                      <option value="microsoft">Microsoft Stack</option>
                      <option value="salesforce">Salesforce</option>
                      <option value="wordpress">WordPress</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Industry Subcategory</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any Subcategory</option>
                      <option value="saas">SaaS</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="fintech">FinTech</option>
                      <option value="healthtech">HealthTech</option>
                      <option value="edtech">EdTech</option>
                      <option value="proptech">PropTech</option>
                      <option value="legaltech">LegalTech</option>
                      <option value="marketing-tech">Marketing Technology</option>
                    </select>
                  </div>
                </div>

                {/* Contact & Company Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Contact Level</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any Level</option>
                      <option value="c-level">C-Level (CEO, CTO, CFO)</option>
                      <option value="vp">VP Level</option>
                      <option value="director">Director Level</option>
                      <option value="manager">Manager Level</option>
                      <option value="founder">Founder</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Company Age</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any Age</option>
                      <option value="new">New (0-1 years)</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-plus">5+ years</option>
                    </select>
                  </div>
                </div>

                {/* Geographic Targeting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Metro Area</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Any Metro</option>
                      <option value="miami">Miami Metro</option>
                      <option value="orlando">Orlando Metro</option>
                      <option value="tampa">Tampa Bay Metro</option>
                      <option value="jacksonville">Jacksonville Metro</option>
                      <option value="new-york">New York Metro</option>
                      <option value="los-angeles">Los Angeles Metro</option>
                      <option value="chicago">Chicago Metro</option>
                      <option value="dallas">Dallas Metro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Radius (miles)</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="25">25 miles</option>
                      <option value="50">50 miles</option>
                      <option value="100">100 miles</option>
                      <option value="250">250 miles</option>
                      <option value="500">500 miles</option>
                    </select>
                  </div>
                </div>

                {/* Custom Keywords */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Custom Keywords</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 'AI', 'blockchain', 'remote-first', 'B2B SaaS'"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Add specific keywords to narrow your search</p>
                </div>
              </div>
            )}

            {/* Search Button */}
            <div className="text-center mt-8">
              <button 
                className="lead-engine-button px-8 py-3 text-lg"
                onClick={() => handleSearch({ 
                  industry: 'Real Estate', 
                  location: 'Florida',
                  companySize: 'mid-market',
                  revenueRange: '10m-100m'
                })}
                disabled={isLoading}
              >
                {isLoading ? '🔍 Generating Leads...' : '🚀 Generate Targeted Leads'}
              </button>
              
              {isLoading && (
                <div className="mt-4 text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Searching multiple sources...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simple Features Section */}
        <section className="mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Lead Engine?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Multi-Source Scraping"
              description="Extract leads from Google Maps, LinkedIn, Yellow Pages, and more with intelligent targeting."
            />
            <FeatureCard
              icon="🔍"
              title="Smart Enrichment"
              description="Automatically find emails, phone numbers, and company information using advanced algorithms."
            />
            <FeatureCard
              icon="📊"
              title="Lead Scoring"
              description="Rate leads by quality and completeness to focus on the most promising prospects."
            />
            <FeatureCard
              icon="⚡"
              title="Automated Workflows"
              description="Set up weekly scraping sessions with email and Slack notifications."
            />
            <FeatureCard
              icon="📈"
              title="Analytics Dashboard"
              description="Track performance, source effectiveness, and lead conversion rates."
            />
            <FeatureCard
              icon="🚀"
              title="Export & Integrate"
              description="Export to CSV, Excel, or integrate with your CRM system."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-300 mb-2">
            Powered by <span className="font-semibold text-blue-400">OpsAlpha VA</span>
          </p>
          <p className="text-sm text-gray-400">
            Professional virtual assistant services for modern businesses
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="lead-engine-card rounded-xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-800 mb-3">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
