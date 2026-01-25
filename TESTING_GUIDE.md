# Guide de Tests - Nature Pharmacy Mobile

## 📋 Vue d'ensemble

Ce guide couvre tous les tests nécessaires avant le déploiement de l'application mobile Nature Pharmacy.

---

## 🧪 Types de Tests

### 1. Tests Fonctionnels Manuels
### 2. Tests d'Intégration
### 3. Tests de Performance
### 4. Tests de Compatibilité
### 5. Tests de Sécurité

---

## ✅ Checklist de Tests Fonctionnels

### 📱 Authentification (3 écrans)

#### LoginScreen
- [ ] Validation email (format correct)
- [ ] Validation password (minimum 6 caractères)
- [ ] Message d'erreur si credentials invalides
- [ ] Redirection vers Home après login réussi
- [ ] Bouton "Mot de passe oublié" fonctionne
- [ ] Bouton "S'inscrire" fonctionne
- [ ] Loading state pendant l'authentification
- [ ] Token sauvegardé dans AsyncStorage

#### RegisterScreen
- [ ] Validation nom (requis)
- [ ] Validation email (format)
- [ ] Validation password (minimum 6 caractères)
- [ ] Validation password confirmation (match)
- [ ] Validation téléphone (format)
- [ ] Sélection du rôle (buyer/seller)
- [ ] Message d'erreur si email existe déjà
- [ ] Redirection vers Login après inscription réussie
- [ ] Loading state pendant l'inscription

#### ForgotPasswordScreen
- [ ] Validation email (format)
- [ ] Message de succès affiché
- [ ] Email de reset envoyé
- [ ] Retour au Login fonctionne

---

### 🏠 Écrans Principaux (4 écrans)

#### HomeScreen
- [ ] Featured products affichés (4 produits)
- [ ] Recent products affichés (6 produits)
- [ ] Search bar fonctionne
- [ ] Navigation vers ProductDetail au clic
- [ ] Pull to refresh fonctionne
- [ ] Loading state pendant le chargement
- [ ] Empty state si aucun produit

#### CategoriesScreen
- [ ] Toutes les catégories affichées
- [ ] Filtres fonctionnent (All, Bio, New, Popular)
- [ ] Pagination fonctionne (Load more)
- [ ] Navigation vers ProductList au clic
- [ ] Pull to refresh fonctionne

#### CartScreen
- [ ] Liste des items du panier
- [ ] Quantité modifiable (+/-)
- [ ] Suppression d'item fonctionne
- [ ] Subtotal calculé correctement
- [ ] Code promo applicable
- [ ] Discount calculé correctement
- [ ] Total calculé correctement
- [ ] Bouton Checkout fonctionne
- [ ] Empty state si panier vide

#### ProfileScreen
- [ ] Nom et email affichés
- [ ] Navigation vers Orders
- [ ] Navigation vers Settings
- [ ] Bouton Logout fonctionne
- [ ] Section Seller visible si role=seller
- [ ] Navigation Seller Dashboard fonctionne

---

### 🛍️ Écrans Produits (3 écrans)

#### ProductDetailScreen
- [ ] Images gallery fonctionne (swipe)
- [ ] Thumbnails fonctionnent
- [ ] Prix affiché correctement
- [ ] Stock affiché
- [ ] Description complète
- [ ] Reviews affichées
- [ ] Seller info affichée
- [ ] Quantity selector fonctionne
- [ ] Bouton Add to Cart fonctionne
- [ ] Alert si stock insuffisant
- [ ] Navigation vers Seller profile

#### ProductListScreen
- [ ] Produits affichés en grille
- [ ] Filtres modal fonctionne
- [ ] Filtres appliqués (category, price, bio, stock)
- [ ] Tri fonctionne (5 options)
- [ ] Pagination (Load more)
- [ ] Pull to refresh
- [ ] Navigation vers ProductDetail

#### SearchScreen
- [ ] Search input fonctionne
- [ ] Debounce 500ms appliqué
- [ ] Suggestions affichées
- [ ] Historique sauvegardé
- [ ] Recherches populaires affichées
- [ ] Catégories affichées
- [ ] Navigation vers résultats
- [ ] Clear history fonctionne

---

### 💳 Checkout Flow (4 écrans)

#### CheckoutScreen
- [ ] 3 steps affichés (Cart → Address → Payment)
- [ ] Step indicator fonctionne
- [ ] Order summary correct
- [ ] Delivery options affichés
- [ ] Navigation entre steps
- [ ] Validation avant next step
- [ ] Back navigation fonctionne

