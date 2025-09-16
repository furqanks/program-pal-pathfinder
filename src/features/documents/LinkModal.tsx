import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, Link2Off } from 'lucide-react';

interface LinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLink: (url: string) => void;
  onRemoveLink: () => void;
  isLinkActive: boolean;
  currentUrl?: string;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  open,
  onOpenChange,
  onAddLink,
  onRemoveLink,
  isLinkActive,
  currentUrl = '',
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setUrl(currentUrl);
      setError('');
    }
  }, [open, currentUrl]);

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol);
    } catch {
      // Try with https:// prefix if no protocol
      if (!urlString.includes('://')) {
        try {
          new URL(`https://${urlString}`);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  };

  const handleAddLink = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const normalizedUrl = url.includes('://') ? url : `https://${url}`;
    
    if (!validateUrl(normalizedUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    onAddLink(normalizedUrl);
    onOpenChange(false);
    setUrl('');
    setError('');
  };

  const handleRemoveLink = () => {
    onRemoveLink();
    onOpenChange(false);
    setUrl('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            {isLinkActive ? 'Edit Link' : 'Add Link'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {isLinkActive && (
              <Button
                variant="destructive"
                onClick={handleRemoveLink}
                className="flex items-center gap-2"
              >
                <Link2Off className="h-4 w-4" />
                Remove Link
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink}>
              {isLinkActive ? 'Update' : 'Add'} Link
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};