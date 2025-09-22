import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import GoogleMap from '../components/GoogleMap';
import { destinationService } from '../services/destinationService';
import { sanitizeInput } from '../utils/validation';
import { sampleDestinations } from '../data/sampleDestinations';

const Home = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: ''
  });

  const DESTINATIONS_PER_PAGE = 9;

  useEffect(() => {
    fetchDestinations();
  }, [currentPage, searchQuery, filters]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use sample destinations instead of API call
      // This prevents errors when backend is not running
      let filteredDestinations = [...sampleDestinations];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.name.toLowerCase().includes(query) ||
          dest.location.toLowerCase().includes(query) ||
          dest.description.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (filters.category) {
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.category === filters.category
        );
      }
      
      // Apply price filters
      if (filters.minPrice) {
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.price >= parseInt(filters.minPrice)
        );
      }
      
      if (filters.maxPrice) {
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.price <= parseInt(filters.maxPrice)
        );
      }
      
      // Apply rating filter
      if (filters.rating) {
        filteredDestinations = filteredDestinations.filter(dest => 
          dest.rating >= parseFloat(filters.rating)
        );
      }
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * DESTINATIONS_PER_PAGE;
      const endIndex = startIndex + DESTINATIONS_PER_PAGE;
      const paginatedDestinations = filteredDestinations.slice(startIndex, endIndex);
      
      setDestinations(paginatedDestinations);
      setTotalPages(Math.ceil(filteredDestinations.length / DESTINATIONS_PER_PAGE));
      
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setError('Failed to load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDestinations();
  };

  const handleSearchChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setSearchQuery(sanitizedValue);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDestinationSave = (destinationId, isSaved) => {
    setDestinations(prev =>
      prev.map(dest =>
        dest._id === destinationId
          ? { ...dest, isSaved }
          : dest
      )
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-6 py-3 text-sm text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 border border-blue-300 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg bg-white/95 backdrop-blur-sm"
        >
          ← Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 text-sm rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
            i === currentPage
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl'
              : 'text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-orange-200 hover:border-orange-400 bg-white/95 backdrop-blur-sm'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-6 py-3 text-sm text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 border border-blue-300 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg bg-white/95 backdrop-blur-sm"
        >
          Next →
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        {pages}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ☁️ Discover Amazing Destinations
          </span>
        </h1>
        <p className="text-xl text-blue-800 mb-8 font-medium">
          Find your perfect getaway from thousands of beautiful locations ✨
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-blue-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search destinations, locations, or activities..."
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white/95 backdrop-blur-sm shadow-lg text-blue-900 placeholder-blue-400"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-r-2xl hover:from-blue-600 hover:to-indigo-700 hover:shadow-2xl transition-all duration-300 font-bold hover-scale shadow-lg"
            >
              🔍 Search
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-6 py-3 border rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg backdrop-blur-sm ${
              showFilters 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400' 
                : 'border-blue-300 hover:bg-blue-100 hover:border-blue-400 text-blue-700 bg-white/90'
            }`}
          >
            <Filter size={18} />
            <span>🎛️ {showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
            className={`flex items-center space-x-2 px-6 py-3 border rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg backdrop-blur-sm ${
              viewMode === 'map' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400' 
                : 'border-indigo-300 hover:bg-indigo-100 hover:border-indigo-400 text-indigo-700 bg-white/90'
            }`}
          >
            <MapPin size={18} />
            <span>🗺️ {viewMode === 'map' ? 'Grid View' : 'Map View'}</span>
          </button>
        </div>
        
        <div className="text-sm text-blue-600 font-medium">
          {loading ? 'Loading...' : `${destinations.length} destinations found`}
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
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white/90 backdrop-blur-sm text-blue-900"
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
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white/90 backdrop-blur-sm text-blue-900 placeholder-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                💵 Max Price
              </label>
              <input
                type="number"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white/90 backdrop-blur-sm text-blue-900 placeholder-blue-400"
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
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 bg-white/90 backdrop-blur-sm text-blue-900"
              >
                <option value="">Any Rating</option>
                <option value="4.5">⭐ 4.5+ Excellent</option>
                <option value="4.0">⭐ 4.0+ Very Good</option>
                <option value="3.5">⭐ 3.5+ Good</option>
                <option value="3.0">⭐ 3.0+ Average</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setFilters({ category: '', minPrice: '', maxPrice: '', rating: '' });
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
              >
                🗑️ Clear All
              </button>
              
              <div className="text-sm text-blue-600">
                {Object.values(filters).filter(Boolean).length > 0 && (
                  <span className="bg-blue-100 px-3 py-1 rounded-full">
                    {Object.values(filters).filter(Boolean).length} filter(s) active
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentPage(1);
                fetchDestinations();
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
            >
              🔍 Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 text-blue-800 px-6 py-4 rounded-2xl mb-6 shadow-lg backdrop-blur-sm">
          ⚠️ {error}
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

      {/* Destinations Grid */}
      {!loading && destinations.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination._id}
              destination={destination}
              onSave={handleDestinationSave}
            />
          ))}
        </div>
      )}

      {/* Google Maps View */}
      {!loading && destinations.length > 0 && viewMode === 'map' && (
        <div className="mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-800">🗺️ Google Maps - Destinations</h3>
              <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {destinations.length} locations
              </span>
            </div>
            
            {/* Google Map Component */}
            <GoogleMap destinations={destinations} />
            
            {/* Map View Info */}
            <div className="mt-4 text-center">
              <p className="text-blue-600 text-sm">
                🌍 Interactive world map • Click markers for destination details • Zoom controls available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && destinations.length === 0 && !error && (
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
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 hover:shadow-2xl transition-all duration-300 font-bold hover-scale shadow-lg"
            >
              🌟 Show All Destinations
            </button>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default Home;
