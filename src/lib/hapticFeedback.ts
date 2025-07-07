/**
 * 📱 HAPTIC FEEDBACK - Trillion-Dollar Touch Sensations
 * Brain-pleasing vibrations for every interaction
 */

export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection'
}

class HapticManager {
  private static instance: HapticManager;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'vibrate' in navigator;
  }

  static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager();
    }
    return HapticManager.instance;
  }

  // Trigger haptic feedback
  trigger(type: HapticType): void {
    if (!this.isSupported) return;

    const patterns: Record<HapticType, number | number[]> = {
      [HapticType.LIGHT]: 25,
      [HapticType.MEDIUM]: 50,
      [HapticType.HEAVY]: 100,
      [HapticType.SUCCESS]: [50, 50, 100],
      [HapticType.WARNING]: [100, 50, 100],
      [HapticType.ERROR]: [100, 100, 100, 100],
      [HapticType.SELECTION]: 30
    };

    const pattern = patterns[type];
    
    try {
      if (Array.isArray(pattern)) {
        navigator.vibrate(pattern);
      } else {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  // Check if haptics are supported
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  // Disable haptics (user preference)
  disable(): void {
    this.isSupported = false;
  }

  // Enable haptics
  enable(): void {
    this.isSupported = 'vibrate' in navigator;
  }
}

// Export singleton instance
export const haptics = HapticManager.getInstance();

// Convenience functions
export const triggerHaptic = (type: HapticType) => haptics.trigger(type);

// React hook for haptic feedback
export const useHapticFeedback = () => {
  const triggerLight = () => haptics.trigger(HapticType.LIGHT);
  const triggerMedium = () => haptics.trigger(HapticType.MEDIUM);
  const triggerHeavy = () => haptics.trigger(HapticType.HEAVY);
  const triggerSuccess = () => haptics.trigger(HapticType.SUCCESS);
  const triggerWarning = () => haptics.trigger(HapticType.WARNING);
  const triggerError = () => haptics.trigger(HapticType.ERROR);
  const triggerSelection = () => haptics.trigger(HapticType.SELECTION);

  return {
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerWarning,
    triggerError,
    triggerSelection,
    isSupported: haptics.isHapticSupported()
  };
};