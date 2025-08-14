'use client';

import { useState, useEffect } from 'react';

interface Lead {
  id: number;
  name: string;
  industry: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  city: string;
  state: string;
  source: string;
  enrichment_status: string;
  lead_score: number;
  created_at: string;
}

export default function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState({
    industry: '',
    source: '',
    enrichment_status: '',
    minScore: 0,
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(10);

  useEffect(() => {
    // Load sample leads (replace with API call)
    loadSampleLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, filters, sortBy, sortOrder]);

  const loadSampleLeads = () => {
    const sampleLeads: Lead[] = [
      {
        id: 1,
        name: 'Miami Real Estate Group',
        industry: 'Real Estate',
        category: 'Real Estate Agency',
        phone: '(305) 555-0123',
        email: 'info@miamirealestate.com',
        website: 'https://miamirealestate.com',
        location: 'Miami, FL',
        city: 'Miami',
        state: 'FL',
        source: 'google_maps',
        enrichment_status: 'completed',
        lead_score: 95,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Dr. Sarah Johnson DDS',
        industry: 'Healthcare',
        category: 'Dentist',
        phone: '(407) 555-0456',
        email: 'dr.johnson@smileorlando.com',
        website: 'https://smileorlando.com',
        location: 'Orlando, FL',
        city: 'Orlando',
        state: 'FL',
        source: 'google_maps',
        enrichment_status: 'completed',
        lead_score: 88,
        created_at: '2024-01-14T14:20:00Z'
      },
      {
        id: 3,
        name: 'Smith & Associates Law Firm',
        industry: 'Legal',
        category: 'Law Firm',
        phone: '(813) 555-0789',
        email: 'contact@smithlaw.com',
        website: 'https://smithlaw.com',
        location: 'Tampa, FL',
        city: 'Tampa',
        state: 'FL',
        source: 'linkedin',
        enrichment_status: 'completed',
        lead_score: 92,
        created_at: '2024-01-13T09:15:00Z'
      },
      {
        id: 4,
        name: 'Sunshine Financial Advisors',
        industry: 'Finance',
        category: 'Financial Planning',
        phone: '(904) 555-0321',
        email: 'hello@sunshinefinancial.com',
        website: 'https://sunshinefinancial.com',
        location: 'Jacksonville, FL',
        city: 'Jacksonville',
        state: 'FL',
        source: 'yellow_pages',
        enrichment_status: 'pattern_guessed',
        lead_score: 75,
        created_at: '2024-01-12T16:45:00Z'
      },
      {
        id: 5,
        name: 'Digital Marketing Pro',
        industry: 'Marketing',
        category: 'Digital Marketing Agency',
        phone: '(954) 555-0654',
        email: 'info@digitalmarketingpro.com',
        website: 'https://digitalmarketingpro.com',
        location: 'Fort Lauderdale, FL',
        city: 'Fort Lauderdale',
        state: 'FL',
        source: 'google_maps',
        enrichment_status: 'completed',
        lead_score: 85,
        created_at: '2024-01-11T11:30:00Z'
      }
    ];
    
    setLeads(sampleLeads);
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Apply filters
    if (filters.industry) {
      filtered = filtered.filter(lead => lead.industry === filters.industry);
    }
    if (filters.source) {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }
    if (filters.enrichment_status) {
      filtered = filtered.filter(lead => lead.enrichment_status === filters.enrichment_status);
    }
    if (filters.minScore > 0) {
      filtered = filtered.filter(lead => lead.lead_score >= filters.minScore);
    }
    if (filters.searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        lead.location.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Lead];
      let bValue = b[sortBy as keyof Lead];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Industry', 'Category', 'Phone', 'Email', 'Website', 'Location', 'Source', 'Lead Score', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.industry}"`,
        `"${lead.category}"`,
        `"${lead.phone}"`,
        `"${lead.email}"`,
        `"${lead.website}"`,
        `"${lead.location}"`,
        `"${lead.source}"`,
        lead.lead_score,
        `"${lead.enrichment_status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'lead-score-high';
    if (score >= 60) return 'lead-score-medium';
    return 'lead-score-low';
  };

  const getEnrichmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pattern_guessed':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  return (
    <div className="lead-engine-card rounded-xl p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Lead Dashboard</h3>
          <p className="text-gray-600">
            {filteredLeads.length} leads found • {leads.length} total in database
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📊 Export CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search leads..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filters.industry}
          onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Industries</option>
          {Array.from(new Set(leads.map(lead => lead.industry))).map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        <select
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Sources</option>
          {Array.from(new Set(leads.map(lead => lead.source))).map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <select
          value={filters.enrichment_status}
          onChange={(e) => setFilters({ ...filters, enrichment_status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pattern_guessed">Pattern Guessed</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={filters.minScore}
          onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={0}>All Scores</option>
          <option value={80}>80+ (High)</option>
          <option value={60}>60+ (Medium)</option>
          <option value={40}>40+ (Low)</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Lead</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Industry</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.category}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {lead.industry}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    {lead.phone && <div className="text-sm text-gray-600">{lead.phone}</div>}
                    {lead.email && <div className="text-sm text-blue-600">{lead.email}</div>}
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {lead.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">{lead.location}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {lead.source}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getLeadScoreColor(lead.lead_score)}`}>
                    {lead.lead_score}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnrichmentStatusColor(lead.enrichment_status)}`}>
                    {lead.enrichment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstLead + 1} to {Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length} leads
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
