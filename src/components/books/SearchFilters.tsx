import React, { useState } from 'react';
import { Search, Filter, X, MapPin, IndianRupee } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../../types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const categories = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Literature',
  'History',
  'Economics',
  'Business',
  'Psychology',
  'Philosophy',
];

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const availabilityOptions = [
  { value: 'sell', label: 'For Sale' },
  { value: 'swap', label: 'For Swap' },
  { value: 'borrow', label: 'For Borrow' },
  { value: 'donate', label: 'Donate' },
];

const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (updates: Partial<SearchFiltersType>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const handleCategoryToggle = (category: string) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateFilters({ categories: updated });
  };

  const handleConditionToggle = (condition: string) => {
    const current = filters.condition || [];
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    updateFilters({ condition: updated });
  };

  const handleAvailabilityToggle = (availability: string) => {
    const current = filters.availability || [];
    const updated = current.includes(availability)
      ? current.filter(a => a !== availability)
      : [...current, availability];
    updateFilters({ availability: updated });
  };

  const handleLanguageToggle = (language: string) => {
    const current = filters.language || [];
    const updated = current.includes(language)
      ? current.filter(l => l !== language)
      : [...current, language];
    updateFilters({ language: updated });
  };

  const activeFiltersCount = [
    filters.categories?.length || 0,
    filters.condition?.length || 0,
    filters.availability?.length || 0,
    filters.language?.length || 0,
    filters.priceMin ? 1 : 0,
    filters.priceMax ? 1 : 0,
    filters.location ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by title, author, or description..."
          value={filters.keyword || ''}
          onChange={(e) => updateFilters({ keyword: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={onSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.categories?.includes(category)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Condition</h4>
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition) => (
                <button
                  key={condition.value}
                  onClick={() => handleConditionToggle(condition.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.condition?.includes(condition.value)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-emerald-500'
                  }`}
                >
                  {condition.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Availability</h4>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAvailabilityToggle(option.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.availability?.includes(option.value)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.priceMin || ''}
                  onChange={(e) => updateFilters({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.priceMax || ''}
                  onChange={(e) => updateFilters({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Location</h4>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter location or campus name..."
                value={filters.location || ''}
                onChange={(e) => updateFilters({ location: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Language */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Language</h4>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageToggle(language)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.language?.includes(language)
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-amber-500'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;