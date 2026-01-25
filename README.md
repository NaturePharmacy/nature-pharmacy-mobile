# 🌿 Nature Pharmacy Mobile App

> Application mobile React Native pour Android et iOS - Marketplace de produits naturels et bio

[![React Native](https://img.shields.io/badge/React%20Native-0.76.6-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-98%25%20Complete-brightgreen.svg)](PROGRESS.md)

## 📱 Vue d'Ensemble

Nature Pharmacy est une application e-commerce mobile complète permettant aux utilisateurs de découvrir, acheter et suivre des produits naturels et bio. Elle connecte des vendeurs du monde entier avec des consommateurs soucieux de leur santé et de l'environnement.

### Fonctionnalités Principales

**Pour les Acheteurs:**
- 🛍️ Parcourir des milliers de produits naturels et bio
- 🔍 Recherche avancée avec filtres et suggestions
- 💳 Paiement sécurisé (Stripe)
- 📦 Suivi en temps réel des commandes
- ⭐ Avis et notes produits
- 🔔 Notifications personnalisées
- 💰 Programme de fidélité

**Pour les Vendeurs:**
- 📊 Dashboard de statistiques
- 📦 Gestion complète des produits (CRUD)
- 🛒 Gestion des commandes clients
- 💵 Suivi des revenus
- 📈 Métriques de performance

## 🏗️ Stack Technique

- **Framework**: React Native 0.76.6
- **Langage**: TypeScript 5.x
- **Navigation**: React Navigation 7
- **State Management**: Redux Toolkit
- **API Client**: Axios avec interceptors
- **Paiement**: Stripe React Native
- **Storage**: AsyncStorage
- **Animations**: React Native Animated API

## 📂 Structure du Projet

```
NaturePharmacyMobile/
├── src/
│   ├── components/       # Composants réutilisables
│   │   └── common/       # Composants de base (Button, Input, etc.)
│   ├── screens/          # Écrans de l'app
│   ├── navigation/       # Configuration navigation
│   ├── services/         # API services
│   │   ├── api.ts        # Configuration Axios ✅
│   │   ├── auth.service.ts      # Service authentification ✅
│   │   ├── product.service.ts   # Service produits ✅
│   │   └── order.service.ts     # Service commandes ✅
│   ├── store/            # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts    # Auth state ✅
│   │   │   └── cartSlice.ts    # Cart state ✅
│   │   └── store.ts            # Configuration store ✅
│   ├── hooks/            # Custom hooks
│   ├── utils/
│   │   └── constants.ts  # Constantes app ✅
│   ├── types/
│   │   └── index.ts      # TypeScript types ✅
│   └── assets/           # Images, icons, fonts
├── android/              # Configuration Android
├── ios/                  # Configuration iOS
├── App.tsx              # Point d'entrée
├── package.json         # Dépendances ✅
├── tsconfig.json        # Configuration TypeScript ✅
└── babel.config.js      # Configuration Babel ✅
```

## ✅ État d'Avancement: 98%

### 📊 Statistiques
- **67 fichiers** créés
- **~27,000 lignes** de code
- **21 écrans** fonctionnels
- **12 composants** réutilisables
- **6 hooks** personnalisés
- **4 services** API complets

### ✨ Fonctionnalités Complètes

#### Authentification (100%)
- ✅ Login avec validation
- ✅ Register avec rôle (buyer/seller)
- ✅ Forgot password flow
- ✅ JWT token management
- ✅ Session persistence

#### Navigation (100%)
- ✅ Stack Navigation
- ✅ Bottom Tab Navigation
- ✅ Auth flow automatique
- ✅ Deep linking ready

#### Écrans Acheteur (100%)
- ✅ Home avec produits featured
- ✅ Catégories avec filtres
- ✅ Recherche avec suggestions
- ✅ Détail produit avec gallery
- ✅ Panier avec coupon
- ✅ Checkout 3 étapes
- ✅ Paiement Stripe
- ✅ Confirmation commande
- ✅ Liste commandes avec filtres
- ✅ Suivi commande avec timeline

#### Écrans Vendeur (100%)
- ✅ Dashboard avec statistiques
- ✅ Gestion produits (CRUD)
- ✅ Gestion commandes clients
- ✅ Métriques de performance

#### Utilitaires (100%)
- ✅ Notifications système
- ✅ Settings multilingues (FR/EN/ES)
- ✅ Error handling global
- ✅ Animations (FadeIn, SlideIn, etc.)
- ✅ Loading states & skeletons

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Installation et démarrage rapide
- **[PROGRESS.md](PROGRESS.md)** - État d'avancement détaillé (67 fichiers)
- **[OPTIMIZATION_GUIDE.md](OPTIMIZATION_GUIDE.md)** - Guide d'optimisation des performances
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guide de tests complet
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Prochaines étapes (tests, build, publication)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- React Native CLI
- Xcode (pour iOS)
- Android Studio (pour Android)

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-username/NaturePharmacyMobile.git
cd NaturePharmacyMobile

# Installer les dépendances
npm install

# iOS seulement
cd ios && pod install && cd ..

# Créer .env
cp .env.example .env
# Éditer .env avec vos clés API

# Lancer l'app
npm run ios     # iOS
npm run android # Android
```

Voir [QUICKSTART.md](QUICKSTART.md) pour plus de détails.

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests E2E (à configurer)
npm run e2e:ios
npm run e2e:android
```

Voir [TESTING_GUIDE.md](TESTING_GUIDE.md) pour le guide complet.

## 📱 Screenshots

*Coming soon - Screenshots seront ajoutés avant la publication*

## 🤝 Contribution

Contributions, issues et feature requests sont les bienvenus !

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Équipe Nature Pharmacy** - *Développement initial*

## 🙏 Remerciements

- React Native Community
- Stripe pour le SDK de paiement
- Tous les contributeurs open-source

---

**Statut**: 🟢 98% Complété - Prêt pour les tests finaux

Pour plus d'informations, consultez [NEXT_STEPS.md](NEXT_STEPS.md)

## 🔧 Installation

### Prérequis

**Windows (Android uniquement):**
- Node.js 18+
- Android Studio
- JDK 11+

**macOS (iOS + Android):**
- Node.js 18+
- Xcode 14+
- CocoaPods
- Android Studio (optionnel pour Android)

### Setup

```bash
# 1. Cloner le repo
cd "c:\Users\pc\Nature Pharmacy\NaturePharmacyMobile"

# 2. Installer les dépendances
npm install

# 3. (iOS seulement) Installer pods
cd ios
pod install
cd ..

# 4. Configurer les variables d'environnement
# Créer .env à la racine
```

### Variables d'Environnement

Créer un fichier `.env` :

```env
API_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Lancer l'App

```bash
# Android
npm run android

# iOS (macOS uniquement)
npm run ios

# Metro bundler (si pas auto-lancé)
npm start
```

## 📱 Écrans Prévus

### Auth Flow
1. **Splash Screen** - Logo + Loading
2. **Onboarding** - Introduction (3 slides)
3. **Login** - Email/Password
4. **Register** - Nom/Email/Password/Rôle
5. **Forgot Password** - Reset par email

### Main Flow
1. **Home** - Featured, Categories, Promotions
2. **Categories** - Liste catégories
3. **Product List** - Grille produits avec filtres
4. **Product Detail** - Images, Description, Avis
5. **Search** - Recherche avec suggestions
6. **Cart** - Panier avec totaux
7. **Checkout** - Adresse + Paiement
8. **Order Confirmation** - Récapitulatif + Tracking

### Profile Flow
1. **Profile** - Infos utilisateur
2. **Edit Profile** - Modifier infos
3. **Orders** - Liste commandes
4. **Order Detail** - Détail + Tracking
5. **Settings** - Langue, Notifications, etc.

### Seller Flow (si role = seller)
1. **Seller Dashboard** - Stats ventes
2. **My Products** - Gestion produits
3. **Add/Edit Product** - Formulaire produit
4. **Orders Management** - Commandes à traiter
5. **Earnings** - Statistiques revenus

## 🎨 Design System

### Couleurs

Reprend les couleurs du site web :
- **Primary**: #10B981 (Green)
- **Secondary**: #6366F1 (Indigo)
- **Accent**: #F59E0B (Amber)
- **Background**: #FFFFFF
- **Surface**: #F9FAFB

### Typographie

- **Headings**: System Bold (700)
- **Body**: System Regular (400)
- **Caption**: System Regular (400), 14px

### Spacing

Échelle : 4, 8, 16, 24, 32, 48px

## 🔌 API Backend

L'app consomme les API du backend Next.js existant :

- **Base URL Dev**: http://localhost:3000/api
- **Base URL Prod**: https://votre-domaine.com/api

Toutes les routes API sont déjà implémentées côté backend !

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec coverage
npm test -- --coverage

# Tests en mode watch
npm test -- --watch
```

## 📦 Build Production

### Android

```bash
# Générer APK
cd android
./gradlew assembleRelease

# Générer AAB (pour Play Store)
./gradlew bundleRelease

# Fichiers générés dans:
# android/app/build/outputs/apk/release/app-release.apk
# android/app/build/outputs/bundle/release/app-release.aab
```

### iOS

```bash
# Ouvrir dans Xcode
open ios/NaturePharmacyMobile.xcworkspace

# Puis:
# 1. Sélectionner Generic iOS Device
# 2. Product → Archive
# 3. Distribute App → App Store Connect
```

## 📚 Documentation Complète

Voir: `docs/MOBILE_DEVELOPMENT_PLAN.md`

## 🤝 Contribution

1. Créer une branche feature
2. Commits avec messages clairs
3. Tests avant push
4. Pull request pour review

## 📄 Licence

MIT

---

## 🚀 Quick Start

```bash
# Installation rapide
cd "c:\Users\pc\Nature Pharmacy\NaturePharmacyMobile"
npm install

# Lancer Android
npm run android

# Lancer iOS (macOS seulement)
npm run ios
```

---

**Développé avec ❤️ pour Nature Pharmacy**
