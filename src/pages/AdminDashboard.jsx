import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MapPin, 
  DollarSign,
  Eye,
  X,
  Upload,
  Loader
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { destinationService } from '../services/destinationService';
import { destinationSchema } from '../utils/validation';

const AdminDashboard = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const DESTINATIONS_PER_PAGE = 10;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(destinationSchema)
  });

  const watchedImages = watch('images', []);

  useEffect(() => {
    fetchDestinations();
  }, [currentPage, searchQuery]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await destinationService.getDestinations(
        currentPage,
        DESTINATIONS_PER_PAGE,
        searchQuery
      );
      
      setDestinations(response.destinations || []);
      setTotalPages(response.totalPages || 1);
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

  const openModal = (destination = null) => {
    setEditingDestination(destination);
    setShowModal(true);
    
    if (destination) {
      // Populate form with existing destination data
      Object.keys(destination).forEach(key => {
        if (key === 'images') {
          setValue('images', destination[key] || []);
        } else {
          setValue(key, destination[key]);
        }
      });
    } else {
      reset();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDestination(null);
    reset();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (editingDestination) {
        await destinationService.updateDestination(editingDestination._id, data);
      } else {
        await destinationService.createDestination(data);
      }
      
      closeModal();
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      setError('Failed to save destination. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (destinationId) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) {
      return;
    }

    try {
      await destinationService.deleteDestination(destinationId);
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      setError('Failed to delete destination. Please try again.');
    }
  };

  const handleImageAdd = () => {
    const currentImages = watchedImages || [];
    setValue('images', [...currentImages, '']);
  };

  const handleImageChange = (index, value) => {
    const currentImages = watchedImages || [];
    const newImages = [...currentImages];
    newImages[index] = value;
    setValue('images', newImages);
  };

  const handleImageRemove = (index) => {
    const currentImages = watchedImages || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue('images', newImages);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 text-sm rounded-md ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
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
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        {pages}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage destinations and bookings</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Destination
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Destinations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Destinations ({destinations.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading destinations...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No destinations found</p>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Destination
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {destinations.map((destination) => (
                  <tr key={destination._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={destination.images?.[0] || '/api/placeholder/60/60'}
                          alt={destination.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {destination.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {destination.category || 'Uncategorized'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-1" />
                        {destination.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign size={16} className="mr-1" />
                        {formatPrice(destination.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/destinations/${destination._id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openModal(destination)}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(destination._id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {renderPagination()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingDestination ? 'Edit Destination' : 'Add New Destination'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Name
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter destination name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      {...register('location')}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter location"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter destination description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Night ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter price"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Images
                    </label>
                    <button
                      type="button"
                      onClick={handleImageAdd}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Image
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(watchedImages || []).map((image, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter image URL"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {errors.images && (
                    <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin mr-2" size={16} />
                        {editingDestination ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingDestination ? 'Update Destination' : 'Create Destination'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
