# 🌍 Travel & Tourism Management System

A comprehensive full-stack travel booking platform built with React, Node.js, Express, and MongoDB. This application provides destination management, booking system, user authentication, and OCR functionality for travel documents.

## 🚀 Features

### Frontend (React)
- **Modern UI/UX** with Tailwind CSS
- **Interactive Maps** with Google Maps integration
- **Destination Discovery** with search and filtering
- **User Authentication** with JWT tokens
- **Booking Management** system
- **Responsive Design** for all devices
- **Admin Dashboard** for destination management
- **User Dashboard** for bookings and saved destinations

### Backend (Node.js/Express)
- **RESTful API** with comprehensive endpoints
- **JWT Authentication** with access and refresh tokens
- **Role-based Authorization** (User/Admin)
- **Destination Management** with CRUD operations
- **Booking System** with availability checking
- **OCR Text Extraction** from travel documents
- **Rate Limiting** and security headers
- **Input Validation** and sanitization
- **File Upload** handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **Google Cloud Vision API** (optional, for OCR features)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ASSIGNMENTTOURSIM
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/travel-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_SECRET=your-cookie-secret-change-this-in-production

# Google Cloud Vision API (Optional - for OCR feature)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For Windows (if MongoDB is installed as a service)
net start MongoDB

# For macOS with Homebrew
brew services start mongodb-community

# For Linux
sudo systemctl start mongod
```

#### Seed the Database (Optional)

```bash
node seedData.js
```

#### Start the Backend Server

```bash
# Development mode (with nodemon for auto-restart)
npm run dev

# Production mode
npm start
```

The backend server will be running at `http://localhost:3001`

### 3. Frontend Setup

Navigate back to the root directory and install frontend dependencies:

```bash
cd ..
npm install
```

#### Environment Configuration (Optional)

If you need to configure frontend environment variables, create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 📦 Dependencies

### Backend Dependencies

#### Core Dependencies
- **express** (^5.1.0) - Web framework for Node.js
- **mongoose** (^8.18.1) - MongoDB object modeling
- **bcryptjs** (^3.0.2) - Password hashing
- **jsonwebtoken** (^9.0.2) - JWT token handling
- **cors** (^2.8.5) - Cross-origin resource sharing
- **helmet** (^8.1.0) - Security headers
- **dotenv** (^17.2.2) - Environment variables
- **express-rate-limit** (^8.1.0) - Rate limiting
- **express-validator** (^7.2.1) - Input validation
- **multer** (^2.0.2) - File upload handling
- **cookie-parser** (^1.4.7) - Cookie parsing

#### Optional Dependencies
- **@google-cloud/vision** (^5.3.3) - OCR functionality

#### Development Dependencies
- **nodemon** (^3.1.10) - Development server with auto-restart

### Frontend Dependencies

#### Core Dependencies
- **react** (^19.1.1) - React library
- **react-dom** (^19.1.1) - React DOM rendering
- **react-router-dom** (^7.9.1) - Client-side routing
- **axios** (^1.12.2) - HTTP client
- **js-cookie** (^3.0.5) - Cookie management

#### UI & Styling
- **@tailwindcss/vite** (^4.1.12) - Tailwind CSS integration
- **tailwindcss** (^4.1.12) - Utility-first CSS framework
- **lucide-react** (^0.544.0) - Icon library

#### Forms & Validation
- **react-hook-form** (^7.62.0) - Form handling
- **@hookform/resolvers** (^5.2.2) - Form validation resolvers
- **yup** (^1.7.0) - Schema validation

#### Maps Integration
- **@googlemaps/react-wrapper** (^1.2.0) - Google Maps React wrapper

#### Development Dependencies
- **vite** (^7.1.2) - Build tool and dev server
- **@vitejs/plugin-react** (^5.0.0) - Vite React plugin
- **eslint** (^9.33.0) - Code linting
- **@eslint/js** (^9.33.0) - ESLint JavaScript configuration
- **eslint-plugin-react-hooks** (^5.2.0) - React hooks linting
- **eslint-plugin-react-refresh** (^0.4.20) - React refresh linting
- **@types/react** (^19.1.10) - React TypeScript definitions
- **@types/react-dom** (^19.1.7) - React DOM TypeScript definitions
- **autoprefixer** (^10.4.21) - CSS autoprefixer
- **postcss** (^8.5.6) - CSS post-processor

## 🚀 Quick Start Commands

### Start Both Frontend and Backend

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

### Build for Production

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get user profile

#### Destinations
- `GET /destinations` - Get all destinations
- `GET /destinations/:id` - Get destination by ID
- `POST /destinations` - Create destination (Admin)
- `PUT /destinations/:id` - Update destination (Admin)
- `DELETE /destinations/:id` - Delete destination (Admin)

#### Bookings
- `POST /booking` - Create booking
- `GET /booking` - Get user bookings
- `GET /booking/:id` - Get booking by ID
- `PUT /booking/:id` - Update booking
- `POST /booking/:id/cancel` - Cancel booking

#### OCR (Optional)
- `POST /ocr` - Process image for text extraction
- `GET /ocr/status` - Get OCR service status

## 🗂️ Project Structure

```
ASSIGNMENTTOURSIM/
├── backend/                 # Backend API
│   ├── config/             # Configuration files
│   │   ├── database.js     # MongoDB connection
│   │   └── environment.js  # Environment variables
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── destinationController.js
│   │   ├── ocrController.js
│   │   └── userController.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── validation.js   # Input validation
│   ├── models/             # MongoDB models
│   │   ├── Booking.js
│   │   ├── Destination.js
│   │   └── User.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── destinations.js
│   │   ├── ocr.js
│   │   └── users.js
│   ├── utils/              # Utility functions
│   │   └── jwt.js
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   ├── index.js            # Application entry point
│   └── seedData.js         # Database seeding
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── DestinationCard.jsx
│   │   ├── GoogleMap.jsx
│   │   ├── InteractiveMap.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── QuickNav.jsx
│   ├── context/            # React context
│   │   └── AuthContext.jsx
│   ├── hooks/              # Custom hooks
│   │   └── useAuth.js
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── DestinationDetail.jsx
│   │   ├── Destinations.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── UserDashboard.jsx
│   ├── services/           # API services
│   │   ├── authService.js
│   │   └── destinationService.js
│   ├── utils/              # Utility functions
│   │   ├── mockAuth.js
│   │   ├── savedDestinations.js
│   │   └── validation.js
│   ├── data/               # Sample data
│   │   └── sampleDestinations.js
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── package.json            # Frontend dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Project documentation
```

## 🔧 Configuration

### MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas (cloud)
2. Update `MONGODB_URI` in your environment variables
3. The application will automatically create the database and collections

### Google Maps Integration (Optional)

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add the key to your frontend environment variables
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### Google Cloud Vision API (Optional)

For OCR functionality:

1. Create a Google Cloud project
2. Enable the Vision API
3. Create a service account and download credentials
4. Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## 🧪 Testing

```bash
# Backend health check
curl http://localhost:3001/health

# Test API endpoints
curl http://localhost:3001/api/destinations
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend Build

```bash
npm run build
```

### Backend Production

```bash
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check if all dependencies are installed
5. Create an issue in the repository

## 🔄 API Response Format

All API responses follow this standardized format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "errors": [], // Validation errors (if applicable)
  "pagination": {} // Pagination info (for list endpoints)
}
```

## 📝 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

---

**Happy Coding! 🚀**

For more detailed information, check the individual README files in the backend directory.


