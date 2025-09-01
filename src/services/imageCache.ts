import React from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedImage {
  uri: string;
  timestamp: number;
  expiresAt: number;
}

class ImageCacheService {
  private cache: Map<string, CachedImage> = new Map();
  private readonly CACHE_KEY = 'image_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.loadCache();
  }

  private async loadCache() {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        this.cache = new Map(Object.entries(cacheData));
      }
    } catch (error) {
      console.warn('Failed to load image cache:', error);
    }
  }

  private async saveCache() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save image cache:', error);
    }
  }

  private isExpired(cachedImage: CachedImage): boolean {
    return Date.now() > cachedImage.expiresAt;
  }

  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, cachedImage] of this.cache.entries()) {
      if (this.isExpired(cachedImage)) {
        this.cache.delete(key);
      }
    }
    this.saveCache();
  }

  async preloadImage(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Image.prefetch(uri)
        .then(() => {
          const cachedImage: CachedImage = {
            uri,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.CACHE_DURATION,
          };
          this.cache.set(uri, cachedImage);
          this.saveCache();
          resolve();
        })
        .catch(reject);
    });
  }

  async getCachedImage(uri: string): Promise<string | null> {
    const cachedImage = this.cache.get(uri);

    if (cachedImage && !this.isExpired(cachedImage)) {
      return cachedImage.uri;
    }

    // If not cached or expired, try to preload
    try {
      await this.preloadImage(uri);
      return uri;
    } catch {
      return null;
    }
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(this.CACHE_KEY);
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // Periodic cleanup
  startCleanupInterval() {
    setInterval(() => {
      this.cleanExpiredCache();
    }, 60 * 60 * 1000); // Clean every hour
  }
}

export const imageCache = new ImageCacheService();

// React Native optimized Image component with caching
export const CachedImage = ({ source, ...props }: any) => {
  const [cachedUri, setCachedUri] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadImage = async () => {
      if (typeof source === 'object' && source.uri) {
        const cached = await imageCache.getCachedImage(source.uri);
        setCachedUri(cached);
      } else {
        setCachedUri(source);
      }
      setLoading(false);
    };

    loadImage();
  }, [source]);

  if (loading) {
    return null; // Or return a loading placeholder
  }

  return (
    <Image
      {...props}
      source={cachedUri ? { uri: cachedUri } : source}
    />
  );
};
