# How to Change the Favicon (Tab Logo)

## Quick Steps

1. **Prepare your logo image:**
   - Format: `.ico` (recommended) or `.png`
   - Size: 32x32 pixels or 16x16 pixels (or multiple sizes)
   - Location: `frontend/public/favicon.ico`

2. **Replace the file:**
   - Delete or rename the existing `frontend/public/favicon.ico`
   - Place your new favicon file as `frontend/public/favicon.ico`

3. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or clear browser cache

## Creating a Favicon from Your Logo

### Option 1: Online Tools (Easiest)
1. Go to [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Upload your logo/image
3. Download the generated `favicon.ico`
4. Replace `frontend/public/favicon.ico` with the downloaded file

### Option 2: Convert PNG to ICO
1. Use [convertio.co](https://convertio.co/png-ico/) or similar tool
2. Upload your PNG logo
3. Download as `.ico` format
4. Replace `frontend/public/favicon.ico`

### Option 3: Using ImageMagick (Command Line)
```bash
convert your-logo.png -resize 32x32 favicon.ico
```

## Recommended Favicon Sizes

For best compatibility, create favicons in multiple sizes:
- 16x16 pixels (standard)
- 32x32 pixels (standard)
- 48x48 pixels (Windows)
- 64x64 pixels (Windows)

## Advanced: Multiple Favicon Formats

If you want to support multiple formats, you can add these to `index.html`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

## Testing

After replacing the favicon:
1. Stop your dev server (if running)
2. Restart: `npm run dev`
3. Hard refresh browser: `Ctrl + Shift + R`
4. Check the browser tab - you should see your new logo!

## Notes

- The favicon is already linked in `index.html` as `/favicon.ico`
- Files in the `public` folder are served from the root URL
- After deployment, the favicon will automatically be available


