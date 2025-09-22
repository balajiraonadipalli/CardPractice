const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/environment');
const User = require('./models/User');
const Destination = require('./models/Destination');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123456',
    role: 'admin',
    emailVerified: true
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'user123456',
    role: 'user',
    emailVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'jane123456',
    role: 'user',
    emailVerified: true
  }
];

const sampleDestinations = [
  {
    name: 'Santorini Paradise',
    description: 'Experience the breathtaking sunsets and pristine white buildings of Santorini. This Greek island paradise offers stunning views of the Aegean Sea, romantic atmosphere, and world-class cuisine. Perfect for couples and photography enthusiasts.',
    location: 'Santorini, Greece',
    coordinates: {
      type: 'Point',
      coordinates: [25.4615, 36.3932]
    },
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    price: 299,
    originalPrice: 399,
    category: 'romantic',
    tags: ['sunset', 'romantic', 'photography', 'luxury'],
    amenities: ['Ocean View', 'Private Balcony', 'Infinity Pool', 'Fine Dining', 'Spa Services'],
    rating: 4.8,
    reviewCount: 127,
    maxGuests: 4,
    isFeatured: true
  },
  {
    name: 'Bali Temple Adventure',
    description: 'Discover the spiritual heart of Bali with visits to ancient temples, lush rice terraces, and traditional villages. Experience authentic Balinese culture, participate in traditional ceremonies, and enjoy tropical paradise.',
    location: 'Ubud, Bali, Indonesia',
    coordinates: {
      type: 'Point',
      coordinates: [115.2624, -8.5069]
    },
    images: [
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'
    ],
    price: 189,
    category: 'cultural',
    tags: ['temple', 'culture', 'spiritual', 'nature'],
    amenities: ['Temple Tours', 'Rice Terrace Walks', 'Traditional Cooking Class', 'Spa Treatments', 'Cultural Shows'],
    rating: 4.6,
    reviewCount: 89,
    maxGuests: 6,
    isFeatured: true
  },
  {
    name: 'Swiss Alps Skiing',
    description: 'Hit the slopes in the world-famous Swiss Alps. Enjoy pristine powder snow, challenging runs for all skill levels, and cozy mountain chalets. After skiing, relax with hot chocolate and Swiss fondue.',
    location: 'Zermatt, Switzerland',
    coordinates: {
      type: 'Point',
      coordinates: [7.7491, 45.9763]
    },
    images: [
      'https://images.unsplash.com/photo-1551524164-6cf2ac26a870?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800'
    ],
    price: 459,
    originalPrice: 599,
    category: 'adventure',
    tags: ['skiing', 'snow', 'mountains', 'winter'],
    amenities: ['Ski Equipment Rental', 'Ski Lessons', 'Mountain Chalet', 'Heated Pools', 'Alpine Dining'],
    rating: 4.9,
    reviewCount: 156,
    maxGuests: 8,
    difficulty: 'moderate',
    isFeatured: true
  },
  {
    name: 'Tokyo City Explorer',
    description: 'Immerse yourself in the vibrant culture of Tokyo. From ancient temples to modern skyscrapers, experience the perfect blend of tradition and innovation. Enjoy authentic sushi, explore bustling markets, and witness the famous cherry blossoms.',
    location: 'Tokyo, Japan',
    coordinates: {
      type: 'Point',
      coordinates: [139.6503, 35.6762]
    },
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800'
    ],
    price: 349,
    category: 'city',
    tags: ['urban', 'culture', 'food', 'technology'],
    amenities: ['City Tours', 'Sushi Making Class', 'Temple Visits', 'Shopping Districts', 'Karaoke'],
    rating: 4.7,
    reviewCount: 203,
    maxGuests: 4
  },
  {
    name: 'Amazon Rainforest Expedition',
    description: 'Explore the worlds largest rainforest and discover incredible biodiversity. Spot exotic wildlife, learn about indigenous cultures, and experience the raw beauty of nature in this once-in-a-lifetime adventure.',
    location: 'Manaus, Brazil',
    coordinates: {
      type: 'Point',
      coordinates: [-60.0261, -3.1190]
    },
    images: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
    ],
    price: 599,
    category: 'nature',
    tags: ['rainforest', 'wildlife', 'adventure', 'eco-tourism'],
    amenities: ['Wildlife Tours', 'Canoe Expeditions', 'Indigenous Village Visits', 'Nature Photography', 'Eco Lodge'],
    rating: 4.5,
    reviewCount: 67,
    maxGuests: 6,
    difficulty: 'difficult'
  },
  {
    name: 'Maldives Overwater Villa',
    description: 'Relax in luxury overwater villas in the pristine Maldives. Crystal clear waters, coral reefs, and white sand beaches create the perfect tropical paradise. Ideal for honeymoons and ultimate relaxation.',
    location: 'Maldives',
    coordinates: {
      type: 'Point',
      coordinates: [73.2207, 3.2028]
    },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800'
    ],
    price: 899,
    originalPrice: 1299,
    category: 'luxury',
    tags: ['beach', 'luxury', 'overwater', 'tropical'],
    amenities: ['Overwater Villa', 'Private Beach', 'Snorkeling', 'Spa Services', 'Fine Dining', 'Water Sports'],
    rating: 4.9,
    reviewCount: 234,
    maxGuests: 2,
    isFeatured: true
  },
  {
    name: 'Moroccan Desert Safari',
    description: 'Experience the magic of the Sahara Desert with camel treks, traditional Berber camps, and stunning starlit nights. Explore ancient kasbahs, vibrant markets, and enjoy authentic Moroccan cuisine.',
    location: 'Marrakech, Morocco',
    coordinates: {
      type: 'Point',
      coordinates: [-7.9811, 31.6295]
    },
    images: [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800',
      'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800'
    ],
    price: 279,
    category: 'adventure',
    tags: ['desert', 'camel', 'culture', 'camping'],
    amenities: ['Camel Trekking', 'Desert Camping', 'Traditional Music', 'Stargazing', 'Berber Culture'],
    rating: 4.4,
    reviewCount: 98,
    maxGuests: 8,
    difficulty: 'moderate'
  },
  {
    name: 'Northern Lights Iceland',
    description: 'Witness the spectacular Aurora Borealis in Iceland. Combine the hunt for Northern Lights with visits to geysers, waterfalls, and the famous Blue Lagoon. Perfect for winter adventure seekers.',
    location: 'Reykjavik, Iceland',
    coordinates: {
      type: 'Point',
      coordinates: [-21.8174, 64.1466]
    },
    images: [
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800',
      'https://images.unsplash.com/photo-1531168556467-80aace4d0144?w=800',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    ],
    price: 449,
    category: 'nature',
    tags: ['northern lights', 'aurora', 'winter', 'photography'],
    amenities: ['Aurora Tours', 'Blue Lagoon', 'Geyser Tours', 'Waterfall Visits', 'Photography Guide'],
    rating: 4.6,
    reviewCount: 145,
    maxGuests: 6
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Destination.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user first
    const adminUser = await User.create(sampleUsers[0]);
    console.log('👤 Created admin user');

    // Create regular users
    const regularUsers = await User.create(sampleUsers.slice(1));
    console.log(`👥 Created ${regularUsers.length} regular users`);

    // Create destinations with admin as creator
    const destinationsWithCreator = sampleDestinations.map(dest => ({
      ...dest,
      createdBy: adminUser._id
    }));

    const destinations = await Destination.create(destinationsWithCreator);
    console.log(`🏖️ Created ${destinations.length} destinations`);

    // Add some destinations to users' saved lists
    for (const user of regularUsers) {
      const randomDestinations = destinations
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 1)
        .map(dest => dest._id);
      
      user.savedDestinations = randomDestinations;
      await user.save();
    }
    console.log('💾 Added saved destinations to users');

    console.log(`
✅ Database seeded successfully!

📊 Created:
   - ${sampleUsers.length} users (1 admin, ${sampleUsers.length - 1} regular)
   - ${sampleDestinations.length} destinations
   - Random saved destinations for users

🔐 Login Credentials:
   Admin: admin@example.com / admin123456
   User:  user@example.com / user123456
   User:  jane@example.com / jane123456

🌐 You can now start the server and test the API!
    `);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Run seeder
if (require.main === module) {
  connectDB().then(seedDatabase);
}

module.exports = { seedDatabase };
