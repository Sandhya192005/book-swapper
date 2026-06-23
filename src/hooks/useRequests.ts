import { useState, useEffect } from 'react';
import { BookRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from './useBooks';

// Get initial requests from localStorage
const getInitialRequests = (): BookRequest[] => {
  const stored = localStorage.getItem('bookRequests');
  if (stored) {
    return JSON.parse(stored).map((request: any) => ({
      ...request,
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt),
      expiresAt: new Date(request.expiresAt),
    }));
  }
  return [];
};

export const useRequests = () => {
  const [requests, setRequests] = useState<BookRequest[]>(getInitialRequests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { books } = useBooks();

  useEffect(() => {
    // Load requests from localStorage whenever component mounts
    const storedRequests = getInitialRequests();
    setRequests(storedRequests);
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const storedRequests = getInitialRequests();
      setRequests(storedRequests);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (bookId: string, message?: string): Promise<BookRequest> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRequest: BookRequest = {
        id: Date.now().toString(),
        bookId,
        requesterId: user.id,
        status: 'pending',
        message,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRequests = [newRequest, ...requests];
      setRequests(updatedRequests);
      
      // Save to localStorage
      localStorage.setItem('bookRequests', JSON.stringify(updatedRequests));
      
      return newRequest;
    } catch (err) {
      setError('Failed to create request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string, 
    status: BookRequest['status']
  ): Promise<BookRequest | null> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status, updatedAt: new Date() }
          : req
      );
      
      setRequests(updatedRequests);
      
      // Save to localStorage
      localStorage.setItem('bookRequests', JSON.stringify(updatedRequests));

      return requests.find(req => req.id === requestId) || null;
    } catch (err) {
      setError('Failed to update request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserRequests = (userId?: string): BookRequest[] => {
    if (!userId) return [];
    return requests.filter(req => req.requesterId === userId);
  };

  const getBookRequests = (bookId: string): BookRequest[] => {
    return requests.filter(req => req.bookId === bookId);
  };

  const getReceivedRequests = (userId?: string): BookRequest[] => {
    if (!userId) return [];
    // Get requests for books owned by this user
    const userBooks = books.filter(book => book.ownerId === userId);
    const userBookIds = userBooks.map(book => book.id);
    return requests.filter(req => userBookIds.includes(req.bookId));
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequestStatus,
    getUserRequests,
    getBookRequests,
    getReceivedRequests,
    fetchRequests,
  };
};