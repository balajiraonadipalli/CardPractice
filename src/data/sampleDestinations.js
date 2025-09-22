// Sample destinations data for testing the map functionality
export const sampleDestinations = [
  {
    _id: '1',
    name: 'Eiffel Tower Experience',
    location: 'Paris, France',
    description: 'Experience the magic of Paris with a stay near the iconic Eiffel Tower. Enjoy breathtaking views, world-class dining, and easy access to all the city\'s attractions.',
    price: 250,
    originalPrice: 300,
    rating: 4.8,
    reviewCount: 1247,
    category: 'cultural',
    images: [
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Gym', 'Pool'],
    coordinates: { coordinates: [2.2945, 48.8584] }
  },
  {
    _id: '2',
    name: 'Big Ben Luxury Suites',
    location: 'London, UK',
    description: 'Stay in the heart of London with stunning views of Big Ben and the Thames. Modern luxury meets historic charm in this premium accommodation.',
    price: 320,
    originalPrice: 380,
    rating: 4.9,
    reviewCount: 892,
    category: 'luxury',
    images: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Concierge', 'Gym', 'Business Center'],
    coordinates: { coordinates: [-0.1276, 51.4994] }
  },
  {
    _id: '3',
    name: 'Times Square Central',
    location: 'New York, USA',
    description: 'Experience the energy of New York City from the heart of Times Square. Perfect for business travelers and tourists alike.',
    price: 400,
    originalPrice: 450,
    rating: 4.7,
    reviewCount: 2156,
    category: 'city',
    images: [
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494522358652-f30e61a603e0?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Gym', 'Business Center', 'Valet Parking'],
    coordinates: { coordinates: [-73.9857, 40.7589] }
  },
  {
    _id: '4',
    name: 'Tokyo Skyline Retreat',
    location: 'Tokyo, Japan',
    description: 'Modern luxury in the heart of Tokyo with panoramic city views. Experience Japanese hospitality at its finest.',
    price: 280,
    originalPrice: 320,
    rating: 4.9,
    reviewCount: 743,
    category: 'luxury',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Gym', 'Concierge'],
    coordinates: { coordinates: [139.6917, 35.6895] }
  },
  {
    _id: '5',
    name: 'Colosseum Historic Hotel',
    location: 'Rome, Italy',
    description: 'Step back in time while enjoying modern comfort near the ancient Colosseum. Perfect blend of history and luxury.',
    price: 220,
    originalPrice: 260,
    rating: 4.6,
    reviewCount: 1089,
    category: 'cultural',
    images: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Gym', 'Historic Tours'],
    coordinates: { coordinates: [12.4922, 41.8902] }
  },
  {
    _id: '6',
    name: 'Sagrada Familia Boutique',
    location: 'Barcelona, Spain',
    description: 'Charming boutique hotel near the iconic Sagrada Familia. Experience Catalan culture and architecture.',
    price: 180,
    originalPrice: 220,
    rating: 4.5,
    reviewCount: 634,
    category: 'cultural',
    images: [
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Bike Rental', 'Cultural Tours'],
    coordinates: { coordinates: [2.1734, 41.4036] }
  },
  {
    _id: '7',
    name: 'Burj Khalifa Views',
    location: 'Dubai, UAE',
    description: 'Luxury accommodation with stunning views of the world\'s tallest building. Experience modern Dubai at its finest.',
    price: 350,
    originalPrice: 400,
    rating: 4.8,
    reviewCount: 1456,
    category: 'luxury',
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Gym', 'Pool', 'Concierge'],
    coordinates: { coordinates: [55.1713, 25.1972] }
  },
  {
    _id: '8',
    name: 'Marina Bay Sands Experience',
    location: 'Singapore',
    description: 'Iconic luxury hotel with the famous infinity pool. Experience Singapore\'s skyline from the world\'s most photographed pool.',
    price: 450,
    originalPrice: 500,
    rating: 4.9,
    reviewCount: 2234,
    category: 'luxury',
    images: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Restaurant', 'Spa', 'Gym', 'Infinity Pool', 'Casino'],
    coordinates: { coordinates: [103.8198, 1.2833] }
  }
];

// Helper function to get destinations by category
export const getDestinationsByCategory = (category) => {
  return sampleDestinations.filter(dest => dest.category === category);
};

// Helper function to get destinations by price range
export const getDestinationsByPriceRange = (minPrice, maxPrice) => {
  return sampleDestinations.filter(dest => 
    dest.price >= minPrice && dest.price <= maxPrice
  );
};

// Helper function to search destinations
export const searchDestinations = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return sampleDestinations.filter(dest => 
    dest.name.toLowerCase().includes(lowercaseQuery) ||
    dest.location.toLowerCase().includes(lowercaseQuery) ||
    dest.description.toLowerCase().includes(lowercaseQuery)
  );
};
