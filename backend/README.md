# Travel App Backend API

A comprehensive RESTful API for a travel destination booking platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **JWT Authentication** with access and refresh tokens
- **Role-based Authorization** (User/Admin)
- **Destination Management** with search and filtering
- **Booking System** with availability checking
- **User Saved Destinations**
- **OCR Text Extraction** from travel documents
- **Rate Limiting** and security headers
- **Input Validation** and sanitization
- **MongoDB** with Mongoose ODM
- **File Upload** handling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Cloud Vision API (optional, for OCR)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the environment variables from `config/environment.js` and set them as environment variables or create a `.env` file:
   
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/travel-app
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   CLIENT_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Seed the database** (optional)
   ```bash
   node seedData.js
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |

### Destination Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/destinations` | Get all destinations | No |
| GET | `/destinations/:id` | Get destination by ID | No |
| POST | `/destinations` | Create destination | Admin |
| PUT | `/destinations/:id` | Update destination | Admin |
| DELETE | `/destinations/:id` | Delete destination | Admin |
| GET | `/destinations/featured` | Get featured destinations | No |
| GET | `/destinations/popular` | Get popular destinations | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/:userId/save/:destId` | Save/unsave destination | Yes |
| GET | `/users/:userId/saved` | Get saved destinations | Yes |
| GET | `/users/:userId/bookings` | Get user bookings | Yes |
| GET | `/users/:userId` | Get user profile | Yes |
| GET | `/users` | Get all users | Admin |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/booking` | Create booking | Yes |
| GET | `/booking` | Get bookings | Yes |
| GET | `/booking/:id` | Get booking by ID | Yes |
| PUT | `/booking/:id` | Update booking | Yes |
| POST | `/booking/:id/cancel` | Cancel booking | Yes |
| GET | `/booking/availability` | Check availability | No |

### OCR Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ocr` | Process image for text extraction | Yes |
| GET | `/ocr/status` | Get OCR service status | No |

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Access Token**: Short-lived (15 minutes), sent in Authorization header
2. **Refresh Token**: Long-lived (7 days), stored as HTTP-only cookie

### Example Usage

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include'
});

// Use access token for protected routes
const protectedResponse = await fetch('/api/destinations', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  savedDestinations: [ObjectId],
  isActive: Boolean,
  emailVerified: Boolean
}
```

### Destination Model
```javascript
{
  name: String,
  description: String,
  location: String,
  coordinates: GeoJSON Point,
  images: [String],
  price: Number,
  category: String,
  rating: Number,
  maxGuests: Number,
  isActive: Boolean,
  isFeatured: Boolean,
  createdBy: ObjectId
}
```

### Booking Model
```javascript
{
  user: ObjectId,
  destination: ObjectId,
  startDate: Date,
  endDate: Date,
  guests: Number,
  totalPrice: Number,
  status: String,
  guestDetails: Object,
  review: Object
}
```

## 🔒 Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **Password hashing** with bcrypt
- **JWT token security** with refresh mechanism
- **CORS** configuration
- **Input sanitization** to prevent XSS

## 🧪 Testing

```bash
# Run tests (if implemented)
npm test

# Check API health
curl http://localhost:3001/health
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
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 Monitoring

- Health check endpoint: `GET /health`
- API documentation: `GET /api`
- Error logging in development mode
- Request logging middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api`
- Review the health check at `/health`

## 🔄 API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "errors": [], // Validation errors (if applicable)
  "pagination": {} // Pagination info (for list endpoints)
}
```

## 📝 Changelog

### v1.0.0
- Initial release
- JWT authentication system
- Destination management
- Booking system
- OCR functionality
- User management
- Admin dashboard features
