# 🏗️ Real-Time Chat Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CHITRASETHU PLATFORM                            │
│                         Real-Time Chat System                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                              ┌──────────────────────┐
│   Customer Browser   │                              │ Photographer Browser │
│   (User A)           │                              │   (User B)           │
│                      │                              │                      │
│  ┌────────────────┐ │                              │  ┌────────────────┐ │
│  │ Messages Page  │ │                              │  │ Messages Page  │ │
│  │                │ │                              │  │                │ │
│  │ [Type msg...]  │ │                              │  │ [Type msg...]  │ │
│  │ [Send] 📨      │ │                              │  │ [Send] 📨      │ │
│  │                │ │                              │  │                │ │
│  │ Status: 🟢 On  │ │                              │  │ Status: 🟢 On  │ │
│  └────────┬───────┘ │                              │  └────────┬───────┘ │
│           │         │                              │           │         │
│  ┌────────▼───────┐ │                              │  ┌────────▼───────┐ │
│  │ useSocket()    │ │                              │  │ useSocket()    │ │
│  │ Hook           │ │                              │  │ Hook           │ │
│  └────────┬───────┘ │                              │  └────────┬───────┘ │
│           │         │                              │           │         │
│  ┌────────▼───────┐ │                              │  ┌────────▼───────┐ │
│  │ SocketService  │ │                              │  │ SocketService  │ │
│  │ .connect()     │ │                              │  │ .connect()     │ │
│  │ .send()        │ │                              │  │ .send()        │ │
│  └────────┬───────┘ │                              │  └────────┬───────┘ │
│           │         │                              │           │         │
│           │ WebSocket (WS)                         │           │ WebSocket
│           │                                        │           │
└───────────┼────────────────────────────────────────┼───────────┼─────────┘
            │                                        │           │
            │                                        │           │
            ▼                                        ▼           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER (Port 5000)                       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Socket.io Server                             │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  Authentication Middleware                                │ │   │
│  │  │  • Verify JWT token                                       │ │   │
│  │  │  • Attach userId to socket                                │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  Connection Handler                                       │ │   │
│  │  │  • User connects → socket.id created                      │ │   │
│  │  │  • User joins room: user_{userId}                         │ │   │
│  │  │  • Logs: "User 123 connected"                             │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  Event Handlers                                           │ │   │
│  │  │                                                            │ │   │
│  │  │  join_conversation   → socket.join('conv_1_2')            │ │   │
│  │  │  leave_conversation  → socket.leave('conv_1_2')           │ │   │
│  │  │  send_message        → broadcast to room                  │ │   │
│  │  │  typing              → emit to other user                 │ │   │
│  │  │  stop_typing         → emit to other user                 │ │   │
│  │  │  mark_read           → emit to other user                 │ │   │
│  │  │  disconnect          → cleanup user rooms                 │ │   │
│  │  │                                                            │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  Room Management                                          │ │   │
│  │  │                                                            │ │   │
│  │  │  Rooms:                                                   │ │   │
│  │  │  • user_1           → User 1's personal room              │ │   │
│  │  │  • user_2           → User 2's personal room              │ │   │
│  │  │  • conv_1_2         → Conversation between User 1 & 2    │ │   │
│  │  │  • conv_3_5         → Conversation between User 3 & 5    │ │   │
│  │  │                                                            │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    REST API                                     │   │
│  │                                                                  │   │
│  │  POST /api/messages/send                                        │   │
│  │  ├─ Save message to database                                    │   │
│  │  └─ Emit socket event 'new_message' to room                     │   │
│  │                                                                  │   │
│  │  GET /api/messages/conversations                                │   │
│  │  └─ Fetch all conversations                                     │   │
│  │                                                                  │   │
│  │  GET /api/messages/conversations/:id                            │   │
│  │  └─ Fetch messages for conversation                             │   │
│  │                                                                  │   │
│  │  PUT /api/messages/conversations/:id/read                       │   │
│  │  ├─ Mark messages as read in database                           │   │
│  │  └─ Emit socket event 'message_read' to room                    │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL Database                          │   │
│  │                                                                  │   │
│  │  messages table:                                                │   │
│  │  ├─ message_id                                                  │   │
│  │  ├─ sender_id                                                   │   │
│  │  ├─ receiver_id                                                 │   │
│  │  ├─ message_text                                                │   │
│  │  ├─ message_type                                                │   │
│  │  ├─ is_read                                                     │   │
│  │  └─ created_at                                                  │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Message Flow Diagram