#### AddressScreen
- [ ] Formulaire validation fonctionne
- [ ] Téléphone 10 chiffres requis
- [ ] Code postal 5 chiffres requis
- [ ] Checkbox "default address"
- [ ] Sauvegarde adresse
- [ ] Retour au checkout avec adresse

#### PaymentScreen
- [ ] Stripe CardField affiché
- [ ] Instructions mode test affichées
- [ ] Checkbox "save card"
- [ ] Payment processing (loading)
- [ ] Succès → OrderConfirmation
- [ ] Erreur → Message d'erreur
- [ ] Test card: 4242 4242 4242 4242

#### OrderConfirmationScreen
- [ ] Message de succès
- [ ] Order number affiché
- [ ] Tracking info affichée
- [ ] Estimated delivery affichée
- [ ] Items list affichée
- [ ] Payment summary correcte
- [ ] Share order fonctionne
- [ ] Continue shopping → Home

---

### 📦 Order Management (2 écrans)

#### OrdersListScreen
- [ ] Toutes les commandes affichées
- [ ] Filtres par statut fonctionnent (6 filtres)
- [ ] Order cards affichées
- [ ] Status badge correct
- [ ] Total affiché
- [ ] Tracking number si disponible
- [ ] Navigation vers OrderDetail
- [ ] Pull to refresh

#### OrderDetailScreen
- [ ] Tracking timeline affiché (4 étapes)
- [ ] Current step highlighted
- [ ] Order info complète
- [ ] Items list affichée
- [ ] Payment summary correcte
- [ ] Shipping address affichée
- [ ] Bouton Cancel Order (si pending)
- [ ] Bouton Contact Support
- [ ] Bouton Reorder
- [ ] Share order fonctionne

---

### 👨‍💼 Seller Features (3 écrans)

#### SellerDashboardScreen
- [ ] Stats cards affichées (4 cards)
- [ ] Period filter fonctionne (Week/Month/Year)
- [ ] Quick actions fonctionnent
- [ ] Recent orders affichées
- [ ] Performance metrics affichées
- [ ] Progress bars animées
- [ ] Pull to refresh

#### SellerProductsScreen
- [ ] Produits vendeur affichés
- [ ] Filtres fonctionnent (All/Active/Draft/Out of stock)
- [ ] Product cards affichées
- [ ] Actions Edit/View/Delete fonctionnent
- [ ] FAB Add product fonctionne
- [ ] Delete avec confirmation
- [ ] Empty state si aucun produit
- [ ] Pull to refresh

#### SellerOrdersScreen
- [ ] Commandes à traiter affichées
- [ ] Filtres par statut fonctionnent
- [ ] Customer info affichée
- [ ] Items preview affichée
- [ ] Shipping address affichée
- [ ] Actions Accept/Ship/Deliver fonctionnent
- [ ] Badge pending orders count
- [ ] Pull to refresh

---

### 🔔 Écrans Utilitaires (2 écrans)

#### NotificationsScreen
- [ ] Toutes les notifications affichées
- [ ] Badge unread count correct
- [ ] Filtres All/Unread fonctionnent
- [ ] Types notification (4 types)
- [ ] Mark as read fonctionne
- [ ] Mark all as read fonctionne
- [ ] Delete notification fonctionne
- [ ] Clear all avec confirmation
- [ ] Navigation vers action (ex: order)
- [ ] Pull to refresh

#### SettingsScreen
- [ ] Toutes les sections affichées
- [ ] Profile info affichée
- [ ] Notification toggles fonctionnent
- [ ] Language selector fonctionne (FR/EN/ES)
- [ ] Currency selector fonctionne (EUR/USD/XOF)
- [ ] Privacy toggles fonctionnent
- [ ] Liens légaux fonctionnent
- [ ] Support navigation fonctionne
- [ ] Clear cache avec confirmation
- [ ] Delete account avec confirmation
- [ ] Logout avec confirmation
- [ ] Settings sauvegardées (AsyncStorage)

---

## 🎣 Tests des Hooks

### useAuth
```typescript
// Test login
const { login, isAuthenticated } = useAuth();
await login({ email: 'test@test.com', password: '123456' });
expect(isAuthenticated).toBe(true);

// Test logout
logout();
expect(isAuthenticated).toBe(false);
```

### useCart
```typescript
const { addToCart, total, itemCount } = useCart();
addToCart(product, 2);
expect(itemCount).toBe(2);
expect(total).toBeGreaterThan(0);
```

### useDebounce
```typescript
const [value, setValue] = useState('');
const debouncedValue = useDebounce(value, 500);
// Wait 500ms
expect(debouncedValue).toBe(value);
```

