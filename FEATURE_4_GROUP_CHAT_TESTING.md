# Feature 4: Group Chat Integration - Testing Guide

## Overview
This feature adds real-time group chat functionality to community groups. Members can send messages, see message history, and receive real-time updates via Socket.IO.

## Files Modified/Created
1. **Backend:**
   - `backend/src/controllers/group.controller.js` - Added `getGroupMessages` and `sendGroupMessage`
   - `backend/src/routes/group.routes.js` - Added message routes
   - `backend/src/config/socket.js` - Added group message Socket.IO handlers

2. **Frontend:**
   - `frontend/src/services/group.service.ts` - Added group message methods
   - `frontend/src/config/api.ts` - Added group message endpoints
   - `frontend/src/components/groups/GroupChat.tsx` - New chat component
   - `frontend/src/pages/photographer/GroupDetailPage.tsx` - Integrated chat with tabs

## Testing Steps

### Test 1: Basic Chat Functionality
1. **Navigate to Group Detail Page**
   - Log in as a photographer
   - Go to `/photographer/community-buzz`
   - Click on a group you're a member of (or join one)
   - Click "Open Chat" or go to the "Chat" tab

2. **Verify Chat UI**
   - Chat component should load
   - Should show "Group Chat" header
   - Should have a message input area at the bottom
   - Should have a scrollable messages area (500px height)

3. **Send a Message**
   - Type a message in the input field
   - Press Enter or click the Send button
   - Verify:
     - Message appears in the chat immediately
     - Message shows on the right side (your messages)
     - Your avatar and name are displayed
     - Timestamp is shown

4. **Message History**
   - Refresh the page
   - Verify that previous messages are loaded
   - Messages should be in chronological order (oldest first)
   - Should scroll to the bottom automatically

### Test 2: Real-time Messaging (Multi-user)
1. **Open Two Browser Windows/Tabs**
   - Window 1: Log in as User A (member of a group)
   - Window 2: Log in as User B (member of the same group)

