'use client';

import { useState } from 'react';

interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

interface SearchParams {
  industry: string;
  location: string;
  customSearchTerms: string[];
  sources: string[];
}

const INDUSTRIES = [
  'Real Estate',
  'Healthcare',
  'Legal',
  'Finance',
  'Marketing',
  'Technology',
  'Construction',
  'Restaurant',
  'Retail',
  'Education',
  'Manufacturing',
  'Consulting',
  'Insurance',
  'Real Estate',
  'Automotive',
  'Beauty & Wellness',
  'Fitness & Health',
  'Travel & Tourism',
  'Entertainment',
  'Non-Profit'
];

const LOCATIONS = [
  'Florida',
  'New York',
  'California',
  'Texas',
  'Illinois',
  'Pennsylvania',
  'Ohio',
  'Georgia',
  'North Carolina',
  'Michigan',
  'New Jersey',
  'Virginia',
  'Washington',
  'Arizona',
  'Massachusetts',
  'Tennessee',
  'Indiana',
  'Missouri',
  'Maryland',
  'Colorado'
];

const SOURCES = [
  { id: 'google_maps', name: 'Google Maps', description: 'Business listings and reviews' },
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional profiles and companies' },
  { id: 'yellow_pages', name: 'Yellow Pages', description: 'Traditional business directory' },
  { id: 'yelp', name: 'Yelp', description: 'Business reviews and information' },
  { id: 'crunchbase', name: 'Crunchbase', description: 'Company and startup data' }
];

export default function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [customSearchTerms, setCustomSearchTerms] = useState<string[]>([]);
  const [newSearchTerm, setNewSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['google_maps', 'linkedin']);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!industry || !location) {
      alert('Please select an industry and location');
      return;
    }

    const searchParams: SearchParams = {
      industry,
      location,
      customSearchTerms,
      sources: selectedSources
    };

    onSearch(searchParams);
  };

  const addSearchTerm = () => {
    if (newSearchTerm.trim() && !customSearchTerms.includes(newSearchTerm.trim())) {
      setCustomSearchTerms([...customSearchTerms, newSearchTerm.trim()]);
      setNewSearchTerm('');
    }
  };

  const removeSearchTerm = (term: string) => {
    setCustomSearchTerms(customSearchTerms.filter(t => t !== term));
  };

  const toggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter(s => s !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  return (
    <div className="lead-engine-card rounded-xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2">
          Start Lead Generation
        </h3>
        <p className="text-gray-600">
          Choose your target industry and location to begin scraping high-quality leads
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Industry Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Industry *
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select an industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
            <option value="custom">Custom Industry</option>
          </select>
        </div>

        {/* Location Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Location *
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a location</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
            <option value="custom">Custom Location</option>
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
            {/* Custom Search Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Search Terms
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSearchTerm}
                  onChange={(e) => setNewSearchTerm(e.target.value)}
                  placeholder="e.g., 'real estate agents', 'dentists'"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addSearchTerm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {customSearchTerms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customSearchTerms.map((term, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {term}
                      <button
                        type="button"
                        onClick={() => removeSearchTerm(term)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Data Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Sources
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SOURCES.map((source) => (
                  <label key={source.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={() => toggleSource(source.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{source.name}</div>
                      <div className="text-xs text-gray-500">{source.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading || !industry || !location}
            className="lead-engine-button text-white px-8 py-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Leads...</span>
              </div>
            ) : (
              '🚀 Generate Leads'
            )}
          </button>
        </div>
      </form>

      {/* Quick Start Suggestions */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Start Suggestions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickStartCard
            industry="Real Estate"
            location="Florida"
            description="Find real estate agents and brokers in the Sunshine State"
          />
          <QuickStartCard
            industry="Healthcare"
            location="New York"
            description="Discover medical practices and healthcare providers"
          />
          <QuickStartCard
            industry="Legal"
            location="California"
            description="Locate attorneys and law firms in the Golden State"
          />
        </div>
      </div>
    </div>
  );
}

function QuickStartCard({ industry, location, description }: {
  industry: string;
  location: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
      <h5 className="font-semibold text-gray-800 mb-1">{industry} in {location}</h5>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