---

## 🔐 Tests de Sécurité

### AsyncStorage
- [ ] Token chiffré
- [ ] Pas de données sensibles en clair
- [ ] Clear storage au logout

### API Calls
- [ ] Headers Authorization présents
- [ ] HTTPS uniquement
- [ ] Timeout configuré
- [ ] Retry logic

### Input Validation
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] File upload validation

---

## 📱 Tests de Compatibilité

### iOS
- [ ] iPhone SE (petit écran)
- [ ] iPhone 14 Pro
- [ ] iPhone 14 Pro Max
- [ ] iPad
- [ ] iOS 15+

### Android
- [ ] Galaxy S21 (petit écran)
- [ ] Pixel 6
- [ ] Galaxy Tab
- [ ] Android 11+

### Orientations
- [ ] Portrait
- [ ] Landscape (si applicable)

---

## ⚡ Tests de Performance

### Métriques
- [ ] Time to Interactive < 3s
- [ ] FPS animations > 55 FPS
- [ ] Memory usage < 150 MB
- [ ] Bundle size < 5 MB
- [ ] API response < 500ms

### Optimisations
- [ ] Images optimisées (WebP)
- [ ] FlatList avec initialNumToRender
- [ ] useCallback/useMemo utilisés
- [ ] Animations useNativeDriver
- [ ] AsyncStorage cache efficace

---

## 🌐 Tests Réseau

### Offline Mode
- [ ] Message "No connection" affiché
- [ ] Retry button fonctionne
- [ ] Données en cache affichées

### Slow Connection
- [ ] Loading states affichés
- [ ] Timeout après 30s
- [ ] Retry automatique (max 3x)

### Error Handling
- [ ] 401 → Redirect login
- [ ] 404 → Message "Not found"
- [ ] 500 → Message "Server error"
- [ ] Network error → Message offline

---

## 🐛 Tests de Régression

Après chaque modification, tester:

1. **Flow complet achat**
   - Login → Browse → Add to cart → Checkout → Payment → Confirmation

2. **Flow vendeur**
   - Login seller → Dashboard → Add product → Manage orders

3. **Navigation**
   - Toutes les transitions entre écrans
   - Back navigation
   - Deep linking

---

## 🚀 Tests Pré-Production

### Checklist Finale

- [ ] Toutes les fonctionnalités testées
- [ ] Aucun console.log en production
- [ ] Version number correcte
- [ ] API endpoint production configuré
- [ ] Stripe clés LIVE
- [ ] Google Analytics configuré
- [ ] Crashlytics/Sentry configuré
- [ ] Push notifications testées
- [ ] Deep links testés
- [ ] Store screenshots prêts
- [ ] Privacy policy URL configurée
- [ ] Terms of service URL configurée

### Build Test

```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
cd ios && xcodebuild -workspace NaturePharmacy.xcworkspace \
  -scheme NaturePharmacy -configuration Release
```

### APK/IPA Test
- [ ] Installer sur device physique
- [ ] Tester flow complet
- [ ] Vérifier taille APK/IPA
- [ ] Pas de crash au lancement
- [ ] Toutes les permissions demandées

---

## 📊 Rapport de Tests

### Template

```markdown
# Test Report - [Date]

## Environment
- OS: iOS 17.2 / Android 13
- Device: iPhone 14 Pro / Pixel 6
- App Version: 1.0.0

## Tests Executed
- Total: 150
- Passed: 145
- Failed: 5
- Skipped: 0

## Issues Found
1. [BUG-001] Cart total incorrect avec coupon
   - Severity: High
   - Status: Fixed

2. [BUG-002] Notifications badge ne se met pas à jour
   - Severity: Medium
   - Status: In Progress

## Recommendations
- Ajouter tests automatisés pour le panier
- Améliorer error handling sur SearchScreen
```

---

## 🛠️ Outils Recommandés

### Testing Libraries
```bash
# Jest + React Testing Library
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# E2E Testing
npm install --save-dev detox
```

### Performance
- **Flipper** - Debugging & profiling
- **React DevTools** - Component profiling
- **Android Studio Profiler** - Memory, CPU, Network
- **Xcode Instruments** - Performance analysis

### Manual Testing
- **TestFlight** (iOS) - Beta testing
- **Google Play Internal Testing** - Beta testing
- **BrowserStack** - Multi-device testing

---

## 📚 Ressources

- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Detox E2E Testing](https://wix.github.io/Detox/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)

---

**Dernière mise à jour :** Janvier 2026
