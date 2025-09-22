import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { destinationService } from '../services/destinationService';
import { isDestinationSaved, saveDestination, unsaveDestination } from '../utils/savedDestinations';

const DestinationCard = ({ destination, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Check if destination is saved on component mount
  useEffect(() => {
    setIsSaved(isDestinationSaved(destination._id));
  }, [destination._id]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        // Unsave the destination
        unsaveDestination(destination._id);
        setIsSaved(false);
        onSave && onSave(destination._id, false);
        console.log('Destination unsaved:', destination.name);
      } else {
        // Save the destination
        saveDestination(destination._id);
        setIsSaved(true);
        onSave && onSave(destination._id, true);
        console.log('Destination saved:', destination.name);
      }
    } catch (error) {
      console.error('Error saving destination:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-colorful overflow-hidden hover:shadow-pink hover-scale transition-all duration-300 border border-white/20">
      <Link to={`/destinations/${destination._id}`}>
        <div className="relative">
          <img
            src={destination.images?.[0] || '/api/placeholder/400/250'}
            alt={destination.name}
            className="w-full h-48 object-cover"
          />
          
          {/* Save button */}
          {isAuthenticated && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`absolute top-3 right-3 p-3 rounded-full transition-all duration-300 shadow-lg ${
                isSaved
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:shadow-pink'
                  : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500 hover:shadow-colorful'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart
                size={20}
                className={isSaved ? 'fill-current' : ''}
              />
            </button>
          )}

          {/* Rating badge */}
          {destination.rating && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center shadow-lg border border-white/20">
              <Star size={16} className="text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">{destination.rating}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {destination.name}
          </h3>
          
          <div className="flex items-center text-purple-600 mb-2">
            <MapPin size={16} className="mr-1" />
            <span className="text-sm font-medium">{destination.location}</span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {destination.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign size={16} className="mr-1 text-green-600" />
              <span className="font-bold text-green-600 text-lg">{formatPrice(destination.price)}</span>
              <span className="text-sm text-gray-500 ml-1">per night</span>
            </div>
            
            <div className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
              {destination.category || '✨ Featured'}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DestinationCard;
