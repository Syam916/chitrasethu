# 🐛 Debug Real-Time Chat Issues

## ✅ Backend Status: RUNNING
- Server: http://localhost:5000
- WebSocket: ws://localhost:5000
- Socket.io: Initialized ✅

## ⚠️ Issue: Socket Not Connecting

### Problem Identified
Your frontend is running on **port 8080** but trying to connect to Socket.io at localhost:5000.

### Why It's Not Working
1. **No green "Connected" indicator** - Socket connection failing
2. **No typing indicators** - WebSocket events not received
3. **No read receipts** - Real-time features disabled
4. **Messages don't appear instantly** - Polling database instead of WebSocket

---

## 🔍 Step-by-Step Debug

### Step 1: Open Browser Console (F12)

1. Open your app: http://localhost:8080
2. Press `F12` → Go to **Console** tab
3. Look for these messages:

**✅ GOOD (Should see):**
```
🔌 Connecting to Socket.io server: http://localhost:5000
✅ Socket connected: abc123xyz
👥 User 123 joined conversation: conv_1_2
```

**❌ BAD (Currently seeing):**
```
❌ Socket connection error: ...
Failed to connect to http://localhost:5000
CORS error
Network error
```

### Step 2: Check Network Tab

1. F12 → **Network** tab
2. Filter: **WS** (WebSocket)
3. Look for: `socket.io/?EIO=4&transport=websocket`

**✅ Should show:**
- Status: 101 Switching Protocols (Green)
- Type: websocket
- Messages flowing

**❌ Currently shows:**
- No WebSocket connection
- Or: Failed / Red status

### Step 3: Check CORS

Open console and run:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend reachable:', data))
  .catch(err => console.error('❌ Cannot reach backend:', err))
```

---

## 🔧 Fixes to Try

### Fix 1: Verify Frontend URL

1. **Check what URL your frontend is using:**
   - Open browser: Look at address bar
   - Is it `localhost:8080` or `localhost:5173`?

2. **Update Socket Configuration if needed**

If you're on **localhost:8080**, the socket should auto-detect correctly.

### Fix 2: Check Browser Console for Auth Errors

Run in console:
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// If no token, you're not logged in!
```

**If no token:**
- You need to login first
- Socket requires JWT authentication
- Won't connect without valid token

### Fix 3: Hard Refresh

1. Press `Ctrl + Shift + R` (hard refresh)
2. Clear cache: `Ctrl + Shift + Delete`
3. Reload page

### Fix 4: Check CORS Settings

Backend CORS should include port 8080. Let me check...

**File:** `backend/src/server.js`

Should have:
```javascript
cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',  // ← Your frontend port
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
})
```

**File:** `backend/src/config/socket.js`

Should have:
```javascript
cors: {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',  // ← Your frontend port
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}
```

---

## 🎯 Quick Test Steps

### 1. Verify Backend is Running
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"success","message":"Server is running"}
```

### 2. Verify Frontend Can Reach Backend

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('API works:', d))
.catch(e => console.error('API error:', e))
```

### 3. Test Socket Connection Manually

In browser console:
```javascript
const { io } = await import('https://cdn.socket.io/4.6.0/socket.io.esm.min.js');
const token = localStorage.getItem('token');
const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => console.log('✅ Socket connected!'));
socket.on('connect_error', (err) => console.error('❌ Connection error:', err));
```

---

## 🔍 Expected Console Output

When working correctly, you should see:

```
🔌 Connecting to Socket.io server: http://localhost:5000
✅ Socket connected: _abc123xyz
👥 User 1 joined conversation: conv_1_2
📨 New message received: {message: {...}, conversationId: "conv_1_2"}
```

---

## 🐛 Common Issues

### Issue 1: "Socket is undefined"

**Cause:** useSocket hook not initialized
**Fix:** Component must use `useSocket()` hook

### Issue 2: "Authentication error"

**Cause:** No JWT token or expired token
**Fix:** Login again to get fresh token

### Issue 3: "CORS error"

**Cause:** Frontend port not in CORS whitelist
**Fix:** Add your port to backend CORS config

### Issue 4: "Connection refused"

**Cause:** Backend not running
**Fix:** Start backend: `cd backend && npm run dev`

### Issue 5: "Port 5000 already in use"

**Cause:** Another process using port 5000
**Fix:**
```bash
netstat -ano | findstr :5000
taskkill /F /PID [PID_NUMBER]
```

---

## ✅ Checklist Before Testing

- [ ] Backend running on port 5000
- [ ] Frontend running on port 8080
- [ ] Logged in (JWT token exists)
- [ ] Browser console open (F12)
- [ ] Network tab open to see WebSocket
- [ ] Two browser windows/tabs open
- [ ] Different users in each window

---

## 🎯 What Should Happen

### Scenario: User A sends "Hello"

1. **User A types "Hello"**
   - Console: "Emitting typing event"
   - User B sees: "..." typing indicator

2. **User A clicks Send**
   - Message saves to database
   - Socket emits to conv_1_2 room
   - User B console: "📨 New message received"
   - User B UI: Message appears instantly

3. **User B opens conversation**
   - Mark as read API called
   - Socket emits read receipt
   - User A console: "✅ Message read"
   - User A UI: Read indicator updates

---

## 🔧 Emergency Fix

If nothing works, restart everything:

```bash
# Kill all processes
taskkill /F /IM node.exe

# Delete caches
cd frontend
Remove-Item -Recurse -Force node_modules/.vite

# Restart backend
cd ../backend
npm run dev

# In new terminal, restart frontend
cd ../frontend
npm run dev
```

---

## 📞 Next Steps

1. **Check browser console** - Look for connection errors
2. **Check Network tab** - Verify WebSocket connection
3. **Verify JWT token** - Make sure you're logged in
4. **Test with curl** - Verify backend is reachable
5. **Check CORS** - Ensure port 8080 is allowed

Let me know what errors you see in the console!










