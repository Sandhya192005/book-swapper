import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User } from 'lucide-react';
import { BookRating as BookRatingType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface BookRatingProps {
  bookId: string;
  className?: string;
}

const BookRating: React.FC<BookRatingProps> = ({ bookId, className = '' }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<BookRatingType[]>([]);
  const [userRating, setUserRating] = useState<BookRatingType | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, [bookId]);

  const loadRatings = () => {
    setLoading(true);
    try {
      const storedRatings = JSON.parse(localStorage.getItem('bookRatings') || '[]');
      const bookRatings = storedRatings
        .filter((rating: BookRatingType) => rating.bookId === bookId)
        .map((rating: BookRatingType) => ({
          ...rating,
          createdAt: new Date(rating.createdAt)
        }));
      
      setRatings(bookRatings);
      
      // Find user's existing rating
      const existingUserRating = bookRatings.find((rating: BookRatingType) => rating.userId === user?.id);
      setUserRating(existingUserRating || null);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!user || newRating === 0) return;

    setIsSubmitting(true);
    try {
      const ratingData: BookRatingType = {
        id: Date.now().toString(),
        bookId,
        userId: user.id,
        rating: newRating,
        comment: newComment.trim() || undefined,
        createdAt: new Date()
      };

      const storedRatings = JSON.parse(localStorage.getItem('bookRatings') || '[]');
      
      // Remove existing rating from this user for this book
      const filteredRatings = storedRatings.filter(
        (rating: BookRatingType) => !(rating.bookId === bookId && rating.userId === user.id)
      );
      
      // Add new rating
      const updatedRatings = [...filteredRatings, ratingData];
      localStorage.setItem('bookRatings', JSON.stringify(updatedRatings));
      
      // Update state
      setUserRating(ratingData);
      loadRatings();
      setShowRatingForm(false);
      setNewRating(0);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onStarClick?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getUserName = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.id === userId);
    return user?.name || 'Anonymous User';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Rating Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {renderStars(Math.round(averageRating))}
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
          </span>
        </div>

        {user && !userRating && (
          <button
            onClick={() => setShowRatingForm(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rate Book
          </button>
        )}
      </div>

      {/* User's Rating Form */}
      {showRatingForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Rate this book
          </h4>
          
          <div className="mb-3">
            {renderStars(newRating, true, setNewRating)}
          </div>
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a review (optional)..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none mb-3"
          />
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowRatingForm(false);
                setNewRating(0);
                setNewComment('');
              }}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitRating}
              disabled={newRating === 0 || isSubmitting}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-1" />
                  Submitting...
                </div>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </div>
      )}

      {/* User's Existing Rating */}
      {userRating && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Your Rating
            </span>
            <button
              onClick={() => {
                setNewRating(userRating.rating);
                setNewComment(userRating.comment || '');
                setShowRatingForm(true);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Edit
            </button>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {renderStars(userRating.rating)}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {userRating.createdAt.toLocaleDateString()}
            </span>
          </div>
          {userRating.comment && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {userRating.comment}
            </p>
          )}
        </div>
      )}

      {/* All Ratings */}
      {ratings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Reviews
          </h4>
          {ratings
            .filter(rating => rating.userId !== user?.id) // Don't show user's own rating again
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((rating) => (
              <div key={rating.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getUserName(rating.userId)}
                      </span>
                    </div>
                    {renderStars(rating.rating)}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {rating.createdAt.toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rating.comment}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}

      {ratings.length === 0 && (
        <div className="text-center py-4">
          <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No reviews yet. Be the first to rate this book!
          </p>
        </div>
      )}
    </div>
  );
};

export default BookRating;