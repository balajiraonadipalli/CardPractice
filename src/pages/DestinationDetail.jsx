import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Heart, 
  DollarSign, 
  Calendar, 
  Users, 
  Camera,
  ArrowLeft,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { destinationService } from '../services/destinationService';
import GoogleMap from '../components/GoogleMap';
import { sampleDestinations } from '../data/sampleDestinations';
import { isDestinationSaved, saveDestination, unsaveDestination } from '../utils/savedDestinations';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    specialRequests: ''
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use sample destinations instead of API call
      const foundDestination = sampleDestinations.find(dest => dest._id === id);
      
      if (foundDestination) {
        setDestination(foundDestination);
        setIsSaved(isDestinationSaved(foundDestination._id));
      } else {
        setError('Destination not found.');
      }
    } catch (error) {
      console.error('Error fetching destination:', error);
      setError('Failed to load destination details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        // Unsave the destination
        unsaveDestination(destination._id);
        setIsSaved(false);
        console.log('Destination unsaved:', destination.name);
      } else {
        // Save the destination
        saveDestination(destination._id);
        setIsSaved(true);
        console.log('Destination saved:', destination.name);
      }
    } catch (error) {
      console.error('Error saving destination:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsBooking(true);
    try {
      const userId = user._id || user.id;
      if (!userId) {
        console.error('User ID not found');
        alert('User information not available. Please try logging in again.');
        return;
      }
      
      const booking = {
        ...bookingData,
        destinationId: destination._id,
        userId: userId
      };
      
      // For now, just show success message since backend might not be running
      setShowBookingModal(false);
      alert('Booking created successfully! (Local demo)');
      console.log('Booking data:', booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Destination not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to destinations
      </button>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <img
              src={destination.images?.[selectedImage] || '/api/placeholder/800/400'}
              alt={destination.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {destination.images?.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-24 lg:h-20 rounded-lg overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${destination.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && destination.images.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera size={20} className="mx-auto mb-1" />
                      <span className="text-sm">+{destination.images.length - 4}</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {destination.name}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={20} className="mr-2" />
                <span>{destination.location}</span>
              </div>
              {destination.rating && (
                <div className="flex items-center">
                  <Star size={20} className="text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{destination.rating}</span>
                  <span className="text-gray-500 ml-1">
                    ({destination.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-3 rounded-full transition-colors ${
                isSaved
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart size={24} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About this destination</h2>
            <p className="text-gray-700 leading-relaxed">{destination.description}</p>
          </div>

          {/* Amenities */}
          {destination.amenities && destination.amenities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destination.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Map */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Location</h2>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-blue-200">
              <GoogleMap destinations={[destination]} />
            </div>
          </div>
        </div>

         {/* Booking Sidebar */}
         <div className="lg:col-span-1">
           <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8 shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <DollarSign size={20} className="text-blue-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(destination.price)}
                  </span>
                </div>
                <span className="text-gray-500">per night</span>
              </div>
              {destination.originalPrice && destination.originalPrice > destination.price && (
                <p className="text-sm text-gray-500">
                  <span className="line-through">{formatPrice(destination.originalPrice)}</span>
                  <span className="text-green-600 ml-2">
                    Save {formatPrice(destination.originalPrice - destination.price)}
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4"
            >
              Book Now
            </button>

            <div className="text-center text-sm text-gray-500">
              Free cancellation up to 24 hours before check-in
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users size={16} className="inline mr-1" />
                  Guests
                </label>
                <select
                  value={bookingData.guests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any special requirements..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isBooking ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2" size={16} />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetail;