### Scenario: User A sends "Hello!" to User B

```
Step 1: User A types and clicks Send
│
├─► Frontend: CustomerMessagesPage
│   ├─ handleSendMessage() called
│   └─ API call: POST /api/messages/send
│
Step 2: Message saved to database
│
├─► Backend: Message Controller
│   ├─ Insert into messages table
│   ├─ Save successful
│   └─ Emit socket event
│
Step 3: Socket event emitted
│
├─► Socket.io Server
│   ├─ Event: 'new_message'
│   ├─ Target room: 'conv_1_2'
│   └─ Broadcast to all in room except sender
│
Step 4: User B receives message instantly
│
└─► Frontend: PhotographerMessagesPage
    ├─ Socket listener triggered
    ├─ handleNewMessage() called
    ├─ Update messages state
    ├─ UI re-renders
    └─ Message appears! ✨
```

---

## Data Flow: Complete Message Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE MESSAGE LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────────┘

1. USER TYPES MESSAGE
   ├─ User types in input field
   ├─ onChange triggers handleTyping()
   ├─ Socket emits 'typing' event
   └─ Other user sees "..." indicator

2. USER SENDS MESSAGE
   ├─ User clicks Send button
   ├─ handleSendMessage() called
   ├─ Stop typing indicator
   └─ API call initiated

3. HTTP REQUEST
   ├─ POST /api/messages/send
   ├─ Headers: Authorization: Bearer {JWT}
   ├─ Body: { conversationId, messageText, messageType }
   └─ Sent to backend

4. BACKEND PROCESSING
   ├─ Verify JWT token
   ├─ Extract user ID from token
   ├─ Validate conversation ID
   ├─ Insert message into database
   └─ Message saved with ID

5. SOCKET EMISSION
   ├─ Get conversation room: conv_1_2
   ├─ Emit 'new_message' event
   ├─ Data: { message, conversationId }
   └─ Sent to all in room except sender

6. RECIPIENT RECEIVES
   ├─ Socket listener 'new_message' triggered
   ├─ Check if current conversation matches
   ├─ Add message to messages array
   ├─ Update conversation list
   └─ Auto-scroll to bottom

7. READ RECEIPT
   ├─ Recipient opens conversation
   ├─ markAsRead() called
   ├─ PUT /api/messages/.../read
   ├─ Database updated: is_read = true
   ├─ Socket emits 'message_read'
   └─ Sender sees read status ✓✓

8. COMPLETE ✅
```

---

## Socket Event Flow

### Connection Flow

```
1. Page Load
   │
   ├─► useSocket hook initialized
   │   ├─ Get JWT token from localStorage
   │   └─ Call socketService.connect(token)
   │
   ├─► Socket.io client connects
   │   ├─ Handshake with auth: { token }
   │   └─ Connection established
   │
   ├─► Backend authentication
   │   ├─ Verify JWT token
   │   ├─ Extract userId
   │   └─ Attach to socket object
   │
   ├─► Join user room
   │   ├─ socket.join('user_{userId}')
   │   └─ Ready to receive personal events
   │
   └─► Connection complete ✅
       └─ Green "Connected" indicator shown
```

### Conversation Join Flow

```
1. User selects conversation
   │
   ├─► selectedConversation state updated
   │
   ├─► useEffect triggered
   │   ├─ Load messages from database
   │   └─ Mark messages as read
   │
   ├─► Socket join
   │   ├─ socketService.joinConversation(conversationId)
   │   ├─ Socket emits 'join_conversation'
   │   └─ Server: socket.join('conv_1_2')
   │
   ├─► Notify other user
   │   ├─ Socket emits 'user_online' to room
   │   └─ Other user sees online status
   │
   └─► Ready to receive messages ✅
       └─ Both users in same room
