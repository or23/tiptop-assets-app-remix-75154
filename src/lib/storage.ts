/**
 * Secure localStorage abstraction with TTL and error handling
 */

interface StorageItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

class SecureStorage {
  private prefix = 'tiptop_';

  /**
   * Set item with optional TTL (time to live in milliseconds)
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Get item with automatic TTL checking
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return defaultValue ?? null;

      const item: StorageItem<T> = JSON.parse(itemStr);

      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return defaultValue ?? null;
      }

      return item.value;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue ?? null;
    }
  }

  /**
   * Remove item
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all items with prefix
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Check if item exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    try {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (key.startsWith(this.prefix)) {
          size += localStorage[key].length + key.length;
        }
      }
      return size;
    } catch (error) {
      console.error('Storage size error:', error);
      return 0;
    }
  }
}

export const storage = new SecureStorage();
