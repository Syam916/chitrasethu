# Chitrasethu - Photography Platform

A collaborative visual and event platform that connects customers with photographers, models, and event organizers.

## 🚀 Features

- **Photographer Discovery**: Browse and filter photographers by category
- **Booking System**: Real-time calendar availability and custom time slots
- **Community Buzz**: Event-based chat and photo sharing
- **Moodboard System**: Create and share vision boards
- **Memory Timeline**: Personalized event timeline
- **Professional Portfolios**: Showcase photographer work

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Query
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Payment**: Razorpay
- **Email**: Nodemailer

### Deployment
- **Frontend**: GitHub Pages / Vercel
- **Backend**: Railway / Render
- **Database**: MySQL (AWS RDS / PlanetScale)

## 📦 Installation

### Quick Start (5 Minutes)

See [QUICK_START.md](QUICK_START.md) for detailed setup instructions.

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd chitrasethu/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd chitrasethu/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your MySQL credentials
   ```

4. **Setup database**
   ```bash
   npm run db:setup    # Create tables
   npm run db:seed     # Add sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Database Setup

See [DATABASE_SUMMARY.md](DATABASE_SUMMARY.md) for complete database documentation.

**Tables Created**: 18 tables across 5 categories
- User Management (4 tables)
- Photographer Management (3 tables)
- Event & Booking (5 tables)
- Social Features (4 tables)
- Communication (2 tables)

## 🌐 Deployment

### Method 1: GitHub Actions (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Save

3. **Automatic Deployment**
   - The GitHub Actions workflow will automatically deploy on every push to main
   - Your site will be available at: `https://yourusername.github.io/Chitrasethu`

### Method 2: Manual Deployment

1. **Update package.json homepage**
   ```json
   {
     "homepage": "https://yourusername.github.io/Chitrasethu"
   }
   ```

2. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Configuration

### Backend Configuration (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chitrasethu_db
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### Database Configuration
- MySQL 8.0+ required
- 18 tables with relationships
- Sample data included
- See `backend/database/DB_README.md` for details

## 📱 Usage

### For Customers
1. **Login/Register** with email
2. **Browse photographers** by category
3. **View portfolios** and book sessions
4. **Join Community Buzz** for events
5. **Create moodboards** for inspiration

### For Photographers
1. **Complete profile** with portfolio
2. **Set availability** and pricing
3. **Manage bookings** and client communication
4. **Share work** in Community Buzz

## 🎨 Design System

The platform uses a comprehensive CSS design system with:
- **Color Palette**: Primary blue, secondary purple
- **Typography**: Modern, readable fonts
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components
- **Responsive**: Mobile-first design

## 🚀 Performance

- **Lazy Loading**: Images and components
- **Optimized Build**: Minified and compressed assets
- **CDN**: Fast loading from GitHub Pages
- **Caching**: Browser caching enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📚 Documentation

- **Quick Start Guide**: [QUICK_START.md](QUICK_START.md)
- **Database Documentation**: [DATABASE_SUMMARY.md](DATABASE_SUMMARY.md)
- **Backend API**: [backend/README.md](backend/README.md)
- **Database Schema**: [backend/database/DB_README.md](backend/database/DB_README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

## 🧪 Test Credentials

After running `npm run db:seed`:

**Customer Account:**
- Email: `customer1@example.com`
- Password: `Password123!`

**Photographer Account:**
- Email: `arjun.kapoor@example.com`
- Password: `Password123!`

**Admin Account:**
- Email: `admin@chitrasethu.com`
- Password: `Password123!`

## 🆘 Support

For support:
- Read documentation in respective folders
- Open an issue on GitHub
- Email: dev@chitrasethu.com

---

**Chitrasethu** - Connecting photographers with their perfect clients! 📸✨
