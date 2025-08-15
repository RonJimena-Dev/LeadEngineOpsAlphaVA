'use client';

import { useState } from 'react';
import TokenizedFilterInput, { FilterToken } from './TokenizedFilterInput';

interface CollapsibleFiltersProps {
  filterTokens: FilterToken[];
  onFilterTokensChange: (tokens: FilterToken[]) => void;
  onClearFilters: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export default function CollapsibleFilters({
  filterTokens,
  onFilterTokensChange,
  onClearFilters,
  isExpanded,
  onToggleExpanded
}: CollapsibleFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* Header with Toggle */}
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎯 Advanced Filters
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filterTokens.length > 0 ? `(${filterTokens.length} active)` : '(No filters)'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {filterTokens.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters();
                }}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
              >
                🗑️ Clear All
              </button>
            )}
            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              🔽
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 py-4 space-y-4">
          {/* Filter Input */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3 text-base">
              Add Filters
            </label>
            <TokenizedFilterInput
              tokens={filterTokens}
              onTokensChange={onFilterTokensChange}
              placeholder="Type to search job titles, locations, industries, etc."
              className="w-full"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              💡 Type keywords and the system will automatically detect the filter type. 
              Press Enter or Tab to add filters, Backspace to remove.
            </p>
          </div>

          {/* Active Filters Summary */}
          {filterTokens.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                📋 Active Filters:
              </h4>
              <div className="flex flex-wrap gap-2">
                {filterTokens.map((token) => (
                  <span
                    key={token.id}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                  >
                    <span className="text-xs opacity-75 mr-1">{token.label}:</span>
                    {token.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
