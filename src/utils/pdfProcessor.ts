import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";

// Configure PDF.js to use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export interface PDFProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  fallbackMessage?: string;
}

export interface ProcessingProgress {
  stage: string;
  progress: number;
  message: string;
}

export class PDFProcessor {
  private onProgress?: (progress: ProcessingProgress) => void;

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(stage: string, progress: number, message: string) {
    this.onProgress?.({ stage, progress, message });
  }

  async processFile(file: File): Promise<PDFProcessingResult> {
    try {
      this.updateProgress('initialization', 10, 'Initializing PDF processor...');
      
      // Try client-side processing first
      const clientResult = await this.processClientSide(file);
      if (clientResult.success) {
        return clientResult;
      }

      // Fallback to server-side processing
      this.updateProgress('fallback', 60, 'Trying server-side processing...');
      const serverResult = await this.processServerSide(file);
      if (serverResult.success) {
        return serverResult;
      }

      // Return fallback message if both methods fail
      return {
        success: false,
        error: 'PDF processing failed',
        fallbackMessage: this.getFallbackMessage(file.name)
      };

    } catch (error) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackMessage: this.getFallbackMessage(file.name)
      };
    }
  }

  private async processClientSide(file: File): Promise<PDFProcessingResult> {
    try {
      this.updateProgress('client-processing', 20, 'Loading PDF file...');
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      }).promise;

      const numPages = pdf.numPages;
      let fullText = "";

      this.updateProgress('client-processing', 30, 'Extracting text from pages...');

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const progressPercent = 30 + (pageNum / numPages) * 40;
        this.updateProgress('client-processing', progressPercent, `Processing page ${pageNum} of ${numPages}...`);
        
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          
          fullText += pageText + "\n\n";
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }

      const cleanText = fullText.trim();
      
      if (cleanText.length > 50) {
        this.updateProgress('client-processing', 100, 'PDF processed successfully!');
        return {
          success: true,
          text: cleanText
        };
      } else {
        return {
          success: false,
          error: 'No readable text found in PDF'
        };
      }

    } catch (error) {
      console.error("Client-side PDF processing failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Client-side processing failed'
      };
    }
  }

  private async processServerSide(file: File): Promise<PDFProcessingResult> {
    try {
      // First upload file to storage
      this.updateProgress('server-processing', 65, 'Uploading file for processing...');
      
      // This would require implementing file upload to Supabase storage
      // For now, return a placeholder that indicates server-side processing is needed
      return {
        success: false,
        error: 'Server-side processing not yet implemented'
      };

    } catch (error) {
      console.error("Server-side PDF processing failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Server-side processing failed'
      };
    }
  }

  private getFallbackMessage(fileName: string): string {
    return `PDF document "${fileName}" was processed, but automatic text extraction had limited success.

This can happen with:
• Image-based PDFs (scanned documents)
• Password-protected PDFs  
• Complex formatting or encrypted PDFs

To get the best results:
1. **Copy and paste** the text content directly into the editor
2. **Convert to Word document** first and upload that instead
3. **Save as plain text** (.txt) and upload that

This will ensure our AI can properly analyze your content and provide accurate feedback.`;
  }
}

// Utility function for simple PDF processing
export async function processPDF(
  file: File, 
  onProgress?: (progress: ProcessingProgress) => void
): Promise<PDFProcessingResult> {
  const processor = new PDFProcessor(onProgress);
  return processor.processFile(file);
}