import photographerAvatar1 from '@/assets/photographer-1.jpg';
import photographerAvatar2 from '@/assets/photographer-2.jpg';
import weddingImage from '@/assets/wedding-1.jpg';
import preWeddingImage from '@/assets/prewedding-1.jpg';
import corporateImage from '@/assets/corporate-1.jpg';
import birthdayImage from '@/assets/birthday-1.jpg';
import fashionImage from '@/assets/fashion-1.jpg';

// Photographer Dummy Data

const defaultCustomerAvatar = photographerAvatar1;
const secondaryCustomerAvatar = photographerAvatar2;
const tertiaryCustomerAvatar = weddingImage;

const defaultPosterAvatar = photographerAvatar1;
const secondaryPosterAvatar = photographerAvatar2;

const defaultParticipantAvatar = photographerAvatar2;
const secondaryParticipantAvatar = photographerAvatar1;

const galleryCoverImages = [
  weddingImage,
  preWeddingImage,
  corporateImage,
  birthdayImage,
  fashionImage,
];

const defaultFeedImages = [
  weddingImage,
  preWeddingImage,
  corporateImage,
  fashionImage,
  birthdayImage,
];

const qrCodes = [
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChitraSethu%20Gallery%201',
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChitraSethu%20Gallery%202',
  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChitraSethu%20Gallery%203',
];

export const photographerBookingRequests = [
  {
    requestId: 1,
    customerId: 5,
    customerName: "Priya & Rahul",
    customerAvatar: defaultCustomerAvatar,
    customerPhone: "+91 9876543210",
    customerEmail: "priya.rahul@email.com",
    eventType: "Wedding",
    eventDate: "2024-03-15",
    eventTime: "10:00 AM",
    eventLocation: "Grand Palace, Mumbai, Maharashtra",
    duration: 8,
    budgetRange: "₹40,000 - ₹50,000",
    guestCount: 300,
    requirements: "Traditional ceremony coverage, candid shots, album included, drone photography for aerial shots",
    urgency: "high",
    status: "pending",
    requestedAt: "2024-02-01T10:30:00Z"
  },
  {
    requestId: 2,
    customerId: 6,
    customerName: "Amit Kumar",
    customerAvatar: secondaryCustomerAvatar,
    customerPhone: "+91 9876543211",
    customerEmail: "amit.k@email.com",
    eventType: "Corporate Event",
    eventDate: "2024-02-28",
    eventTime: "2:00 PM",
    eventLocation: "Tech Park Convention Center, Bangalore",
    duration: 6,
    budgetRange: "₹25,000 - ₹35,000",
    guestCount: 150,
    requirements: "Professional headshots, event coverage, stage photography, product photography",
    urgency: "medium",
    status: "pending",
    requestedAt: "2024-02-05T14:20:00Z"
  },
  {
    requestId: 3,
    customerName: "Sneha & Vikram",
    customerAvatar: tertiaryCustomerAvatar,
    customerPhone: "+91 9876543212",
    customerEmail: "sneha.v@email.com",
    customerId: 7,
    eventType: "Pre-Wedding",
    eventDate: "2024-03-10",
    eventTime: "6:00 AM",
    eventLocation: "Goa Beaches",
    duration: 4,
    budgetRange: "₹20,000 - ₹30,000",
    guestCount: 2,
    requirements: "Sunrise shoot, beach locations, multiple outfit changes, candid and posed shots",
    urgency: "high",
    status: "pending",
    requestedAt: "2024-02-08T09:15:00Z"
  },
  {
    requestId: 4,
    customerId: 8,
    customerName: "Riya Fashion Studio",
    customerAvatar: secondaryCustomerAvatar,
    customerPhone: "+91 9876543213",
    customerEmail: "riya.fashion@email.com",
    eventType: "Fashion Shoot",
    eventDate: "2024-02-25",
    eventTime: "11:00 AM",
    eventLocation: "Studio 5, Delhi NCR",
    duration: 5,
    budgetRange: "₹30,000 - ₹40,000",
    guestCount: 5,
    requirements: "Studio setup, 3 models, 5 outfit changes, retouching included, online gallery",
    urgency: "medium",
    status: "pending",
    requestedAt: "2024-02-10T11:45:00Z"
  }
];

