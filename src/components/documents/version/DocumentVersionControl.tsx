import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, Clock, User, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentVersion {
  id: string;
  version_number: number;
  content_raw: string;
  created_at: string;
  change_summary?: string;
  is_branch: boolean;
  branch_name?: string;
  parent_version_id?: string;
}

interface DocumentVersionControlProps {
  documentId: string;
  currentContent: string;
  onVersionSelect: (content: string) => void;
}

const DocumentVersionControl = ({
  documentId,
  currentContent,
  onVersionSelect
}: DocumentVersionControlProps) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (documentId) {
      fetchVersions();
    }
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load document versions');
    } finally {
      setLoading(false);
    }
  };

  const createVersion = async (changeSummary: string) => {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          content_raw: currentContent,
          change_summary: changeSummary,
          version_number: versions.length + 1
        });

      if (error) throw error;
      
      await fetchVersions();
      toast.success('Version saved successfully');
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to save version');
    }
  };

  const compareVersions = (v1: DocumentVersion, v2: DocumentVersion) => {
    // Simple diff highlighting - in production, use a proper diff library
    const content1 = v1.content_raw.split('\n');
    const content2 = v2.content_raw.split('\n');
    
    return {
      version1: content1,
      version2: content2,
      changes: calculateChanges(content1, content2)
    };
  };

  const calculateChanges = (content1: string[], content2: string[]) => {
    // Simplified change detection
    const maxLength = Math.max(content1.length, content2.length);
    const changes = [];
    
    for (let i = 0; i < maxLength; i++) {
      const line1 = content1[i] || '';
      const line2 = content2[i] || '';
      
      if (line1 !== line2) {
        changes.push({
          lineNumber: i + 1,
          type: !line1 ? 'added' : !line2 ? 'removed' : 'modified',
          oldText: line1,
          newText: line2
        });
      }
    }
    
    return changes;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Version Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Version History</TabsTrigger>
            <TabsTrigger value="compare">Compare Versions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-4">
            <Button
              onClick={() => {
                const summary = prompt('Enter a summary for this version:');
                if (summary) createVersion(summary);
              }}
              className="w-full"
            >
              Save Current Version
            </Button>
            
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onVersionSelect(version.content_raw)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          v{version.version_number}
                        </Badge>
                        {version.is_branch && version.branch_name && (
                          <Badge variant="secondary">
                            {version.branch_name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(version.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {version.change_summary && (
                      <p className="text-sm text-muted-foreground">
                        {version.change_summary}
                      </p>
                    )}
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      {version.content_raw.length} characters
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Version 1</label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  onChange={(e) => {
                    const current = selectedVersions || [e.target.value, ''];
                    setSelectedVersions([e.target.value, current[1]]);
                  }}
                >
                  <option value="">Select version...</option>
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      v{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Version 2</label>
                <select
                  className="w-full mt-1 p-2 border rounded"
                  onChange={(e) => {
                    const current = selectedVersions || ['', e.target.value];
                    setSelectedVersions([current[0], e.target.value]);
                  }}
                >
                  <option value="">Select version...</option>
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      v{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedVersions && selectedVersions[0] && selectedVersions[1] && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Version Comparison</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">Version 1</h5>
                    <div className="bg-green-50 p-3 rounded border min-h-48 font-mono text-xs whitespace-pre-wrap">
                      {versions.find(v => v.id === selectedVersions[0])?.content_raw}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-600 mb-2">Version 2</h5>
                    <div className="bg-blue-50 p-3 rounded border min-h-48 font-mono text-xs whitespace-pre-wrap">
                      {versions.find(v => v.id === selectedVersions[1])?.content_raw}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionControl;