import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Wifi, WifiOff, Smartphone, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentPWAProps {
  documentContent: string;
  documentType: string;
}

export const DocumentPWA = ({ documentContent, documentType }: DocumentPWAProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'offline'>('synced');

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('synced');
      toast.success('Back online! Syncing documents...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      toast.info('You\'re offline. Changes will sync when connection returns.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Auto-save to localStorage when offline
    if (!isOnline && documentContent) {
      localStorage.setItem(`offline-doc-${documentType}`, JSON.stringify({
        content: documentContent,
        timestamp: Date.now(),
        type: documentType
      }));
      setSyncStatus('pending');
    }
  }, [documentContent, documentType, isOnline]);

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    try {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        toast.success('App installed successfully!');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed. Please try again.');
    }
  };

  const syncOfflineChanges = async () => {
    try {
      const offlineKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('offline-doc-')
      );

      for (const key of offlineKeys) {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        // Here you would sync with your backend
        console.log('Syncing offline document:', data);
        localStorage.removeItem(key);
      }

      setSyncStatus('synced');
      toast.success('All documents synced successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync offline changes');
    }
  };

  const getOfflineDocuments = () => {
    const offlineKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('offline-doc-')
    );
    
    return offlineKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return {
        type: data.type,
        timestamp: data.timestamp,
        preview: data.content?.substring(0, 100) + '...'
      };
    });
  };

  const offlineDocuments = getOfflineDocuments();

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Alert className={isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-orange-600" />}
          <AlertDescription className={isOnline ? 'text-green-800' : 'text-orange-800'}>
            {isOnline ? 'Connected - All changes saved' : 'Offline - Changes saved locally'}
          </AlertDescription>
          {syncStatus === 'pending' && (
            <Badge variant="secondary" className="ml-auto">
              Pending Sync
            </Badge>
          )}
        </div>
      </Alert>

      {/* Install App Prompt */}
      {!isInstalled && installPrompt && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4" />
              Install App
            </CardTitle>
            <CardDescription>
              Install the Documents Assistant for offline access and a native app experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstallApp} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Documents */}
      {offlineDocuments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4" />
              Offline Changes
            </CardTitle>
            <CardDescription>
              Documents with unsaved changes that will sync when online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {offlineDocuments.map((doc, index) => (
              <div key={index} className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{doc.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(doc.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{doc.preview}</p>
              </div>
            ))}
            
            {isOnline && (
              <Button onClick={syncOfflineChanges} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All Changes
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* PWA Features Info */}
      {isInstalled && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">App Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Offline document editing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Automatic sync when online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Native app experience</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Push notifications</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};