export const photographerJobPostings = [
  {
    jobId: 1,
    photographerId: 1,
    postedBy: "John's Photography Studio",
    posterAvatar: defaultPosterAvatar,
    jobTitle: "Need Experienced Video Editor for Wedding Project",
    jobDescription: "Looking for a skilled video editor proficient in Premiere Pro and DaVinci Resolve. Need to edit 8 hours of wedding footage into a cinematic 30-minute video with color grading and audio mixing.",
    category: "Video Editor",
    budgetMin: 15000,
    budgetMax: 20000,
    duration: "5 days",
    urgency: "urgent",
    location: "Remote",
    requiredSkills: ["Premiere Pro", "DaVinci Resolve", "Color Grading", "Audio Mixing"],
    status: "open",
    applicationCount: 8,
    postedAt: "2024-02-05T09:00:00Z"
  },
  {
    jobId: 2,
    photographerId: 2,
    postedBy: "Creative Lens Photography",
    posterAvatar: secondaryPosterAvatar,
    jobTitle: "Photography Assistant for Fashion Shoot",
    jobDescription: "Need an assistant for a 2-day fashion shoot. Must be familiar with studio lighting, reflectors, and basic camera equipment. Prior fashion photography experience preferred.",
    category: "Photography Assistant",
    budgetMin: 5000,
    budgetMax: 8000,
    duration: "2 days",
    urgency: "moderate",
    location: "Mumbai, On-site",
    requiredSkills: ["Studio Lighting", "Equipment Handling", "Fashion Photography"],
    status: "open",
    applicationCount: 12,
    postedAt: "2024-02-07T14:30:00Z"
  },
  {
    jobId: 3,
    photographerId: 3,
    postedBy: "Moments Photography",
    posterAvatar: defaultPosterAvatar,
    jobTitle: "Drone Operator for Destination Wedding",
    jobDescription: "Seeking professional drone operator for destination wedding in Udaipur. Must have DJI Mavic 3 or similar, FAA certification, and experience in wedding aerial photography.",
    category: "Drone Operator",
    budgetMin: 12000,
    budgetMax: 18000,
    duration: "3 days",
    urgency: "moderate",
    location: "Udaipur, Rajasthan",
    requiredSkills: ["Drone Operation", "DJI Mavic", "Aerial Photography", "FAA Certified"],
    status: "open",
    applicationCount: 5,
    postedAt: "2024-02-08T10:15:00Z"
  },
  {
    jobId: 4,
    photographerId: 4,
    postedBy: "Elite Photography Co.",
    posterAvatar: secondaryPosterAvatar,
    jobTitle: "Photo Retoucher for Wedding Album",
    jobDescription: "Need a skilled retoucher to edit 500 wedding photos. Skin retouching, color correction, background cleanup. Must deliver in 7 days.",
    category: "Photo Retoucher",
    budgetMin: 10000,
    budgetMax: 15000,
    duration: "7 days",
    urgency: "flexible",
    location: "Remote",
    requiredSkills: ["Photoshop", "Lightroom", "Color Correction", "Skin Retouching"],
    status: "open",
    applicationCount: 15,
    postedAt: "2024-02-09T16:00:00Z"
  }
];

