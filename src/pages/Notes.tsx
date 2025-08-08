
import NotionLikeInterface from "@/components/notes/NotionLikeInterface";
import { useAINotesContext } from "@/contexts/AINotesContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Notes = () => {
  const { loading, error, fetchAllData, lastFetchStatus } = useAINotesContext();
  const { user } = useAuth();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h3 className="text-lg font-semibold">Unable to Load Notes</h3>
              <p className="text-sm text-muted-foreground">
                There was an issue loading your notes. Please check your connection and try again.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>User: {user?.id || 'anonymous'}</p>
                <p>Counts — Notes: {lastFetchStatus.notesCount}, Folders: {lastFetchStatus.foldersCount}, Templates: {lastFetchStatus.templatesCount}</p>
                {lastFetchStatus.lastUpdated && <p>Last attempt: {new Date(lastFetchStatus.lastUpdated).toLocaleTimeString()}</p>}
                {lastFetchStatus.lastError && <p>Error: {lastFetchStatus.lastError}</p>}
              </div>
              <Button 
                onClick={() => fetchAllData()} 
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <NotionLikeInterface />;
};

export default Notes;
