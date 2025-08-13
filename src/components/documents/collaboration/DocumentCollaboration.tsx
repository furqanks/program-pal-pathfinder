import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, MessageSquare, Users, History, Plus, Check, X, Clock, Eye, Edit3, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CollaborationProps {
  documentId: string;
  isOwner: boolean;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  position_start?: number;
  position_end?: number;
  is_resolved: boolean;
  created_at: string;
}

interface Collaboration {
  id: string;
  collaborator_id: string;
  permission_level: string;
  status: string;
  invited_at: string;
  accepted_at?: string;
}

interface DocumentVersion {
  id: string;
  version_number: number;
  content_raw: string;
  change_summary?: string;
  created_at: string;
  user_id: string;
}

export const DocumentCollaboration = ({ documentId, isOwner }: CollaborationProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorPermission, setNewCollaboratorPermission] = useState('comment');
  const [shareableLink, setShareableLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0, text: '' });

  useEffect(() => {
    fetchCollaborationData();
  }, [documentId]);

  const fetchCollaborationData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('document-collaboration', {
        body: {
          action: 'get_document_activity',
          documentId,
          userId: user.id
        }
      });

      if (error) throw error;

      setComments(data.comments || []);
      setCollaborations(data.collaborations || []);
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
      toast.error('Failed to load collaboration data');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-collaboration', {
        body: {
          action: 'add_comment',
          documentId,
          userId: user.id,
          content: newComment,
          positionStart: selectedText.start || undefined,
          positionEnd: selectedText.end || undefined
        }
      });

      if (error) throw error;

      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
      setSelectedText({ start: 0, end: 0, text: '' });
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!newCollaboratorEmail.trim() || !user || !isOwner) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-collaboration', {
        body: {
          action: 'invite_collaborator',
          documentId,
          userId: user.id,
          collaboratorEmail: newCollaboratorEmail,
          permissionLevel: newCollaboratorPermission
        }
      });

      if (error) throw error;

      setCollaborations(prev => [data.invitation, ...prev]);
      setNewCollaboratorEmail('');
      toast.success(`Invitation sent to ${newCollaboratorEmail}`);
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShareableLink = async () => {
    if (!user || !isOwner) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-collaboration', {
        body: {
          action: 'create_shareable_link',
          documentId,
          userId: user.id,
          permissionLevel: 'view'
        }
      });

      if (error) throw error;

      setShareableLink(data.shareableLink);
      toast.success('Shareable link created');
    } catch (error) {
      console.error('Error creating shareable link:', error);
      toast.error('Failed to create shareable link');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('document-collaboration', {
        body: {
          action: 'resolve_comment',
          commentId,
          userId: user.id
        }
      });

      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, is_resolved: true } : comment
      ));
      toast.success('Comment resolved');
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast.error('Failed to resolve comment');
    }
  };

  const handleCompareVersions = async (versionId1: string, versionId2: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('document-collaboration', {
        body: {
          action: 'compare_versions',
          versionId1,
          versionId2
        }
      });

      if (error) throw error;

      toast.success(`Comparison: ${data.summary}`);
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast.error('Failed to compare versions');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="comments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
              <CardDescription>
                Add comments and feedback on the document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                {selectedText.text && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    Selected text: "{selectedText.text}"
                  </div>
                )}
                <Button onClick={handleAddComment} disabled={loading || !newComment.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>

              <Separator />

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id} className={comment.is_resolved ? "opacity-60" : ""}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <p className="text-sm">{comment.content}</p>
                            {comment.position_start !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Text selection: {comment.position_start}-{comment.position_end}
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </div>
                          </div>
                          {!comment.is_resolved && isOwner && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResolveComment(comment.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {comment.is_resolved && (
                          <Badge variant="secondary" className="mt-2">
                            Resolved
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No comments yet. Be the first to add feedback!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborators" className="space-y-4">
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Invite Collaborator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Email address"
                    value={newCollaboratorEmail}
                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  />
                  <Select value={newCollaboratorPermission} onValueChange={setNewCollaboratorPermission}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          View Only
                        </div>
                      </SelectItem>
                      <SelectItem value="comment">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Comment
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInviteCollaborator} disabled={loading}>
                    Send Invite
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collaborations.map((collaboration) => (
                  <div key={collaboration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{collaboration.collaborator_id}</div>
                      <div className="text-sm text-muted-foreground">
                        Invited {new Date(collaboration.invited_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{collaboration.permission_level}</Badge>
                      <Badge variant={collaboration.status === 'accepted' ? 'default' : 'secondary'}>
                        {collaboration.status === 'accepted' ? <Check className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {collaboration.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {collaborations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No collaborators yet. Invite someone to get feedback!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
              <CardDescription>
                Track changes and compare different versions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {versions.map((version, index) => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Version {version.version_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {version.change_summary || 'No summary provided'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(version.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index < versions.length - 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompareVersions(version.id, versions[index + 1].id)}
                          >
                            Compare
                          </Button>
                        )}
                        <Badge variant="outline">
                          {version.content_raw.split(/\s+/).length} words
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {versions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No versions yet. Versions are created when you make significant changes.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Document
                </CardTitle>
                <CardDescription>
                  Create shareable links for easy access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCreateShareableLink} disabled={loading}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Create Shareable Link
                </Button>
                
                {shareableLink && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shareable Link:</label>
                    <div className="flex gap-2">
                      <Input value={shareableLink} readOnly />
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(shareableLink);
                          toast.success('Link copied to clipboard');
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This link allows view-only access and expires in 7 days.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};