export const photographerBookings = [
  // Current Bookings
  {
    bookingId: 1,
    customerId: 10,
    customerName: "Ananya & Rohan",
    customerAvatar: defaultCustomerAvatar,
    customerPhone: "+91 9988776655",
    customerEmail: "ananya.rohan@email.com",
    eventType: "Wedding",
    eventDate: "2024-02-18",
    eventTime: "10:00 AM",
    eventLocation: "Leela Palace, Bangalore",
    duration: 10,
    packageName: "Wedding Premium",
    price: 50000,
    paymentStatus: "partial",
    deliveryStatus: "pending",
    status: "current",
    checklist: {
      equipmentChecked: true,
      locationScouted: false,
      contractSigned: true,
      advanceReceived: true,
      backupArranged: false
    }
  },
  {
    bookingId: 2,
    customerId: 11,
    customerName: "Tech Innovations Pvt Ltd",
    customerAvatar: secondaryCustomerAvatar,
    customerPhone: "+91 9988776656",
    customerEmail: "events@techinnovations.com",
    eventType: "Corporate Event",
    eventDate: "2024-02-20",
    eventTime: "2:00 PM",
    eventLocation: "Hyatt Regency, Delhi",
    duration: 6,
    packageName: "Corporate Coverage",
    price: 30000,
    paymentStatus: "paid",
    deliveryStatus: "pending",
    status: "current",
    checklist: {
      equipmentChecked: true,
      locationScouted: true,
      contractSigned: true,
      advanceReceived: true,
      backupArranged: true
    }
  },
  
  // Upcoming Bookings
  {
    bookingId: 3,
    customerId: 12,
    customerName: "Meera & Arjun",
    customerAvatar: tertiaryCustomerAvatar,
    customerPhone: "+91 9988776657",
    customerEmail: "meera.arjun@email.com",
    eventType: "Pre-Wedding",
    eventDate: "2024-03-05",
    eventTime: "6:00 AM",
    eventLocation: "Jaipur, Rajasthan",
    duration: 8,
    packageName: "Pre-Wedding Deluxe",
    price: 35000,
    paymentStatus: "unpaid",
    deliveryStatus: "pending",
    status: "upcoming",
    daysUntil: 17,
    checklist: {
      equipmentChecked: false,
      locationScouted: false,
      contractSigned: true,
      advanceReceived: false,
      backupArranged: false
    }
  },
  {
    bookingId: 4,
    customerId: 13,
    customerName: "Divya Birthday Party",
    customerAvatar: secondaryCustomerAvatar,
    customerPhone: "+91 9988776658",
    customerEmail: "divya.party@email.com",
    eventType: "Birthday",
    eventDate: "2024-03-12",
    eventTime: "5:00 PM",
    eventLocation: "Home Garden, Mumbai",
    duration: 4,
    packageName: "Birthday Basic",
    price: 12000,
    paymentStatus: "unpaid",
    deliveryStatus: "pending",
    status: "upcoming",
    daysUntil: 24,
    checklist: {
      equipmentChecked: false,
      locationScouted: false,
      contractSigned: false,
      advanceReceived: false,
      backupArranged: false
    }
  },
  
  // Past Bookings
  {
    bookingId: 5,
    customerId: 14,
    customerName: "Kavya & Karthik",
    customerAvatar: defaultCustomerAvatar,
    customerPhone: "+91 9988776659",
    customerEmail: "kavya.karthik@email.com",
    eventType: "Wedding",
    eventDate: "2024-01-20",
    eventTime: "11:00 AM",
    eventLocation: "Taj Lands End, Mumbai",
    duration: 12,
    packageName: "Wedding Platinum",
    price: 75000,
    paymentStatus: "paid",
    deliveryStatus: "delivered",
    status: "past",
    rating: 5,
    review: "Absolutely amazing work! Captured every moment perfectly.",
    revenue: 75000,
    photoCount: 800,
    completedAt: "2024-01-20"
  },
  {
    bookingId: 6,
    customerId: 15,
    customerName: "Fashion Forward Magazine",
    customerAvatar: secondaryCustomerAvatar,
    customerPhone: "+91 9988776660",
    customerEmail: "editor@fashionforward.com",
    eventType: "Fashion Shoot",
    eventDate: "2024-01-15",
    eventTime: "10:00 AM",
    eventLocation: "Studio 9, Mumbai",
    duration: 6,
    packageName: "Fashion Editorial",
    price: 40000,
    paymentStatus: "paid",
    deliveryStatus: "delivered",
    status: "past",
    rating: 4.8,
    review: "Professional service, beautiful shots!",
    revenue: 40000,
    photoCount: 200,
    completedAt: "2024-01-15"
  }
];

export const photographerPhotoBooths = [
  {
    galleryId: 1,
    eventName: "Kavya & Karthik Wedding",
    bookingId: 5,
    qrCode: "QRKAVYA2024",
    qrCodeUrl: qrCodes[0],
    photoCount: 800,
    galleryUrl: "https://chitrasethu.com/gallery/QRKAVYA2024",
    privacy: "public",
    password: null,
    expiryDate: "2024-12-31",
    downloadEnabled: true,
    watermark: false,
    accessCount: 245,
    downloadCount: 89,
    createdAt: "2024-01-21T10:00:00Z"
  },
  {
    galleryId: 2,
    eventName: "Fashion Forward Editorial",
    bookingId: 6,
    qrCode: "QRFASHION2024",
    qrCodeUrl: qrCodes[1],
    photoCount: 200,
    galleryUrl: "https://chitrasethu.com/gallery/QRFASHION2024",
    privacy: "password",
    password: "fashion2024",
    expiryDate: "2024-06-30",
    downloadEnabled: false,
    watermark: true,
    accessCount: 67,
    downloadCount: 12,
    createdAt: "2024-01-16T14:00:00Z"
  },
  {
    galleryId: 3,
    eventName: "Ananya & Rohan Wedding",
    bookingId: 1,
    qrCode: "QRANANYA2024",
    qrCodeUrl: qrCodes[2],
    photoCount: 450,
    galleryUrl: "https://chitrasethu.com/gallery/QRANANYA2024",
    privacy: "public",
    password: null,
    expiryDate: "2025-02-18",
    downloadEnabled: true,
    watermark: false,
    accessCount: 123,
    downloadCount: 45,
    createdAt: "2024-02-12T09:00:00Z"
  }
];