2. **Send Message from User A**
   - In Window 1, send a message
   - Verify in Window 2:
     - Message appears automatically (without refresh)
     - Message shows on the left side (other user's messages)
     - Other user's avatar and name are displayed
     - Timestamp is correct

3. **Send Message from User B**
   - In Window 2, send a reply
   - Verify in Window 1:
     - Reply appears automatically
     - Messages are in correct order

4. **Multiple Messages**
   - Send several messages from both users
   - Verify:
     - All messages appear in both windows
     - Messages are in correct chronological order
     - No duplicate messages

### Test 3: Typing Indicators
1. **Start Typing**
   - In Window 1, start typing a message (don't send)
   - Verify in Window 2:
     - Typing indicator appears (animated dots)
     - Shows after a short delay
     - Disappears after 3 seconds of inactivity

2. **Stop Typing**
   - In Window 1, stop typing for 2+ seconds
   - Verify in Window 2:
     - Typing indicator disappears

3. **Send Message**
   - In Window 1, finish typing and send
   - Verify in Window 2:
     - Typing indicator disappears
     - Message appears

### Test 4: Non-Member Access
1. **View as Non-Member**
   - Log in as a user who is NOT a member of a group
   - Navigate to that group's detail page
   - Go to Chat tab

2. **Verify Restriction**
   - Should see "Join to Chat" message
   - Should NOT see message input
   - Should NOT see message history
   - Should show helpful message about joining

3. **Join and Chat**
   - Click "Join Group" button
   - After joining, go to Chat tab
   - Verify chat is now accessible

### Test 5: Socket Connection States
1. **Connected State**
   - When Socket.IO is connected:
     - Chat should work normally
     - No connection warnings

2. **Disconnected State**
   - Disconnect internet or stop backend
   - Verify:
     - "Reconnecting to chat..." message appears
     - Send button is disabled
     - Input field shows disabled state

3. **Reconnection**
   - Reconnect internet/backend
   - Verify:
     - Connection message disappears
     - Chat functionality resumes
     - Messages can be sent again

### Test 6: Message Formatting
1. **Text Messages**
   - Send plain text messages
   - Verify they display correctly
   - Long messages should wrap properly

2. **Special Characters**
   - Send messages with:
     - Emojis 😀
     - Special characters: !@#$%^&*()
     - Line breaks (Enter key)
   - Verify all display correctly

3. **Message Timestamps**
   - Send messages at different times
   - Verify timestamps:
     - Today: Shows time only (HH:mm)
     - This week: Shows day and time (EEE HH:mm)
     - Older: Shows date and time (MMM d, HH:mm)

### Test 7: Error Handling
1. **Network Error**
   - Disconnect internet
   - Try to send a message
   - Verify:
     - Error toast appears
     - Message text is restored to input
     - Can retry after reconnecting

2. **Invalid Group**
   - Try to access chat for a non-existent group
   - Verify appropriate error message

3. **Permission Error**
   - Try to send message when not a member (if possible)
   - Verify appropriate error message

### Test 8: UI/UX
1. **Responsive Design**
   - Test on different screen sizes
   - Verify chat adapts to screen width
   - Messages should not overflow

2. **Scrolling**
   - Send many messages (20+)
   - Verify:
     - Scrollbar appears when needed
     - Auto-scrolls to bottom on new messages
     - Can manually scroll up to see history

3. **Loading States**
   - When loading messages:
     - Shows loading spinner
     - Shows "Loading messages..." text
   - When sending:
     - Send button shows spinner
     - Button is disabled

4. **Empty State**
   - In a group with no messages:
     - Shows "No messages yet. Start the conversation!"
     - Message input is still available

### Test 9: Performance
1. **Many Messages**
   - Load a group with 50+ messages
   - Verify:
     - Messages load efficiently
     - No lag when scrolling
     - Real-time updates still work

2. **Rapid Messages**
   - Send multiple messages quickly
   - Verify:
     - All messages are sent
     - No duplicates
     - Order is correct

### Test 10: Integration with Group Detail Page
1. **Tab Navigation**
   - Verify tabs work correctly:
     - "Group Info" tab shows group information
     - "Chat" tab shows chat component
     - "Members" tab shows member list

2. **Tab Switching**
   - Switch between tabs
   - Verify:
     - Chat state is preserved
     - Socket connection remains active
     - Messages continue to update

3. **Open Chat Button**
   - Click "Open Chat" button in header
   - Verify it switches to Chat tab

## Expected Behavior

### Chat Component
- ✅ Loads message history on mount
- ✅ Joins Socket.IO room for real-time updates
- ✅ Displays messages with sender info
- ✅ Shows own messages on right, others on left
- ✅ Auto-scrolls to bottom
- ✅ Handles typing indicators
- ✅ Shows connection status
- ✅ Prevents non-members from chatting

### Real-time Updates
- ✅ New messages appear instantly
- ✅ Typing indicators work
- ✅ Multiple users can chat simultaneously
- ✅ No duplicate messages
- ✅ Correct message ordering

### Error Handling
- ✅ Network errors show toast
- ✅ Permission errors are handled
- ✅ Connection states are indicated
- ✅ Graceful degradation when disconnected

## Edge Cases to Test
1. **Very Long Messages**: Send messages with 500+ characters
2. **Special Characters**: Test with various Unicode characters
3. **Rapid Typing**: Type and send messages very quickly
4. **Multiple Tabs**: Open same group chat in multiple tabs
5. **Browser Refresh**: Refresh page while in chat
6. **Tab Switching**: Switch tabs rapidly while messages are coming in
7. **Connection Loss**: Test behavior when connection drops mid-message

## Notes
- Chat requires Socket.IO connection
- Only group members can access chat
- Messages are stored in the `messages` table with `group_id`
- Real-time updates use Socket.IO rooms (`group_${groupId}`)
- Typing indicators timeout after 3 seconds
- Message history loads last 50 messages by default

## Success Criteria
✅ Users can send and receive messages in real-time
✅ Message history loads correctly
✅ Typing indicators work
✅ Non-members are restricted
✅ Connection states are handled
✅ UI is responsive and user-friendly
✅ Error handling works correctly
✅ Integration with Group Detail Page works smoothly


