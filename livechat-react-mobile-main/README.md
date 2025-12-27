# LiveChat Mobile App

React Native mobile application for live chat support.

## Build Commands

### PlayStore Production Build
```bash
eas build --platform android --profile production
```

### iOS App Store Build
```bash
eas build --platform ios --profile production
```

### Preview Build (Android)
```bash
eas build --platform android --profile preview
```

### Preview Build (iOS)
```bash
eas build --platform ios --profile preview
```

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npx expo start
```

### Run on Android
```bash
npx expo run:android
```

### Run on iOS
```bash
npx expo run:ios
```

Done! Here's what I fixed:

  ✅ Dashboard Balance Card Fixed

  - Changed icon to proper wallet icon (credit card design)
  - Fixed text overflow: added flex: 1, marginRight: 8 and numberOfLines={1}
  - Changed label from "Refund Balance" to "Wallet Balance"

  ✅ Version Check Fixed

  - Expo Go issue: Version check now skips in Expo Go/dev mode (that's why you didn't see the dialog)
  - Added versionCode: 1 to app.json android section
  - Version check reads versionCode from manifest in production builds
  - In production APK, it will:
    - Send version_code: 1 (from app.json)
    - Get response with update_available: true, is_mandatory: true
    - Show dialog with changelog
    - Block app if mandatory update

  📦 Ready for Production Build

  Your eas.json is already configured for APK builds. When you push to GitHub and run:

  eas build --platform android --profile production

  The built APK will have:
  - Version: 1.0.0
  - Version Code: 1
  - Package: com.codedwebltd.livechatmobile
  - Version check will work properly (not in Expo Go)

  Your server is set up to return version 2.0.0 as mandatory, so version 1.0.0 APK will show the update dialog on
  first launch!