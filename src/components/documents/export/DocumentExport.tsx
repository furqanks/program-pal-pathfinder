import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Printer, Share2, Package, Globe, Calendar, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ExportProps {
  documentId?: string;
  documentIds?: string[];
  programId?: string;
  isPortfolio?: boolean;
}

interface ExportOption {
  format: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  mimeType: string;
}

const exportOptions: ExportOption[] = [
  {
    format: 'pdf',
    label: 'PDF',
    description: 'Professional format, ideal for submissions',
    icon: <FileText className="h-4 w-4" />,
    mimeType: 'application/pdf'
  },
  {
    format: 'docx',
    label: 'Word Document',
    description: 'Editable format for further revisions',
    icon: <FileText className="h-4 w-4" />,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  {
    format: 'html',
    label: 'HTML',
    description: 'Web format for online sharing',
    icon: <Globe className="h-4 w-4" />,
    mimeType: 'text/html'
  },
  {
    format: 'txt',
    label: 'Plain Text',
    description: 'Simple text format',
    icon: <FileText className="h-4 w-4" />,
    mimeType: 'text/plain'
  },
  {
    format: 'latex',
    label: 'LaTeX',
    description: 'Academic format for research papers',
    icon: <FileText className="h-4 w-4" />,
    mimeType: 'application/x-latex'
  }
];

export const DocumentExport = ({ documentId, documentIds, programId, isPortfolio = false }: ExportProps) => {
  const { user } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeFeedback, setIncludeFeedback] = useState(false);
  const [includeVersions, setIncludeVersions] = useState(false);
  const [optimizeForPrint, setOptimizeForPrint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleExport = async () => {
    if (!user) return;

    setLoading(true);
    setExportProgress(0);

    try {
      let exportResult;

      if (isPortfolio && programId) {
        // Export complete portfolio
        exportResult = await supabase.functions.invoke('document-export', {
          body: {
            action: 'generate_portfolio',
            userId: user.id,
            programId,
            format: selectedFormat,
            includeMetadata,
            includeFeedback,
            includeVersions
          }
        });
      } else if (documentIds && documentIds.length > 1) {
        // Batch export
        exportResult = await supabase.functions.invoke('document-export', {
          body: {
            action: 'batch_export',
            userId: user.id,
            documentIds,
            format: selectedFormat,
            includeMetadata,
            includeFeedback,
            includeVersions
          }
        });
      } else {
        // Single document export
        exportResult = await supabase.functions.invoke('document-export', {
          body: {
            action: optimizeForPrint ? 'create_print_version' : 'export_document',
            documentId,
            userId: user.id,
            format: selectedFormat,
            includeMetadata,
            includeFeedback,
            includeVersions
          }
        });
      }

      if (exportResult.error) {
        throw exportResult.error;
      }

      setExportProgress(100);
      setDownloadUrl(exportResult.data.downloadUrl);
      
      if (exportResult.data.downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = exportResult.data.downloadUrl;
        link.download = exportResult.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Export completed successfully!');
      }

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!user || !documentId) return;

    try {
      // Create shareable link via collaboration system
      const { data, error } = await supabase.functions.invoke('document-collaboration', {
        body: {
          action: 'create_shareable_link',
          documentId,
          userId: user.id,
          permissionLevel: 'view'
        }
      });

      if (error) throw error;

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareableLink);
      toast.success('Shareable link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to create shareable link');
    }
  };

  const currentOption = exportOptions.find(opt => opt.format === selectedFormat);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
          <CardDescription>
            Choose your preferred format and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {exportOptions.map((option) => (
                <Card
                  key={option.format}
                  className={`cursor-pointer border-2 transition-colors ${
                    selectedFormat === option.format
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedFormat(option.format)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">{option.icon}</div>
                      <div className="space-y-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Export Settings</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                />
                <label htmlFor="metadata" className="text-sm">
                  Include document metadata (created date, version info)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="feedback"
                  checked={includeFeedback}
                  onCheckedChange={(checked) => setIncludeFeedback(checked === true)}
                />
                <label htmlFor="feedback" className="text-sm">
                  Include AI feedback and scoring
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="versions"
                  checked={includeVersions}
                  onCheckedChange={(checked) => setIncludeVersions(checked === true)}
                />
                <label htmlFor="versions" className="text-sm">
                  Include version history
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="print"
                  checked={optimizeForPrint}
                  onCheckedChange={(checked) => setOptimizeForPrint(checked === true)}
                />
                <label htmlFor="print" className="text-sm">
                  Optimize for printing (proper margins, page breaks)
                </label>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Preparing export...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={handleExport}
          disabled={loading}
          className="h-12"
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Exporting...' : `Export as ${currentOption?.label}`}
        </Button>

        {documentId && (
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={loading}
            className="h-12"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Create Share Link
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => window.print()}
          disabled={loading}
          className="h-12"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Preview
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="ghost"
              className="h-16 justify-start p-4"
              onClick={() => {
                setSelectedFormat('pdf');
                setIncludeMetadata(false);
                setIncludeFeedback(false);
                setOptimizeForPrint(true);
                handleExport();
              }}
              disabled={loading}
            >
              <div className="flex items-center space-x-3">
                <Printer className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Print-Ready PDF</div>
                  <div className="text-xs text-muted-foreground">Clean format for printing</div>
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="h-16 justify-start p-4"
              onClick={() => {
                setSelectedFormat('docx');
                setIncludeMetadata(true);
                setIncludeFeedback(true);
                handleExport();
              }}
              disabled={loading}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-medium">Complete Word Doc</div>
                  <div className="text-xs text-muted-foreground">With feedback and metadata</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">SOP_2024-08-13.pdf</div>
                <div className="text-sm text-muted-foreground">
                  Exported 2 hours ago
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">PDF</Badge>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-center py-4 text-muted-foreground text-sm">
              Export history will appear here after your first export
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};