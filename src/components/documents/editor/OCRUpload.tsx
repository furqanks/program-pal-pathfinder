import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileImage, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OCRUploadProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
}

const OCRUpload = ({ onTextExtracted, disabled }: OCRUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Please upload an image under 10MB.');
      return;
    }

    setIsProcessing(true);
    toast.info('Processing image with OCR...');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = (reader.result as string).split(',')[1];
          
          // Call OCR edge function
          const { data, error } = await supabase.functions.invoke('ocr-extraction', {
            body: { 
              image: base64Image,
              mimeType: file.type,
              fileName: file.name
            }
          });

          if (error) throw error;
          
          if (data?.text) {
            onTextExtracted(data.text);
            toast.success(`Text extracted from ${file.name}`);
          } else {
            toast.warning('No text found in the image');
          }
        } catch (error) {
          console.error('OCR processing error:', error);
          toast.error('Failed to extract text from image');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      toast.error('Failed to read the uploaded file');
      setIsProcessing(false);
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={disabled || isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="ocr-upload"
      />
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isProcessing}
        asChild
      >
        <label htmlFor="ocr-upload" className="cursor-pointer">
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileImage className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isProcessing ? 'Processing...' : 'OCR Upload'}
          </span>
        </label>
      </Button>
    </div>
  );
};

export default OCRUpload;