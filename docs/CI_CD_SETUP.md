# CI/CD Setup Guide for Nature Pharmacy Mobile

This guide explains how to configure GitHub Actions for automated iOS and Android builds.

## GitHub Secrets Required

### iOS Build Secrets

1. **IOS_CERTIFICATE_P12**
   - Base64 encoded .p12 certificate file
   - Generate: `base64 -i certificate.p12 | pbcopy`

2. **IOS_CERTIFICATE_PASSWORD**
   - Password for the .p12 certificate

3. **IOS_PROVISIONING_PROFILE**
   - Base64 encoded .mobileprovision file
   - Generate: `base64 -i profile.mobileprovision | pbcopy`

4. **IOS_PROVISIONING_PROFILE_NAME**
   - Name of the provisioning profile (e.g., "Nature Pharmacy Distribution")

5. **IOS_CODE_SIGN_IDENTITY**
   - Usually "Apple Distribution" or "iPhone Distribution"

6. **IOS_TEAM_ID**
   - Your Apple Developer Team ID (10 characters)

7. **APPLE_ID**
   - Your Apple ID email for App Store Connect upload

8. **APPLE_APP_SPECIFIC_PASSWORD**
   - App-specific password from appleid.apple.com

### Android Build Secrets

1. **ANDROID_KEYSTORE_BASE64**
   - Base64 encoded keystore file
   - Generate: `base64 -i release.keystore | pbcopy`

2. **ANDROID_KEYSTORE_PASSWORD**
   - Password for the keystore

3. **ANDROID_KEY_ALIAS**
   - Key alias in the keystore

4. **ANDROID_KEY_PASSWORD**
   - Password for the key

5. **GOOGLE_PLAY_SERVICE_ACCOUNT_JSON**
   - JSON key for Google Play Console API access
   - Create at: Google Cloud Console > Service Accounts

## iOS Certificate Setup

### 1. Create an App ID
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Certificates, Identifiers & Profiles > Identifiers
3. Click "+" and select "App IDs"
4. Bundle ID: `com.naturepharmacy.mobile`
5. Enable required capabilities (Push Notifications, etc.)

### 2. Create a Distribution Certificate
1. Certificates, Identifiers & Profiles > Certificates
2. Click "+" and select "Apple Distribution"
3. Follow the instructions to create a CSR
4. Download and install the certificate
5. Export as .p12 from Keychain Access

### 3. Create a Provisioning Profile
1. Certificates, Identifiers & Profiles > Profiles
2. Click "+" and select "App Store Connect"
3. Select your App ID
4. Select your Distribution Certificate
5. Download the .mobileprovision file

## Android Keystore Setup

### Create a Release Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias nature-pharmacy -keyalg RSA -keysize 2048 -validity 10000

# Follow prompts:
# - Keystore password
# - Key password
# - Certificate information
```

### Google Play Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use existing
3. Enable Google Play Android Developer API
4. Create a service account with JSON key
5. Go to [Google Play Console](https://play.google.com/console)
6. Setup > API access > Link the service account
7. Grant "Release Manager" permission

## Triggering Builds

### Manual Build
1. Go to GitHub repository > Actions
2. Select "Build iOS App" or "Build Android App"
3. Click "Run workflow"
4. Select build type (debug/release)

### Automatic Build
- Builds trigger automatically on push to `master` or `main`
- Tagged releases (v*) also upload to App Store Connect / Play Store

### Creating a Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

## Troubleshooting

### iOS Build Fails
- Check certificate expiration
- Verify provisioning profile matches bundle ID
- Ensure Team ID is correct

### Android Build Fails
- Verify keystore password
- Check key alias spelling
- Ensure gradle wrapper is executable

### Upload Fails
- iOS: Verify Apple ID and app-specific password
- Android: Check service account permissions

## Local Development

### iOS (requires Mac)
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

## App Store Submission Checklist

### iOS
- [ ] App screenshots (6.5", 5.5")
- [ ] App icon (1024x1024)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App description
- [ ] Keywords
- [ ] Age rating

### Android
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Screenshots
- [ ] App description
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
