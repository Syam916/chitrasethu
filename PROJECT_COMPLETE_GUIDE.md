# 🎯 Chitrasethu Photography Platform - Complete Project Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Database Structure](#database-structure)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Authentication Flow](#authentication-flow)
7. [API Endpoints](#api-endpoints)
8. [File Structure Explained](#file-structure-explained)
9. [Data Flow Examples](#data-flow-examples)
10. [Setup Instructions](#setup-instructions)
11. [Development Workflow](#development-workflow)
12. [Key Features Implementation](#key-features-implementation)

---

## 🎯 Project Overview

**Chitrasethu** is a comprehensive photography platform that connects customers with professional photographers. It's a full-stack application with:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- **Backend**: Node.js + Express + MySQL
- **Authentication**: JWT-based authentication
- **Database**: MySQL with comprehensive schema

### Key Features:
- User registration and authentication
- Photographer profiles and portfolios
- Event booking system
- Social media features (posts, likes, comments)
- Payment integration (Razorpay)
- Real-time messaging
- Notification system

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│   (React)       │                │   (Node.js)     │
│   Port: 5173    │                │   Port: 5000    │
└─────────────────┘                └─────────────────┘
                                           │
                                           │ SQL Queries
                                           ▼
                                    ┌─────────────────┐
                                    │   Database      │
                                    │   (MySQL)       │
                                    │   Port: 3306    │
                                    └─────────────────┘
```

---

## 🗄️ Database Structure

### Core Tables:

#### 1. **Users & Authentication**
- `users` - Core user authentication data
- `user_profiles` - Extended user profile information
- `user_sessions` - Track active user sessions
- `user_roles` - Define user roles and permissions

#### 2. **Photographer Management**
- `photographers` - Professional photographer profiles
- `photographer_portfolios` - Portfolio images and details
- `photographer_availability` - Calendar availability

#### 3. **Event & Booking System**
- `event_categories` - Event types (Wedding, Corporate, etc.)
- `events` - Event listings
- `bookings` - Booking requests and confirmations
- `booking_payments` - Payment transactions
- `booking_reviews` - Reviews and ratings

#### 4. **Social Features**
- `posts` - Social media posts
- `post_likes` - Post likes tracking
- `post_comments` - Post comments
- `collections` - Curated photo collections

#### 5. **Communication**
- `messages` - Direct messaging
- `notifications` - User notifications

### Database Relationships:
```
users (1) ──► (1) user_profiles
users (1) ──► (1) photographers
photographers (1) ──► (*) photographer_portfolios
users (1) ──► (*) events
users (1) ──► (*) bookings
photographers (1) ──► (*) bookings
```

---

## 🔧 Backend Architecture

### Directory Structure:
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection & queries
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── photographer.controller.js
│   │   └── post.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.routes.js        # Authentication routes
│   │   ├── photographer.routes.js
│   │   └── post.routes.js
│   ├── database/
│   │   ├── setup.js             # Database setup
│   │   ├── seed.js              # Seed data
│   │   └── reset.js             # Database reset
│   └── server.js                # Main server file
├── database/
│   ├── schema.sql               # Database schema
│   └── seed.sql                # Sample data
├── package.json
└── env.example
```

### Key Backend Files Explained:

#### 1. **server.js** - Main Server File
```javascript
// What it does:
- Sets up Express server
- Configures middleware (CORS, security, logging)
- Mounts API routes
- Handles errors globally
- Connects to database
- Starts server on port 5000
```

#### 2. **config/database.js** - Database Configuration
```javascript
// What it does:
- Creates MySQL connection pool
- Provides query helper functions
- Handles database transactions
- Tests database connectivity

```

#### 3. **controllers/auth.controller.js** - Authentication Logic
```javascript
// Functions:
- register() - Creates new user account
- login() - Authenticates user and returns JWT
- getCurrentUser() - Gets current user data
- updateProfile() - Updates user profile
- logout() - Handles user logout
```

#### 4. **middleware/auth.middleware.js** - JWT Middleware
```javascript
// Functions:
- authenticateToken() - Verifies JWT tokens
- optionalAuth() - Optional authentication for public routes
```

---

## 🎨 Frontend Architecture

### Directory Structure:
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                   # Shadcn/UI components
│   │   ├── home/                 # Home page components
│   │   ├── LoginPageIntegrated.tsx
│   │   ├── RegisterPageIntegrated.tsx
│   │   └── HomePage.tsx
│   ├── pages/                    # Route components
│   ├── services/                 # API service layers
│   │   ├── auth.service.ts
│   │   ├── photographer.service.ts
│   │   └── post.service.ts
│   ├── config/
│   │   └── api.ts               # API configuration
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   ├── assets/                  # Images and static files
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # App entry point
├── package.json
└── tailwind.config.ts
```

### Key Frontend Files Explained:

#### 1. **App.tsx** - Main Application Component
```typescript
// What it does:
- Sets up React Router for navigation
- Configures React Query for API calls
- Provides UI context (TooltipProvider)
- Defines all application routes
- Renders toast notifications
```

#### 2. **services/auth.service.ts** - Authentication Service
```typescript
// What it does:
- Handles all authentication API calls
- Manages JWT token storage in localStorage
- Provides user data management
- Handles login/logout functionality
```

#### 3. **config/api.ts** - API Configuration
```typescript
// What it does:
- Defines all API endpoints
- Provides helper functions for API calls
- Handles authentication headers
- Manages API error handling
```

#### 4. **components/LoginPageIntegrated.tsx** - Login Component
```typescript
// What it does:
- Renders beautiful login form
- Handles form validation
- Calls authentication service
- Manages loading states and errors
- Redirects to home page on success
```

---

## 🔐 Authentication Flow

### Complete Login Flow:

#### 1. **User Enters Credentials**
```
User fills login form → LoginPageIntegrated.tsx
```

#### 2. **Frontend Validation**
```typescript
// In LoginPageIntegrated.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // Form validation
  // Call authService.login()
}
```

#### 3. **API Call to Backend**
```typescript
// In auth.service.ts
async login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
```

#### 4. **Backend Processing**
```javascript
// In auth.controller.js
export const login = async (req, res) => {
  // 1. Validate input
  // 2. Find user in database
  // 3. Verify password with bcrypt
  // 4. Generate JWT token
  // 5. Update last login
  // 6. Return user data + token
}
```

#### 5. **Token Storage**
```typescript
// In auth.service.ts
if (result.data?.token) {
  localStorage.setItem('token', result.data.token);
  localStorage.setItem('user', JSON.stringify(result.data.user));
}
```

#### 6. **Protected Route Access**
```typescript
// In auth.middleware.js (Backend)
export const authenticateToken = (req, res, next) => {
  // 1. Extract token from Authorization header
  // 2. Verify JWT token
  // 3. Add user data to request object
  // 4. Allow access to protected route
}
```

### Authentication State Management:

#### Frontend State:
```typescript
// User authentication state is managed through:
1. localStorage - Persistent storage
2. authService - Service layer
3. React components - UI state
4. React Router - Route protection
```

#### Backend State:
```javascript
// Authentication state managed through:
1. JWT tokens - Stateless authentication
2. Database sessions - Optional session tracking
3. Middleware - Request-level authentication
```

---

## 🌐 API Endpoints

### Authentication Endpoints:
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
GET  /api/auth/me          - Get current user
PUT  /api/auth/profile     - Update user profile
POST /api/auth/logout      - User logout
```

### Photographer Endpoints:
```
GET  /api/photographers     - List photographers
GET  /api/photographers/:id - Get photographer details
POST /api/photographers     - Create photographer profile
PUT  /api/photographers/:id - Update photographer profile
```

### Post Endpoints:
```
GET  /api/posts            - List posts
GET  /api/posts/:id        - Get post details
POST /api/posts            - Create new post
PUT  /api/posts/:id        - Update post
DELETE /api/posts/:id      - Delete post
```

### API Request/Response Format:
```javascript
// Request Headers (for authenticated routes)
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}

// Success Response
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}

// Error Response
{
  "status": "error",
  "message": "Error description"
}
```

---

## 📁 File Structure Explained

### Backend Files:

#### **server.js** - Main Server Entry Point
```javascript
// Purpose: Application bootstrap and configuration
// Key responsibilities:
- Express server setup
- Middleware configuration (CORS, security, logging)
- Route mounting
- Error handling
- Database connection testing
- Server startup
```

#### **config/database.js** - Database Layer
```javascript
// Purpose: Database connection and query management
// Key functions:
- createPool() - MySQL connection pool
- testConnection() - Database connectivity test
- query() - Execute SQL queries
- transaction() - Database transaction handling
```

#### **controllers/auth.controller.js** - Authentication Business Logic
```javascript
// Purpose: Handle authentication-related operations
// Key functions:
- register() - User registration with profile creation
- login() - User authentication and JWT generation
- getCurrentUser() - Retrieve current user data
- updateProfile() - Update user profile information
- logout() - Handle user logout
```

#### **middleware/auth.middleware.js** - Authentication Middleware
```javascript
// Purpose: Protect routes and verify JWT tokens
// Key functions:
- authenticateToken() - Required authentication
- optionalAuth() - Optional authentication
```

#### **routes/auth.routes.js** - Authentication Routes
```javascript
// Purpose: Define authentication API endpoints
// Routes:
- POST /register - Public route
- POST /login - Public route
- GET /me - Protected route
- PUT /profile - Protected route
- POST /logout - Protected route
```

### Frontend Files:

#### **App.tsx** - Main Application Component
```typescript
// Purpose: Application root and routing
// Key responsibilities:
- React Router setup
- React Query configuration
- UI provider setup
- Route definitions
- Global components (Toaster, etc.)
```

#### **services/auth.service.ts** - Authentication Service Layer
```typescript
// Purpose: Handle all authentication API calls
// Key functions:
- register() - User registration
- login() - User authentication
- logout() - User logout
- getCurrentUser() - Get current user
- updateProfile() - Update profile
- isAuthenticated() - Check auth status
```

#### **config/api.ts** - API Configuration
```typescript
// Purpose: Centralized API configuration
// Key exports:
- API_BASE_URL - Base API URL
- API_ENDPOINTS - All endpoint definitions
- getAuthHeader() - Authentication headers
- handleApiError() - Error handling
```

#### **components/LoginPageIntegrated.tsx** - Login Component
```typescript
// Purpose: User login interface
// Key features:
- Beautiful UI with hero section
- Form validation
- Loading states
- Error handling
- Authentication integration
- Navigation after login
```

#### **components/home/NavbarIntegrated.tsx** - Navigation Component
```typescript
// Purpose: Main navigation and user menu
// Key features:
- User authentication state
- Navigation menu
- User profile dropdown
- Logout functionality
- Search functionality
```

---

## 🔄 Data Flow Examples

### 1. **User Login Flow**

```
1. User enters email/password in LoginPageIntegrated.tsx
   ↓
2. Form submission calls authService.login()
   ↓
3. authService makes POST request to /api/auth/login
   ↓
4. Backend auth.controller.js processes login:
   - Validates credentials
   - Checks user in database
   - Verifies password with bcrypt
   - Generates JWT token
   - Returns user data + token
   ↓
5. Frontend stores token in localStorage
   ↓
6. User redirected to /home
   ↓
7. NavbarIntegrated.tsx loads user data from localStorage
   ↓
8. User can now access protected routes
```

### 2. **Protected Route Access**

```
1. User navigates to protected route (e.g., /home)
   ↓
2. HomePage.tsx checks authentication with authService.isAuthenticated()
   ↓
3. If not authenticated, redirect to /login
   ↓
4. If authenticated, render protected content
   ↓
5. Any API calls include JWT token in Authorization header
   ↓
6. Backend middleware verifies token
   ↓
7. Request proceeds to controller
```

### 3. **API Call with Authentication**

```
1. Frontend component needs data (e.g., photographer list)
   ↓
2. photographer.service.ts makes API call
   ↓
3. getAuthHeader() adds JWT token to request headers
   ↓
4. Request sent to backend /api/photographers
   ↓
5. Backend auth.middleware.js verifies JWT token
   ↓
6. If valid, request proceeds to photographer.controller.js
   ↓
7. Controller queries database
   ↓
8. Response sent back to frontend
   ↓
9. Frontend updates UI with data
```

---

## 🚀 Setup Instructions

### Prerequisites:
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Git

### Backend Setup:

#### 1. **Navigate to Backend Directory**
```bash
cd chitrasethu/backend
```

#### 2. **Install Dependencies**
```bash
npm install
```

#### 3. **Environment Configuration**
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chitrasethu_db
JWT_SECRET=your_super_secret_jwt_key
```

#### 4. **Database Setup**
```bash
# Create database and tables
npm run db:setup

# Seed with sample data
npm run db:seed
```

#### 5. **Start Backend Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Frontend Setup:

#### 1. **Navigate to Frontend Directory**
```bash
cd chitrasethu/frontend
```

#### 2. **Install Dependencies**
```bash
npm install
```

#### 3. **Environment Configuration**
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

#### 4. **Start Frontend Server**
```bash
# Development mode
npm run dev

# Build for production
npm run build
```

### Verification:

#### 1. **Backend Health Check**
```bash
curl http://localhost:5000/health
```

#### 2. **Frontend Access**
```bash
# Open browser to http://localhost:5173
```

#### 3. **Test Login**
```bash
# Use test credentials from seed data:
Email: customer1@example.com
Password: Password123!
```

---

## 💻 Development Workflow

### 1. **Making Changes to Backend**

#### Adding New API Endpoint:
```javascript
// 1. Create controller function in controllers/
export const newFunction = async (req, res) => {
  // Business logic here
};

// 2. Add route in routes/
router.get('/new-endpoint', authenticateToken, newFunction);

// 3. Mount route in server.js
app.use('/api/new', newRoutes);
```

#### Adding New Database Table:
```sql
-- 1. Add table to schema.sql
CREATE TABLE new_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- columns here
);

-- 2. Update seed.sql with sample data
INSERT INTO new_table VALUES (...);

-- 3. Run database setup
npm run db:setup
```

### 2. **Making Changes to Frontend**

#### Adding New Page:
```typescript
// 1. Create page component in pages/
const NewPage = () => {
  return <div>New Page Content</div>;
};

// 2. Add route in App.tsx
<Route path="/new-page" element={<NewPage />} />

// 3. Add navigation link in NavbarIntegrated.tsx
```

#### Adding New Service:
```typescript
// 1. Create service in services/
class NewService {
  async getData() {
    const response = await fetch(API_ENDPOINTS.NEW.DATA);
    return response.json();
  }
}

// 2. Export service
export default new NewService();

// 3. Use in components
import newService from '@/services/new.service';
```

### 3. **Database Changes**

#### Adding New Column:
```sql
-- 1. Add to schema.sql
ALTER TABLE existing_table ADD COLUMN new_column VARCHAR(255);

-- 2. Update seed.sql if needed
-- 3. Run database reset and setup
npm run db:reset
npm run db:setup
```

---

## 🎯 Key Features Implementation

### 1. **User Authentication**

#### Registration Process:
```javascript
// Backend: auth.controller.js
export const register = async (req, res) => {
  // 1. Validate input data
  // 2. Check if user exists
  // 3. Hash password with bcrypt
  // 4. Insert user into database
  // 5. Create user profile
  // 6. Generate JWT token
  // 7. Return user data + token
};
```

#### Login Process:
```javascript
// Backend: auth.controller.js
export const login = async (req, res) => {
  // 1. Validate credentials
  // 2. Find user in database
  // 3. Verify password with bcrypt
  // 4. Check if account is active
  // 5. Generate JWT token
  // 6. Update last login
  // 7. Return user data + token
};
```

### 2. **JWT Token Management**

#### Token Generation:
```javascript
// Backend: auth.controller.js
const generateToken = (userId, email, userType) => {
  return jwt.sign(
    { userId, email, userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
```

#### Token Verification:
```javascript
// Backend: auth.middleware.js
export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

### 3. **Database Operations**

#### Query Execution:
```javascript
// Backend: config/database.js
const query = async (sql, params) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

// Usage in controllers:
const users = await query('SELECT * FROM users WHERE email = ?', [email]);
```

#### Transaction Handling:
```javascript
// Backend: config/database.js
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
```

### 4. **Frontend State Management**

#### Authentication State:
```typescript
// Frontend: services/auth.service.ts
class AuthService {
  // Store token and user data
  async login(data: LoginData) {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (result.data?.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    return result;
  }
  
  // Check authentication status
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
```

#### API Error Handling:
```typescript
// Frontend: config/api.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};
```

---

## 🔧 Troubleshooting Common Issues

### 1. **Database Connection Issues**
```bash
# Check MySQL service
sudo systemctl status mysql

# Check database credentials in .env
# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### 2. **CORS Issues**
```javascript
// Backend: server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### 3. **JWT Token Issues**
```bash
# Check JWT_SECRET in .env
# Verify token format in requests
# Check token expiration
```

### 4. **Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run lint
```

---

## 📚 Additional Resources

### Database Schema Reference:
- **Users**: Authentication and basic info
- **Photographers**: Professional profiles and portfolios
- **Events**: Event listings and details
- **Bookings**: Booking management and payments
- **Posts**: Social media functionality
- **Messages**: Direct messaging system

### API Documentation:
- All endpoints follow RESTful conventions
- Authentication required for protected routes
- Consistent error response format
- JWT tokens for stateless authentication

### Frontend Components:
- Shadcn/UI components for consistent design
- Tailwind CSS for styling
- React Router for navigation
- React Query for API state management

---

## 🎉 Conclusion

This project demonstrates a complete full-stack application with:

✅ **Robust Authentication System**
✅ **Comprehensive Database Design**
✅ **Modern Frontend Architecture**
✅ **Scalable Backend Structure**
✅ **Professional UI/UX Design**
✅ **Complete CRUD Operations**
✅ **Social Media Features**
✅ **Payment Integration Ready**

The codebase is well-structured, documented, and ready for production deployment. Each component has a clear purpose and follows best practices for maintainability and scalability.

---

*This guide provides complete understanding of the Chitrasethu Photography Platform. Use it as a reference for development, maintenance, and feature additions.*
