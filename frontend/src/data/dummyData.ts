// Import generated images
import wedding1 from '@/assets/wedding-1.jpg';
import fashion1 from '@/assets/fashion-1.jpg';
import corporate1 from '@/assets/corporate-1.jpg';
import birthday1 from '@/assets/birthday-1.jpg';
import prewedding1 from '@/assets/prewedding-1.jpg';
import photographer1 from '@/assets/photographer-1.jpg';
import photographer2 from '@/assets/photographer-2.jpg';
import weddingCollection from '@/assets/wedding-collection.jpg';

// Upcoming Events Data
export const upcomingEvents = [
  {
    id: 1,
    title: 'Royal Wedding Ceremony',
    date: '2024-01-15',
    time: '10:00 AM',
    location: 'Grand Palace Hotel, Mumbai',
    image: wedding1,
    attendees: 250,
    category: 'Wedding',
    status: 'Booking Open',
    price: '₹50,000',
    description: 'Capture the magic of this royal wedding ceremony with traditional rituals and modern elegance.'
  },
  {
    id: 2,
    title: 'Fashion Week Finale',
    date: '2024-01-20',
    time: '7:00 PM',
    location: 'Fashion Arena, Delhi',
    image: fashion1,
    attendees: 150,
    category: 'Fashion',
    status: 'Limited Spots',
    price: '₹35,000',
    description: 'High-end fashion photography for the biggest fashion event of the season.'
  },
  {
    id: 3,
    title: 'Corporate Gala Night',
    date: '2024-01-25',
    time: '6:30 PM',
    location: 'Business Center, Bangalore',
    image: corporate1,
    attendees: 300,
    category: 'Corporate',
    status: 'VIP Access',
    price: '₹25,000',
    description: 'Professional event photography for corporate milestone celebration.'
  },
  {
    id: 4,
    title: 'Birthday Bash Celebration',
    date: '2024-01-28',
    time: '4:00 PM',
    location: 'Rainbow Gardens, Chennai',
    image: birthday1,
    attendees: 80,
    category: 'Birthday',
    status: 'Booking Open',
    price: '₹15,000',
    description: 'Fun and colorful birthday party photography with family moments.'
  },
  {
    id: 5,
    title: 'Pre-Wedding Romance',
    date: '2024-02-02',
    time: '5:30 PM',
    location: 'Seaside Resort, Goa',
    image: prewedding1,
    attendees: 4,
    category: 'Pre Wedding',
    status: 'Exclusive',
    price: '₹30,000',
    description: 'Romantic pre-wedding photoshoot with sunset beach backdrop.'
  },
  {
    id: 6,
    title: 'Annual Awards Ceremony',
    date: '2024-02-05',
    time: '8:00 PM',
    location: 'Grand Auditorium, Mumbai',
    image: corporate1,
    attendees: 500,
    category: 'Corporate',
    status: 'Premium',
    price: '₹75,000',
    description: 'Red carpet and awards ceremony photography for industry leaders.'
  },
  {
    id: 7,
    title: 'Designer Fashion Show',
    date: '2024-02-10',
    time: '7:30 PM',
    location: 'Luxury Hotel, Delhi',
    image: fashion1,
    attendees: 200,
    category: 'Fashion',
    status: 'Booking Open',
    price: '₹40,000',
    description: 'Runway photography for emerging designers showcase event.'
  },
  {
    id: 8,
    title: 'Golden Anniversary',
    date: '2024-02-14',
    time: '12:00 PM',
    location: 'Heritage Villa, Jaipur',
    image: wedding1,
    attendees: 120,
    category: 'Wedding',
    status: 'Family Event',
    price: '₹22,000',
    description: '50th anniversary celebration with traditional photography.'
  }
];

