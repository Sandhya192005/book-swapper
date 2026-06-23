import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  BookOpen,
  Calendar,
  Filter
} from 'lucide-react';
import { useRequests } from '../hooks/useRequests';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../hooks/useBooks';
import { BookRequest } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RequestsPage: React.FC = () => {
  const { requests, loading, updateRequestStatus, getUserRequests, getReceivedRequests } = useRequests();
  const { user } = useAuth();
  const { books } = useBooks();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'expired'>('all');

  const getStatusIcon = (status: BookRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: BookRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const handleStatusUpdate = async (requestId: string, status: BookRequest['status']) => {
    try {
      await updateRequestStatus(requestId, status);
    } catch (error) {
      console.error('Failed to update request status:', error);
    }
  };

  // Get actual requests based on filter
  const getFilteredRequests = () => {
    let allRequests = requests;
    
    // Add book and requester information to requests
    allRequests = allRequests.map(request => {
      const book = books.find(b => b.id === request.bookId);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const requester = users.find((u: any) => u.id === request.requesterId);
      
      return {
        ...request,
        book: book ? {
          ...book,
          createdAt: new Date(book.createdAt),
          updatedAt: new Date(book.updatedAt),
        } : undefined,
        requester: requester ? {
          ...requester,
          createdAt: new Date(requester.createdAt),
        } : undefined,
      };
    });
    
    return allRequests;
  };

  const filteredRequests = getFilteredRequests().filter(request => {
    if (filter === 'sent' && request.requesterId !== user?.id) return false;
    if (filter === 'received' && request.book?.ownerId !== user?.id) return false;
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Book Requests
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your book exchange requests
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Requests</option>
                <option value="sent">Sent by Me</option>
                <option value="received">Received by Me</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Book Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <img
                        src={request.book?.photos[0]}
                        alt={request.book?.title}
                        className="w-16 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {request.book?.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          by {request.book?.authors.join(', ')}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{request.book?.availability}</span>
                          </span>
                          {request.book?.price && (
                            <span>₹{request.book.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-1 text-sm text-orange-600 dark:text-orange-400">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeRemaining(request.expiresAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Requester/Owner Info */}
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {request.requesterId === user?.id ? 'You requested' : `Request from ${request.requester?.name}`}
                      </span>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{request.message}"
                        </p>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {request.createdAt.toLocaleDateString()} at {request.createdAt.toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Actions */}
                    {request.book?.ownerId === user?.id && request.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'accepted')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'declined')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {request.status === 'accepted' && (
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Start Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'sent' 
                ? "You haven't sent any requests yet."
                : filter === 'received'
                ? "You haven't received any requests yet."
                : "No requests match your current filters."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;