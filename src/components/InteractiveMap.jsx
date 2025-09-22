import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const InteractiveMap = ({ destinations = [] }) => {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [zoom, setZoom] = useState(1);

  // World map regions for better positioning
  const regions = {
    'Europe': { x: 50, y: 30 },
    'Asia': { x: 70, y: 35 },
    'North America': { x: 25, y: 35 },
    'South America': { x: 30, y: 60 },
    'Africa': { x: 55, y: 50 },
    'Oceania': { x: 80, y: 70 },
    'Middle East': { x: 60, y: 40 }
  };

  const getRegionForLocation = (location) => {
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('europe') || locationLower.includes('greece') || 
        locationLower.includes('italy') || locationLower.includes('france') ||
        locationLower.includes('spain') || locationLower.includes('switzerland')) {
      return regions['Europe'];
    }
    if (locationLower.includes('asia') || locationLower.includes('japan') || 
        locationLower.includes('china') || locationLower.includes('bali') ||
        locationLower.includes('indonesia') || locationLower.includes('thailand')) {
      return regions['Asia'];
    }
    if (locationLower.includes('america') || locationLower.includes('usa') || 
        locationLower.includes('canada') || locationLower.includes('mexico')) {
      return regions['North America'];
    }
    if (locationLower.includes('brazil') || locationLower.includes('argentina') || 
        locationLower.includes('chile') || locationLower.includes('peru')) {
      return regions['South America'];
    }
    if (locationLower.includes('africa') || locationLower.includes('morocco') || 
        locationLower.includes('egypt') || locationLower.includes('kenya')) {
      return regions['Africa'];
    }
    if (locationLower.includes('australia') || locationLower.includes('new zealand') || 
        locationLower.includes('fiji') || locationLower.includes('maldives')) {
      return regions['Oceania'];
    }
    if (locationLower.includes('iceland') || locationLower.includes('greenland')) {
      return { x: 45, y: 20 };
    }
    
    // Default to center
    return { x: 50, y: 45 };
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5));

  return (
    <div className="relative">
      {/* Interactive World Map */}
      <div className="relative bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-200 rounded-xl h-96 overflow-hidden border border-blue-300 shadow-lg">
        {/* World Map Background */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ 
            transform: `scale(${zoom})`,
            backgroundImage: `
              radial-gradient(circle at 25% 35%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 35%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 30% 60%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 55% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
            `,
          }}
        >
          {/* Continent Outlines */}
          <div className="absolute inset-0">
            {/* Europe */}
            <div className="absolute" style={{ left: '48%', top: '28%', width: '8%', height: '12%' }}>
              <div className="w-full h-full bg-blue-200/30 rounded-lg border border-blue-300/50"></div>
            </div>
            {/* Asia */}
            <div className="absolute" style={{ left: '65%', top: '30%', width: '20%', height: '25%' }}>
              <div className="w-full h-full bg-purple-200/30 rounded-lg border border-purple-300/50"></div>
            </div>
            {/* North America */}
            <div className="absolute" style={{ left: '15%', top: '25%', width: '20%', height: '20%' }}>
              <div className="w-full h-full bg-green-200/30 rounded-lg border border-green-300/50"></div>
            </div>
            {/* South America */}
            <div className="absolute" style={{ left: '25%', top: '50%', width: '12%', height: '25%' }}>
              <div className="w-full h-full bg-red-200/30 rounded-lg border border-red-300/50"></div>
            </div>
            {/* Africa */}
            <div className="absolute" style={{ left: '50%', top: '45%', width: '15%', height: '20%' }}>
              <div className="w-full h-full bg-yellow-200/30 rounded-lg border border-yellow-300/50"></div>
            </div>
            {/* Australia */}
            <div className="absolute" style={{ left: '75%', top: '65%', width: '10%', height: '8%' }}>
              <div className="w-full h-full bg-teal-200/30 rounded-lg border border-teal-300/50"></div>
            </div>
          </div>
        </div>

        {/* Destination Markers */}
        <div className="relative h-full w-full">
          {destinations.map((destination, index) => {
            const region = getRegionForLocation(destination.location);
            const offsetX = (Math.random() - 0.5) * 8; // Random offset within region
            const offsetY = (Math.random() - 0.5) * 8;
            
            return (
              <div
                key={destination._id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                style={{
                  left: `${region.x + offsetX}%`,
                  top: `${region.y + offsetY}%`,
                  transform: `translate(-50%, -50%) scale(${zoom})`
                }}
                onClick={() => setSelectedDestination(destination)}
              >
                {/* Animated Map Pin */}
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse hover:animate-bounce transition-all duration-300 hover:scale-110">
                    <MapPin size={16} className="text-white" />
                  </div>
                  
                  {/* Pin Label */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md border border-blue-200 whitespace-nowrap">
                      <span className="text-xs font-semibold text-blue-800">{destination.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
          <button 
            onClick={handleZoomIn}
            className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-md border border-blue-200 hover:bg-blue-50 transition-all duration-200 text-blue-600"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={handleZoomOut}
            className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-md border border-blue-200 hover:bg-blue-50 transition-all duration-200 text-blue-600"
          >
            <ZoomOut size={18} />
          </button>
          <button className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-md border border-blue-200 hover:bg-blue-50 transition-all duration-200 text-blue-600">
            <Maximize size={18} />
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-blue-200 z-20">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full border border-white"></div>
              <span className="text-blue-700 font-medium">Destinations ({destinations.length})</span>
            </div>
            <div className="text-blue-600">Click pins for details</div>
          </div>
        </div>
      </div>

      {/* Selected Destination Popup */}
      {selectedDestination && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 max-w-md w-full border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-800">📍 {selectedDestination.name}</h3>
              <button
                onClick={() => setSelectedDestination(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            <img
              src={selectedDestination.images?.[0] || '/api/placeholder/400/200'}
              alt={selectedDestination.name}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            
            <div className="space-y-3">
              <div className="flex items-center text-blue-600">
                <MapPin size={16} className="mr-2" />
                <span className="font-medium">{selectedDestination.location}</span>
              </div>
              
              <p className="text-gray-700 text-sm line-clamp-3">
                {selectedDestination.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                <div className="text-2xl font-bold text-green-600">
                  ${selectedDestination.price}
                  <span className="text-sm text-gray-500 font-normal">/night</span>
                </div>
                
                <Link
                  to={`/destinations/${selectedDestination._id}`}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={() => setSelectedDestination(null)}
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