export const photographerEvents = [
  // Current Events
  {
    eventId: 1,
    eventName: "Ananya & Rohan Wedding",
    eventType: "Wedding",
    eventDate: "2024-02-18",
    location: "Bangalore",
    customerName: "Ananya & Rohan",
    albumName: "AnanyaRohan_Wedding_2024",
    coverPhoto: galleryCoverImages[0],
    photoCount: 450,
    uploadStatus: "in-progress",
    status: "current",
    privacy: "private"
  },
  {
    eventId: 2,
    eventName: "Tech Innovations Conference",
    eventType: "Corporate",
    eventDate: "2024-02-20",
    location: "Delhi",
    customerName: "Tech Innovations",
    albumName: "TechConf_2024",
    coverPhoto: galleryCoverImages[1],
    photoCount: 180,
    uploadStatus: "pending",
    status: "current",
    privacy: "private"
  },
  
  // Past Events
  {
    eventId: 3,
    eventName: "Kavya & Karthik Wedding",
    eventType: "Wedding",
    eventDate: "2024-01-20",
    location: "Mumbai",
    customerName: "Kavya & Karthik",
    albumName: "KavyaKarthik_Wedding_2024",
    coverPhoto: galleryCoverImages[2],
    photoCount: 800,
    uploadStatus: "completed",
    status: "past",
    privacy: "public",
    viewCount: 1234,
    downloadCount: 456
  },
  {
    eventId: 4,
    eventName: "Fashion Forward Editorial",
    eventType: "Fashion",
    eventDate: "2024-01-15",
    location: "Mumbai",
    customerName: "Fashion Forward Magazine",
    albumName: "FashionForward_Jan2024",
    coverPhoto: galleryCoverImages[3],
    photoCount: 200,
    uploadStatus: "completed",
    status: "past",
    privacy: "private",
    viewCount: 456,
    downloadCount: 123
  },
  
  // Upcoming Events
  {
    eventId: 5,
    eventName: "Meera & Arjun Pre-Wedding",
    eventType: "Pre-Wedding",
    eventDate: "2024-03-05",
    location: "Jaipur",
    customerName: "Meera & Arjun",
    albumName: "MeeraArjun_PreWedding_2024",
    coverPhoto: galleryCoverImages[4],
    photoCount: 0,
    uploadStatus: "not-started",
    status: "upcoming",
    privacy: "private"
  }
];

export const photographerCommunityGroups = [
  {
    groupId: 1,
    groupName: "Wedding Photographers Mumbai",
    groupType: "regional",
    description: "Community of wedding photographers in Mumbai sharing tips, equipment, and collaborations",
    groupIcon: defaultPosterAvatar,
    memberCount: 45,
    unreadCount: 5,
    lastActivity: "2 hours ago",
    role: "member"
  },
  {
    groupId: 2,
    groupName: "Kavya Wedding Project",
    groupType: "project",
    description: "Collaboration group for Kavya & Karthik wedding - Photographer + Videographer + Drone operator",
    groupIcon: secondaryPosterAvatar,
    memberCount: 4,
    unreadCount: 12,
    lastActivity: "10 minutes ago",
    role: "admin"
  },
  {
    groupId: 3,
    groupName: "Fashion Photography Network",
    groupType: "network",
    description: "Professional network for fashion and editorial photographers",
    groupIcon: defaultPosterAvatar,
    memberCount: 128,
    unreadCount: 0,
    lastActivity: "1 day ago",
    role: "member"
  },
  {
    groupId: 4,
    groupName: "Equipment Share India",
    groupType: "equipment",
    description: "Rent, share, or borrow photography equipment across India",
    groupIcon: secondaryPosterAvatar,
    memberCount: 234,
    unreadCount: 3,
    lastActivity: "5 hours ago",
    role: "member"
  }
];

