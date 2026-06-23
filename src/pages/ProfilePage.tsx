import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Star, 
  Badge, 
  BookOpen, 
  MessageSquare,
  Calendar,
  Edit3,
  Camera,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Plus,
  Search,
  Upload,
  Map
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../hooks/useBooks';
import { useRequests } from '../hooks/useRequests';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookCard from '../components/books/BookCard';
import LocationPicker from '../components/common/LocationPicker';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { getUserBooks, toggleFavorite, isFavorited } = useBooks();
  const { getUserRequests } = useRequests();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'requests'>('overview');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    campus: user?.campus || '',
    area: user?.area || '',
    genres: user?.genres || [],
    geoPoint: user?.geoPoint || null,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleAvatarUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setUploadingAvatar(true);
      
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          updateProfile({ avatar: result });
          setUploadingAvatar(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar. Please try again.');
        setUploadingAvatar(false);
      }
    };
    
    input.click();
  };

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      area: location.address,
      geoPoint: { latitude: location.lat, longitude: location.lng }
    }));
    setShowLocationPicker(false);
  };

  const popularGenres = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Engineering',
    'Literature',
    'Business',
    'Psychology',
    'History',
  ];

  // Get user's actual data
  const userBooks = getUserBooks(user?.id);
  const userRequests = getUserRequests(user?.id);

  const stats = {
    booksListed: userBooks.length,
    successfulExchanges: 3, // Mock data for now
    totalRequests: userRequests.length,
    responseRate: userRequests.length > 0 ? Math.round((userRequests.filter(r => r.status !== 'pending').length / userRequests.length) * 100) : 95,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Please log in to view your profile
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your account and track your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                      <span className="text-white text-2xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    {uploadingAvatar ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Camera className="h-4 w-4" onClick={handleAvatarUpload} />
                    )}
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                  {user.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.campus}
                </p>
              </div>

              {/* Reputation */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.reputation}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/ 100</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reputation Score
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${user.reputation}%` }}
                  ></div>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Status */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Verification Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.verifiedLevels.includes('email')
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {user.verifiedLevels.includes('email') ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.verifiedLevels.includes('phone')
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {user.verifiedLevels.includes('phone') ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('books')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'books'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  My Books ({userBooks.length})
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'requests'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Requests ({userRequests.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Activity Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Activity Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.booksListed}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Books Listed
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.successfulExchanges}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Exchanges
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
                        <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalRequests}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Requests
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg mx-auto mb-2">
                        <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.responseRate}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Response Rate
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            University/Campus
                          </label>
                          <input
                            type="text"
                            value={formData.campus}
                            onChange={(e) => setFormData(prev => ({ ...prev, campus: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address/Area
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={formData.area}
                            onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Hauz Khas, New Delhi"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLocationPicker(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <Map className="h-4 w-4" />
                            <span>Map</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Interested Genres
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {popularGenres.map((genre) => (
                            <button
                              key={genre}
                              type="button"
                              onClick={() => handleGenreToggle(genre)}
                              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                formData.genres.includes(genre)
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <LoadingSpinner size="sm" className="mr-2" />
                              Saving...
                            </div>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</span>
                          </div>
                          <p className="text-gray-900 dark:text-white">{user.email}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</span>
                          </div>
                          <p className="text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">University/Campus</span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium">{user.campus}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address/Area</span>
                          </div>
                          <p className="text-gray-900 dark:text-white">{user.area || 'Not specified'}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interested Genres</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.genres.length > 0 ? user.genres.map((genre, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                              >
                                {genre}
                              </span>
                            )) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">No genres selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'books' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    My Listed Books
                  </h3>
                  <Link
                    to="/add-book"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Book</span>
                  </Link>
                </div>

                {userBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onFavorite={(bookId) => toggleFavorite(bookId)}
                        onContact={(bookId) => console.log('Contact for book:', bookId)}
                        isFavorited={isFavorited(book.id)}
                        showOwnerInfo={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      No books listed yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Start sharing your books with the community. List your first book and help other students find what they need.
                    </p>
                    <Link
                      to="/add-book"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      List Your First Book
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  My Requests
                </h3>
                
                {userRequests.length > 0 ? (
                  <div className="space-y-4">
                    {userRequests.map((request) => (
                      <div key={request.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              Request for Book ID: {request.bookId}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {request.message || 'No message provided'}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Created: {request.createdAt.toLocaleDateString()}</span>
                              <span>Expires: {request.expiresAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            request.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      No requests yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      When you request books from other users, they'll appear here. Start browsing books to make your first request.
                    </p>
                    <Link
                      to="/search"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Browse Books
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
            initialLocation={formData.geoPoint ? {
              lat: formData.geoPoint.latitude,
              lng: formData.geoPoint.longitude
            } : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;