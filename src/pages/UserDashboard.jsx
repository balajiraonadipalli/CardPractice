import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Star, 
  DollarSign,
  Trash2,
  Eye,
  User,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { destinationService } from '../services/destinationService';
import GoogleMap from '../components/GoogleMap';
import { getSavedDestinationsWithData, unsaveDestination } from '../utils/savedDestinations';
import { sampleDestinations } from '../data/sampleDestinations';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedViewMode, setSavedViewMode] = useState('grid'); // 'grid' or 'map'

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Refresh saved destinations when the tab becomes active
  useEffect(() => {
    if (activeTab === 'saved' && user) {
      const savedDests = getSavedDestinationsWithData(sampleDestinations);
      setSavedDestinations(savedDests);
    }
  }, [activeTab, user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get saved destinations from local storage
      const savedDests = getSavedDestinationsWithData(sampleDestinations);
      setSavedDestinations(savedDests);
      
      // For now, we'll use mock bookings data since the endpoint might not be ready
      setBookings([]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveDestination = async (destinationId) => {
    try {
      // Remove from local storage
      unsaveDestination(destinationId);
      
      // Update the local state
      setSavedDestinations(prev => 
        prev.filter(dest => dest._id !== destinationId)
      );
      
      console.log('Destination unsaved:', destinationId);
    } catch (error) {
      console.error('Error unsaving destination:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    
    if (now < startDate) return { status: 'upcoming', color: 'text-blue-600 bg-blue-100' };
    if (now >= startDate && now <= endDate) return { status: 'active', color: 'text-green-600 bg-green-100' };
    return { status: 'completed', color: 'text-gray-600 bg-gray-100' };
  };

  const tabs = [
    { id: 'saved', label: 'Saved Destinations', icon: Heart },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Manage your saved destinations, bookings, and profile settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={20} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'saved' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Saved Destinations ({savedDestinations.length})
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const savedDests = getSavedDestinationsWithData(sampleDestinations);
                  setSavedDestinations(savedDests);
                }}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                🔄 Refresh
              </button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSavedViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    savedViewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setSavedViewMode('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    savedViewMode === 'map'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map
                </button>
              </div>
              <Link
                to="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discover More
              </Link>
            </div>
          </div>

          {savedDestinations.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved destinations yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start exploring and save your favorite destinations to see them here.
              </p>
              <Link
                to="/"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Destinations
              </Link>
            </div>
          ) : (
            <>
              {savedViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedDestinations.map((destination) => (
                    <div key={destination._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="relative">
                        <img
                          src={destination.images?.[0] || '/api/placeholder/400/250'}
                          alt={destination.name}
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={() => handleUnsaveDestination(destination._id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {destination.name}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin size={16} className="mr-1" />
                          <span className="text-sm">{destination.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign size={16} className="text-blue-600 mr-1" />
                            <span className="font-semibold">{formatPrice(destination.price)}</span>
                          </div>
                          <Link
                            to={`/destinations/${destination._id}`}
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Eye size={16} className="mr-1" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-blue-800">🗺️ Your Saved Destinations Map</h3>
                    <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {savedDestinations.length} locations
                    </span>
                  </div>
                  
                  <GoogleMap destinations={savedDestinations} />
                  
                  <div className="mt-4 text-center">
                    <p className="text-blue-600 text-sm">
                      🌍 Your saved destinations • Click markers for details • Navigate between locations
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              My Bookings ({bookings.length})
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-4">
                Book your first destination to start your travel journey.
              </p>
              <Link
                to="/"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book a Destination
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const statusInfo = getBookingStatus(booking);
                return (
                  <div key={booking._id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {booking.destination?.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <div>
                              <p className="font-medium">Check-in</p>
                              <p>{formatDate(booking.startDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <div>
                              <p className="font-medium">Check-out</p>
                              <p>{formatDate(booking.endDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            <div>
                              <p className="font-medium">Guests</p>
                              <p>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                            </div>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                            <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(booking.totalPrice)}
                        </p>
                        <Link
                          to={`/destinations/${booking.destination?._id}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Destination
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
              
              <div className="pt-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
