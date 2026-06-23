import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Search } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  onClose,
  initialLocation
}) => {
  const [address, setAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = {
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            lat: latitude,
            lng: longitude
          };
          setSelectedLocation(location);
          setAddress(location.address);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter manually.');
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else if (address.trim()) {
      // Parse coordinates if in lat,lng format
      const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        onLocationSelect({ address, lat, lng });
      } else {
        // Default coordinates for Delhi if regular address
        onLocationSelect({ 
          address, 
          lat: 28.6139, 
          lng: 77.2090 
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Location
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>How to use:</strong>
              <br />• Type your address manually
              <br />• Or use coordinates format: "28.6139, 77.2090"
              <br />• Click "Current" to get GPS location
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address or Coordinates
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setSelectedLocation(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter address or lat, lng"
                />
              </div>
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Navigation className="h-4 w-4" />
                <span>{isGettingLocation ? 'Getting...' : 'Current'}</span>
              </button>
            </div>
          </div>

          {selectedLocation && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ <strong>Location Selected:</strong>
                <br />📍 {selectedLocation.address}
                <br />📊 Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={!address.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Set Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;