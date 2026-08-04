import { useState, useEffect } from 'react';
import { Book, SearchFilters } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Get initial books from localStorage or use default
const getInitialBooks = (): Book[] => {
  const stored = localStorage.getItem('books');
  if (stored) {
    return JSON.parse(stored).map((book: any) => ({
      ...book,
      createdAt: new Date(book.createdAt),
      updatedAt: new Date(book.updatedAt),
    }));
  }
  
  // Default books if none exist
  const defaultBooks: Book[] = [
    {
      id: '1',
      ownerId: 'demo-user-1',
      title: 'Introduction to Algorithms',
      authors: ['Thomas H. Cormen', 'Charles E. Leiserson'],
      isbn: '9780262033848',
      categories: ['Computer Science', 'Algorithms'],
      language: 'English',
      condition: 'good',
      photos: ['https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'],
      description: 'Comprehensive guide to algorithms and data structures. Great condition with minimal highlighting.',
      availability: 'sell',
      price: 800,
      location: 'IIT Delhi',
      status: 'available',
      tags: ['algorithms', 'computer-science', 'programming'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      ownerId: 'demo-user-2',
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      isbn: '9780132350884',
      categories: ['Computer Science', 'Software Engineering'],
      language: 'English',
      condition: 'like-new',
      photos: ['https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400'],
      description: 'Essential book for writing clean, maintainable code. Barely used, like new condition.',
      availability: 'swap',
      location: 'Delhi University',
      status: 'available',
      tags: ['clean-code', 'programming', 'software-engineering'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ];
  
  localStorage.setItem('books', JSON.stringify(defaultBooks));
  return defaultBooks;
};

export const useBooks = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>(getInitialBooks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load books from localStorage
    const fetchBooks = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        const storedBooks = getInitialBooks();
        setBooks(storedBooks);
      } catch (err) {
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const searchBooks = async (filters: SearchFilters): Promise<Book[]> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...books];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(keyword) ||
        book.authors.some(author => author.toLowerCase().includes(keyword)) ||
        book.description.toLowerCase().includes(keyword)
      );
    }

    if (filters.categories?.length) {
      filtered = filtered.filter(book =>
        book.categories.some(cat => filters.categories!.includes(cat))
      );
    }

    if (filters.condition?.length) {
      filtered = filtered.filter(book =>
        filters.condition!.includes(book.condition)
      );
    }

    if (filters.availability?.length) {
      filtered = filtered.filter(book =>
        filters.availability!.includes(book.availability)
      );
    }

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(book =>
        book.price === undefined || book.price >= filters.priceMin!
      );
    }

    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(book =>
        book.price === undefined || book.price <= filters.priceMax!
      );
    }

    setLoading(false);
    return filtered;
  };

  const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setBooks(prev => [newBook, ...prev]);
    
    // Save to localStorage
    localStorage.setItem('books', JSON.stringify([newBook, ...books]));
    return newBook;
  };

  const toggleFavorite = (bookId: string) => {
    const newFavorites = favorites.includes(bookId)
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const isFavorited = (bookId: string) => favorites.includes(bookId);

  const getUserBooks = (userId?: string): Book[] => {
    if (!userId) return [];
    return books.filter(book => book.ownerId === userId);
  };

  const updateBook = async (id: string, updates: Partial<Book>): Promise<Book | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedBooks = books.map(book => 
      book.id === id 
        ? { ...book, ...updates, updatedAt: new Date() }
        : book
    );
    setBooks(prev => prev.map(book => 
      book.id === id 
        ? { ...book, ...updates, updatedAt: new Date() }
        : book
    ));

    // Save to localStorage
    localStorage.setItem('books', JSON.stringify(updatedBooks));

    return books.find(book => book.id === id) || null;
  };

  const deleteBook = async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setBooks(prev => prev.filter(book => book.id !== id));
    
    const remainingBooks = books.filter(book => book.id !== id);
    localStorage.setItem('books', JSON.stringify(remainingBooks));
  };

  return {
    books,
    loading,
    error,
    favorites,
    searchBooks,
    addBook,
    toggleFavorite,
    isFavorited,
    getUserBooks,
    updateBook,
    deleteBook,
  };
};