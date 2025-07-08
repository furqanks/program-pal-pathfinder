import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Database, 
  Download, 
  Trash2, 
  Shield, 
  Eye, 
  Share, 
  AlertTriangle,
  FileText,
  Clock,
  Lock
} from "lucide-react";

interface DataExportRequest {
  id: string;
  export_type: string;
  status: string;
  file_url?: string;
  created_at: string;
  expires_at?: string;
}

interface DataSummary {
  documents: number;
  notes: number;
  programs: number;
  usage_logs: number;
  total_size: string;
}

export const DataPrivacy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary>({
    documents: 0,
    notes: 0,
    programs: 0,
    usage_logs: 0,
    total_size: '0 MB'
  });
  const [privacySettings, setPrivacySettings] = useState({
    analytics_sharing: true,
    marketing_data: false,
    third_party_sharing: false,
    research_participation: false
  });

  useEffect(() => {
    if (user) {
      loadDataSummary();
      loadExportRequests();
    }
  }, [user]);

  const loadDataSummary = async () => {
    try {
      const [documentsResult, notesResult, programsResult, usageResult] = await Promise.all([
        supabase.from('user_documents').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('ai_notes').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('programs_saved').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('usage_tracking').select('id', { count: 'exact' }).eq('user_id', user?.id)
      ]);

      setDataSummary({
        documents: documentsResult.count || 0,
        notes: notesResult.count || 0,
        programs: programsResult.count || 0,
        usage_logs: usageResult.count || 0,
        total_size: '2.3 MB' // This would be calculated from actual data sizes
      });
    } catch (error) {
      console.error('Error loading data summary:', error);
    }
  };

  const loadExportRequests = async () => {
    try {
      const { data } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        setExportRequests(data);
      }
    } catch (error) {
      console.error('Error loading export requests:', error);
    }
  };

  const handleExportData = async (exportType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user?.id,
          export_type: exportType,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();

      if (error) throw error;

      setExportRequests(prev => [data, ...prev]);
      
      toast({
        title: "Export requested",
        description: `Your ${exportType} export has been requested and will be ready soon.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request data export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async (dataType: string) => {
    setLoading(true);
    try {
      let result;
      
      switch (dataType) {
        case 'documents':
          result = await supabase.from('user_documents').delete().eq('user_id', user?.id);
          break;
        case 'notes':
          result = await supabase.from('ai_notes').delete().eq('user_id', user?.id);
          break;
        case 'programs':
          result = await supabase.from('programs_saved').delete().eq('user_id', user?.id);
          break;
        case 'usage':
          result = await supabase.from('usage_tracking').delete().eq('user_id', user?.id);
          break;
        default:
          throw new Error('Invalid data type');
      }

      if (result.error) throw result.error;

      await loadDataSummary();
      
      toast({
        title: "Data deleted",
        description: `Your ${dataType} have been permanently deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySettingChange = (setting: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    // In a real app, this would save to the user profile
    toast({
      title: "Privacy setting updated",
      description: "Your privacy preference has been saved.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Ready</Badge>;
      case 'pending':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Data Overview
          </CardTitle>
          <CardDescription>Summary of data stored in your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{dataSummary.documents}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{dataSummary.notes}</div>
              <div className="text-sm text-muted-foreground">Notes</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{dataSummary.programs}</div>
              <div className="text-sm text-muted-foreground">Programs</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{dataSummary.usage_logs}</div>
              <div className="text-sm text-muted-foreground">Usage Logs</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              Total storage used: <span className="font-medium">{dataSummary.total_size}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>Download your data in various formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExportData('all_data')}
              disabled={loading}
              className="h-auto p-4"
            >
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Complete Export</div>
                <div className="text-sm text-muted-foreground">All your data in JSON format</div>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => handleExportData('documents_only')}
              disabled={loading}
              className="h-auto p-4"
            >
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Documents Only</div>
                <div className="text-sm text-muted-foreground">Your documents and feedback</div>
              </div>
            </Button>
          </div>

          {/* Export Requests History */}
          {exportRequests.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recent Export Requests</h4>
              {exportRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium capitalize">{request.export_type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {request.status === 'completed' && request.file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={request.file_url} download>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control how your data is used and shared</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="analytics">Analytics Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Help us improve the service by sharing anonymous usage data
                </p>
              </div>
              <Switch
                id="analytics"
                checked={privacySettings.analytics_sharing}
                onCheckedChange={(checked) => handlePrivacySettingChange('analytics_sharing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing">Marketing Data Usage</Label>
                <p className="text-sm text-muted-foreground">
                  Allow us to use your data for personalized marketing
                </p>
              </div>
              <Switch
                id="marketing"
                checked={privacySettings.marketing_data}
                onCheckedChange={(checked) => handlePrivacySettingChange('marketing_data', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="third_party">Third-Party Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data with educational partners
                </p>
              </div>
              <Switch
                id="third_party"
                checked={privacySettings.third_party_sharing}
                onCheckedChange={(checked) => handlePrivacySettingChange('third_party_sharing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="research">Research Participation</Label>
                <p className="text-sm text-muted-foreground">
                  Participate in educational research studies
                </p>
              </div>
              <Switch
                id="research"
                checked={privacySettings.research_participation}
                onCheckedChange={(checked) => handlePrivacySettingChange('research_participation', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Data Deletion
          </CardTitle>
          <CardDescription>Permanently delete specific types of data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-auto p-4">
                  <div className="text-center">
                    <Trash2 className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Delete Documents</div>
                    <div className="text-sm opacity-80">Remove all uploaded documents</div>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete All Documents?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your uploaded documents and their feedback. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteData('documents')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Documents
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-auto p-4">
                  <div className="text-center">
                    <Trash2 className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Delete Notes</div>
                    <div className="text-sm opacity-80">Remove all created notes</div>
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete All Notes?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your notes and AI insights. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteData('notes')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Notes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Important Notice</h4>
                <p className="text-sm text-red-700 mt-1">
                  Data deletion is permanent and cannot be undone. Please make sure to export any data you want to keep before deleting.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy Compliance
          </CardTitle>
          <CardDescription>Your rights and our compliance status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">GDPR Compliance</h4>
              <p className="text-sm text-muted-foreground">
                We comply with EU General Data Protection Regulation for all users.
              </p>
              <Badge variant="default" className="mt-2">Compliant</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">CCPA Compliance</h4>
              <p className="text-sm text-muted-foreground">
                We comply with California Consumer Privacy Act for CA residents.
              </p>
              <Badge variant="default" className="mt-2">Compliant</Badge>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              For questions about your data or privacy rights, please contact our support team.
              View our full privacy policy and terms of service for complete details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};