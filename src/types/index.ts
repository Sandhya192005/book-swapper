export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  campus: string;
  area?: string;
  avatar?: string;
  genres: string[];
  reputation: number;
  badges: string[];
  verifiedLevels: string[];
  geoPoint?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

export interface Book {
  id: string;
  ownerId: string;
  owner?: User;
  title: string;
  authors: string[];
  isbn?: string;
  categories: string[];
  language: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  photos: string[];
  description: string;
  availability: 'sell' | 'swap' | 'borrow' | 'donate';
  price?: number;
  location: string;
  geoPoint?: {
    latitude: number;
    longitude: number;
  };
  status: 'available' | 'pending' | 'exchanged' | 'removed';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookRating {
  id: string;
  bookId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
}

export interface BookRequest {
  id: string;
  bookId: string;
  book?: Book;
  requesterId: string;
  requester?: User;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
  message?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  requestId: string;
  participants: string[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender?: User;
  content: string;
  type: 'text' | 'image' | 'system';
  createdAt: Date;
  read: boolean;
}

export interface Exchange {
  id: string;
  requestId: string;
  request?: BookRequest;
  qrToken?: string;
  meetupAt?: Date;
  meetupLocation?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: Date;
  createdAt: Date;
}

export interface Review {
  id: string;
  exchangeId: string;
  reviewerId: string;
  reviewer?: User;
  reviewedUserId: string;
  reviewedUser?: User;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface SearchFilters {
  keyword?: string;
  categories?: string[];
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  availability?: string[];
  language?: string[];
  location?: string;
  radius?: number;
}