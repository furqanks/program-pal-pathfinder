import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accessibility, Eye, Volume2, Keyboard, Monitor } from "lucide-react";
import { toast } from "sonner";

interface AccessibilitySettingsProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncements: boolean;
  colorTheme: 'auto' | 'light' | 'dark' | 'high-contrast';
}

const AccessibilitySettings = ({ onSettingsChange }: AccessibilitySettingsProps) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    voiceAnnouncements: false,
    colorTheme: 'auto'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Apply settings to the document
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
    
    // Color theme
    root.setAttribute('data-accessibility-theme', newSettings.colorTheme);
    
    // Announce changes to screen readers
    if (newSettings.voiceAnnouncements) {
      announceChange('Accessibility settings updated');
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
    
    // Notify parent component
    onSettingsChange?.(newSettings);
  };

  const announceChange = (message: string) => {
    // Create a live region for announcements
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
      document.body.removeChild(announcement);
    }, 1000);
  };

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      highContrast: false,
      reducedMotion: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      voiceAnnouncements: false,
      colorTheme: 'auto'
    };
    
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    
    toast.success('Accessibility settings reset to defaults');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="font-medium">Visual</h3>
          </div>
          
          <div className="space-y-4 ml-6">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
              <Slider
                id="font-size"
                min={12}
                max={24}
                step={1}
                value={[settings.fontSize]}
                onValueChange={(value) => updateSetting('fontSize', value[0])}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color-theme">Color Theme</Label>
              <Select
                value={settings.colorTheme}
                onValueChange={(value: AccessibilitySettings['colorTheme']) => 
                  updateSetting('colorTheme', value)
                }
              >
                <SelectTrigger id="color-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="high-contrast">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Motion Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <h3 className="font-medium">Motion & Animation</h3>
          </div>
          
          <div className="ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>
          </div>
        </div>

        {/* Input Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            <h3 className="font-medium">Input & Navigation</h3>
          </div>
          
          <div className="space-y-4 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
              <Switch
                id="keyboard-nav"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
              <Switch
                id="screen-reader"
                checked={settings.screenReaderOptimized}
                onCheckedChange={(checked) => updateSetting('screenReaderOptimized', checked)}
              />
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <h3 className="font-medium">Audio</h3>
          </div>
          
          <div className="ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-announcements">Voice Announcements</Label>
              <Switch
                id="voice-announcements"
                checked={settings.voiceAnnouncements}
                onCheckedChange={(checked) => updateSetting('voiceAnnouncements', checked)}
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;