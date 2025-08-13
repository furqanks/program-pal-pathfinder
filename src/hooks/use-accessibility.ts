import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncements: boolean;
  colorTheme: 'auto' | 'light' | 'dark' | 'high-contrast';
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 16,
  highContrast: false,
  reducedMotion: false,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  voiceAnnouncements: false,
  colorTheme: 'auto'
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }

    // Apply OS-level preferences
    applySystemPreferences();
  }, []);

  const applySystemPreferences = () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      updateSetting('reducedMotion', true);
    }

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      updateSetting('highContrast', true);
    }

    // Check for color scheme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && settings.colorTheme === 'auto') {
      applyColorTheme('dark');
    }
  };

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-size', `${newSettings.fontSize}px`);
    
    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Screen reader optimization
    if (newSettings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
    
    // Keyboard navigation
    if (newSettings.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
    
    // Color theme
    applyColorTheme(newSettings.colorTheme);
  };

  const applyColorTheme = (theme: AccessibilitySettings['colorTheme']) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    
    switch (theme) {
      case 'light':
        root.classList.add('theme-light');
        break;
      case 'dark':
        root.classList.add('theme-dark');
        break;
      case 'high-contrast':
        root.classList.add('theme-high-contrast');
        break;
      case 'auto':
        // Let CSS handle auto theme
        break;
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    
    // Announce changes to screen readers
    if (newSettings.voiceAnnouncements) {
      announceChange(`${key} updated`);
    }
  };

  const announceChange = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    
    if (settings.voiceAnnouncements) {
      announceChange('Accessibility settings reset to defaults');
    }
  };

  return {
    settings,
    updateSetting,
    resetToDefaults,
    announceChange
  };
};