export const photographerCollaborations = [
  {
    collaborationId: 1,
    postedBy: "Sarah's Photography",
    posterAvatar: defaultPosterAvatar,
    collaborationType: "seeking",
    title: "Need Second Shooter for Wedding - Feb 25",
    description: "Looking for experienced second shooter for a wedding in Pune. 8-hour coverage, split payment 60-40.",
    skills: ["Wedding Photography", "Candid Shots"],
    location: "Pune, Maharashtra",
    budget: "₹15,000",
    date: "2024-02-25",
    responses: 8,
    postedAt: "2024-02-10T11:00:00Z"
  },
  {
    collaborationId: 2,
    postedBy: "Creative Studios",
    posterAvatar: secondaryPosterAvatar,
    collaborationType: "seeking",
    title: "Video Editor + Photographer Collaboration",
    description: "Long-term collaboration opportunity for corporate events. Looking for reliable video editor to work with on monthly projects.",
    skills: ["Video Editing", "Premiere Pro", "Color Grading"],
    location: "Bangalore / Remote",
    budget: "₹20,000 - ₹30,000 per project",
    date: "Ongoing",
    responses: 15,
    postedAt: "2024-02-08T14:30:00Z"
  },
  {
    collaborationId: 3,
    postedBy: "Drone Specialist Pro",
    posterAvatar: defaultPosterAvatar,
    collaborationType: "offering",
    title: "Professional Drone Services Available",
    description: "Offering aerial photography services for weddings, real estate, and events. DJI Mavic 3 Pro, 4K video, licensed and insured.",
    skills: ["Drone Photography", "Aerial Videography", "FAA Certified"],
    location: "Mumbai, Pune, Goa",
    budget: "₹10,000 - ₹25,000",
    date: "Available immediately",
    responses: 0,
    postedAt: "2024-02-12T09:00:00Z"
  }
];

export const photographerMessages = [
  {
    conversationId: 1,
    participantName: "Ananya & Rohan",
    participantAvatar: defaultParticipantAvatar,
    lastMessage: "Thank you! Looking forward to the wedding on 18th!",
    timestamp: "10:30 AM",
    unreadCount: 0,
    online: true,
    isPinned: true,
    bookingId: 1
  },
  {
    conversationId: 2,
    participantName: "Tech Innovations",
    participantAvatar: secondaryParticipantAvatar,
    lastMessage: "Can we schedule a call to discuss the event details?",
    timestamp: "Yesterday",
    unreadCount: 2,
    online: false,
    isPinned: false,
    bookingId: 2
  },
  {
    conversationId: 3,
    participantName: "Priya & Rahul",
    participantAvatar: defaultParticipantAvatar,
    lastMessage: "What packages do you offer for March weddings?",
    timestamp: "2 days ago",
    unreadCount: 1,
    online: true,
    isPinned: false,
    bookingId: null
  },
  {
    conversationId: 4,
    participantName: "Meera & Arjun",
    participantAvatar: secondaryParticipantAvatar,
    lastMessage: "Perfect! Booked for March 5th",
    timestamp: "3 days ago",
    unreadCount: 0,
    online: false,
    isPinned: false,
    bookingId: 3
  }
];

export const photographerStats = {
  totalBookings: 45,
  currentMonthBookings: 5,
  currentMonthRevenue: 185000,
  pendingRequests: 4,
  activeConversations: 8,
  portfolioViews: 1245,
  profileRating: 4.9,
  totalReviews: 87,
  completionRate: 98,
  responseTime: "2 hours"
};

