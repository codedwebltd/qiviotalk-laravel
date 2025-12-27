# Livechat Mobile - Build Instructions

## 📱 Building APK for Android

### Quick Start

**On Windows:**
```bash
build-apk.cmd
```

**On Mac/Linux (Git Bash on Windows):**
```bash
./build-apk.sh
```

This script will:
1. Check if EAS CLI is installed (installs if needed)
2. Login to Expo (if not already logged in)
3. Build your Android APK in production mode
4. Provide you with a link to download the APK

### Manual Build (if script doesn't work)

```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile production
```

---

## 🎨 Temporary Icons (LT Logo)

### Current Status
✅ Temporary "LT" icons are installed and configured
- Professional gradient design (blue theme)
- All required formats generated (icon, splash, adaptive, monochrome)
- Located in: `assets/images/temp-icons/`

### Replacing with Final Logo

When your UI/UX designer provides the final logo:

1. **Delete the temporary icons:**
   ```bash
   rm -rf assets/images/temp-icons/
   ```

2. **Update `app.json`:**
   - Replace all paths pointing to `temp-icons/` with your new logo paths
   - Remove all `__COMMENT` fields
   - Look for these sections:
     - `"icon"` (line 8)
     - `"adaptiveIcon"` fields (lines 21-23)
     - `"favicon"` (line 33)
     - `"splash-screen" > "image"` (line 41)

3. **Example replacement:**
   ```json
   "icon": "./assets/images/logo.png",
   "adaptiveIcon": {
     "foregroundImage": "./assets/images/adaptive-foreground.png",
     "backgroundImage": "./assets/images/adaptive-background.png",
     "monochromeImage": "./assets/images/adaptive-monochrome.png"
   }
   ```

### Regenerating Temporary Icons

If you need to regenerate the temporary icons:

```bash
node scripts/generate-temp-icons.js
npm install sharp  # if not already installed
node scripts/convert-svg-to-png.js
```

---

## 🚫 Expo Splash Animation

The Expo splash animation has been **removed**.

- Implementation: `app/_layout.tsx:15` and `app/_layout.tsx:51-55`
- The app now uses your custom splash screen immediately
- No Expo branding or animation shown

---

## 📋 Build Profiles

### Preview (APK for testing)
```bash
eas build --platform android --profile preview
```

### Production (APK for distribution)
```bash
eas build --platform android --profile production
```

**Note:** Production profile is configured to build APK (not AAB) for easier testing. When ready for Play Store, change `eas.json` line 18 from `"apk"` to `"app-bundle"`.

---

## 🔧 Configuration Files

- **app.json** - App configuration and icon paths
- **eas.json** - Build profiles and settings
- **app/_layout.tsx** - Splash screen control
- **scripts/generate-temp-icons.js** - Temporary icon generator
- **scripts/convert-svg-to-png.js** - SVG to PNG converter

---

## ⚠️ Important Notes

1. **Temporary Icons:** All icons marked with `__COMMENT` in app.json are temporary
2. **APK vs AAB:** Currently building APK for testing. Change to AAB when submitting to Play Store
3. **Build Time:** Expo builds take 5-15 minutes. You'll receive an email when complete
4. **Testing:** Download the APK from Expo dashboard and install on Android device

---

## 🆘 Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### Build fails
- Check your internet connection
- Verify Expo account is in good standing
- Check build logs on Expo dashboard
- Ensure all dependencies in package.json are compatible

---

## 📞 Need Help?

Check Expo documentation: https://docs.expo.dev/build/setup/
