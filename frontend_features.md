# ChitraSethu Frontend Features Documentation

## Complete Frontend Feature Analysis

---

## 1. LOGIN PAGE (`/login` or `/`)

### Page Name
**Login Page Integrated** - User Authentication Entry Point

### Page Features
1. **User Authentication Form**
   - Email input field with validation
   - Password input field with show/hide toggle
   - "Remember me" checkbox option
   - "Forgot password" link (UI only, not functional yet)
   
2. **Visual Elements**
   - Hero section with animated background image
   - Ken Burns animation effect on background
   - Gradient overlays and floating particles
   - Statistics display: 500+ Photographers, 4.9 Rating, 10K+ Happy Clients
   - Responsive design (mobile and desktop views)

3. **Error Handling**
   - Displays error alerts for failed login attempts
   - Form validation for email and password
   - Loading state with spinner during authentication

### Backend Connection
- **Service File**: `src/services/auth.service.ts`
- **API Endpoint**: `POST /api/auth/login`
- **Request Data**:
  ```json
  {
    "email": "user@example.com",
    "password": "userpassword"
  }
  ```
- **Response Data**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "token": "JWT_TOKEN",
      "user": {
        "userId": 1,
        "email": "user@example.com",
        "fullName": "User Name",
        "userType": "customer",
        "isVerified": true
      }
    }
  }
  ```

### Functionality Flow
1. User enters email and password credentials
2. On form submit, `authService.login()` is called
3. API request sent to backend `/api/auth/login`
4. If valid credentials:
   - JWT token stored in localStorage
   - User data stored in localStorage
   - Redirects to `/home` page
5. If invalid credentials:
   - Error message displayed
   - User remains on login page
6. User can click "Sign up now" link to navigate to registration page

---

## 2. REGISTER/SIGN UP PAGE (`/register`)

### Page Name
**Register Page Integrated** - New User Registration

### Page Features
1. **Registration Form Fields**
   - Full Name (required)
   - Email Address (required)
   - Phone Number (optional)
   - Password (required, minimum 6 characters)
   - Confirm Password (required, must match password)
   - User Type Selection (Customer or Photographer)

2. **User Type Options**
   - **Customer**: For users looking to book photographers
   - **Photographer**: For users offering photography services

3. **Visual Elements**
   - Hero section with animated photography image
   - Feature highlights (verified photographers, secure booking, portfolio showcase)
   - Statistics: 500+ Photographers, 4.9 Rating, Award Winning
   - Password visibility toggles for both password fields

4. **Form Validation**
   - Email format validation
   - Password length validation (min 6 characters)
   - Password match confirmation
   - Required field validation

### Backend Connection
- **Service File**: `src/services/auth.service.ts`
- **API Endpoint**: `POST /api/auth/register`
- **Request Data**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "fullName": "New User Name",
    "userType": "customer",
    "phone": "+91 9876543210"
  }
  ```
- **Response Data**:
  ```json
  {
    "status": "success",
    "message": "Registration successful",
    "data": {
      "token": "JWT_TOKEN",
      "user": {
        "userId": 2,
        "email": "newuser@example.com",
        "fullName": "New User Name",
        "userType": "customer",
        "isVerified": false
      }
    }
  }
  ```

### Functionality Flow
1. User fills out all registration form fields
2. User selects user type (Customer or Photographer)
3. Frontend validates password match and length
4. On submit, `authService.register()` is called
5. API request sent to backend `/api/auth/register`
6. If registration successful:
   - JWT token stored in localStorage
   - User data stored in localStorage
   - Automatically logged in
   - Redirects to `/home` page
7. If registration fails:
   - Error message displayed (duplicate email, etc.)
   - User remains on registration page
8. User can click "Sign in" link to navigate to login page

---

## 3. HOME PAGE (`/home`)

### Page Name
**Home Page** - Main Dashboard After Login

### Page Features
1. **Navigation Bar** (NavbarIntegrated component)
   - Logo and brand name
   - Navigation menu: Home, Explore, Event Photos, Mood Board, Requests, Community Buzz
   - Search bar for photographers and events
   - Notification bell icon (with red dot indicator)
   - User profile dropdown with:
     - User name and email display
     - Profile Settings link
     - My Requests link
     - My Bookings link
     - Logout option

2. **Hero Section** (HeroSection component)
   - Welcome message with user name
   - Photography categories with images:
     - Weddings
     - Portraits
     - Events
     - Fashion
     - Corporate
   - "Start Exploring" button

3. **Three-Column Layout**
   - **Left Sidebar** (LeftSidebar component):
     - User profile card with avatar
     - Quick stats (Photos, Followers, Following)
     - Navigation shortcuts to all sections
     - Suggested photographers list
   
   - **Main Feed** (MainFeed component):
     - Social media style feed
     - Posts from photographers
     - Each post includes:
       - User avatar, name, verification badge
       - Post image/video
       - Like, Comment, Share buttons
       - Caption and hashtags
       - Comment section
     - Infinite scroll capability
   
   - **Right Sidebar** (RightSidebar component):
     - Trending photographers list
     - Popular collections showcase
     - Trending events
     - Suggested accounts to follow

4. **Authentication Check**
   - Automatically redirects to `/login` if not authenticated
   - Uses `authService.isAuthenticated()` to check login status

### Backend Connection
- **Service File**: `src/services/auth.service.ts`, `src/services/post.service.ts`
- **API Endpoints**:
  - `GET /api/auth/me` - Get current user data
  - `GET /api/posts` - Get all posts for feed
- **Data Sources**:
  - Currently uses dummy data from `src/data/dummyData.ts` for social posts
  - User data fetched from localStorage or API

### Functionality Flow
1. Page loads and checks if user is authenticated
2. If not authenticated, redirects to `/login`
3. If authenticated:
   - Loads user data from localStorage/API
   - Displays personalized welcome message
   - Loads social feed posts
   - Displays photographer posts with images
4. User can:
   - Like/unlike posts (toggle heart icon)
   - Save posts (bookmark icon)
   - Click comment to view comments section
   - Share posts
   - Add new comments
   - Navigate to different sections via navbar or sidebars
   - View trending photographers and collections
   - Click on photographers to view their profiles
5. Search functionality in navbar (UI present, full functionality pending)

---

## 4. EXPLORE PAGE (`/explore`)

### Page Name
**Explore Photographers** - Photographer Discovery and Search

### Page Features
1. **Hero Search Section**
   - Large heading: "Explore Photographers"
   - Search bar with filter button
   - Search by name, location, or specialty

2. **Sidebar Filters**
   - **Categories Filter**:
     - All Categories
     - Wedding (120 photographers)
     - Fashion (85 photographers)
     - Portrait (92 photographers)
     - Pre Wedding (56 photographers)
     - Event (78 photographers)
     - Corporate (45 photographers)
   
   - **Price Range Filter**:
     - Under ₹15,000
     - ₹15,000 - ₹25,000
     - ₹25,000 - ₹50,000
     - Above ₹50,000
   
   - **Rating Filter**:
     - 5 stars & above
     - 4 stars & above
     - 3 stars & above
     - 2 stars & above

3. **Main Content Area**
   - View mode toggle (Grid view / List view)
   - Photographer count display
   - Photographer cards showing:
     - Portfolio preview image
     - Photographer avatar
     - Name and experience
     - Location
     - Description
     - Specialties (badges)
     - Rating and review count
     - Price range
     - Heart icon (favorite)
     - "View Profile" button

4. **Search and Filter**
   - Real-time search filtering
   - Category-based filtering
   - Results update dynamically
   - "Clear Filters" option when no results

### Backend Connection
- **Service File**: `src/services/photographer.service.ts`
- **API Endpoint**: `GET /api/photographers`
- **Query Parameters**:
  ```
  ?category=wedding&city=Mumbai&minRating=4&maxPrice=50000&search=keyword
  ```
- **Response Data**:
  ```json
  {
    "status": "success",
    "data": {
      "photographers": [
        {
          "photographerId": 1,
          "userId": 5,
          "fullName": "Photographer Name",
          "businessName": "Studio Name",
          "avatarUrl": "url",
          "location": "Mumbai, Maharashtra",
          "city": "Mumbai",
          "state": "Maharashtra",
          "specialties": ["Wedding", "Portrait"],
          "experienceYears": 5,
          "basePrice": 25000,
          "rating": 4.8,
          "totalReviews": 156,
          "isVerified": true,
          "isPremium": false
        }
      ]
    }
  }
  ```

