# 🔧 Fix Vite Permission Error (EPERM)

## ❌ Error You're Seeing

```
error when starting dev server:
Error: EPERM: operation not permitted, rmdir '...\node_modules\.vite\deps'
```

**Cause:** Windows/OneDrive file locking preventing Vite from cleaning its cache directory.

---

## ✅ **Solution 1: Delete Vite Cache Manually** (Quick Fix)

### Step 1: Close all terminals/IDEs that might have Vite running

### Step 2: Delete the cache folder manually

```powershell
# In PowerShell, navigate to frontend folder and run:
cd frontend
Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
```

**Or use File Explorer:**
1. Go to: `frontend/node_modules/.vite`
2. Right-click → Delete
3. If it says "file in use", close any running processes and try again

### Step 3: Try starting again

```bash
npm run dev
```

---

## ✅ **Solution 2: Configure Vite Cache Location** (Permanent Fix)

This moves Vite's cache outside OneDrive to avoid sync issues.

### Update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import os from "os";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Fix: Move cache outside OneDrive
  cacheDir: path.resolve(os.tmpdir(), '.vite-cache'),
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

---

## ✅ **Solution 3: Exclude from OneDrive Sync** (Recommended)

### Step 1: Open OneDrive Settings

1. Right-click OneDrive icon in system tray
2. Click "Settings"
3. Go to "Sync and backup" tab
4. Click "Advanced settings"

### Step 2: Add Exclusion

1. Click "Files On-Demand"
2. Or go to "Choose folders" and uncheck problematic folders

### Step 3: Exclude Node Modules (Better Solution)

Add these to OneDrive exclusions:
- `node_modules/`
- `.vite/`
- `dist/`
- `.git/`

---

## ✅ **Solution 4: Run as Administrator** (Temporary Fix)

```powershell
# Right-click PowerShell/CMD → Run as Administrator
cd frontend
npm run dev
```

---

## 🎯 **Quick Fix Now (Copy & Paste)**

Run these commands in PowerShell:

```powershell
cd "C:\Users\puttu\OneDrive - Vardaan Cyber Security Pvt Ltd\Desktop\chitrasethu\chitrasethu\frontend"

# Kill any node processes
taskkill /F /IM node.exe 2>$null

# Delete Vite cache
Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue

# Start again
npm run dev
```

---

## 🔍 **Why This Happens**

1. **OneDrive Sync**: OneDrive locks files while syncing
2. **File Handles**: Another process is using the files
3. **Windows Permissions**: Insufficient permissions to delete folder
4. **Antivirus**: Some antivirus software locks files

---

## ✅ **Best Long-Term Solution**

**Option A**: Move project outside OneDrive
```
C:\Projects\chitrasethu\  (instead of OneDrive)
```

**Option B**: Configure Vite to use temp directory (Solution 2 above)

**Option C**: Exclude node_modules from OneDrive sync

---

## 🐛 **Still Not Working?**

### Try this PowerShell script:

```powershell
# Complete cleanup and restart
cd frontend

# Stop all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Delete cache
Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Reinstall dependencies (if needed)
# npm install

# Start dev server
npm run dev
```

---

## ✅ **Verification**

After applying a fix, you should see:

```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Not:**
```
Error: EPERM: operation not permitted
```

---

**Try Solution 1 first (quickest), then Solution 2 (permanent)!** 🚀













