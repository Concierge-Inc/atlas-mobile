# TestFlight Deployment Guide for ATLAS Mobile

## Current App Information
- **App Name**: AtlasMobile
- **Bundle ID**: org.reactjs.native.example.AtlasMobile
- **Version**: 1.0
- **Build Number**: 1

---

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Enroll at: https://developer.apple.com/programs/enroll/

2. **Xcode** (already installed)
   - Version 14.0 or later

3. **Valid Certificate & Provisioning Profile**

---

## Step-by-Step Guide

### 1. Update Bundle Identifier (Important!)

Before publishing, you need to change from the default React Native bundle ID to your own:

1. Open Xcode:
   ```bash
   cd /Users/betulcalik/Projects/atlas-mobile/ios
   open AtlasMobile.xcworkspace
   ```

2. In Xcode:
   - Select **AtlasMobile** project in the left sidebar
   - Select **AtlasMobile** target
   - Go to **Signing & Capabilities** tab
   - Change **Bundle Identifier** from:
     ```
     org.reactjs.native.example.AtlasMobile
     ```
     To something like:
     ```
     com.yourcompany.atlas
     ```
     (Replace `yourcompany` with your company/name)

### 2. Set Up Signing

In the **Signing & Capabilities** tab:

1. Check **Automatically manage signing**
2. Select your **Team** (your Apple Developer account)
3. Xcode will automatically create certificates and provisioning profiles

### 3. Configure App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: ATLAS Mobile (or your preferred name)
   - **Primary Language**: English
   - **Bundle ID**: Select the one you created (com.yourcompany.atlas)
   - **SKU**: Can be same as bundle ID
   - **User Access**: Full Access

### 4. Update App Icon (Required for App Store)

You need to add app icons. Place icon files in:
```
ios/AtlasMobile/Images.xcassets/AppIcon.appiconset/
```

Required sizes:
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 167x167 (iPad Pro)
- 152x152 (iPad @2x)
- 76x76 (iPad)

### 5. Build for Archive

1. In Xcode, select device: **Any iOS Device (arm64)**
2. Menu: **Product** → **Archive**
3. Wait for build to complete (5-10 minutes)

### 6. Upload to App Store Connect

1. When archive completes, **Organizer** window opens
2. Select your archive
3. Click **Distribute App**
4. Choose **App Store Connect**
5. Click **Upload**
6. Choose **Automatically manage signing**
7. Click **Upload**

### 7. TestFlight Setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Go to **TestFlight** tab
4. Wait for build to process (10-30 minutes)
5. Once processed, add build to **External Testing** or **Internal Testing**

### 8. Add Testers

**Internal Testing** (up to 100 testers, no review):
- Go to **TestFlight** → **Internal Testing**
- Create a group
- Add testers by email

**External Testing** (up to 10,000 testers, requires review):
- Go to **TestFlight** → **External Testing**
- Create a group
- Add test information (What to test, etc.)
- Submit for review
- Add testers by email or public link

---

## Quick Command Reference

### Build Release Version from Terminal

```bash
# Navigate to iOS directory
cd /Users/betulcalik/Projects/atlas-mobile/ios

# Clean build
xcodebuild clean -workspace AtlasMobile.xcworkspace -scheme AtlasMobile

# Archive for App Store
xcodebuild archive \
  -workspace AtlasMobile.xcworkspace \
  -scheme AtlasMobile \
  -archivePath ./build/AtlasMobile.xcarchive \
  -configuration Release
```

### Export Archive (after building)

```bash
xcodebuild -exportArchive \
  -archivePath ./build/AtlasMobile.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist
```

---

## Important Configuration Updates Needed

### 1. Update Bundle Identifier
Currently using default: `org.reactjs.native.example.AtlasMobile`
Change to: `com.yourcompany.atlas` (or similar)

### 2. App Privacy Information (Required for TestFlight)
You need to add privacy descriptions for permissions you're using.

Add these to `ios/AtlasMobile/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>ATLAS needs camera access for document verification.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>ATLAS needs photo library access to attach images.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>ATLAS uses your location to provide real-time tracking during active missions.</string>

<key>NSFaceIDUsageDescription</key>
<string>ATLAS uses Face ID for secure authentication.</string>
```

### 3. App Icon
You must add an App Icon before submitting to TestFlight.

### 4. Privacy Policy URL (Required for External Testing)
You'll need to provide a privacy policy URL in App Store Connect.

---

## Common Issues & Solutions

### Issue: "No signing certificate found"
**Solution**: In Xcode Preferences → Accounts, add your Apple ID and download certificates.

### Issue: "Bundle identifier already in use"
**Solution**: Choose a unique bundle identifier. Check availability in your Apple Developer account.

### Issue: "Missing App Icon"
**Solution**: Add all required icon sizes to `Images.xcassets/AppIcon.appiconset/`

### Issue: "Missing compliance information"
**Solution**: In App Store Connect, answer export compliance questions (usually "No" for standard apps).

---

## Next Steps After Upload

1. **Wait for Processing** (10-30 minutes)
2. **Add Test Information** in TestFlight
3. **Invite Testers** via email
4. **Testers Install** via TestFlight app
5. **Collect Feedback** and iterate

---

## Resources

- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Developer Portal](https://developer.apple.com/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [React Native Publishing Guide](https://reactnative.dev/docs/publishing-to-app-store)

---

## Quick Checklist

- [ ] Apple Developer Account enrolled
- [ ] Bundle identifier updated to unique ID
- [ ] Team selected in Xcode signing
- [ ] App icon added (all sizes)
- [ ] Privacy descriptions added to Info.plist
- [ ] App created in App Store Connect
- [ ] Archive built successfully
- [ ] Upload to App Store Connect completed
- [ ] Build processed in TestFlight
- [ ] Testers invited
- [ ] Privacy policy URL provided (for external testing)

---

**Need Help?** The most common first-time issue is signing. Make sure:
1. You're logged into your Apple ID in Xcode (Preferences → Accounts)
2. Your bundle ID is unique and registered in your developer account
3. "Automatically manage signing" is checked
