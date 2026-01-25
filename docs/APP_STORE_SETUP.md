# Configuration App Store & Play Store

## Prérequis

### 1. Générer les dossiers natifs
```bash
cd NaturePharmacyMobile
npx react-native eject
# ou
npx expo prebuild
```

---

## iOS - App Store

### Icônes requises (AppIcon.appiconset)
Créer les icônes dans `ios/NaturePharmacyMobile/Images.xcassets/AppIcon.appiconset/`:

| Taille | Fichier | Usage |
|--------|---------|-------|
| 20x20 | icon-20.png | iPad Notifications |
| 40x40 | icon-20@2x.png | iPhone/iPad Notifications @2x |
| 60x60 | icon-20@3x.png | iPhone Notifications @3x |
| 29x29 | icon-29.png | iPad Settings |
| 58x58 | icon-29@2x.png | iPhone/iPad Settings @2x |
| 87x87 | icon-29@3x.png | iPhone Settings @3x |
| 40x40 | icon-40.png | iPad Spotlight |
| 80x80 | icon-40@2x.png | iPhone/iPad Spotlight @2x |
| 120x120 | icon-40@3x.png | iPhone Spotlight @3x |
| 60x60 | icon-60.png | iPhone App (legacy) |
| 120x120 | icon-60@2x.png | iPhone App @2x |
| 180x180 | icon-60@3x.png | iPhone App @3x |
| 76x76 | icon-76.png | iPad App |
| 152x152 | icon-76@2x.png | iPad App @2x |
| 167x167 | icon-83.5@2x.png | iPad Pro App |
| 1024x1024 | icon-1024.png | App Store |

### Splash Screen (LaunchScreen)
1. Ouvrir `ios/NaturePharmacyMobile.xcworkspace` dans Xcode
2. Aller dans `LaunchScreen.storyboard`
3. Personnaliser avec le logo Nature Pharmacy

### Configuration Info.plist
```xml
<key>CFBundleDisplayName</key>
<string>Nature Pharmacy</string>
<key>CFBundleName</key>
<string>NaturePharmacy</string>
<key>CFBundleIdentifier</key>
<string>com.naturepharmacy.app</string>
```

### Certificats & Provisioning
1. Créer un App ID sur developer.apple.com
2. Générer certificat Distribution
3. Créer Provisioning Profile App Store
4. Configurer dans Xcode > Signing & Capabilities

---

## Android - Play Store

### Icônes adaptatives
Créer dans `android/app/src/main/res/`:

```
mipmap-mdpi/
  ic_launcher.png (48x48)
  ic_launcher_round.png (48x48)
  ic_launcher_foreground.png (108x108)

mipmap-hdpi/
  ic_launcher.png (72x72)
  ic_launcher_round.png (72x72)
  ic_launcher_foreground.png (162x162)

mipmap-xhdpi/
  ic_launcher.png (96x96)
  ic_launcher_round.png (96x96)
  ic_launcher_foreground.png (216x216)

mipmap-xxhdpi/
  ic_launcher.png (144x144)
  ic_launcher_round.png (144x144)
  ic_launcher_foreground.png (324x324)

mipmap-xxxhdpi/
  ic_launcher.png (192x192)
  ic_launcher_round.png (192x192)
  ic_launcher_foreground.png (432x432)
```

### ic_launcher.xml (Adaptive Icon)
```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

### Splash Screen
Créer `android/app/src/main/res/drawable/launch_screen.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_bg"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/splash_logo"/>
    </item>
</layer-list>
```

### Keystore Production
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore naturepharmacy-release.keystore \
  -alias naturepharmacy \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

### gradle.properties
```properties
MYAPP_RELEASE_STORE_FILE=naturepharmacy-release.keystore
MYAPP_RELEASE_KEY_ALIAS=naturepharmacy
MYAPP_RELEASE_STORE_PASSWORD=****
MYAPP_RELEASE_KEY_PASSWORD=****
```

---

## Screenshots requis

### iOS App Store
- iPhone 6.7" (1290 x 2796) - obligatoire
- iPhone 6.5" (1284 x 2778)
- iPhone 5.5" (1242 x 2208) - obligatoire
- iPad Pro 12.9" (2048 x 2732) - si iPad supporté

### Google Play Store
- Phone (1080 x 1920 minimum)
- 7" Tablet (1200 x 1920)
- 10" Tablet (1600 x 2560)

---

## Descriptions

### Courte (80 caractères)
**FR:** Produits naturels & bio - Plantes médicinales, huiles essentielles
**EN:** Natural & organic products - Medicinal plants, essential oils
**ES:** Productos naturales y orgánicos - Plantas medicinales, aceites

### Longue
Voir fichiers de traduction dans `locales/`

---

## Checklist pré-soumission

### iOS
- [ ] Icônes toutes tailles
- [ ] Splash screen
- [ ] Screenshots iPhone/iPad
- [ ] Description localisée (FR, EN, ES)
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Catégorie: Health & Fitness ou Shopping
- [ ] Age Rating: 4+
- [ ] TestFlight beta test

### Android
- [ ] Icônes adaptatives
- [ ] Splash screen
- [ ] Feature graphic (1024x500)
- [ ] Screenshots phone/tablet
- [ ] Description localisée
- [ ] Privacy Policy URL
- [ ] Catégorie: Shopping ou Health & Fitness
- [ ] Content rating questionnaire
- [ ] Internal testing track
