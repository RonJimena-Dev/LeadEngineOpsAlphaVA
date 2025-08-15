'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

export interface FilterToken {
  id: string;
  value: string;
  type: 'industry' | 'location' | 'jobTitle' | 'companySize';
  label: string;
}

interface TokenizedFilterInputProps {
  tokens: FilterToken[];
  onTokensChange: (tokens: FilterToken[]) => void;
  placeholder?: string;
  className?: string;
}

const filterTypeConfig = {
  industry: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Industry' },
  location: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Location' },
  jobTitle: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Job Title' },
  companySize: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Company Size' }
};

const suggestions = {
  industry: [
    'Real Estate', 'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Marketing', 'Consulting', 'Legal', 'Non-Profit'
  ],
  location: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'
  ],
  jobTitle: [
    'CEO', 'Manager', 'Director', 'VP', 'President', 'Founder', 'Owner',
    'Consultant', 'Specialist', 'Coordinator', 'Assistant', 'Analyst'
  ],
  companySize: [
    'Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'
  ]
};

export default function TokenizedFilterInput({ 
  tokens, 
  onTokensChange, 
  placeholder = "Type to search job titles, locations, etc.",
  className = ""
}: TokenizedFilterInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [currentFilterType, setCurrentFilterType] = useState<FilterToken['type']>('jobTitle');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-detect filter type based on input
  useEffect(() => {
    const detectFilterType = (input: string): FilterToken['type'] => {
      const lowerInput = input.toLowerCase();
      
      // Check for industry keywords
      if (['real estate', 'tech', 'healthcare', 'finance', 'education', 'manufacturing', 'retail', 'construction', 'marketing', 'consulting', 'legal'].some(keyword => lowerInput.includes(keyword))) {
        return 'industry';
      }
      
      // Check for location keywords
      if (['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'florida', 'california', 'texas', 'new york'].some(keyword => lowerInput.includes(keyword))) {
        return 'location';
      }
      
      // Check for job title keywords
      if (['ceo', 'manager', 'director', 'vp', 'president', 'founder', 'owner', 'consultant', 'specialist', 'coordinator', 'assistant', 'analyst', 'agent'].some(keyword => lowerInput.includes(keyword))) {
        return 'jobTitle';
      }
      
      // Check for company size keywords
      if (['startup', 'small', 'medium', 'large', 'enterprise', '1-10', '11-50', '51-200', '201-1000', '1000+'].some(keyword => lowerInput.includes(keyword))) {
        return 'companySize';
      }
      
      return 'jobTitle'; // Default
    };

    if (inputValue.trim()) {
      const detectedType = detectFilterType(inputValue);
      setCurrentFilterType(detectedType);
      
      // Filter suggestions based on detected type
      const typeSuggestions = suggestions[detectedType];
      const filtered = typeSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [inputValue]);

  const addToken = (value: string, type?: FilterToken['type']) => {
    if (!value.trim()) return;
    
    const tokenType = type || currentFilterType;
    const newToken: FilterToken = {
      id: `${tokenType}_${Date.now()}`,
      value: value.trim(),
      type: tokenType,
      label: filterTypeConfig[tokenType].label
    };
    
    onTokensChange([...tokens, newToken]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeToken = (tokenId: string) => {
    onTokensChange(tokens.filter(token => token.id !== tokenId));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        addToken(filteredSuggestions[selectedSuggestionIndex], currentFilterType);
      } else if (inputValue.trim()) {
        addToken(inputValue, currentFilterType);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (inputValue.trim()) {
        addToken(inputValue, currentFilterType);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && tokens.length > 0) {
      removeToken(tokens[tokens.length - 1].id);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addToken(suggestion, currentFilterType);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? <strong key={index} className="font-bold text-gray-900">{part}</strong> : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Token Container */}
      <div className="min-h-[48px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all duration-200">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Existing Tokens */}
          {tokens.map((token) => (
            <div
              key={token.id}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${filterTypeConfig[token.type].color} hover:shadow-md`}
            >
              <span className="text-xs opacity-75">{token.label}</span>
              <span>{token.value}</span>
              <button
                onClick={() => removeToken(token.id)}
                className="ml-1 w-4 h-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors duration-150"
              >
                <span className="text-xs font-bold">×</span>
              </button>
            </div>
          ))}
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.trim().length > 0)}
            placeholder={tokens.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[150px] sm:min-w-[200px] outline-none text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {filterTypeConfig[currentFilterType].label} Suggestions
            </span>
          </div>
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                index === selectedSuggestionIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {highlightMatch(suggestion, inputValue)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
