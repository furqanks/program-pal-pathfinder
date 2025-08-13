import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, Download, Share2, Zap } from "lucide-react";
import DocumentContentEditor from "../editor/DocumentContentEditor";
import VoiceInput from "../editor/VoiceInput";
import OCRUpload from "../editor/OCRUpload";
import { DocumentExport } from "../export/DocumentExport";
import { RealtimeWritingAssistant } from "../realtime/RealtimeWritingAssistant";

interface MobileDocumentEditorProps {
  documentContent: string;
  setDocumentContent: (content: string) => void;
  documentType: string;
  documentTypeLabel: string;
  onFileContent: (content: string, fileName: string) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  onSave: () => void;
  onGenerateFeedback: () => void;
  isSaving: boolean;
  isGeneratingFeedback: boolean;
  documentId?: string | null;
}

const MobileDocumentEditor = ({
  documentContent,
  setDocumentContent,
  documentType,
  documentTypeLabel,
  onFileContent,
  isUploading,
  setIsUploading,
  onSave,
  onGenerateFeedback,
  isSaving,
  isGeneratingFeedback,
  documentId
}: MobileDocumentEditorProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const handleVoiceTranscription = (text: string) => {
    if (documentContent.trim()) {
      setDocumentContent(documentContent + " " + text);
    } else {
      setDocumentContent(text);
    }
  };

  const handleOCRExtraction = (text: string) => {
    if (documentContent.trim()) {
      setDocumentContent(documentContent + "\n\n" + text);
    } else {
      setDocumentContent(text);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg truncate">{documentTypeLabel}</h1>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <SheetHeader>
                <SheetTitle>Document Tools</SheetTitle>
                <SheetDescription>
                  Access advanced features for your document
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveFeature('assistant')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  AI Writing Assistant
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveFeature('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export & Share
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveFeature('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Document Settings
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Quick Input Tools */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <VoiceInput 
                onTranscription={handleVoiceTranscription}
                disabled={isUploading}
              />
              <OCRUpload 
                onTextExtracted={handleOCRExtraction}
                disabled={isUploading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Editor */}
        <Card className="flex-1">
          <CardContent className="p-4">
            <DocumentContentEditor
              documentContent={documentContent}
              setDocumentContent={setDocumentContent}
              documentTypeLabel={documentTypeLabel}
              isMobile={true}
              onFileContent={onFileContent}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          </CardContent>
        </Card>

        {/* AI Assistant (if active) */}
        {activeFeature === 'assistant' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Writing Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RealtimeWritingAssistant
                documentContent={documentContent}
                documentType={documentType}
                onContentUpdate={setDocumentContent}
              />
            </CardContent>
          </Card>
        )}

        {/* Export Tools (if active) */}
        {activeFeature === 'export' && documentId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export & Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentExport documentId={documentId} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onSave}
            disabled={isSaving || !documentContent.trim()}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Document'}
          </Button>
          <Button
            onClick={onGenerateFeedback}
            disabled={isGeneratingFeedback || !documentContent.trim()}
            variant="outline"
            className="w-full"
          >
            {isGeneratingFeedback ? 'Analyzing...' : 'Get Feedback'}
          </Button>
        </div>
      </div>

      {/* Bottom spacer for fixed action bar */}
      <div className="h-20"></div>
    </div>
  );
};

export default MobileDocumentEditor;