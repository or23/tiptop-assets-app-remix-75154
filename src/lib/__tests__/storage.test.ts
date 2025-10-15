import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../storage';

describe('SecureStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should set and get item', () => {
    const key = 'testKey';
    const value = { name: 'Test', count: 42 };

    storage.set(key, value);
    const retrieved = storage.get(key);

    expect(retrieved).toEqual(value);
  });

  it('should respect TTL', async () => {
    const key = 'expiring';
    const value = 'test';
    const ttl = 100; // 100ms

    storage.set(key, value, ttl);
    expect(storage.get(key)).toBe(value);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(storage.get(key)).toBeNull();
  });

  it('should return default value when key not found', () => {
    const defaultValue = 'default';
    const result = storage.get('nonexistent', defaultValue);

    expect(result).toBe(defaultValue);
  });

  it('should remove item', () => {
    storage.set('test', 'value');
    expect(storage.has('test')).toBe(true);

    storage.remove('test');
    expect(storage.has('test')).toBe(false);
  });

  it('should clear all prefixed items', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    localStorage.setItem('other_key', 'value'); // Non-prefixed item

    storage.clear();

    expect(storage.get('key1')).toBeNull();
    expect(storage.get('key2')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('value');
  });

  it('should list all keys', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');

    const keys = storage.keys();

    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys.length).toBe(2);
  });
});
