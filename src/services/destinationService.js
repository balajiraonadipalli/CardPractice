import api from './authService';

export const destinationService = {
  // Public endpoints
  async getDestinations(page = 1, limit = 10, search = '', filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.rating && { rating: filters.rating })
    });
    
    const response = await api.get(`/destinations?${params}`);
    return response.data;
  },

  async getDestination(id) {
    const response = await api.get(`/destinations/${id}`);
    return response.data;
  },

  // Admin endpoints
  async createDestination(destinationData) {
    const response = await api.post('/destinations', destinationData);
    return response.data;
  },

  async updateDestination(id, destinationData) {
    const response = await api.put(`/destinations/${id}`, destinationData);
    return response.data;
  },

  async deleteDestination(id) {
    const response = await api.delete(`/destinations/${id}`);
    return response.data;
  },

  // User actions
  async saveDestination(userId, destId) {
    const response = await api.post(`/users/${userId}/save/${destId}`);
    return response.data;
  },

  async getSavedDestinations(userId) {
    const response = await api.get(`/users/${userId}/saved`);
    return response.data;
  },

  async createBooking(bookingData) {
    const response = await api.post('/booking', bookingData);
    return response.data;
  },

  // OCR endpoint
  async processImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