### Functionality Flow
1. Page loads and fetches photographer list from API
2. Displays photographers in grid/list view
3. User can:
   - Search photographers by keyword
   - Filter by category (wedding, fashion, etc.)
   - Filter by price range
   - Filter by rating
   - Switch between grid and list view
   - Click "View Profile" to see detailed photographer profile
   - Like/favorite photographers
   - Save photographers to collection
4. Search results update in real-time as filters are applied
5. Shows "No photographers found" message when filters return no results
6. Can clear all filters to reset search

---

## 5. EVENT PHOTOS PAGE (`/event-photos`)

### Page Name
**Event Photography** - Browse and Book Event Photographers

### Page Features
1. **Hero Section**
   - Title: "Event Photography"
   - Description: Discover upcoming events
   - Search bar for events (by name, location, category)
   - Filter button

2. **Sidebar**
   - **Event Categories**:
     - All Categories
     - Wedding
     - Fashion
     - Pre Wedding
     - Event
     - Corporate
     - Birthday
     - (Shows count for each category)
   
   - **Quick Stats Card**:
     - Total Events count
     - Events this month
     - Available spots percentage
     - Average price

3. **Main Content**
   - View mode toggle (Grid/List)
   - Events available count
   - Event cards displaying:
     - Event image
     - Status badge (Booking Open, Limited Spots, VIP Access, etc.)
     - Category badge
     - Price display
     - Event title and description
     - Date and time
     - Location
     - Expected attendees
     - "Book Photographer" button
     - "Details" button

4. **Event Information Displayed**
   - Title and description
   - Date and time
   - Location
   - Number of attendees
   - Event category
   - Booking status
   - Price range
   - Event image

### Backend Connection
- **Service File**: Currently uses dummy data from `src/data/dummyData.ts`
- **Future API Endpoint**: `GET /api/events`
- **Future Query Parameters**:
  ```
  ?category=wedding&location=Mumbai&status=open&search=keyword
  ```
- **Expected Response**:
  ```json
  {
    "status": "success",
    "data": {
      "events": [
        {
          "id": 1,
          "title": "Corporate Annual Conference",
          "description": "Event details",
          "date": "2024-02-15",
          "time": "10:00 AM",
          "location": "Mumbai, Maharashtra",
          "category": "Corporate",
          "price": "₹25,000 - ₹35,000",
          "status": "Booking Open",
          "attendees": 200,
          "image": "url"
        }
      ]
    }
  }
  ```

### Functionality Flow
1. Page loads and displays available events
2. Events filtered by selected category
3. User can:
   - Search events by keyword
   - Filter by category
   - Switch between grid and list view
   - View event details
   - Click "Book Photographer" to initiate booking process
   - View full event details
4. Search results update based on filters
5. Shows event statistics in sidebar
6. Clear filters option available

---

## 6. MOOD BOARD PAGE (`/mood-board`)

### Page Name
**Mood Board** - Photography Inspiration Collection

### Page Features
1. **Hero Section**
   - Title: "Mood Board"
   - Description: Create inspiring mood boards
   - Search bar for inspirations
   - "Create New Board" button

2. **Left Sidebar**
   - **Categories**:
     - All Categories (120)
     - Wedding (45)
     - Fashion (32)
     - Portrait (28)
     - Event (25)
     - Nature (18)
     - Architecture (15)
   
   - **My Boards**:
     - Wedding Inspiration
     - Fashion Shoots
     - Portrait Ideas
     - Color Palettes
     - (Shows item count for each)
     - "New Board" button
   
   - **Trending Tags**:
     - #minimalist, #vintage, #bohemian
     - #modern, #rustic, #elegant
     - #candid, #artistic

3. **Main Content**
   - Masonry grid layout (Pinterest-style)
   - Inspiration gallery items showing:
     - Image with varying aspect ratios
     - Category badge
     - Hover overlay with action buttons:
       - Bookmark/Save button
       - Download button
       - Share button
     - Title
     - Author name
     - Like count
     - "Save" button
   
4. **Board Management**
   - Save items to boards
   - Create new boards
   - Upload images
   - Download images
   - Share images

### Backend Connection
- **Service File**: Currently uses data from `src/data/dummyData.ts` (socialPosts and collections)
- **Future API Endpoints**:
  - `GET /api/moodboards` - Get all mood boards
  - `POST /api/moodboards` - Create new mood board
  - `POST /api/moodboards/:id/items` - Add item to board
- **Data Sources**:
  - Combines social posts and collections data
  - Creates mood board items from existing images

### Functionality Flow
1. Page loads and displays gallery in masonry layout
2. User can:
   - Browse inspiration images
   - Search by keyword
   - Filter by category
   - Create new mood boards
   - Save images to boards
   - Download images
   - Share images
   - Upload new images
   - View image details (title, author, likes)
3. Images organized in Pinterest-style masonry grid
4. Hover over images shows action buttons
5. Click save to add to personal boards
6. Track saved items (turns blue when saved)
7. View trending tags and categories

---

## 7. REQUESTS PAGE (`/requests`)

### Page Name
**Photography Requests** - Post and Browse Photography Opportunities

### Page Features
1. **Hero Section**
   - Title: "Photography Requests"
   - Description: Post needs or browse opportunities
   - Three tab options:
     - Browse Requests (with Camera icon)
     - Post Request (with Plus icon)
     - My Requests (with Users icon)

2. **BROWSE REQUESTS TAB**
   
   **Sidebar Filters**:
   - Category filter (Wedding, Fashion, Corporate, Portrait, Event)
   - Budget range filter
   - Urgency filter (High, Medium, Low priority)
   - Request stats card:
     - Active requests count
     - Total budget
     - Average proposals

   **Main Content**:
   - Active requests count
   - "More Filters" button
   - Request cards showing:
     - Client avatar and name
     - Posted time
     - Request title
     - Date, location, budget
     - Urgency badge (color-coded)
     - Category badge
     - Description
     - Requirements list (badges)
     - Proposal count
     - Status
     - "View Details" button
     - "Submit Proposal" button

3. **POST REQUEST TAB**
   
   **Create Request Form**:
   - Project title
   - Category dropdown
   - Budget range dropdown
   - Event date picker
   - Location input
   - Project description (textarea)
   - Requirements (textarea)
   - "Save as Draft" button
   - "Post Request" button

4. **MY REQUESTS TAB**
   
   **Personal Requests Management**:
   - List of user's posted requests
   - Each request shows:
     - Title
     - Posted date
     - Status badge (Active, Closed, etc.)
     - Budget
     - Event date
     - Number of proposals received
     - "View Proposals" button
     - "Edit Request" button
   - "New Request" button

### Backend Connection
- **Service File**: Currently uses dummy data from `src/data/dummyData.ts`
- **Future API Endpoints**:
  - `GET /api/requests` - Get all requests
  - `POST /api/requests` - Create new request
  - `GET /api/requests/my` - Get user's requests
  - `POST /api/requests/:id/proposals` - Submit proposal
- **Request Data Structure**:
  ```json
  {
    "title": "Wedding Photography",
    "client": "User Name",
    "budget": "₹45,000 - ₹60,000",
    "date": "2024-02-15",
    "location": "Mumbai, Maharashtra",
    "category": "Wedding",
    "description": "Detailed description",
    "requirements": ["Full day", "Album included"],
    "urgency": "High",
    "status": "Open"
  }
  ```

### Functionality Flow
1. **Browse Requests Flow**:
   - Page loads and displays available requests
   - Filter by category, budget, urgency
   - View request details
   - Submit proposals to requests
   - See how many proposals each request has

2. **Post Request Flow**:
   - Fill out request form
   - Select category and budget range
   - Provide project details
   - Save as draft or post immediately
   - Request becomes visible to photographers

3. **My Requests Flow**:
   - View all requests user has posted
   - Check proposal counts
   - Review submitted proposals
   - Edit existing requests
   - Create new requests

---

## 8. COMMUNITY BUZZ PAGE (`/community-buzz`)

