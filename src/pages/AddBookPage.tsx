import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Upload, 
  MapPin, 
  IndianRupee,
  Camera,
  X,
  Plus
} from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LocationPicker from '../components/common/LocationPicker';

const conditions = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like-new', label: 'Like New', description: 'Excellent condition, minimal wear' },
  { value: 'good', label: 'Good', description: 'Good condition, some wear but fully functional' },
  { value: 'fair', label: 'Fair', description: 'Noticeable wear but still usable' },
  { value: 'poor', label: 'Poor', description: 'Heavy wear, may have damage' },
];

const availabilityOptions = [
  { value: 'sell', label: 'Sell', description: 'I want to sell this book' },
  { value: 'swap', label: 'Swap', description: 'I want to exchange for another book' },
  { value: 'borrow', label: 'Lend', description: 'I can lend this book temporarily' },
  { value: 'donate', label: 'Donate', description: 'I want to give this book away for free' },
];

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
  'Art & Design',
  'Language Learning',
  'Medical',
  'Law',
];

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { addBook } = useBooks();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    authors: [''],
    isbn: '',
    categories: [] as string[],
    language: 'English',
    condition: 'good' as const,
    description: '',
    availability: 'sell' as const,
    price: '',
    location: user?.campus || '',
    tags: [] as string[],
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.authors[0].trim()) newErrors.authors = 'At least one author is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.availability === 'sell' && !formData.price) {
      newErrors.price = 'Price is required for selling';
    }
    if (formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const bookData = {
        ...formData,
        ownerId: user.id,
        authors: formData.authors.filter(author => author.trim()),
        price: formData.availability === 'sell' ? Number(formData.price) : undefined,
        photos: photos.length > 0 ? photos : ['https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'],
        status: 'available' as const,
      };

      await addBook(bookData);
      navigate('/search');
    } catch (error) {
      console.error('Failed to add book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, '']
    }));
  };

  const updateAuthor = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => i === index ? value : author)
    }));
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length > 1) {
      setFormData(prev => ({
        ...prev,
        authors: prev.authors.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addPhoto = async () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setUploadingPhoto(true);
      
      try {
        // Convert file to base64 for preview (in real app, upload to cloud storage)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhotos(prev => [...prev, result]);
          setUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo. Please try again.');
        setUploadingPhoto(false);
      }
    };
    
    input.click();
  };

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
    setFormData(prev => ({ ...prev, location: location.address }));
    setShowLocationPicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            List Your Book
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Share your books with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter the book title"
                  />
                  {errors.title && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Authors */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Authors *
                  </label>
                  {formData.authors.map((author, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => updateAuthor(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Author name"
                      />
                      {formData.authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another author</span>
                  </button>
                  {errors.authors && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.authors}</p>}
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ISBN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="978-0-123456-78-9"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Categories *
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.categories.includes(category)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {errors.categories && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.categories}</p>}
            </div>

            {/* Condition */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Condition *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {conditions.map((condition) => (
                  <label
                    key={condition.value}
                    className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.condition === condition.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {condition.label}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {condition.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Availability *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availabilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.availability === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={formData.availability === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as any }))}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price (if selling) */}
            {formData.availability === 'sell' && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter price"
                  />
                </div>
                {errors.price && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.price}</p>}
              </div>
            )}

            {/* Location */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Campus or area name"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </button>
              </div>
              {selectedLocation && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✓ Precise location selected: {selectedLocation.address}
                </p>
              )}
              {errors.location && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the book's condition, any highlights, missing pages, etc."
              />
              {errors.description && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Photos */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photo}
                      alt={`Book photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={addPhoto}
                    disabled={uploadingPhoto}
                    className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingPhoto ? (
                      <>
                        <LoadingSpinner size="md" className="mb-2" />
                        <span className="text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 mb-2" />
                        <span className="text-sm">Add Photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Add up to 5 photos (max 5MB each). First photo will be the main image.
              </p>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Publishing...
                  </div>
                ) : (
                  'Publish Book'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
            initialLocation={selectedLocation ? {
              lat: selectedLocation.lat,
              lng: selectedLocation.lng
            } : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default AddBookPage;