// Photographers Data
export const photographers = [
  {
    id: 1,
    name: 'Arjun Kapoor',
    location: 'Mumbai, Maharashtra',
    description: 'Wedding & Portrait Specialist with 8+ years experience',
    rating: 4.8,
    reviews: 156,
    image: photographer1,
    badge: 'Pro',
    price: '₹15,000',
    specialties: ['Wedding', 'Portrait', 'Traditional'],
    experience: '8+ years',
    portfolio: [wedding1, prewedding1, corporate1],
    bio: 'Passionate wedding photographer specializing in capturing emotions and candid moments. Featured in top wedding magazines.',
    equipment: ['Canon EOS R5', 'Sony A7 III', 'Professional Lighting'],
    languages: ['Hindi', 'English', 'Marathi']
  },
  {
    id: 2,
    name: 'Priya Sharma',
    location: 'Delhi, NCR',
    description: 'Fashion & Event Photography Expert',
    rating: 4.9,
    reviews: 203,
    image: photographer2,
    badge: 'Premium',
    price: '₹25,000',
    specialties: ['Fashion', 'Events', 'Commercial'],
    experience: '10+ years',
    portfolio: [fashion1, corporate1, birthday1],
    bio: 'Award-winning fashion photographer with international clients. Specialized in high-end fashion and commercial photography.',
    equipment: ['Nikon D850', 'Medium Format Camera', 'Studio Lighting'],
    languages: ['Hindi', 'English', 'Punjabi']
  },
  {
    id: 3,
    name: 'Vikram Singh',
    location: 'Bangalore, Karnataka',
    description: 'Corporate & Wedding Expert',
    rating: 4.7,
    reviews: 98,
    image: photographer1,
    badge: 'Verified',
    price: '₹18,000',
    specialties: ['Corporate', 'Wedding', 'Events'],
    experience: '6+ years',
    portfolio: [corporate1, wedding1, fashion1],
    bio: 'Corporate photography specialist with expertise in events and business portraits. Trusted by Fortune 500 companies.',
    equipment: ['Canon EOS 5D', 'Professional Flash', 'Drone Camera'],
    languages: ['Hindi', 'English', 'Kannada']
  },
  {
    id: 4,
    name: 'Ananya Mehta',
    location: 'Chennai, Tamil Nadu',
    description: 'Creative Portrait & Family Photographer',
    rating: 4.6,
    reviews: 142,
    image: photographer2,
    badge: 'Rising Star',
    price: '₹12,000',
    specialties: ['Portrait', 'Family', 'Kids'],
    experience: '4+ years',
    portfolio: [birthday1, prewedding1, wedding1],
    bio: 'Creative photographer specializing in family portraits and children photography. Known for capturing natural expressions.',
    equipment: ['Sony A7R IV', 'Portrait Lenses', 'Natural Lighting'],
    languages: ['Tamil', 'English', 'Hindi']
  }
];

// Social Media Posts Data
export const socialPosts = [
  {
    id: 1,
    user: {
      name: 'Rahul Photography',
      avatar: photographer1,
      username: '@rahulphotos',
      verified: true
    },
    content: {
      type: 'image',
      media: [wedding1, prewedding1],
      caption: 'Captured this beautiful moment at yesterday\'s wedding ceremony. The emotions, the colors, the pure joy - everything was perfect! 📸✨ #WeddingPhotography #LoveStory #ChitraSethu',
      location: 'Grand Palace Hotel, Mumbai'
    },
    engagement: {
      likes: 1247,
      comments: 89,
      shares: 23,
      timestamp: '2 hours ago'
    },
    tags: ['Wedding', 'Portrait', 'Mumbai']
  },
  {
    id: 2,
    user: {
      name: 'Priya Lens',
      avatar: photographer2,
      username: '@priyalens',
      verified: false
    },
    content: {
      type: 'video',
      media: [fashion1],
      caption: 'Behind the scenes of today\'s fashion shoot! The magic happens when creativity meets passion. What do you think of this setup? 🎬👗',
      location: 'Fashion Studio, Delhi'
    },
    engagement: {
      likes: 892,
      comments: 67,
      shares: 15,
      timestamp: '4 hours ago'
    },
    tags: ['Fashion', 'BTS', 'Studio']
  },
  {
    id: 3,
    user: {
      name: 'Vikram Captures',
      avatar: photographer1,
      username: '@vikramcaptures',
      verified: true
    },
    content: {
      type: 'image',
      media: [corporate1],
      caption: 'Corporate headshots that tell a story. Professional photography isn\'t just about the camera - it\'s about connecting with your subject. 💼📷',
      location: 'Business District, Bangalore'
    },
    engagement: {
      likes: 634,
      comments: 42,
      shares: 18,
      timestamp: '6 hours ago'
    },
    tags: ['Corporate', 'Portrait', 'Professional']
  },
  {
    id: 4,
    user: {
      name: 'Chennai Clicks',
      avatar: photographer2,
      username: '@chennaiklicks',
      verified: true
    },
    content: {
      type: 'image',
      media: [birthday1],
      caption: 'Birthday celebrations are about capturing joy in its purest form! This little one\'s smile made my day ✨🎂 #BirthdayPhotography #Joy #Memories',
      location: 'Rainbow Gardens, Chennai'
    },
    engagement: {
      likes: 456,
      comments: 34,
      shares: 12,
      timestamp: '8 hours ago'
    },
    tags: ['Birthday', 'Kids', 'Family']
  },
  {
    id: 5,
    user: {
      name: 'Mumbai Frames',
      avatar: photographer1,
      username: '@mumbaiframes',
      verified: false
    },
    content: {
      type: 'image',
      media: [prewedding1, wedding1],
      caption: 'Pre-wedding magic at Goa beaches! Sometimes the best shots happen when couples forget about the camera and just be themselves 🌅💕',
      location: 'Seaside Resort, Goa'
    },
    engagement: {
      likes: 978,
      comments: 56,
      shares: 28,
      timestamp: '12 hours ago'
    },
    tags: ['PreWedding', 'Beach', 'Romance']
  }
];

