# 🔴 Real-Time Chat Implementation Plan

## 📋 Overview
Implementing WebSocket-based real-time chat using Socket.io for instant message delivery between customers and photographers.

---

## 🗄️ Current Database Schema

### Messages Table (Already Exists ✅)
```sql
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_receiver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**✅ No database changes needed!** The schema already supports real-time chat.

---

## 🏗️ Architecture

```
┌─────────────────────┐         WebSocket          ┌─────────────────────┐
│   Customer Client   │◄───────────────────────────►│                     │
│  (React + Socket)   │                             │   Express Server    │
└─────────────────────┘                             │   + Socket.io       │
                                                    │                     │
┌─────────────────────┐         WebSocket          │   Port: 5000        │
│ Photographer Client │◄───────────────────────────►│                     │
│  (React + Socket)   │                             └─────────────────────┘
└─────────────────────┘                                      │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  PostgreSQL DB  │
                                                    │   messages      │
                                                    └─────────────────┘
```

---

## 🔧 Implementation Steps

### **Phase 1: Backend Setup** 🔴

#### Step 1: Configure Socket.io Server
- Integrate Socket.io with existing Express server
- Configure CORS for WebSocket connections
- Set up connection logging

#### Step 2: Socket Authentication Middleware
- Verify JWT tokens on socket connection
- Attach user information to socket
- Handle authentication errors

#### Step 3: Socket Event Handlers
**Events to Implement:**
1. `connection` - When user connects
2. `join_conversation` - Join a specific conversation room
3. `leave_conversation` - Leave a conversation room
4. `send_message` - Send a new message
5. `typing` - Typing indicator
6. `stop_typing` - Stop typing
7. `message_read` - Mark message as read
8. `disconnect` - Handle disconnection

#### Step 4: Integrate with Message Controller
- Emit socket events when messages are sent via REST API
- Emit to specific user rooms
- Update online status

---

### **Phase 2: Frontend Setup** 🟢

#### Step 5: Install Socket.io Client
```bash
npm install socket.io-client
```

#### Step 6: Create Socket Service
- Create `useSocket` custom hook
- Handle connection/disconnection
- Manage authentication
- Handle reconnection logic

#### Step 7: Update Message Components
**For Both CustomerMessagesPage & PhotographerMessagesPage:**
- Connect to Socket.io on mount
- Join conversation when selected
- Listen for `new_message` events
- Listen for `message_read` events
- Listen for `typing` events
- Emit `send_message` events
- Emit `typing` indicators
- Auto-scroll to new messages

---

## 📡 Socket Events Schema

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId }` | Join a conversation room |
| `leave_conversation` | `{ conversationId }` | Leave a conversation room |
| `send_message` | `{ conversationId, messageText, messageType, attachmentUrl }` | Send a message |
| `typing` | `{ conversationId }` | User is typing |
| `stop_typing` | `{ conversationId }` | User stopped typing |
| `mark_read` | `{ conversationId }` | Mark messages as read |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ message, conversationId }` | New message received |
| `message_read` | `{ conversationId, userId }` | Messages marked as read |
| `user_typing` | `{ conversationId, userId, userName }` | Someone is typing |
| `user_stopped_typing` | `{ conversationId, userId }` | Typing stopped |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId }` | User went offline |
| `error` | `{ message }` | Error occurred |

---

## 🔒 Security Considerations

1. **Authentication**: JWT verification on socket connection
2. **Authorization**: Users can only join their own conversations
3. **Rate Limiting**: Prevent spam (typing indicators, messages)
4. **Input Validation**: Sanitize all message content
5. **Room Isolation**: Users only receive messages from their rooms

---

## 🎯 Key Features

### Real-Time Features ✨
- ✅ Instant message delivery
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online/offline status
- ✅ Message delivery confirmation
- ✅ Auto-reconnection handling

### User Experience 🎨
- ✅ Smooth animations
- ✅ Auto-scroll to new messages
- ✅ Visual feedback for sent/delivered/read
- ✅ Connection status indicator
- ✅ Offline message queue

---

## 📊 Room Naming Convention

```
Conversation Room: conv_{userId1}_{userId2}
Example: conv_1_5 (conversation between user 1 and user 5)

User Room: user_{userId}
Example: user_1 (user 1's personal room for notifications)
```

---

## 🧪 Testing Plan

1. **Connection Testing**
   - ✓ Socket connects successfully
   - ✓ JWT authentication works
   - ✓ Reconnection after disconnect

2. **Message Flow**
   - ✓ Send message via socket
   - ✓ Receive message in real-time
   - ✓ Message persists in database

3. **Typing Indicators**
   - ✓ Show when user types
   - ✓ Hide after timeout
   - ✓ Multiple users typing

4. **Read Receipts**
   - ✓ Mark as read works
   - ✓ Updates conversation list
   - ✓ Updates message display

5. **Edge Cases**
   - ✓ Network disconnect/reconnect
   - ✓ Multiple tabs open
   - ✓ Rapid message sending
   - ✓ Large message handling

---

## 📦 Dependencies

### Backend (Already Installed ✅)
- `socket.io`: ^4.6.0

### Frontend (To Install)
- `socket.io-client`: ^4.6.0

---

## 🚀 Deployment Considerations

1. **WebSocket Support**: Ensure hosting provider supports WebSockets
2. **Sticky Sessions**: Required for multiple server instances
3. **Redis Adapter**: For scaling across multiple servers (future)
4. **Monitoring**: Track socket connections and errors
5. **CORS**: Configure for production domains

---

## 📝 Implementation Checklist

### Backend
- [ ] Configure Socket.io server
- [ ] Create socket authentication middleware
- [ ] Implement event handlers
- [ ] Integrate with message controller
- [ ] Test socket events
- [ ] Add error handling
- [ ] Add logging

### Frontend
- [ ] Install socket.io-client
- [ ] Create useSocket hook
- [ ] Create socket service
- [ ] Update CustomerMessagesPage
- [ ] Update PhotographerMessagesPage
- [ ] Add typing indicators
- [ ] Add read receipts
- [ ] Add connection status UI
- [ ] Test real-time features

---

## 🎓 Next Steps

After implementing basic real-time chat:
1. Add file upload via WebSocket
2. Add voice/video call support
3. Add message reactions
4. Add message editing/deletion
5. Add group chat support
6. Add notification sounds
7. Add desktop notifications

---

## 📚 Resources

- Socket.io Documentation: https://socket.io/docs/v4/
- JWT Authentication with Socket.io: https://socket.io/docs/v4/middlewares/
- React Hooks with Socket.io: https://socket.io/how-to/use-with-react

---

**Implementation Start Date**: December 6, 2025
**Status**: 🟢 Ready to Implement

