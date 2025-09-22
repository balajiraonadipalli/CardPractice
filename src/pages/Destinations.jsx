import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Grid, List, Star } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import GoogleMap from '../components/GoogleMap';
import { sampleDestinations } from '../data/sampleDestinations';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: ''
  });

  useEffect(() => {
    // Simulate loading and set sample destinations
    setTimeout(() => {
      setDestinations(sampleDestinations);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter destinations based on search and filters
  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = !searchQuery || 
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filters.category || destination.category === filters.category;
    const matchesMinPrice = !filters.minPrice || destination.price >= parseInt(filters.minPrice);
    const matchesMaxPrice = !filters.maxPrice || destination.price <= parseInt(filters.maxPrice);
    const matchesRating = !filters.rating || destination.rating >= parseFloat(filters.rating);

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating;
  });

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: ''
    });
    setSearchQuery('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌍 Explore Amazing Destinations
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover incredible places around the world and plan your next adventure
        </p>
      </div>

      {/* Search and Controls */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-blue-200">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white/90 backdrop-blur-sm text-gray-900"
              />
            </div>
          </form>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid size={16} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin size={16} />
              <span>Map</span>
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-6 py-3 border rounded-xl transition-all duration-300 font-semibold ${
              showFilters 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-blue-300 hover:bg-blue-50 text-blue-700 bg-white'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-blue-600 font-medium">
          {loading ? 'Loading...' : `${filteredDestinations.length} destinations found`}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                🏷️ Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white text-gray-900"
              >
                <option value="">All Categories</option>
                <option value="adventure">🏔️ Adventure</option>
                <option value="beach">🏖️ Beach</option>
                <option value="city">🏙️ City</option>
                <option value="cultural">🏛️ Cultural</option>
                <option value="nature">🌿 Nature</option>
                <option value="luxury">💎 Luxury</option>
                <option value="budget">💰 Budget</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
                <option value="romantic">💕 Romantic</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                💵 Min Price
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                💵 Max Price
              </label>
              <input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white text-gray-900"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                ⭐ Min Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white text-gray-900"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              🗑️ Clear All Filters
            </button>
            
            <div className="text-sm text-blue-600">
              {Object.values(filters).filter(Boolean).length > 0 && (
                <span className="bg-blue-100 px-3 py-1 rounded-full">
                  {Object.values(filters).filter(Boolean).length} filter(s) active
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content based on view mode */}
      {!loading && (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && filteredDestinations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination._id}
                  destination={destination}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && filteredDestinations.length > 0 && (
            <div className="space-y-6 mb-8">
              {filteredDestinations.map((destination) => (
                <div key={destination._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-1/3">
                      <img
                        src={destination.images?.[0] || '/api/placeholder/400/250'}
                        alt={destination.name}
                        className="w-full h-64 lg:h-full object-cover"
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="lg:w-2/3 p-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {destination.name}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin size={16} className="mr-1" />
                            <span className="text-sm">{destination.location}</span>
                          </div>
                          {destination.rating && (
                            <div className="flex items-center mb-3">
                              <Star size={16} className="text-yellow-400 fill-current mr-1" />
                              <span className="font-medium text-sm">{destination.rating}</span>
                              <span className="text-gray-500 ml-1 text-sm">
                                ({destination.reviewCount || 0} reviews)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Price Section */}
                        <div className="text-right mb-4 lg:mb-0">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(destination.price)}
                          </div>
                          <div className="text-sm text-gray-500">per night</div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                        {destination.description.length > 150 
                          ? `${destination.description.substring(0, 150)}...` 
                          : destination.description}
                      </p>
                      
                      {/* Amenities and Action */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                          {destination.amenities?.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                              {amenity}
                            </span>
                          ))}
                          {destination.amenities?.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                              +{destination.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        <Link
                          to={`/destinations/${destination._id}`}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map View */}
          {viewMode === 'map' && filteredDestinations.length > 0 && (
            <div className="mb-8">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-blue-800">🗺️ Destinations Map</h3>
                  <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {filteredDestinations.length} locations
                  </span>
                </div>
                
                <GoogleMap destinations={filteredDestinations} />
                
                <div className="mt-4 text-center">
                  <p className="text-blue-600 text-sm">
                    🌍 Interactive world map • Click markers for destination details • Navigate between locations
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredDestinations.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No destinations found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all destinations.
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show All Destinations
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Destinations;
