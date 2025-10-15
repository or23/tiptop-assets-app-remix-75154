import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHaptic } from '../useHaptic';

describe('useHaptic', () => {
  beforeEach(() => {
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn(),
    });
  });

  it('should trigger light haptic feedback', () => {
    const { result } = renderHook(() => useHaptic());
    
    result.current.hapticFeedback('light');
    
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('should trigger success haptic feedback with pattern', () => {
    const { result } = renderHook(() => useHaptic());
    
    result.current.hapticFeedback('success');
    
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 50, 10]);
  });

  it('should handle missing vibrate API gracefully', () => {
    // Remove vibrate from navigator
    const originalVibrate = navigator.vibrate;
    // @ts-ignore
    delete navigator.vibrate;

    const { result } = renderHook(() => useHaptic());
    
    // Should not throw
    expect(() => result.current.hapticFeedback('light')).not.toThrow();

    // Restore
    navigator.vibrate = originalVibrate;
  });
});
