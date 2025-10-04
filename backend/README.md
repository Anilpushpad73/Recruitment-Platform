# Full-Stack Recruitment Platform with MongoDB

A comprehensive recruitment platform built with React, Node.js, Express, and MongoDB featuring user authentication, profile management, and modern UI design.

## Features

### Backend (Node.js/Express/MongoDB)
- **User Authentication**: JWT-based authentication with secure password hashing
- **Registration API**: Email/password signup with comprehensive validation
- **Login API**: Secure authentication with token generation
- **Profile Management**: Complete CRUD operations for user profiles
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Robust error handling with detailed error messages
- **Security**: Rate limiting, CORS, helmet security headers
- **Database**: MongoDB with Mongoose ODM for data modeling

### Frontend (React/TypeScript)
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Authentication Forms**: Login and registration with real-time validation
- **Profile Management**: Comprehensive profile editing with skills, experience levels
- **Error Handling**: User-friendly error messages and loading states
- **Responsive Design**: Mobile-first design that works on all devices
- **Type Safety**: Full TypeScript implementation for better development experience

### Database Schema (MongoDB)
```javascript
User Schema:
- email (String, required, unique, validated)
- password (String, required, hashed with bcrypt)
- fullName (String, required)
- phone (String, optional, validated)
- location (String, optional)
- bio (String, optional, max 1000 chars)
- skills (Array of Strings)
- experienceLevel (Enum: entry, junior, mid, senior, lead)
- linkedinUrl (String, optional, URL validated)
- githubUrl (String, optional, URL validated)
- portfolioUrl (String, optional, URL validated)
- isActive (Boolean, default: true)
- lastLogin (Date)
- timestamps (createdAt, updatedAt)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `DELETE /api/profile` - Deactivate user account

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/recruitment_platform
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

3. Start MongoDB service (if running locally)

4. Start the backend server:
   ```bash
   npm run server:dev
   ```

### Frontend Setup
1. Start the React development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

## Security Features

- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Security Headers**: Helmet.js for security headers
- **Data Sanitization**: Input sanitization to prevent injection attacks

## Error Handling

- **Validation Errors**: Detailed field-level validation messages
- **Authentication Errors**: Clear authentication failure messages
- **Database Errors**: Proper handling of database connection and query errors
- **Network Errors**: Frontend handling of network connectivity issues
- **User-Friendly Messages**: Clear, actionable error messages for users

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js
- Express Validator
- Helmet
- CORS
- Express Rate Limit

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Vite (build tool)

## Development

### Running in Development Mode
```bash
# Start backend with nodemon (auto-restart)
npm run server:dev

# Start frontend with hot reload
npm run dev
```

### Building for Production
```bash
# Build frontend
npm run build

# Start backend in production mode
NODE_ENV=production npm run server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.