// Trending Events Data
export const trendingEvents = [
  { name: 'Wedding Season', posts: 1.2, trending: '+23%' },
  { name: 'Fashion Week', posts: 0.8, trending: '+45%' },
  { name: 'Corporate Events', posts: 0.6, trending: '+12%' },
  { name: 'Birthday Parties', posts: 0.9, trending: '+18%' },
  { name: 'Pre-Wedding Shoots', posts: 0.7, trending: '+31%' },
  { name: 'Festival Photography', posts: 1.1, trending: '+27%' }
];

// Collections Data
export const collections = [
  {
    id: 1,
    title: 'Best Wedding Shots',
    images: 45,
    thumbnail: weddingCollection,
    curator: 'ChitraSethu Team',
    description: 'Curated collection of the most beautiful wedding moments',
    category: 'Wedding'
  },
  {
    id: 2,
    title: 'Fashion Portfolio',
    images: 32,
    thumbnail: fashion1,
    curator: 'Style Magazine',
    description: 'High-end fashion photography showcase',
    category: 'Fashion'
  },
  {
    id: 3,
    title: 'Event Highlights',
    images: 28,
    thumbnail: corporate1,
    curator: 'Event Masters',
    description: 'Professional event photography collection',
    category: 'Events'
  },
  {
    id: 4,
    title: 'Portrait Excellence',
    images: 38,
    thumbnail: birthday1,
    curator: 'Portrait Pro',
    description: 'Stunning portrait photography examples',
    category: 'Portrait'
  }
];

// Advertisements Data
export const advertisements = [
  {
    id: 1,
    title: 'Premium Lens Collection',
    subtitle: '50% off on Canon & Nikon',
    image: fashion1,
    cta: 'Shop Now',
    link: '#',
    discount: '50% OFF'
  },
  {
    id: 2,
    title: 'Photography Workshop',
    subtitle: 'Master the art of portraits',
    image: corporate1,
    cta: 'Register',
    link: '#',
    price: '₹2,999'
  },
  {
    id: 3,
    title: 'Wedding Package Deal',
    subtitle: 'Complete coverage + album',
    image: wedding1,
    cta: 'Book Now',
    link: '#',
    offer: 'Limited Time'
  }
];

// Event Categories with Icons
export const eventCategories = [
  { id: 'all', name: 'All Events', count: 150, color: 'bg-primary' },
  { id: 'wedding', name: 'Wedding', count: 45, color: 'bg-red-500' },
  { id: 'event', name: 'Events', count: 32, color: 'bg-blue-500' },
  { id: 'birthday', name: 'Birthday', count: 28, color: 'bg-yellow-500' },
  { id: 'prewedding', name: 'Pre Wedding', count: 22, color: 'bg-pink-500' },
  { id: 'fashion', name: 'Fashion', count: 18, color: 'bg-purple-500' },
  { id: 'modelling', name: 'Modelling', count: 15, color: 'bg-green-500' }
];

// Suggested Connections
export const suggestedConnections = [
  { id: 1, name: 'Alex Photography', type: 'Photographer', avatar: photographer1, mutual: 12 },
  { id: 2, name: 'Sarah Studios', type: 'Studio', avatar: photographer2, mutual: 8 },
  { id: 3, name: 'Mumbai Shots', type: 'Photographer', avatar: photographer1, mutual: 15 },
  { id: 4, name: 'Creative Lens', type: 'Agency', avatar: photographer2, mutual: 6 },
  { id: 5, name: 'Delhi Frames', type: 'Photographer', avatar: photographer1, mutual: 10 }
];