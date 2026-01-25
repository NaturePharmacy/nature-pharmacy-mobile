# 🚀 Quick Start - Nature Pharmacy Mobile

Guide rapide pour démarrer le développement de l'application mobile.

## ⚡ Installation Express (5 minutes)

### 1. Prérequis

**Windows (Android seulement):**
```bash
# Vérifier Node.js
node --version  # doit être 18+

# Installer Android Studio
# Télécharger: https://developer.android.com/studio
```

**macOS (iOS + Android):**
```bash
# Vérifier Node.js
node --version  # doit être 18+

# Installer Xcode (App Store)
# Installer CocoaPods
sudo gem install cocoapods
```

### 2. Installation

```bash
# Aller dans le dossier mobile
cd "c:\Users\pc\Nature Pharmacy\NaturePharmacyMobile"

# Installer les dépendances
npm install

# iOS seulement : installer pods
cd ios && pod install && cd ..
```

### 3. Créer fichier .env

Créer `.env` à la racine :

```env
API_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
```

### 4. Lancer l'App

```bash
# Android
npm run android

# iOS (macOS seulement)
npm run ios
```

**C'est tout ! L'app devrait se lancer sur l'émulateur. 🎉**

---

## 📝 Prochaines Étapes Recommandées

### Étape 1 : Créer les composants de base (1 jour)

**Fichiers à créer :**
```
src/components/common/
├── Input.tsx        # Composant Input (email, password, etc.)
├── Card.tsx         # Composant Card générique
├── Loading.tsx      # Spinner et skeleton loaders
└── Badge.tsx        # Badge (statuts, compteurs)
```

**Exemple Input.tsx :**
```typescript
import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@utils/constants';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={COLORS.text.disabled}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});

export default Input;
```

### Étape 2 : Configurer la navigation (0.5 jour)

**Fichier à créer :**
```
src/navigation/
├── AppNavigator.tsx       # Navigation principale
├── AuthNavigator.tsx      # Stack Auth (Login, Register)
└── MainNavigator.tsx      # Tabs (Home, Cart, Profile)
```

**Exemple AppNavigator.tsx :**
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector } from '@store/store';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### Étape 3 : Créer l'écran Login (0.5 jour)

**Fichier à créer :**
```
src/screens/Auth/LoginScreen.tsx
```

**Exemple basique :**
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppDispatch } from '@store/store';
import { login } from '@store/slices/authSlice';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { COLORS, SPACING } from '@utils/constants';

const LoginScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await dispatch(login({ email, password })).unwrap();
      // Navigation handled by AppNavigator
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="votre@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <Button
          title="Se connecter"
          onPress={handleLogin}
          loading={loading}
          fullWidth
        />

        <Button
          title="Créer un compte"
          variant="text"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
});

export default LoginScreen;
```

### Étape 4 : Créer l'écran Home (0.5 jour)

**Fichier à créer :**
```
src/screens/Home/HomeScreen.tsx
```

**Features à implémenter :**
- Featured products carousel
- Categories grid
- Product grid
- Pull to refresh

### Étape 5 : Créer Product Card (0.5 jour)

**Fichier à créer :**
```
src/components/product/ProductCard.tsx
```

**Features :**
- Image produit
- Nom et prix
- Rating stars
- Bouton "Ajouter au panier"
- Badge si promo/organic

---

## 🎯 Objectifs par Semaine

### Semaine 1 : Foundation
- [x] Setup projet ✅ FAIT
- [ ] Composants de base (Input, Card, Loading)
- [ ] Navigation (Stack + Tabs)
- [ ] Login Screen
- [ ] Register Screen

### Semaine 2 : Produits
- [ ] Home Screen (layout)
- [ ] ProductCard component
- [ ] ProductGrid component
- [ ] Product List Screen
- [ ] Product Detail Screen

### Semaine 3 : Cart & Checkout
- [ ] Cart Screen
- [ ] Checkout Screen (sans paiement)
- [ ] Order Confirmation
- [ ] Profile Screen

### Semaine 4 : Paiement
- [ ] Intégration Stripe
- [ ] Payment Screen
- [ ] Order tracking

### Semaine 5-6 : Polish & Tests
- [ ] Animations
- [ ] Error handling
- [ ] Loading states
- [ ] Tests
- [ ] Build Android/iOS

---

## 🛠️ Outils Utiles

### Debugging

```bash
# React Native Debugger
npm install -g react-native-debugger

# Flipper (recommandé)
# Télécharger: https://fbflipper.com/

# Logs
# Android
adb logcat | grep ReactNative

# iOS
react-native log-ios
```

### Émulateurs

**Android:**
```bash
# Lister les émulateurs
emulator -list-avds

# Lancer un émulateur
emulator -avd Pixel_5_API_33
```

**iOS:**
```bash
# Lister les simulateurs
xcrun simctl list devices

# Lancer un simulateur
open -a Simulator
```

### Hot Reload

- **Fast Refresh** : Automatique quand vous sauvegardez
- **Reload manuel** : Double-tap R (Android) ou Cmd+R (iOS)
- **Dev Menu** : Secouer le device ou Cmd+D (iOS) / Cmd+M (Android)

---

## 📚 Ressources

### Documentation
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Native Paper](https://reactnativepaper.com/)

### Tutoriels Vidéo
- [React Native Crash Course](https://www.youtube.com/results?search_query=react+native+tutorial+2024)
- [E-commerce App Tutorial](https://www.youtube.com/results?search_query=react+native+ecommerce)

### Communauté
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Reddit r/reactnative](https://reddit.com/r/reactnative)
- [Discord React Native](https://discord.com/invite/reactiflux)

---

## 🐛 Problèmes Courants

### "Metro bundler not running"
```bash
npm start -- --reset-cache
```

### "Build failed - Android"
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### "Pod install failed - iOS"
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

---

## ✅ Checklist Démarrage

Avant de coder, vérifier :

- [ ] Node.js 18+ installé
- [ ] Android Studio configuré (Windows/macOS)
- [ ] Xcode installé (macOS seulement)
- [ ] Dépendances npm installées
- [ ] Pods installés (iOS)
- [ ] .env configuré
- [ ] Backend API running (`npm run dev` dans le projet web)
- [ ] Émulateur lancé
- [ ] App lancée avec `npm run android/ios`

---

**Prêt à coder ! 🚀**

Questions ? Consulter le [README.md](./README.md) ou [MOBILE_DEVELOPMENT_PLAN.md](../docs/MOBILE_DEVELOPMENT_PLAN.md)
