import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GoogleMap = ({ destinations = [] }) => {
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showDestinationList, setShowDestinationList] = useState(false);

  // Simple, working Google Maps embed URLs
  const getMapUrl = () => {
    if (destinations.length === 0) {
      // Default to Paris
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83998.77824282732!2d2.2646349!3d48.8589507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e1f06e2b70f%3A0x40b82c3688c9460!2sParis%2C%20France!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus";
    }

    const dest = destinations[selectedDestinationIndex] || destinations[0];
    const location = dest.location || dest.name || 'Paris';
    
    // Simple location-based maps
    const locationMaps = {
      'paris': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83998.77824282732!2d2.2646349!3d48.8589507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e1f06e2b70f%3A0x40b82c3688c9460!2sParis%2C%20France!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus",
      'london': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d158858.182370726!2d-0.10159865000000035!3d51.528308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus",
      'new york': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387194.0622732494!2d-74.30932777004288!3d40.69701928773439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus",
      'tokyo': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d207398.88049830253!2d139.69170639999998!3d35.6895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b2423e6f869%3A0x6c0d289a8292810d!2sTokyo%2C%20Japan!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus",
      'rome': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d190028.764225672!2d12.395911999999999!3d41.9102411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f6196f9928ebb%3A0xb90f770693656e38!2sRome%2C%20Italy!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus",
      'barcelona': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d95777.339063676!2d2.1734034999999997!3d41.3850639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a49816718e30e5%3A0x44b0fb3d4f47660a!2sBarcelona%2C%20Spain!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus",
      'dubai': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462562.65095999995!2d55.171252799999995!3d25.2048493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus",
      'singapore': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.1903617906!2d103.704165!3d1.3143394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2sus!4v1735034400000!5m2!1sen!2sus"
    };

    // Find matching location
    const locationKey = Object.keys(locationMaps).find(key => 
      location.toLowerCase().includes(key)
    );

    return locationKey ? locationMaps[locationKey] : locationMaps['paris'];
  };

  const currentDestination = destinations.length > 0 
    ? destinations[selectedDestinationIndex] || destinations[0]
    : null;

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="w-full h-96 rounded-xl overflow-hidden border-2 border-blue-300 shadow-xl bg-white">
        <iframe
          src={getMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Travel Destinations Map"
          onLoad={() => setMapLoaded(true)}
        />
        
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-200 max-w-xs">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
                  <div>
            <h4 className="font-bold text-blue-800 text-sm">Travel Destinations</h4>
            <p className="text-xs text-blue-600">
              {currentDestination ? currentDestination.name : 'Explore amazing places'}
            </p>
          </div>
        </div>

        {/* Destination Navigation */}
        {destinations.length > 1 && (
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setSelectedDestinationIndex(Math.max(0, selectedDestinationIndex - 1))}
              disabled={selectedDestinationIndex === 0}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-blue-600 font-medium">
              {selectedDestinationIndex + 1} of {destinations.length}
            </span>
            <button
              onClick={() => setSelectedDestinationIndex(Math.min(destinations.length - 1, selectedDestinationIndex + 1))}
              disabled={selectedDestinationIndex === destinations.length - 1}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Open in Google Maps Button */}
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(
            currentDestination ? (currentDestination.location || currentDestination.name) : 'Paris, France'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          🗺️ Open in Google Maps
        </a>
      </div>

      {/* Destination List Toggle Button */}
      {destinations.length > 0 && (
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setShowDestinationList(!showDestinationList)}
            className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-blue-200 hover:bg-white transition-colors"
          >
          <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800">
                {showDestinationList ? 'Hide' : 'Show'} Destinations
              </span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {destinations.length}
              </span>
          </div>
          </button>
        </div>
      )}

      {/* Collapsible Destination Info Panel */}
      {destinations.length > 0 && showDestinationList && (
        <div className="absolute bottom-16 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-200 max-h-80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-blue-800 text-sm">Available Destinations</h4>
            <button
              onClick={() => setShowDestinationList(false)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {destinations.map((destination, index) => (
              <div
                key={destination._id || index}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  index === selectedDestinationIndex 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDestinationIndex(index)}
              >
                <img
                  src={destination.images?.[0] || '/api/placeholder/40/40'}
                  alt={destination.name}
                  className="w-10 h-10 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-blue-800 text-sm truncate">
                    {destination.name}
                  </h5>
                  <p className="text-xs text-blue-600 truncate">
                    📍 {destination.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-600">
                    ${destination.price}/night
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Destinations Link */}
          <div className="mt-3 pt-3 border-t border-blue-200">
          <Link
              to="/destinations"
              className="block text-center text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
              View All Destinations →
          </Link>
          </div>
        </div>
      )}

      {/* Map Status Indicator */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${mapLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="text-xs text-blue-600 font-medium">
            {mapLoaded ? 'Map Loaded' : 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;