# Guide d'Optimisation - Nature Pharmacy Mobile

## 📱 Optimisations des Performances

### 1. Images

#### Utiliser des images optimisées
```typescript
// ❌ Mauvais - Image non optimisée
<Image source={{ uri: 'https://example.com/large-image.jpg' }} />

// ✅ Bon - Image optimisée avec resize
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
/>
```

#### Formats recommandés
- **WebP** pour les images (50% plus léger que JPEG)
- **SVG** pour les icônes
- **PNG** uniquement pour les images avec transparence

#### Compression
- Utiliser des outils comme **TinyPNG** ou **ImageOptim**
- Qualité JPEG : 80-85% (bon compromis qualité/taille)
- Créer plusieurs tailles (@1x, @2x, @3x)

### 2. Listes et FlatList

#### Optimiser FlatList
```typescript
// ✅ Optimisations recommandées
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item.id}

  // Performance optimizations
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}

  // Avoid re-renders
  getItemLayout={(data, index) => (
    { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
  )}
/>
```

#### Utiliser memo pour les items
```typescript
import React, { memo } from 'react';

const ProductItem = memo(({ product, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{product.name}</Text>
  </TouchableOpacity>
));
```

### 3. State Management

#### Éviter les re-renders inutiles
```typescript
// ❌ Mauvais - Recréation de fonction à chaque render
const handlePress = () => {
  console.log('pressed');
};

// ✅ Bon - useCallback pour mémoriser
const handlePress = useCallback(() => {
  console.log('pressed');
}, []);
```

#### Utiliser useMemo pour les calculs coûteux
```typescript
// ✅ Mémoriser les calculs
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);
```

### 4. Navigation

#### Lazy Loading des écrans
```typescript
// Charger les écrans à la demande
const HomeScreen = lazy(() => import('./screens/Home/HomeScreen'));
const ProductDetailScreen = lazy(() => import('./screens/Product/ProductDetailScreen'));
```

#### Précharger les écrans fréquents
```typescript
// Dans App.tsx
useEffect(() => {
  // Précharger les écrans importants
  navigation.preload('ProductDetail');
  navigation.preload('Cart');
}, []);
```

### 5. API & Data Fetching

#### Pagination
```typescript
// ✅ Charger les données par page
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!loading && hasMore) {
    const data = await fetchProducts({ page: page + 1 });
    setProducts([...products, ...data]);
    setPage(page + 1);
    setHasMore(data.length > 0);
  }
};
```

#### Caching
```typescript
// Utiliser AsyncStorage pour le cache
const getCachedData = async (key: string) => {
  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache valide 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  return null;
};
```

### 6. Bundle Size

#### Analyser le bundle
```bash
# Analyser la taille du bundle
npx react-native-bundle-visualizer
```

#### Lazy imports
```typescript
// ❌ Import complet
import * as Icons from 'react-native-vector-icons';

// ✅ Import spécifique
import Icon from 'react-native-vector-icons/MaterialIcons';
```

### 7. Animations

#### Utiliser useNativeDriver
```typescript
// ✅ Animations natives (60 FPS)
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // IMPORTANT
}).start();
```

#### Éviter les animations sur layout
```typescript
// ❌ Mauvais - Animations CPU-intensive
transform: [{ translateX }] // ✅ Bon
width: animatedValue        // ❌ Mauvais
```

---

## 🚀 Optimisations Avancées

### 1. Code Splitting

Diviser le code en chunks plus petits :

```typescript
// Dynamic imports
const SellerDashboard = React.lazy(() =>
  import('./screens/Seller/SellerDashboardScreen')
);
```

### 2. Hermes Engine

Activer Hermes pour de meilleures performances :

```javascript
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,
]
```

**Avantages :**
- 50% plus rapide au démarrage
- 30% moins de mémoire
- Bundle 40% plus petit

### 3. ProGuard (Android)

Minifier le code Android :

```gradle
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4. Profiling

#### React DevTools Profiler
```bash
npm install -g react-devtools
react-devtools
```

#### Flipper
- Installer Flipper Desktop
- Profiler les performances
- Détecter les memory leaks

---

## 📊 Métriques de Performance

### Objectifs

| Métrique | Objectif | Critique |
|----------|----------|----------|
| TTI (Time to Interactive) | < 3s | < 5s |
| FPS (Animations) | 60 FPS | > 45 FPS |
| Bundle Size (JS) | < 5 MB | < 8 MB |
| Memory Usage | < 150 MB | < 250 MB |
| API Response Time | < 500ms | < 1s |

### Mesurer les performances

```typescript
// Mesurer le temps de chargement
const start = performance.now();
await fetchData();
const end = performance.now();
console.log(`Fetch took ${end - start}ms`);
```

---

## 🔧 Checklist d'Optimisation

### Avant le Build Production

- [ ] Images optimisées (WebP, compression)
- [ ] Supprimer console.log en production
- [ ] Activer ProGuard (Android)
- [ ] Activer Hermes Engine
- [ ] Minifier le code JavaScript
- [ ] Supprimer les dépendances inutilisées
- [ ] Tester sur des appareils low-end
- [ ] Profiler avec Flipper
- [ ] Analyser le bundle size
- [ ] Vérifier les memory leaks

### Cache Strategy

```typescript
// Stratégie de cache recommandée
const CACHE_DURATION = {
  PRODUCTS: 5 * 60 * 1000,      // 5 minutes
  CATEGORIES: 30 * 60 * 1000,   // 30 minutes
  USER_PROFILE: 15 * 60 * 1000, // 15 minutes
  STATIC_CONTENT: 24 * 60 * 60 * 1000, // 24 heures
};
```

---

## 📱 Optimisations Spécifiques

### iOS

```objective-c
// ios/Podfile
# Activer Hermes
use_react_native!(
  :hermes_enabled => true
)

# Optimiser les builds
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_COMPILATION_MODE'] = 'wholemodule'
    end
  end
end
```

### Android

```gradle
// android/app/build.gradle
android {
    buildTypes {
        release {
            // Optimisations
            minifyEnabled true
            shrinkResources true

            // Splits APK par architecture
            ndk {
                abiFilters "armeabi-v7a", "arm64-v8a"
            }
        }
    }
}
```

---

## 🐛 Debugging Performance Issues

### Identifier les problèmes

1. **FPS Drops** → Animations trop complexes
2. **Slow Renders** → Trop de re-renders
3. **Memory Leaks** → Event listeners non nettoyés
4. **Large Bundle** → Imports inutiles

### Outils

- **React DevTools Profiler** - Identifier les re-renders
- **Flipper** - Profiling complet
- **Android Studio Profiler** - CPU, Memory, Network
- **Xcode Instruments** - Performance iOS

---

## 📚 Ressources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Hermes Engine](https://hermesengine.dev/)
- [Flipper](https://fbflipper.com/)
- [React DevTools](https://react-devtools-tutorial.vercel.app/)

---

**Dernière mise à jour :** Janvier 2026