export const eventChatRooms = [
  {
    roomId: 1,
    eventName: "Mumbai Photography Meetup 2024",
    eventType: "Networking",
    eventDate: "2024-02-22",
    eventLocation: "Phoenix Mall, Mumbai",
    eventStatus: "upcoming",
    participantCount: 45,
    unreadCount: 12,
    lastMessage: "See you all this Saturday!",
    coverImage: galleryCoverImages[0]
  },
  {
    roomId: 2,
    eventName: "AR Rahman Concert - Photographer Access",
    eventType: "Live Event",
    eventDate: "2024-02-18",
    eventLocation: "DY Patil Stadium, Mumbai",
    eventStatus: "live",
    participantCount: 23,
    unreadCount: 45,
    lastMessage: "Stage access is from Gate 5",
    coverImage: galleryCoverImages[1]
  },
  {
    roomId: 3,
    eventName: "India Photography Festival",
    eventType: "Conference",
    eventDate: "2024-03-10",
    eventLocation: "NCPA, Mumbai",
    eventStatus: "upcoming",
    participantCount: 156,
    unreadCount: 0,
    lastMessage: "Early bird tickets available!",
    coverImage: galleryCoverImages[2]
  },
  {
    roomId: 4,
    eventName: "Diwali Fashion Week 2023",
    eventType: "Fashion",
    eventDate: "2023-11-10",
    eventLocation: "Jio World Centre, Mumbai",
    eventStatus: "completed",
    participantCount: 89,
    unreadCount: 0,
    lastMessage: "Great event everyone! Let's connect for next year",
    coverImage: galleryCoverImages[3]
  }
];

export const photographerMoodBoards = [
  {
    boardId: 1,
    boardName: "Wedding Inspiration 2024",
    category: "Wedding",
    description: "Classic and contemporary wedding photography inspiration",
    privacy: "public",
    coverImage: defaultFeedImages[0],
    imageCount: 45,
    createdAt: "2024-01-15",
    views: 234,
    saves: 67
  },
  {
    boardId: 2,
    boardName: "Fashion Editorial Styles",
    category: "Fashion",
    description: "High-fashion editorial photography references",
    privacy: "public",
    coverImage: defaultFeedImages[1],
    imageCount: 32,
    createdAt: "2024-01-20",
    views: 456,
    saves: 123
  },
  {
    boardId: 3,
    boardName: "Portrait Lighting Setups",
    category: "Portrait",
    description: "Various portrait lighting techniques and setups",
    privacy: "private",
    coverImage: defaultFeedImages[2],
    imageCount: 28,
    createdAt: "2024-02-01",
    views: 89,
    saves: 12
  },
  {
    boardId: 4,
    boardName: "Color Palette - Warm Tones",
    category: "Color Palette",
    description: "Warm color grading references for photo editing",
    privacy: "public",
    coverImage: defaultFeedImages[3],
    imageCount: 15,
    createdAt: "2024-02-05",
    views: 178,
    saves: 45
  }
];

// Feed data for photographer home page
export const photographerFeedPosts = [
  {
    id: 1,
    photographer: {
      name: "Sarah Photography",
      username: "@sarahphotography",
      avatar: defaultPosterAvatar,
      verified: true
    },
    content: {
      type: "image",
      media: [defaultFeedImages[0]],
      caption: "Beautiful sunset wedding ceremony at Taj Falaknuma Palace. The golden hour made everything magical! ✨ #WeddingPhotography #GoldenHour",
      location: "Hyderabad, India"
    },
    engagement: {
      likes: 1245,
      comments: 87,
      shares: 23,
      timestamp: "2 hours ago"
    },
    tags: ["#WeddingPhotography", "#GoldenHour", "#Hyderabad"]
  },
  {
    id: 2,
    photographer: {
      name: "Creative Lens Studio",
      username: "@creativelens",
      avatar: secondaryPosterAvatar,
      verified: true
    },
    content: {
      type: "image",
      media: [defaultFeedImages[1]],
      caption: "Fashion editorial shoot for @vogueIndia. Loved working with this amazing team! 📸💫",
      location: "Mumbai, India"
    },
    engagement: {
      likes: 2341,
      comments: 156,
      shares: 45,
      timestamp: "5 hours ago"
    },
    tags: ["#FashionPhotography", "#Editorial", "#VogueIndia"]
  },
  {
    id: 3,
    photographer: {
      name: "Moments Photography",
      username: "@momentsphotography",
      avatar: defaultParticipantAvatar,
      verified: false
    },
    content: {
      type: "image",
      media: [defaultFeedImages[2]],
      caption: "Pre-wedding shoot in the beautiful landscapes of Ladakh. Nothing beats natural beauty! 🏔️❤️",
      location: "Ladakh, India"
    },
    engagement: {
      likes: 987,
      comments: 54,
      shares: 18,
      timestamp: "1 day ago"
    },
    tags: ["#PreWedding", "#Ladakh", "#NaturePhotography"]
  }
];

