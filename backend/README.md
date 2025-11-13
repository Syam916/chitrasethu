# Chitrasethu Backend API

Complete backend API for the Chitrasethu Photography Platform built with Node.js, Express, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

- **User Management**: Registration, authentication, and profile management
- **Photographer Profiles**: Professional portfolios and service listings
- **Booking System**: Complete booking workflow with payments
- **Event Management**: Create and manage photography events
- **Social Features**: Posts, likes, comments, and collections
- **Messaging**: Direct messaging between users
- **Notifications**: Real-time notification system
- **Payment Integration**: Razorpay payment gateway
- **File Upload**: Image and video upload with Cloudinary
- **RESTful API**: Clean and well-documented API endpoints
- **Security**: JWT authentication, password hashing, input validation
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer + Cloudinary
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Real-time**: Socket.io (for future implementation)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chitrasethu.git
cd chitrasethu/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=chitrasethu
DB_PORT=5432

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🗄️ Database Setup

### Step 1: Create Database and Tables

```bash
npm run db:setup
```

This command will:
- Create the `chitrasethu` database
- Create all 18 tables with proper relationships
- Set up indexes and constraints
- Create triggers and views

### Step 2: Seed Sample Data

```bash
npm run db:seed
```

This command will populate the database with:
- 8 sample users (customers, photographers, admin)
- 4 photographer profiles with portfolios
- 8 event categories
- 5 sample events
- 4 bookings with payments
- Social posts and interactions
- Messages and notifications

### Step 3: Verify Database

```bash
# Login to MySQL
mysql -u root -p

# Use the database
USE chitrasethu;

# Check tables
SHOW TABLES;

# Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM photographers;
SELECT COUNT(*) FROM bookings;
```

### Database Reset (CAUTION!)

To completely reset the database:

```bash
npm run db:reset
```

**Warning**: This will delete all data! Use only in development.

## ⚙️ Configuration

### MySQL Configuration

Ensure MySQL is running and accessible:

```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL (if not running)
sudo systemctl start mysql

# Login to MySQL
mysql -u root -p
```

### Create MySQL User (Optional)

For better security, create a dedicated database user:

```sql
CREATE USER 'chitrasethu_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON chitrasethu_db.* TO 'chitrasethu_user'@'localhost';
FLUSH PRIVILEGES;
```

Update `.env` with the new credentials.

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:5000` with auto-reload on file changes.

### Production Mode

```bash
npm start
```

### Verify Server

Open your browser or use curl:

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-10-25T10:30:00.000Z"
}
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

#### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/account` - Delete user account

#### Photographers
- `GET /api/photographers` - Get all photographers (with filters)
- `GET /api/photographers/:id` - Get photographer details
- `POST /api/photographers` - Create photographer profile
- `PUT /api/photographers/:id` - Update photographer profile
- `GET /api/photographers/:id/portfolio` - Get portfolio
- `POST /api/photographers/:id/portfolio` - Add portfolio item
- `GET /api/photographers/:id/availability` - Get availability
- `POST /api/photographers/:id/availability` - Set availability

#### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

#### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/confirm` - Confirm booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/review` - Add review

#### Posts
- `GET /api/posts` - Get all posts (feed)
- `GET /api/posts/:id` - Get post details
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment on post

#### Collections
- `GET /api/collections` - Get all collections
- `GET /api/collections/:id` - Get collection details
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection

#### Messages
- `GET /api/messages` - Get user messages
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

#### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:bookingId` - Get payment history

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   ├── cloudinary.js        # Cloudinary config
│   │   └── razorpay.js          # Payment config
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── user.controller.js   # User operations
│   │   ├── photographer.controller.js
│   │   ├── booking.controller.js
│   │   ├── event.controller.js
│   │   ├── post.controller.js
│   │   └── ...
│   ├── models/
│   │   ├── user.model.js        # User database queries
│   │   ├── photographer.model.js
│   │   ├── booking.model.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── user.routes.js       # User endpoints
│   │   ├── photographer.routes.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── validate.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   ├── utils/
│   │   ├── jwt.util.js          # JWT helpers
│   │   ├── email.util.js        # Email helpers
│   │   ├── upload.util.js       # File upload helpers
│   │   └── response.util.js     # Response formatters
│   ├── validators/
│   │   ├── auth.validator.js    # Input validation
│   │   ├── user.validator.js
│   │   └── ...
│   ├── database/
│   │   ├── setup.js             # Database setup script
│   │   ├── seed.js              # Seed data script
│   │   └── reset.js             # Database reset script
│   └── server.js                # Main server file
├── database/
│   ├── schema.sql               # Database schema
│   ├── seed.sql                 # Seed data
│   └── DB_README.md             # Database documentation
├── uploads/                     # Temporary file uploads
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md                    # This file
```

## 🗃️ Database Schema

The database consists of 18 tables organized into 5 categories:

### User Management
- `users` - Core user data
- `user_profiles` - Extended profiles
- `user_roles` - Role definitions
- `user_sessions` - Active sessions

### Photographer Management
- `photographers` - Photographer profiles
- `photographer_portfolios` - Portfolio items
- `photographer_availability` - Calendar availability

### Event & Booking
- `event_categories` - Event types
- `events` - Event listings
- `bookings` - Booking records
- `booking_payments` - Payment transactions
- `booking_reviews` - Reviews and ratings

### Social Features
- `posts` - Social posts
- `post_likes` - Post likes
- `post_comments` - Post comments
- `collections` - Photo collections

### Communication
- `messages` - Direct messages
- `notifications` - User notifications

For detailed database documentation, see [database/DB_README.md](database/DB_README.md)

## 🧪 Testing

### Test Credentials

After running `npm run db:seed`, you can use these credentials:

**Customer Account:**
- Email: `customer1@example.com`
- Password: `Password123!`

**Photographer Account:**
- Email: `arjun.kapoor@example.com`
- Password: `Password123!`

**Admin Account:**
- Email: `admin@chitrasethu.com`
- Password: `Password123!`

### Manual API Testing

Use Postman, Insomnia, or curl to test endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test API info
curl http://localhost:5000/api

# Test login (example)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com","password":"Password123!"}'
```

## 🚢 Deployment

### Environment Variables

Ensure all production environment variables are set:

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=strong_production_password
JWT_SECRET=strong_random_secret
```

### Build and Deploy

```bash
# Install production dependencies only
npm install --production

# Start server
npm start
```

### Recommended Hosting Platforms

- **Backend**: Railway, Render, DigitalOcean, AWS EC2
- **Database**: AWS RDS, DigitalOcean Managed MySQL, PlanetScale
- **File Storage**: Cloudinary, AWS S3

## 🔒 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong JWT secrets**
3. **Enable HTTPS in production**
4. **Implement rate limiting**
5. **Validate all inputs**
6. **Use prepared statements** (already implemented)
7. **Keep dependencies updated**
8. **Enable CORS only for trusted origins**
9. **Use environment-specific configurations**
10. **Regular security audits**

## 📝 Scripts Reference

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run db:setup   # Create database and tables
npm run db:seed    # Populate with sample data
npm run db:reset   # Reset database (CAUTION!)
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check MySQL is running
sudo systemctl status mysql

# Check MySQL port
netstat -an | grep 3306

# Test MySQL connection
mysql -u root -p -h localhost
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: dev@chitrasethu.com
- Documentation: [database/DB_README.md](database/DB_README.md)

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributors

- Development Team - Chitrasethu

---

**Happy Coding! 📸✨**

