/**
 * OptimizedImage Component
 * High-performance image component with caching and placeholder support
 * Uses react-native-fast-image when available, falls back to Image
 */

import React, { useState, useCallback, memo } from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  View,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../utils/constants';

// Try to import FastImage, fall back to regular Image if not available
let FastImage: typeof Image | null = null;
try {
  FastImage = require('react-native-fast-image').default;
} catch {
  // FastImage not installed, will use regular Image
}

export type ImagePriority = 'low' | 'normal' | 'high';
export type ImageResizeMode = 'contain' | 'cover' | 'stretch' | 'center';
export type ImageCache = 'immutable' | 'web' | 'cacheOnly';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  priority?: ImagePriority;
  cache?: ImageCache;
  fallbackSource?: number;
  showPlaceholder?: boolean;
  placeholderColor?: string;
  showLoadingIndicator?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  testID?: string;
}

const OptimizedImageComponent: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  resizeMode = 'cover',
  priority = 'normal',
  cache = 'immutable',
  fallbackSource,
  showPlaceholder = true,
  placeholderColor = COLORS.surface,
  showLoadingIndicator = true,
  onLoad,
  onError,
  testID,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Determine the actual source to use
  const actualSource = hasError && fallbackSource ? fallbackSource : source;

  // If FastImage is available and source is a URI, use it
  if (FastImage && typeof actualSource === 'object' && 'uri' in actualSource) {
    const fastImagePriority = {
      low: (FastImage as any).priority?.low,
      normal: (FastImage as any).priority?.normal,
      high: (FastImage as any).priority?.high,
    }[priority];

    const fastImageCache = {
      immutable: (FastImage as any).cacheControl?.immutable,
      web: (FastImage as any).cacheControl?.web,
      cacheOnly: (FastImage as any).cacheControl?.cacheOnly,
    }[cache];

    const fastImageResizeMode = {
      contain: (FastImage as any).resizeMode?.contain,
      cover: (FastImage as any).resizeMode?.cover,
      stretch: (FastImage as any).resizeMode?.stretch,
      center: (FastImage as any).resizeMode?.center,
    }[resizeMode];

    return (
      <View style={[styles.container, containerStyle]}>
        {showPlaceholder && isLoading && (
          <View style={[styles.placeholder, { backgroundColor: placeholderColor }, style as ViewStyle]}>
            {showLoadingIndicator && (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}
          </View>
        )}
        <FastImage
          source={{
            uri: actualSource.uri,
            priority: fastImagePriority,
            cache: fastImageCache,
          }}
          style={style}
          resizeMode={fastImageResizeMode}
          onLoad={handleLoad}
          onError={handleError}
          testID={testID}
        />
      </View>
    );
  }

  // Fall back to regular Image component
  return (
    <View style={[styles.container, containerStyle]}>
      {showPlaceholder && isLoading && (
        <View style={[styles.placeholder, { backgroundColor: placeholderColor }, style as ViewStyle]}>
          {showLoadingIndicator && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>
      )}
      <Image
        source={actualSource}
        style={style}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export const OptimizedImage = memo(OptimizedImageComponent);
