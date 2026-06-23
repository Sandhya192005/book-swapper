import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Star, 
  Badge,
  Heart,
  MessageCircle,
  Eye,
  Map
} from 'lucide-react';
import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  showOwnerInfo?: boolean;
  onFavorite?: (bookId: string) => void;
  onContact?: (bookId: string) => void;
  onViewLocation?: (bookId: string) => void;
  isFavorited?: boolean;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  showOwnerInfo = true,
  onFavorite,
  onContact,
  onViewLocation,
  isFavorited = false,
  className = ''
}) => {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
      case 'like-new':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'sell':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'swap':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'borrow':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'donate':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getAverageRating = () => {
    const ratings = JSON.parse(localStorage.getItem('bookRatings') || '[]');
    const bookRatings = ratings.filter((rating: any) => rating.bookId === book.id);
    if (bookRatings.length === 0) return 0;
    return bookRatings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / bookRatings.length;
  };

  const averageRating = getAverageRating();
  const ratingCount = JSON.parse(localStorage.getItem('bookRatings') || '[]')
    .filter((rating: any) => rating.bookId === book.id).length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 overflow-hidden group ${className}`}>
      {/* Book Image */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
        <img
          src={book.photos[0] || 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Overlay actions */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {onFavorite && (
            <button
              onClick={() => onFavorite(book.id)}
              className={`p-2 rounded-full backdrop-blur-sm border transition-colors ${
                isFavorited
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white/80 border-white/50 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
          
          <Link
            to={`/book/${book.id}`}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(book.availability)}`}>
            {book.availability === 'sell' ? 'For Sale' : 
             book.availability === 'swap' ? 'For Swap' :
             book.availability === 'borrow' ? 'For Borrow' : 'Donate'}
          </span>
          {book.availability === 'sell' && book.price && (
            <span className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-900 rounded-full">
              {formatPrice(book.price)}
            </span>
          )}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        {/* Title and Authors */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link to={`/book/${book.id}`}>
              {book.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
            by {book.authors.join(', ')}
          </p>
        </div>

        {/* Rating */}
        {averageRating > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({ratingCount} review{ratingCount !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Condition and Categories */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(book.condition)}`}>
            {book.condition === 'like-new' ? 'Like New' : 
             book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
          </span>
          {book.categories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Location and Time */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{book.location}</span>
            {book.geoPoint && (
              <button
                onClick={() => {
                  onViewLocation?.(book.id);
                }}
                className="ml-1 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                title="View location on map"
              >
                <Map className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{timeAgo(book.createdAt)}</span>
          </div>
        </div>

        {/* Owner Info */}
        {showOwnerInfo && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {book.ownerId.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Owner ID: {book.ownerId.slice(0, 8)}...
              </span>
            </div>

            {onContact && (
              <button
                onClick={() => onContact(book.id)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Contact owner"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Show owner info if available */}
        {showOwnerInfo && book.owner && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {book.owner.avatar ? (
                <img
                  src={book.owner.avatar}
                  alt={book.owner.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {book.owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {book.owner.name}
              </span>
              {book.owner.reputation > 80 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    {book.owner.reputation}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {book.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
            {book.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookCard;