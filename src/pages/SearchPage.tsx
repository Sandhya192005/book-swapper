import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import SearchFilters from '../components/books/SearchFilters';
import BookCard from '../components/books/BookCard';
import BookLocationMap from '../components/common/BookLocationMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useBooks } from '../hooks/useBooks';
import { useAuth } from '../contexts/AuthContext';
import { SearchFilters as SearchFiltersType, Book } from '../types';

const SearchPage: React.FC = () => {
  const { books, loading, searchBooks, toggleFavorite, isFavorited } = useBooks();
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBookForMap, setSelectedBookForMap] = useState<Book | null>(null);

  useEffect(() => {
    // Show all books initially
    setSearchResults(books);
  }, [books]);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const results = await searchBooks(filters);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFavorite = (bookId: string) => {
    toggleFavorite(bookId);
  };

  const handleContact = (bookId: string) => {
    console.log('Contact owner for book:', bookId);
    // TODO: Navigate to request/chat page
  };

  const handleViewLocation = (bookId: string) => {
    const book = searchResults.find(b => b.id === bookId);
    if (book) {
      setSelectedBookForMap(book);
    }
  };

  if (loading && !hasSearched) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Books
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find the perfect books for your studies and interests
          </p>
        </div>

        {/* Search Filters */}
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          isLoading={isSearching}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {hasSearched ? 'Search Results' : 'All Books'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchResults.length} book{searchResults.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Sort Options */}
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="condition">Best Condition</option>
          </select>
        </div>

        {/* Results */}
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onFavorite={handleFavorite}
                onContact={handleContact}
                onViewLocation={handleViewLocation}
                isFavorited={isFavorited(book.id)}
                showOwnerInfo={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {hasSearched ? 'No books found' : 'No books available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasSearched 
                ? 'Try adjusting your search criteria to find more books.'
                : 'Be the first to list a book in this category!'
              }
            </p>
            {hasSearched && (
              <button
                onClick={() => {
                  setFilters({});
                  setHasSearched(false);
                  setSearchResults(books);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Load More (if pagination needed) */}
        {searchResults.length > 0 && searchResults.length % 12 === 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Load More Books
            </button>
          </div>
        )}

        {/* Location Map Modal */}
        {selectedBookForMap && (
          <BookLocationMap
            book={selectedBookForMap}
            userLocation={user?.geoPoint}
            onClose={() => setSelectedBookForMap(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;