
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedNotesSection from "@/components/application/EnhancedNotesSection";

const Notes = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Notes</h1>
          <p className="text-gray-600 mt-1">
            Capture, organize, and gain insights from your thoughts with AI-powered analysis
          </p>
        </div>
      </div>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="notes">All Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="mt-6">
          <EnhancedNotesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notes;
