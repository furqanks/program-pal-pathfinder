
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  StickyNote, 
  ArrowRight,
  Sparkles,
  Folder,
  Archive,
  Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotesSection = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Notes & Ideas - Enhanced Version Available!
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/50">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <StickyNote className="h-12 w-12 text-purple-400" />
              <Sparkles className="h-6 w-6 text-purple-600 absolute -top-1 -right-1" />
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Your notes have been upgraded! 🎉
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We've enhanced your notes with AI-powered insights, smart organization, 
            and collaboration features. Your existing notes are safe and have been 
            migrated to the new system.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI-powered insights
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Folder className="h-4 w-4 text-blue-600" />
              Smart organization
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Archive className="h-4 w-4 text-green-600" />
              Archive & pin notes
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Share2 className="h-4 w-4 text-orange-600" />
              Collaboration ready
            </div>
          </div>

          <Button 
            onClick={() => navigate('/notes')}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Enhanced Notes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            This basic notes interface will be removed in a future update
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesSection;