### Page Name
**Community Buzz** - Photography Community and Social Hub

### Page Features
1. **Hero Section**
   - Title: "Community Buzz"
   - Description: Connect with photographers
   - Community statistics:
     - 2.5K+ Active Members
     - 150+ Daily Posts
     - 50+ Active Discussions

2. **Four Main Tabs**:
   - Community Feed
   - Discussions
   - Events
   - Trending

3. **COMMUNITY FEED TAB**
   
   **Main Feed**:
   - **Community Highlights Section**:
     - Photographer of the Month
     - Trending Technique
     - Community Challenge
     - Award/Tutorial/Challenge badges
   
   - **Social Posts Feed**:
     - User avatar with verification badge
     - Username and location
     - Timestamp
     - Post image (square format)
     - Like, Comment, Share buttons
     - Like count (interactive)
     - Comment count
     - Share count
     - Caption with hashtags
     - Tags as badges
   
   **Right Sidebar**:
   - **Trending Now**:
     - Trending topics with post counts
     - Trending percentage badges
   
   - **Top Contributors**:
     - Ranked photographer list (#1, #2, etc.)
     - Avatar, name, contribution count

4. **DISCUSSIONS TAB**
   
   **Main Content**:
   - Active discussions list
   - Each discussion shows:
     - Title
     - "Hot" badge for popular topics
     - Author name
     - Category badge
     - Reply count
     - Last active time
     - "Join Discussion" button
   
   **Sidebar**:
   - Discussion categories:
     - Equipment
     - Business
     - Post-Processing
     - Client Relations
     - Techniques
     - Inspiration

5. **EVENTS TAB**
   - Grid of community events
   - Event cards showing:
     - Event image
     - Category badge
     - Title
     - Date and time
     - Location
     - Attendee count
     - "Join Event" button

6. **TRENDING TAB**
   - **Trending Hashtags**:
     - List of popular hashtags
     - Post count for each
   
   - **Popular Techniques**:
     - Technique name
     - Tutorial count

### Backend Connection
- **Service File**: Uses data from `src/data/dummyData.ts`
- **Future API Endpoints**:
  - `GET /api/community/feed` - Get community posts
  - `POST /api/community/posts/:id/like` - Like post
  - `POST /api/community/posts/:id/comments` - Add comment
  - `GET /api/community/discussions` - Get discussions
  - `GET /api/community/trending` - Get trending data

### Functionality Flow
1. **Community Feed**:
   - Loads social posts from photographers
   - User can like/unlike posts
   - View and add comments
   - Share posts
   - See trending content
   - View top contributors

2. **Discussions**:
   - Browse active discussions by category
   - See hot topics
   - Join discussions
   - Filter by category

3. **Events**:
   - View upcoming community events
   - See event details
   - Join events

4. **Trending**:
   - See trending hashtags
   - View popular techniques
   - Access tutorials

---

## 9. PROFILE SETTINGS PAGE (`/profile`)

### Page Name
**Profile Settings** - User Account Management

### Page Features
1. **Page Header**
   - Title: "Profile Settings"
   - Description: "Manage your account information"
   - "Back to Home" button

2. **Left Profile Card**
   - Large avatar (24x24)
   - User full name
   - User type badge (Customer/Photographer/Admin)
   - Verification badge (if verified)
   - Email address
   - Phone number
   - Location

3. **Right Profile Form**
   
   **Personal Information Section**:
   - Full Name (editable)
   - Email Address (read-only)
   - Phone Number (editable)
   - Location (editable)
   - City (editable)
   - State (editable)
   - Bio (textarea, editable)
   
   **Account Information Section** (Read-only):
   - User ID
   - Account Type
   - Verification Status
   
   **Edit Mode**:
   - "Edit" button to enable editing
   - "Cancel" button to discard changes
   - "Save" button to save changes
   - Loading state during save
   - Success/Error alerts

4. **Authentication Check**
   - Redirects to login if not authenticated
   - Loads user data on mount

### Backend Connection
- **Service File**: `src/services/auth.service.ts`
- **API Endpoints**:
  - `GET /api/auth/me` - Get current user data
  - `PUT /api/auth/profile` - Update user profile
- **Update Request Data**:
  ```json
  {
    "fullName": "Updated Name",
    "phone": "+91 9876543210",
    "location": "Mumbai, Maharashtra",
    "city": "Mumbai",
    "state": "Maharashtra",
    "bio": "My bio text"
  }
  ```
- **Response Data**:
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "userId": 1,
        "email": "user@example.com",
        "fullName": "Updated Name",
        "phone": "+91 9876543210",
        "location": "Mumbai, Maharashtra",
        "city": "Mumbai",
        "state": "Maharashtra",
        "bio": "My bio text",
        "userType": "customer",
        "isVerified": true
      }
    }
  }
  ```

### Functionality Flow
1. Page loads and checks authentication
2. If not authenticated, redirects to `/login`
3. Fetches current user data from API or localStorage
4. Displays user information in read-only mode
5. User clicks "Edit" button:
   - All fields become editable (except email and account info)
   - "Cancel" and "Save" buttons appear
6. User makes changes and clicks "Save":
   - Form data validated
   - API call to update profile
   - Success message shown
   - Updated data stored in localStorage
   - Form returns to read-only mode
7. User clicks "Cancel":
   - All changes discarded
   - Form returns to original values
   - Returns to read-only mode
8. Shows loading state during API calls
9. Displays error messages if update fails

---

## 10. TEST CONNECTION PAGE (`/test`)

### Page Name
**Test Connection** - System Integration Testing

### Page Features
1. **Page Header**
   - Title: "Connection Test"
   - Description: "Testing frontend-backend integration"

2. **System Status Card**
   - "Retest" button to run all tests again
   - Five test sections:
     
     **Backend Server Test**:
     - Tests if backend is running
     - Shows server status message
     - Success/Error/Pending icon
     
     **Database Connection Test**:
     - Tests database connectivity
     - Shows connection status
     - Success/Error/Pending icon
     
     **Authentication Test**:
     - Checks if user is logged in
     - Shows logged in user name or "Not logged in"
     - Success/Warning/Pending icon
     
     **Photographers API Test**:
     - Tests photographer API endpoint
     - Shows number of photographers found
     - Success/Error/Pending icon
     
     **Posts API Test**:
     - Tests posts API endpoint
     - Shows number of posts found
     - Success/Error/Pending icon

3. **Navigation Buttons**
   - "Go to Login" button
   - "Go to Register" button
   - "Go to Home" button

4. **Connection Information**
   - Displays API Base URL
   - Displays Backend URL

### Backend Connection
- **Service Files**: 
  - `src/services/auth.service.ts`
  - `src/services/photographer.service.ts`
  - `src/services/post.service.ts`
- **API Endpoints Tested**:
  - `GET /health` - Backend health check
  - `GET /api/photographers` - Database connection via photographers list
  - `GET /api/posts` - Posts API
- **Config File**: `src/config/api.ts`

### Functionality Flow
1. Page loads and automatically runs all tests
2. Each test runs sequentially:
   - Backend health check
   - Database connection check
   - Authentication status check
   - Photographers API check
   - Posts API check
3. Each test shows:
   - Pending state (blue spinning loader)
   - Success state (green checkmark)
   - Error state (red X mark)
   - Warning state (yellow X mark)
4. Status messages displayed for each test
5. User can click "Retest" to run all tests again
6. Navigation buttons to go to different pages
7. Displays API URLs being used

---

## GLOBAL COMPONENTS

### Navigation Bar (NavbarIntegrated)
**Used on all main pages after login**

**Features**:
- Sticky header (stays at top when scrolling)
- ChitraSethu logo and brand
- Navigation menu items:
  - Home → `/home`
  - Explore → `/explore`
  - Event Photos → `/event-photos`
  - Mood Board → `/mood-board`
  - Requests → `/requests`
  - Community Buzz → `/community-buzz`
- Search bar (global search)
- Notification bell with indicator
- User profile dropdown:
  - User name and email
  - User type (Customer/Photographer)
  - Profile Settings
  - My Requests
  - My Bookings
  - Logout
- Responsive design (mobile menu on small screens)

**Backend Connection**:
- `GET /api/auth/me` - Fetch current user
- `POST /api/auth/logout` - Logout user

---

## AUTHENTICATION & DATA FLOW

### Authentication Service (`auth.service.ts`)

**Functions**:
1. `register(data)` - Register new user
2. `login(data)` - Login user
3. `logout()` - Logout user
4. `getCurrentUser()` - Fetch current user from API
5. `isAuthenticated()` - Check if token exists
6. `getStoredUser()` - Get user from localStorage
7. `getToken()` - Get JWT token
8. `updateProfile(data)` - Update user profile

**Data Storage**:
- JWT Token → `localStorage.setItem('token', token)`
- User Data → `localStorage.setItem('user', JSON.stringify(user))`

**Authentication Flow**:
1. User logs in or registers
2. Backend returns JWT token and user data
3. Token and user stored in localStorage
4. Token sent in Authorization header for all API requests
5. Pages check `isAuthenticated()` before loading
6. If not authenticated, redirect to `/login`

---

## PHOTOGRAPHER SERVICE (`photographer.service.ts`)

**Functions**:
1. `getAll(filters)` - Get all photographers with optional filters
2. `getById(id)` - Get photographer details by ID

**Filters Available**:
- `category` - Filter by specialty
- `city` - Filter by location
- `minRating` - Minimum rating
- `maxPrice` - Maximum price
- `search` - Search keyword

---

## POST SERVICE (`post.service.ts`)

**Functions**:
1. `getAll(limit, offset)` - Get all posts with pagination

---

## DATA STRUCTURES

### User Object
```json
{
  "userId": 1,
  "email": "user@example.com",
  "fullName": "User Name",
  "userType": "customer | photographer | admin",
  "isVerified": true,
  "avatarUrl": "url",
  "phone": "+91 9876543210",
  "location": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra",
  "bio": "Bio text"
}
```

### Photographer Object
```json
{
  "photographerId": 1,
  "userId": 5,
  "fullName": "Photographer Name",
  "businessName": "Studio Name",
  "avatarUrl": "url",
  "location": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra",
  "specialties": ["Wedding", "Portrait"],
  "experienceYears": 5,
  "basePrice": 25000,
  "rating": 4.8,
  "totalReviews": 156,
  "isVerified": true,
  "isPremium": false,
  "bio": "About photographer",
  "phone": "+91 9876543210",
  "totalBookings": 50,
  "equipment": ["Canon 5D", "Sony A7"],
  "languages": ["English", "Hindi"],
  "portfolio": [
    {
      "portfolioId": 1,
      "imageUrl": "url",
      "title": "Title",
      "category": "Wedding",
      "likesCount": 45
    }
  ]
}
```

### Post Object
```json
{
  "postId": 1,
  "userId": 5,
  "fullName": "User Name",
  "avatarUrl": "url",
  "userType": "photographer",
  "contentType": "image | video",
  "caption": "Post caption",
  "mediaUrls": ["url1", "url2"],
  "location": "Mumbai",
  "tags": ["#wedding", "#portrait"],
  "likesCount": 124,
  "commentsCount": 23,
  "sharesCount": 12,
  "viewsCount": 456,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## ROUTING STRUCTURE

```
/ → LoginPageIntegrated
/login → LoginPageIntegrated
/register → RegisterPageIntegrated
/test → TestConnection
/profile → ProfileSettings (Protected)
/home → Home (Protected)
/explore → Explore (Protected)
/event-photos → EventPhotos (Protected)
/mood-board → MoodBoard (Protected)
/requests → Requests (Protected)
/community-buzz → CommunityBuzz (Protected)
* → NotFound (404 page)
```

**Protected Routes**: Require authentication, redirect to `/login` if not logged in

---

## CURRENT LIMITATIONS & FUTURE FEATURES

### Currently Implemented (Normal User Login)
✅ User Registration (Customer & Photographer types)
✅ User Login/Logout
✅ Profile Settings Management
✅ Home Page with Social Feed
✅ Explore Photographers
✅ Event Photos Browse
✅ Mood Board Gallery
✅ Photography Requests (Browse & Post)
✅ Community Buzz (Feed & Discussions)
✅ Backend Integration Testing

### NOT YET IMPLEMENTED
❌ Photographer-specific dashboard and features
❌ Photographer portfolio management
❌ Booking system functionality
❌ Payment integration
❌ Real-time messaging between users and photographers
❌ Advanced search with AI recommendations
❌ Review and rating system (backend ready, UI pending)
❌ Photo upload and gallery management for users
❌ Event creation and management
❌ Notification system (UI exists, backend pending)
❌ Email verification system
❌ Password reset functionality
❌ Social media login (Google, Facebook)
❌ Mobile app version

### Partially Implemented (UI Exists, Backend Pending)
⚠️ Event booking from Event Photos page
⚠️ Submitting proposals for requests
⚠️ Adding comments on posts
⚠️ Following photographers
⚠️ Saving to mood boards
⚠️ Downloading images
⚠️ Sharing content

---

## API CONFIGURATION

**Base URL**: `http://localhost:5000/api` (default)
**Environment Variable**: `VITE_API_URL`

**API Endpoints**:
```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile

Photographers:
GET    /api/photographers
GET    /api/photographers/:id

Posts:
GET    /api/posts
GET    /api/posts/:id

Events:
GET    /api/events
GET    /api/events/:id

Bookings:
GET    /api/bookings
GET    /api/bookings/:id
```

---

## UI/UX FEATURES

### Design System
- **Primary Color**: Custom gradient (primary to primary-glow)
- **Font**: Playfair Display (headings), System fonts (body)
- **Dark Mode**: Yes (implemented with Tailwind)
- **Glass Effect**: Frosted glass design on cards
- **Animations**: 
  - Ken Burns effect (login/register)
  - Floating particles
  - Gradient shifts
  - Hover effects
  - Smooth transitions

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Mobile menu for navigation
- Adaptive layouts for all pages
- Touch-friendly buttons and interactions

### Interactive Elements
- Like/Unlike with animation
- Save/Bookmark with state
- Search with real-time filtering
- View mode toggles (Grid/List)
- Dropdown menus
- Modal dialogs
- Toast notifications
- Loading states
- Error handling with alerts

---

## SUMMARY

**Total Pages**: 10 main pages
**Protected Pages**: 7 pages (require login)
**Public Pages**: 3 pages (login, register, test)
**Backend Services**: 3 services (auth, photographer, post)
**API Endpoints Used**: 8+ endpoints
**UI Components**: 40+ reusable components

**User Types Supported**:
1. **Customer** - Can browse photographers, post requests, save inspirations
2. **Photographer** - Can register as photographer (dashboard features pending)
3. **Admin** - User type exists (admin panel not implemented)

**Current Status**: 
- Normal user (Customer) interface fully functional
- Photographer dashboard and features NOT YET IMPLEMENTED
- All UI pages created and functional
- Backend integration completed for core features
- Ready for photographer-specific feature development

---

# PHOTOGRAPHER DASHBOARD & FEATURES

## Overview
When a photographer logs into the system, they get access to a specialized dashboard with photographer-specific features and tools to manage their business, bookings, portfolio, and client interactions.

---

## PHOTOGRAPHER NAVIGATION BAR

### Main Navigation Items
1. **Home** - Photographer feed and dashboard
2. **Requests** - Customer booking requests
3. **Community Buzz** - Event discussions and networking
4. **Jobs** - Post and browse job opportunities
5. **Bookings** - Manage all bookings (past, current, upcoming)
6. **Photo Booth** - QR code generation for photo sharing
7. **Maps** - Location-based photographer and event discovery
8. **Messages** (Top Right) - Chat with customers and collaborators
9. **Profile** (Top Right) - Profile dropdown with settings

---

## 1. PHOTOGRAPHER HOME PAGE (`/photographer/home`)

### Page Layout

#### Left Sidebar Navigation
1. **My Profile**
   - Edit Profile
   - View as Public
   - Preview Profile
   
2. **Event Photos**
   - Create Photo Session
   - My Events (Current, Past, Upcoming)
   - Public Events
   
3. **Mood Boards**
   - My Mood Boards
   - Editor/Create New
   - Public View
   
4. **Community**
   - My Groups
   - Create Group
   - Share Work
   - Find Collaborations

#### Center Feed
- Instagram-style photography feed
- Posts from other photographers
- Customer photos and tags
- Photography inspiration and trends
- Like, comment, share functionality
- Photo engagement metrics

#### Right Sidebar
- **Upcoming Events** - Next scheduled bookings
- **New Requests** - Recent customer requests
- **Quick Stats**:
  - Total bookings this month
  - Revenue this month
  - Pending requests
  - Active conversations

### Features
- View photography feed from community
- See customer photos featuring photographer's work
- Track engagement on portfolio pieces
- Quick access to pending requests
- Dashboard overview of business metrics

---

## 2. PHOTOGRAPHER REQUESTS PAGE (`/photographer/requests`)

### Page Name
**Booking Requests Management** - Customer Request Hub

### Page Features

#### Request Cards Display
Each request shows:
- **Customer Information**:
  - Customer name and avatar
  - Contact information
  - Customer location
  
- **Booking Details**:
  - Event type (Wedding, Portrait, Fashion, etc.)
  - Event date and time
  - Event location
  - Duration required
  - Budget range
  - Special requirements
  - Number of guests/subjects
  
- **Request Metadata**:
  - Request received time
  - Urgency level (High, Medium, Low)
  - Status (Pending, Accepted, Declined)
  
#### Action Buttons
- **Accept Request** - Confirm booking
- **Decline Request** - Reject booking with reason
- **Request More Info** - Ask customer for additional details
- **View Customer Profile** - See customer history

#### Filters
- Filter by status (Pending, Accepted, Declined)
- Filter by event type
- Filter by date range
- Filter by budget range
- Sort by urgency, date, or budget

### Backend Connection
- **API Endpoint**: `GET /api/photographer/requests`
- **API Endpoint**: `PUT /api/photographer/requests/:id/accept`
- **API Endpoint**: `PUT /api/photographer/requests/:id/decline`

### Functionality Flow
1. Page loads all customer booking requests
2. Photographer reviews request details
3. Can accept request → Creates confirmed booking
4. Can decline request → Notifies customer
5. Can request more information → Opens message thread
6. Real-time updates when new requests arrive

---

## 3. PHOTOGRAPHER COMMUNITY BUZZ PAGE (`/photographer/community-buzz`)

### Page Name
**Community & Events Discussion Hub**

### Page Features

#### Event-Based Chat Rooms
- **Live Events** - Currently happening events
- **Upcoming Events** - Future events (e.g., AR Rahman Concert)
- **Completed Events** - Past events archive

#### Chat Features
- Event-specific chat rooms
- Real-time messaging
- Share photos from event
- Discuss techniques and tips
- Network with other photographers
- Event coordinator announcements
- Location and timing updates

#### Event Card Display
Each event shows:
- Event name and category
- Event date, time, location
- Number of photographers attending
- Chat participant count
- Join chat button
- Event details button

#### Community Features
- Photography tips and tricks discussion
- Equipment recommendations
- Post-processing techniques
- Business advice sharing
- Client management discussions

### Backend Connection
- **API Endpoint**: `GET /api/community/events`
- **API Endpoint**: `GET /api/community/events/:id/messages`
- **API Endpoint**: `POST /api/community/events/:id/messages`
- **WebSocket**: Real-time chat functionality

---

## 4. PHOTOGRAPHER JOBS PAGE (`/photographer/jobs`)

### Page Name
**Jobs & Collaboration Marketplace**

### Page Features

#### Two Main Tabs

##### **POST REQUEST Tab**
- **Job Posting Form**:
  - Job title (e.g., "Need Video Editor")
  - Job description
  - Required skills and experience
  - Job category (Video Editor, Photography Assistant, Drone Operator, etc.)
  - Budget range
  - Payment terms
  - Duration/Timeline
  - Urgency level (Urgent, Moderate, Flexible)
  - Location (On-site, Remote, Hybrid)
  - Equipment requirements
  - "Post Request" button
  - "Save as Draft" button

##### **BROWSE JOBS Tab**
- List of available job postings
- Each job shows:
  - Job title
  - Posted by (photographer/business name)
  - Job description
  - Required skills
  - Budget range
  - Location
  - Urgency badge
  - Application count
  - Posted date
  - "Apply" button
  - "View Details" button

#### Job Categories
- Video Editor
- Photography Assistant
- Drone Operator
- Photo Retoucher
- Second Shooter
- Lighting Assistant
- Makeup Artist
- Stylist
- Equipment Rental

#### Filters
- Filter by category
- Filter by budget range
- Filter by location
- Filter by urgency
- Sort by date, budget, or relevance

### Backend Connection
- **API Endpoint**: `GET /api/photographer/jobs`
- **API Endpoint**: `POST /api/photographer/jobs`
- **API Endpoint**: `POST /api/photographer/jobs/:id/apply`
- **API Endpoint**: `GET /api/photographer/jobs/my-posts`

### Functionality Flow
1. **Posting a Job**:
   - Photographer fills job posting form
   - Sets budget and urgency
   - Posts job to marketplace
   - Receives applications from interested professionals
   
2. **Browsing Jobs**:
   - View available job opportunities
   - Filter by category and requirements
   - Apply to jobs that match skills
   - Track application status

---

## 5. PHOTOGRAPHER BOOKINGS PAGE (`/photographer/bookings`)

### Page Name
**Bookings Management Dashboard**

### Page Features

#### Three Main Tabs

##### **CURRENT BOOKINGS**
- Active/ongoing bookings
- Today's shoots
- This week's schedule
- Each booking shows:
  - Customer name and contact
  - Event type and details
  - Date, time, location
  - Duration
  - Payment status
  - Checklist/preparation status
  - "Start Shoot" button
  - "View Details" button
  - "Contact Customer" button

##### **UPCOMING BOOKINGS**
- Future scheduled bookings
- Calendar view option
- List view option
- Each booking shows:
  - Countdown to event
  - Customer information
  - Event details
  - Preparation checklist
  - Equipment needed
  - "Prepare" button
  - "Reschedule" button
  - "Cancel" button (with policy)

##### **PAST BOOKINGS**
- Completed bookings history
- Each booking shows:
  - Completion date
  - Customer name
  - Event type
  - Payment received status
  - Photos delivered status
  - Customer rating (if provided)
  - Revenue generated
  - "View Gallery" button
  - "Request Review" button

#### Booking Details
- Customer profile and contact
- Event information (type, date, venue)
- Package selected and pricing
- Payment schedule and status
- Deliverables checklist
- Photo delivery status
- Communication history
- Contract/agreement

#### Calendar Integration
- Monthly calendar view
- Day view with time slots
- Color-coded by event type
- Drag and drop rescheduling
- Availability blocking

### Backend Connection
- **API Endpoint**: `GET /api/photographer/bookings?status=current`
- **API Endpoint**: `GET /api/photographer/bookings?status=upcoming`
- **API Endpoint**: `GET /api/photographer/bookings?status=past`
- **API Endpoint**: `PUT /api/photographer/bookings/:id/status`

---

## 6. PHOTOGRAPHER PHOTO BOOTH PAGE (`/photographer/photo-booth`)

### Page Name
**Photo Booth & QR Code Gallery Sharing**

### Page Features

#### QR Code Generation
- **Create Photo Gallery QR**:
  - Select event/booking
  - Choose photos to include
  - Generate unique QR code
  - Downloadable QR code image
  - Printable QR code
  - Shareable QR code link

#### QR Code Management
- List of generated QR codes
- Each QR code shows:
  - Event name
  - Creation date
  - Number of photos
  - Access count/views
  - Expiry date (optional)
  - "View Gallery" button
  - "Edit" button
  - "Delete" button
  - "Download QR" button

#### Gallery Settings
- **Privacy Settings**:
  - Public (anyone with QR can view)
  - Password protected
  - Expiry date
  - Download enabled/disabled
  - Watermark option
  
- **Gallery Customization**:
  - Gallery title
  - Cover photo
  - Photo order
  - Gallery description
  - Branding/logo overlay

#### Usage Statistics
- Total scans
- Unique visitors
- Download count
- Popular photos
- Access timeline

### Backend Connection
- **API Endpoint**: `POST /api/photographer/photo-booth/generate`
- **API Endpoint**: `GET /api/photographer/photo-booth/galleries`
- **API Endpoint**: `GET /api/photo-booth/:qrId` (public access)

### Functionality Flow
1. Photographer selects photos from completed event
2. Generates unique QR code
3. Prints QR code or displays at venue
4. Customers scan QR code
5. Customers view and download photos
6. Photographer tracks engagement

---

## 7. PHOTOGRAPHER MAPS PAGE (`/photographer/maps`)

### Page Name
**Location-Based Discovery & Events Map**

### Page Features

#### Two View Modes

##### **PHOTOGRAPHERS VIEW**
- Map showing nearby photographers
- Snapchat-style interactive map
- Each photographer marker shows:
  - Profile photo
  - Name
  - Specialization
  - Rating
  - Distance from you
  - "View Profile" button
  
- **Map Features**:
  - Search by location
  - Filter by specialty
  - Filter by availability
  - Filter by rating
  - Radius slider
  - Cluster view for dense areas

##### **EVENTS VIEW**
- Map showing nearby events
- Each event marker shows:
  - Event name
  - Event type icon
  - Date and time
  - Distance from you
  - Number of attendees
  - "View Event" button
  
- **Map Features**:
  - Filter by event type
  - Filter by date range
  - Filter by size
  - Search by location
  - Travel time estimation

#### Map Interactions
- Click marker to see details
- Get directions to location
- Save favorite locations
- Share location with customers
- Real-time location updates

#### List View Toggle
- Switch between map and list view
- List shows same information in card format
- Sort by distance, rating, or date

### Backend Connection
- **API Endpoint**: `GET /api/maps/photographers?lat=&lng=&radius=`
- **API Endpoint**: `GET /api/maps/events?lat=&lng=&radius=`
- **Geolocation API**: Browser geolocation

---

## 8. PHOTOGRAPHER MESSAGES PAGE (`/photographer/messages`)

### Page Name
**Messages & Client Communication**

### Page Features

#### Message Interface
- **Left Panel**: Conversation list
  - Customer/contact name and avatar
  - Last message preview
  - Timestamp
  - Unread count badge
  - Online/offline status
  - Pinned conversations
  
- **Center Panel**: Active conversation
  - Message history
  - Real-time typing indicator
  - Message timestamps
  - Read receipts
  - Message search
  
- **Right Panel**: Contact information
  - Contact profile
  - Booking information
  - Quick actions (Call, Video Call)
  - Shared files
  - Booking timeline

#### Message Features
- **Text Messages**: Regular chat
- **File Sharing** (Photographer Only):
  - Send photos (JPEG, PNG, RAW)
  - Send videos (MP4, MOV)
  - Send documents (PDF, DOC)
  - Multiple file selection
  - Drag and drop upload
  - File size limit display
  
- **Rich Features**:
  - Voice messages
  - Photo preview in chat
  - Video preview in chat
  - Location sharing
  - Booking quick replies
  - Template messages

#### Message Management
- Archive conversations
- Delete conversations
- Mark as unread
- Pin important chats
- Search messages
- Filter by customer/type

#### Notification Settings
- Push notifications
- Email notifications
- Sound alerts
- Desktop notifications

### Backend Connection
- **API Endpoint**: `GET /api/messages/conversations`
- **API Endpoint**: `GET /api/messages/:conversationId`
- **API Endpoint**: `POST /api/messages/:conversationId/send`
- **API Endpoint**: `POST /api/messages/:conversationId/upload`
- **WebSocket**: Real-time messaging

### Functionality Flow
1. Photographer receives message from customer
2. Notification appears in navbar
3. Open messages page
4. Select conversation
5. View message history
6. Can send text messages
7. Can upload and share photos/videos
8. Real-time delivery and read receipts
9. File upload with progress indicator

---

## 9. PHOTOGRAPHER PROFILE EDIT PAGE (`/photographer/profile/edit`)

### Page Name
**Profile Management & Public Profile Editor**

### Page Features

#### Header Actions
- **Preview Profile** - See how profile looks to public
- **View as Public** - Switch to customer view
- **Save Changes** - Save all modifications
- **Cancel** - Discard changes

#### Profile Edit Sections

##### **1. BASIC INFORMATION**
- **Personal Details**:
  - Full Name
  - Studio/Company Name
  - Profile Photo Upload
  - Cover Photo Upload
  - Location (City, State, Country)
  - Bio/About Me (rich text editor)
  
##### **2. PROFESSIONAL DETAILS**
- **Specializations** (Multi-select):
  - Wedding Photography
  - Fashion Photography
  - Portrait Photography
  - Event Photography
  - Corporate Photography
  - Product Photography
  - Wildlife Photography
  - Sports Photography
  - Food Photography
  - Architecture Photography
  
- **Experience**:
  - Years of experience
  - Certifications
  - Awards and recognition
  - Professional associations
  
##### **3. PORTFOLIO MANAGEMENT**
- **Photo Gallery**:
  - Upload photos (drag & drop)
  - Organize into categories
  - Set cover photo
  - Add photo titles and descriptions
  - Tag photos by event type
  - Bulk upload capability
  - Photo ordering
  
- **Video Portfolio**:
  - Upload video samples
  - YouTube/Vimeo links
  - Video thumbnails
  - Video descriptions

##### **4. SERVICES & PRICING**
- **Service Packages**:
  - Package name (e.g., "Wedding Premium")
  - Duration (hours)
  - Price
  - Inclusions (list)
  - Add/Edit/Delete packages
  
- **Service Types**:
  - Wedding Photography (₹40,000 - 8 hours)
  - Pre-Wedding Shoot (₹25,000 - 4 hours)
  - Birthday Event (₹15,000 - 3 hours)
  - Corporate Event (₹30,000 - 6 hours)
  - Portrait Session (₹10,000 - 2 hours)
  - Fashion Shoot (₹35,000 - 5 hours)
  
- **Pricing Customization**:
  - Base rate per hour
  - Package discounts
  - Additional charges (travel, equipment)
  - Payment terms

##### **5. CONTACT & SOCIAL**
- **Contact Information**:
  - Phone number (primary)
  - Phone number (secondary)
  - Email address (primary)
  - Email address (business)
  - WhatsApp number
  
- **Social Media Links**:
  - Instagram profile
  - Facebook page
  - YouTube channel
  - Twitter/X handle
  - LinkedIn profile
  - Personal website
  - Blog link

##### **6. AVAILABILITY & TRAVEL**
- **Calendar Management**:
  - Interactive calendar
  - Mark unavailable dates
  - Set available time slots
  - Recurring unavailability (every Tuesday)
  - Holiday blocking
  - Advance booking limit
  
- **Travel Preferences**:
  - Willing to travel (Yes/No)
  - Maximum travel distance
  - Travel charges
  - Preferred locations
  - Travel availability calendar

#### Additional Settings
- **Booking Settings**:
  - Instant booking (Yes/No)
  - Require approval for bookings
  - Advance booking period
  - Cancellation policy
  - Deposit requirements
  
- **Profile Visibility**:
  - Public profile (searchable)
  - Private profile (invite only)
  - Hide pricing (request quote)
  - Show/hide contact info

### Backend Connection
- **API Endpoint**: `GET /api/photographer/profile`
- **API Endpoint**: `PUT /api/photographer/profile`
- **API Endpoint**: `POST /api/photographer/portfolio/upload`
- **API Endpoint**: `PUT /api/photographer/availability`

### Functionality Flow
1. Photographer navigates to profile edit
2. Loads current profile data
3. Edits sections as needed
4. Uploads portfolio photos/videos
5. Sets service packages and pricing
6. Updates availability calendar
7. Clicks "Preview Profile" to see public view
8. Saves changes
9. Profile updated and visible to customers

---

## 10. PHOTOGRAPHER EVENT PHOTOS PAGE (`/photographer/event-photos`)

### Page Name
**Event Photo Management & Session Creation**

### Page Features

#### Main Actions
- **Create Photo Session** Button
  - Opens modal/page to create new event album
  
#### Create Photo Session Modal
- **Session Details**:
  - Event name
  - Event type (Wedding, Fashion, Corporate, etc.)
  - Event date
  - Location
  - Customer name
  - Folder/Album name
  - Privacy settings (Public/Private)
  - Cover photo selection
  - Description
  
- **Upload Photos**:
  - Drag and drop multiple photos
  - Bulk upload capability
  - Photo preview before upload
  - Progress indicator
  - Auto-organize by date/time

#### My Events Tabs

##### **CURRENT EVENTS**
- Events in progress or recently completed
- Each event card shows:
  - Event cover photo
  - Event name and type
  - Date
  - Photo count
  - Upload status
  - "Upload More" button
  - "View Gallery" button
  - "Share" button

##### **PAST EVENTS**
- Completed and archived events
- Each event card shows:
  - Event cover photo
  - Event name
  - Completion date
  - Total photos
  - Download count
  - View count
  - "View Gallery" button
  - "Archive" button

##### **UPCOMING EVENTS**
- Scheduled future events
- Each event card shows:
  - Event name
  - Scheduled date
  - Customer name
  - Event type
  - "Prepare" button
  - "View Details" button

##### **PUBLIC EVENTS Tab**
- View events visible to customers
- Same events customer can see
- Customer perspective view

#### Event Gallery Management
- View all photos in event
- Select multiple photos
- Delete photos
- Move photos to different event
- Download photos
- Share event link
- Generate QR code for event
- Set featured photos
- Add captions to photos
- Tag people in photos

### Backend Connection
- **API Endpoint**: `GET /api/photographer/events`
- **API Endpoint**: `POST /api/photographer/events`
- **API Endpoint**: `POST /api/photographer/events/:id/photos`
- **API Endpoint**: `GET /api/photographer/events/:id/photos`

---

## 11. PHOTOGRAPHER MOOD BOARDS PAGE (`/photographer/mood-boards`)

### Page Name
**Mood Board Creation & Management**

### Page Features

#### Two View Modes

##### **PUBLIC VIEW**
- See what customers see
- Public mood boards
- Popular inspiration boards
- Trending photography styles

##### **MY MOOD BOARDS / EDITOR**
- **Create New Mood Board**:
  - Board name (e.g., "Wedding Inspiration 2024")
  - Board category (Wedding, Festival, Fashion, Portrait)
  - Board description
  - Privacy settings (Public/Private)
  - Cover image selection
  
- **Mood Board Editor** (Pinterest-style):
  - Drag and drop images
  - Add images from URL
  - Upload images from device
  - Organize in grid/masonry layout
  - Add titles and descriptions
  - Tag with keywords
  - Color palette extraction
  - Rearrange images
  
- **My Mood Boards List**:
  - All created mood boards
  - Each board shows:
    - Cover image
    - Board name
    - Image count
    - Creation date
    - Privacy status
    - "Edit" button
    - "Share" button
    - "Delete" button

#### Board Categories
- Wedding Mood Boards
- Festival/Event Boards
- Fashion Photography Boards
- Portrait Inspiration
- Color Palettes
- Lighting Setups
- Composition Ideas
- Post-Processing Styles

#### Sharing Features
- Share board link
- Embed board on website
- Collaborate with other photographers
- Client access (share with customers)

### Backend Connection
- **API Endpoint**: `GET /api/photographer/moodboards`
- **API Endpoint**: `POST /api/photographer/moodboards`
- **API Endpoint**: `POST /api/photographer/moodboards/:id/images`
- **API Endpoint**: `PUT /api/photographer/moodboards/:id`

---

## 12. PHOTOGRAPHER COMMUNITY PAGE (`/photographer/community`)

### Page Name
**Community Groups & Collaboration Hub**

### Page Features

#### Four Main Sections

##### **1. MY GROUPS**
- List of groups photographer is part of
- Each group shows:
  - Group icon/photo
  - Group name
  - Member count
  - Unread message count
  - Last activity time
  - "Open" button

##### **2. CREATE GROUP**
- **Group Creation Form**:
  - Group name
  - Group type:
    - Project Group (specific project/wedding)
    - Professional Network
    - Equipment Sharing
    - Learning/Mentorship
    - Regional/Location-based
  - Group description
  - Privacy (Public/Private/Invite-only)
  - Add members (search and select)
  - Group icon upload
  - "Create Group" button

##### **3. SHARE WORK COMMUNITY**
- Collaboration marketplace
- Find other professionals to work with
- **Post Collaboration Request**:
  - What you need (Video Editor, Second Shooter, etc.)
  - Project details
  - Budget
  - Timeline
  - Location
  - Required skills
  
- **Browse Collaboration Offers**:
  - Professionals offering services
  - Skills and portfolio
  - Availability
  - Rates
  - "Connect" button

##### **4. FIND COLLABORATIONS**
- Discover collaboration opportunities
- Match with complementary professionals
- Filter by:
  - Service type
  - Location
  - Budget range
  - Experience level
  - Rating
  
- **Collaboration Types**:
  - Photographer + Video Editor
  - Photographer + Drone Operator
  - Photographer + Retoucher
  - Photographer + Photographer (multi-angle)
  - Photographer + Makeup Artist
  - Photographer + Stylist

#### Group Features (WhatsApp-style)
- Group chat interface
- Share photos and videos in group
- File sharing
- Member management (add/remove)
- Admin controls
- Pin important messages
- Group settings
- Notifications control
- Media gallery view

### Backend Connection
- **API Endpoint**: `GET /api/photographer/community/groups`
- **API Endpoint**: `POST /api/photographer/community/groups`
- **API Endpoint**: `POST /api/photographer/community/collaborations`
- **API Endpoint**: `GET /api/photographer/community/collaborations`

---

## PHOTOGRAPHER DATA STRUCTURES

### Photographer Extended Profile
```json
{
  "photographerId": 1,
  "userId": 10,
  "fullName": "John Photographer",
  "businessName": "John's Photography Studio",
  "avatarUrl": "url",
  "coverPhotoUrl": "url",
  "location": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra",
  "bio": "Professional wedding and event photographer",
  "specialties": ["Wedding", "Portrait", "Event"],
  "experienceYears": 8,
  "certifications": ["Professional Photographer Certification"],
  "awards": ["Best Wedding Photographer 2023"],
  "rating": 4.9,
  "totalReviews": 234,
  "totalBookings": 456,
  "isVerified": true,
  "isPremium": true,
  "phone": "+91 9876543210",
  "email": "john@photography.com",
  "socialMedia": {
    "instagram": "@johnphotography",
    "facebook": "johnphotography",
    "website": "www.johnphotography.com"
  },
  "services": [
    {
      "serviceName": "Wedding Photography",
      "duration": 8,
      "price": 40000,
      "inclusions": ["Full day coverage", "Album", "500+ edited photos"]
    }
  ],
  "availability": {
    "instantBooking": false,
    "unavailableDates": ["2024-02-14", "2024-02-15"],
    "recurringUnavailable": ["Tuesday"]
  },
  "travelPreferences": {
    "willingToTravel": true,
    "maxDistance": 200,
    "travelCharges": 5000
  }
}
```

### Booking Request Object
```json
{
  "requestId": 1,
  "customerId": 5,
  "customerName": "Customer Name",
  "customerAvatar": "url",
  "customerPhone": "+91 9876543210",
  "eventType": "Wedding",
  "eventDate": "2024-03-15",
  "eventTime": "10:00 AM",
  "eventLocation": "Mumbai, Maharashtra",
  "duration": 8,
  "budgetRange": "₹40,000 - ₹50,000",
  "guestCount": 200,
  "requirements": "Traditional ceremony, candid shots, album required",
  "urgency": "High",
  "status": "Pending",
  "requestedAt": "2024-02-01T10:30:00Z"
}
```

### Job Posting Object
```json
{
  "jobId": 1,
  "postedBy": "John Photographer",
  "photographerId": 10,
  "jobTitle": "Need Video Editor for Wedding",
  "jobDescription": "Looking for experienced video editor...",
  "category": "Video Editor",
  "budget": "₹15,000 - ₹20,000",
  "duration": "5 days",
  "urgency": "Urgent",
  "location": "Remote",
  "requiredSkills": ["Premiere Pro", "Color Grading"],
  "status": "Open",
  "applicationCount": 12,
  "postedAt": "2024-02-05T09:00:00Z"
}
```

### Photo Booth Gallery Object
```json
{
  "galleryId": 1,
  "photographerId": 10,
  "eventName": "Smith Wedding",
  "bookingId": 45,
  "qrCode": "unique-qr-code-string",
  "qrCodeUrl": "url-to-qr-image",
  "photoCount": 150,
  "galleryUrl": "https://app.com/gallery/unique-code",
  "privacy": "public",
  "expiryDate": "2024-12-31",
  "downloadEnabled": true,
  "watermark": true,
  "accessCount": 245,
  "downloadCount": 89,
  "createdAt": "2024-02-10T14:00:00Z"
}
```

---

## DATABASE TABLES NEEDED

### 1. photographer_bookings
```sql
CREATE TABLE photographer_bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  photographer_id INT NOT NULL,
  customer_id INT NOT NULL,
  event_type VARCHAR(50),
  event_date DATE,
  event_time TIME,
  event_location VARCHAR(255),
  duration INT,
  budget_range VARCHAR(50),
  guest_count INT,
  requirements TEXT,
  status ENUM('pending', 'accepted', 'declined', 'completed', 'cancelled'),
  urgency ENUM('high', 'medium', 'low'),
  payment_status ENUM('unpaid', 'partial', 'paid'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id),
  FOREIGN KEY (customer_id) REFERENCES users(user_id)
);
```

### 2. photographer_jobs
```sql
CREATE TABLE photographer_jobs (
  job_id INT PRIMARY KEY AUTO_INCREMENT,
  photographer_id INT NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_description TEXT,
  category VARCHAR(100),
  budget_min INT,
  budget_max INT,
  duration VARCHAR(50),
  urgency ENUM('urgent', 'moderate', 'flexible'),
  location VARCHAR(255),
  required_skills JSON,
  status ENUM('open', 'closed', 'filled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id)
);
```

### 3. photographer_services
```sql
CREATE TABLE photographer_services (
  service_id INT PRIMARY KEY AUTO_INCREMENT,
  photographer_id INT NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  duration INT,
  price DECIMAL(10, 2),
  inclusions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id)
);
```

### 4. photographer_availability
```sql
CREATE TABLE photographer_availability (
  availability_id INT PRIMARY KEY AUTO_INCREMENT,
  photographer_id INT NOT NULL,
  unavailable_date DATE,
  recurring_day VARCHAR(20),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id)
);
```

### 5. photo_booth_galleries
```sql
CREATE TABLE photo_booth_galleries (
  gallery_id INT PRIMARY KEY AUTO_INCREMENT,
  photographer_id INT NOT NULL,
  booking_id INT,
  event_name VARCHAR(255),
  qr_code VARCHAR(255) UNIQUE,
  gallery_url VARCHAR(500),
  privacy ENUM('public', 'private', 'password'),
  password VARCHAR(255),
  expiry_date DATE,
  download_enabled BOOLEAN DEFAULT TRUE,
  watermark BOOLEAN DEFAULT FALSE,
  access_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id),
  FOREIGN KEY (booking_id) REFERENCES photographer_bookings(booking_id)
);
```

### 6. community_groups
```sql
CREATE TABLE community_groups (
  group_id INT PRIMARY KEY AUTO_INCREMENT,
  group_name VARCHAR(255) NOT NULL,
  group_type ENUM('project', 'network', 'equipment', 'learning', 'regional'),
  description TEXT,
  created_by INT NOT NULL,
  privacy ENUM('public', 'private', 'invite'),
  group_icon VARCHAR(500),
  member_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

### 7. community_group_members
```sql
CREATE TABLE community_group_members (
  member_id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin', 'member'),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES community_groups(group_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 8. messages
```sql
CREATE TABLE messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT,
  message_type ENUM('text', 'image', 'video', 'file'),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id)
);
```

### 9. conversations
```sql
CREATE TABLE conversations (
  conversation_id INT PRIMARY KEY AUTO_INCREMENT,
  participant1_id INT NOT NULL,
  participant2_id INT NOT NULL,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant1_id) REFERENCES users(user_id),
  FOREIGN KEY (participant2_id) REFERENCES users(user_id)
);
```

### 10. event_chat_rooms
```sql
CREATE TABLE event_chat_rooms (
  room_id INT PRIMARY KEY AUTO_INCREMENT,
  event_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  event_date DATE,
  event_location VARCHAR(255),
  event_status ENUM('live', 'upcoming', 'completed'),
  participant_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API ENDPOINTS FOR PHOTOGRAPHER

### Booking Requests
```
GET    /api/photographer/requests
GET    /api/photographer/requests/:id
PUT    /api/photographer/requests/:id/accept
PUT    /api/photographer/requests/:id/decline
POST   /api/photographer/requests/:id/request-info
```

### Jobs
```
GET    /api/photographer/jobs
POST   /api/photographer/jobs
GET    /api/photographer/jobs/:id
POST   /api/photographer/jobs/:id/apply
GET    /api/photographer/jobs/my-posts
DELETE /api/photographer/jobs/:id
```

### Bookings
```
GET    /api/photographer/bookings?status=current
GET    /api/photographer/bookings?status=upcoming
GET    /api/photographer/bookings?status=past
GET    /api/photographer/bookings/:id
PUT    /api/photographer/bookings/:id/status
```

### Photo Booth
```
GET    /api/photographer/photo-booth/galleries
POST   /api/photographer/photo-booth/generate
GET    /api/photographer/photo-booth/:galleryId
DELETE /api/photographer/photo-booth/:galleryId
PUT    /api/photographer/photo-booth/:galleryId
GET    /api/photo-booth/:qrCode (public access)
```

### Profile
```
GET    /api/photographer/profile
PUT    /api/photographer/profile
POST   /api/photographer/portfolio/upload
DELETE /api/photographer/portfolio/:photoId
PUT    /api/photographer/availability
POST   /api/photographer/services
PUT    /api/photographer/services/:id
DELETE /api/photographer/services/:id
```

### Events
```
GET    /api/photographer/events
POST   /api/photographer/events
POST   /api/photographer/events/:id/photos
GET    /api/photographer/events/:id/photos
DELETE /api/photographer/events/:id/photos/:photoId
```

### Community
```
GET    /api/photographer/community/groups
POST   /api/photographer/community/groups
GET    /api/photographer/community/groups/:id
POST   /api/photographer/community/groups/:id/messages
GET    /api/photographer/community/collaborations
POST   /api/photographer/community/collaborations
```

### Messages
```
GET    /api/messages/conversations
GET    /api/messages/:conversationId
POST   /api/messages/:conversationId/send
POST   /api/messages/:conversationId/upload
PUT    /api/messages/:messageId/read
```

### Maps
```
GET    /api/maps/photographers?lat=&lng=&radius=
GET    /api/maps/events?lat=&lng=&radius=
```

---

## PHOTOGRAPHER ROUTING STRUCTURE

```
/photographer/home → Photographer Home (Feed)
/photographer/requests → Booking Requests Management
/photographer/community-buzz → Event Chat Rooms
/photographer/jobs → Jobs Marketplace
/photographer/bookings → Bookings Dashboard
/photographer/photo-booth → QR Code Gallery Management
/photographer/maps → Location Discovery
/photographer/messages → Client Messaging
/photographer/profile/edit → Profile Editor
/photographer/event-photos → Event Gallery Management
/photographer/mood-boards → Mood Board Creator
/photographer/community → Groups & Collaboration
```

All routes are **protected** and require photographer authentication.

---

## UPDATED SUMMARY

**Total Pages**: 10 customer pages + 12 photographer pages = **22 pages**
**Protected Pages**: 19 pages (7 customer + 12 photographer)
**Public Pages**: 3 pages (login, register, test)
**User Types with Full Features**:
1. **Customer** - ✅ Fully implemented
2. **Photographer** - 🔄 Implementation starting
3. **Admin** - ❌ Not implemented

**Current Status**: 
- ✅ Customer interface fully functional
- 🔄 Photographer dashboard - Design phase complete, Implementation starting
- ✅ Database schema planned
- ✅ API endpoints designed
- 🔄 Static data generation needed
- 🔄 UI implementation in progress

---

*Last Updated: Photographer features added*
*Version: 2.0*