```

### Message Send Flow

```
1. User sends message
   │
   ├─► HTTP API call
   │   ├─ POST /api/messages/send
   │   ├─ Save to database
   │   └─ Return saved message
   │
   ├─► Backend emits socket event
   │   ├─ emitToConversation()
   │   ├─ Event: 'new_message'
   │   ├─ Target: conv_1_2
   │   └─ Data: { message, conversationId }
   │
   ├─► Sender's UI update (optimistic)
   │   ├─ Add message to local state
   │   ├─ Clear input field
   │   └─ Auto-scroll to bottom
   │
   └─► Receiver gets message instantly
       ├─ Socket listener triggered
       ├─ handleNewMessage() called
       ├─ Add to messages array
       ├─ Update UI (re-render)
       └─ Auto-scroll to bottom
```

---

## Room Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    SOCKET.IO ROOMS                           │
└─────────────────────────────────────────────────────────────┘

User Rooms (Personal):
├─ user_1
│  └─ Socket(s): [socket_abc123, socket_def456]  ← User 1 in 2 tabs
├─ user_2
│  └─ Socket(s): [socket_ghi789]                 ← User 2 in 1 tab
└─ user_3
   └─ Socket(s): [socket_jkl012]                 ← User 3 in 1 tab

Conversation Rooms (1-to-1):
├─ conv_1_2 (User 1 ↔ User 2)
│  └─ Socket(s): [socket_abc123, socket_def456, socket_ghi789]
│     └─ Events: new_message, typing, message_read
│
├─ conv_1_3 (User 1 ↔ User 3)
│  └─ Socket(s): [socket_abc123, socket_jkl012]
│     └─ Events: new_message, typing, message_read
│
└─ conv_2_3 (User 2 ↔ User 3)
   └─ Socket(s): [socket_ghi789, socket_jkl012]
      └─ Events: new_message, typing, message_read

Room Naming Convention:
├─ Personal: user_{userId}
│  Example: user_1, user_2, user_3
│
└─ Conversation: conv_{smallerId}_{largerId}
   Example: conv_1_2 (always smaller ID first)
   Ensures both users use same room name
```

---

## Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   TECHNOLOGY STACK                      │
└────────────────────────────────────────────────────────┘

Backend:
├─ Runtime: Node.js 18+
├─ Framework: Express.js
├─ Real-time: Socket.io 4.6.0
├─ Database: PostgreSQL 15+
├─ Authentication: JWT (jsonwebtoken)
└─ Security: Helmet, CORS

Frontend:
├─ Framework: React 18
├─ Language: TypeScript
├─ Build Tool: Vite
├─ Real-time: socket.io-client 4.6.0
├─ State: React Hooks (useState, useEffect, useRef)
└─ UI: Tailwind CSS + Shadcn UI

Communication:
├─ WebSocket: Primary transport
├─ HTTP Polling: Fallback transport
├─ HTTP/REST: Initial data load & persistence
└─ JSON: Data format

Security:
├─ JWT: Authentication tokens
├─ CORS: Cross-origin protection
├─ Room Validation: Authorization
└─ HTTPS: Production (recommended)
```

---

## Scalability Considerations

### Current Setup (Single Server)
```
┌──────────────┐
│  Node.js     │
│  Server      │
│              │
│  ├─ Express  │
│  ├─ Socket.io│
│  └─ PostgreSQL Connection │
└──────────────┘

Capacity: ~1,000 concurrent connections
```

### Future: Multi-Server Setup (With Redis)
```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Node.js     │       │  Node.js     │       │  Node.js     │
│  Server 1    │       │  Server 2    │       │  Server 3    │
│              │       │              │       │              │
│  ├─ Express  │       │  ├─ Express  │       │  ├─ Express  │
│  └─ Socket.io│       │  └─ Socket.io│       │  └─ Socket.io│
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Redis Adapter   │
                    │  (Pub/Sub Bridge) │
                    └───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    PostgreSQL     │
                    │     Database      │
                    └───────────────────┘

Capacity: 10,000+ concurrent connections
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: December 6, 2025  
**Status**: ✅ Production Ready













