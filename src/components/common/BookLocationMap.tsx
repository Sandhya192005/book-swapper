import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Book } from '../../types';

interface BookLocationMapProps {
  book: Book;
  userLocation?: { latitude: number; longitude: number };
  onClose: () => void;
}

const BookLocationMap: React.FC<BookLocationMapProps> = ({
  book,
  userLocation,
  onClose
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState<string>('');
  const [directions, setDirections] = useState<string>('');

  useEffect(() => {
    // Calculate distance if both locations are available
    if (userLocation && book.geoPoint) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        book.geoPoint.latitude,
        book.geoPoint.longitude
      );
      setDistance(dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`);
    }
    setIsLoading(false);
  }, [userLocation, book.geoPoint]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openInGoogleMaps = () => {
    if (!book.geoPoint) return;
    
    let url = `https://www.google.com/maps?q=${book.geoPoint.latitude},${book.geoPoint.longitude}`;
    
    // If user location is available, add directions
    if (userLocation) {
      url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${book.geoPoint.latitude},${book.geoPoint.longitude}`;
    }
    
    window.open(url, '_blank');
  };

  const openInAppleMaps = () => {
    if (!book.geoPoint) return;
    
    let url = `http://maps.apple.com/?q=${book.geoPoint.latitude},${book.geoPoint.longitude}`;
    
    // If user location is available, add directions
    if (userLocation) {
      url = `http://maps.apple.com/?saddr=${userLocation.latitude},${userLocation.longitude}&daddr=${book.geoPoint.latitude},${book.geoPoint.longitude}`;
    }
    
    window.open(url, '_blank');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        if (book.geoPoint) {
          const dist = calculateDistance(
            userLat,
            userLng,
            book.geoPoint.latitude,
            book.geoPoint.longitude
          );
          setDistance(dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting current location:', error);
        setIsLoading(false);
      }
    );
  };

  if (!book.geoPoint) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Location Not Available
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This book doesn't have a specific location set. You can contact the owner for more details.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>General Location: {book.location}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Book Location
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {book.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Location Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-200">
                  Book Location
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  {book.location}
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Coordinates: {book.geoPoint.latitude.toFixed(6)}, {book.geoPoint.longitude.toFixed(6)}
                </div>
              </div>
            </div>
          </div>

          {/* Distance Info */}
          {distance && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Navigation className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-200">
                    Distance from You
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Approximately {distance} away
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Static Map Placeholder */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Interactive Map View
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Use the buttons below to open in your preferred map app
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={openInGoogleMaps}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="h-5 w-5" />
                <span>Open in Google Maps</span>
              </button>
              
              <button
                onClick={openInAppleMaps}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MapPin className="h-5 w-5" />
                <span>Open in Apple Maps</span>
              </button>
            </div>

            {!userLocation && (
              <button
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Getting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5" />
                    <span>Get My Location & Distance</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
              How to Navigate:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Click "Open in Google Maps" for turn-by-turn directions</li>
              <li>• Use "Get My Location" to calculate exact distance</li>
              <li>• Contact the book owner to coordinate pickup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLocationMap;