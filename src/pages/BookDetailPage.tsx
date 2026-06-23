import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Flag,
  User,
  Phone,
  Mail,
  Badge,
  Calendar,
  BookOpen,
  IndianRupee,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { useRequests } from '../hooks/useRequests';
import BookLocationMap from '../components/common/BookLocationMap';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Book, User as UserType } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookRating from '../components/books/BookRating';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, toggleFavorite, isFavorited } = useBooks();
  const { createRequest } = useRequests();
  const { user, isAuthenticated } = useAuth();
  
  const [book, setBook] = useState<Book | null>(null);
  const [owner, setOwner] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find the actual book from the books list
        const foundBook = books.find(b => b.id === id);
        
        if (foundBook) {
          setBook(foundBook);
          
          // Get owner information from users list
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const bookOwner = users.find((u: UserType) => u.id === foundBook.ownerId);
          
          if (bookOwner) {
            setOwner({
              ...bookOwner,
              createdAt: new Date(bookOwner.createdAt)
            });
          } else {
            // Create a default owner if not found
            const defaultOwner: UserType = {
              id: foundBook.ownerId,
              name: `User ${foundBook.ownerId.slice(0, 8)}`,
              email: `user${foundBook.ownerId}@example.com`,
              campus: foundBook.location,
              genres: [],
              reputation: 75,
              badges: ['Member'],
              verifiedLevels: ['email'],
              createdAt: new Date(),
            };
            setOwner(defaultOwner);
          }
        } else {
          // Book not found
          setBook(null);
          setOwner(null);
        }
      } catch (error) {
        console.error('Failed to fetch book details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id, books]);

  const handleRequestBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!book) return;

    setIsSubmittingRequest(true);
    try {
      await createRequest(book.id, requestMessage);
      setShowRequestModal(false);
      setRequestMessage('');
      // Show success message
      alert('Request sent successfully!');
    } catch (error) {
      console.error('Failed to send request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const getDistanceText = () => {
    if (!book?.geoPoint || !user?.geoPoint) return null;
    
    const distance = calculateDistance(
      user.geoPoint.latitude,
      user.geoPoint.longitude,
      book.geoPoint.latitude,
      book.geoPoint.longitude
    );
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const nextImage = () => {
    if (book) {
      setCurrentImageIndex((prev) => (prev + 1) % book.photos.length);
    }
  };

  const prevImage = () => {
    if (book) {
      setCurrentImageIndex((prev) => (prev - 1 + book.photos.length) % book.photos.length);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book || !owner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Book not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Images */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700">
                <img
                  src={book.photos[currentImageIndex]}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                
                {book.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {book.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    {currentImageIndex + 1} / {book.photos.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {book.photos.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {book.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? 'border-blue-500'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${book.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {book.title}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    by {book.authors.join(', ')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => book && toggleFavorite(book.id)}
                    className={`p-2 rounded-full transition-colors ${
                      book && isFavorited(book.id)
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${book && isFavorited(book.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Price and Availability */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getAvailabilityColor(book.availability)}`}>
                  {book.availability === 'sell' ? 'For Sale' : 
                   book.availability === 'swap' ? 'For Swap' :
                   book.availability === 'borrow' ? 'For Borrow' : 'Donate'}
                </span>
                
                {book.price && (
                  <div className="flex items-center space-x-1 text-2xl font-bold text-gray-900 dark:text-white">
                    <IndianRupee className="h-6 w-6" />
                    <span>{book.price.toLocaleString()}</span>
                  </div>
                )}
                
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getConditionColor(book.condition)}`}>
                  {book.condition === 'like-new' ? 'Like New' : 
                   book.condition.charAt(0).toUpperCase() + book.condition.slice(1)}
                </span>
              </div>

              {/* Location and Distance */}
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{book.location}</span>
                </div>
                {getDistanceText() && (
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{getDistanceText()}</span>
                  </div>
                )}
                {book.geoPoint && (
                  <button
                    onClick={() => setShowLocationMap(true)}
                    className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>View on Map</span>
                  </button>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Listed {book.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Categories:</span>
                  <div className="inline-flex flex-wrap gap-2">
                    {book.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                {book.tags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Tags:</span>
                    <div className="inline-flex flex-wrap gap-2">
                      {book.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {book.isbn && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">ISBN:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{book.isbn}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Language:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{book.language}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Owner Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Book Owner
              </h2>
              
              <div className="flex items-start space-x-4">
                {owner.avatar ? (
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                    <span className="text-white text-xl font-bold">
                      {owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {owner.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {owner.reputation}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {owner.campus}{owner.area && `, ${owner.area}`}
                      </span>
                      {owner.geoPoint && (
                        <button
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${owner.geoPoint!.latitude},${owner.geoPoint!.longitude}`;
                            window.open(url, '_blank');
                          }}
                          className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        >
                          View on Map
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {owner.email}
                      </span>
                    </div>
                    
                    {owner.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {owner.phone}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Member since {owner.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {owner.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                      >
                        <Badge className="h-3 w-3 mr-1" />
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  {/* Verification Status */}
                  <div className="flex items-center space-x-3 mt-3">
                    {owner.verifiedLevels.includes('email') && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        <Mail className="h-3 w-3 mr-1" />
                        Email Verified
                      </span>
                    )}
                    {owner.verifiedLevels.includes('phone') && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        <Phone className="h-3 w-3 mr-1" />
                        Phone Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Rating */}
            <BookRating bookId={book.id} />

            {/* Action Buttons */}
            {user?.id !== owner.id && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>
                      {book.availability === 'sell' ? 'Request to Buy' :
                       book.availability === 'swap' ? 'Request to Swap' :
                       book.availability === 'borrow' ? 'Request to Borrow' : 'Request Book'}
                    </span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                    <Link to={`/profile/${owner.id}`} className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>View Profile</span>
                    </Link>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send Request
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Send a message to {owner.name} about "{book.title}"
                </p>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Hi! I'm interested in this book. Is it still available?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestBook}
                  disabled={isSubmittingRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmittingRequest ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending...
                    </div>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Map Modal */}
        {showLocationMap && book && (
          <BookLocationMap
            book={book}
            userLocation={user?.geoPoint}
            onClose={() => setShowLocationMap(false)}
          />
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;