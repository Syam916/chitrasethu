import photographerAvatar1 from '@/assets/photographer-1.jpg';
import photographerAvatar2 from '@/assets/photographer-2.jpg';

// Customer Dummy Data

const defaultPhotographerAvatar = photographerAvatar1;
const secondaryPhotographerAvatar = photographerAvatar2;

export const customerMessages = [
  {
    conversationId: 1,
    participantName: "Arjun Kapoor Photography",
    participantAvatar: defaultPhotographerAvatar,
    lastMessage: "Thank you for your interest! I'd be happy to discuss your wedding photography needs.",
    timestamp: "10:30 AM",
    unreadCount: 0,
    online: true,
    isPinned: true,
    bookingId: 1
  },
  {
    conversationId: 2,
    participantName: "Priya Sharma Photography",
    participantAvatar: secondaryPhotographerAvatar,
    lastMessage: "I've sent you the portfolio link. Let me know if you have any questions!",
    timestamp: "Yesterday",
    unreadCount: 2,
    online: false,
    isPinned: false,
    bookingId: 2
  },
  {
    conversationId: 3,
    participantName: "Vikram Singh Photography",
    participantAvatar: defaultPhotographerAvatar,
    lastMessage: "Can we schedule a call to discuss the event details?",
    timestamp: "2 days ago",
    unreadCount: 1,
    online: true,
    isPinned: false,
    bookingId: null
  },
  {
    conversationId: 4,
    participantName: "Ananya Mehta Photography",
    participantAvatar: secondaryPhotographerAvatar,
    lastMessage: "Perfect! I've noted your requirements. I'll send you a quote by tomorrow.",
    timestamp: "3 days ago",
    unreadCount: 0,
    online: false,
    isPinned: false,
    bookingId: 3
  }
];























