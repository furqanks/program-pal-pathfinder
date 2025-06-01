
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DocumentTypeSelectorProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  isMobile: boolean;
}

const DocumentTypeSelector = ({
  activeTab,
  setActiveTab,
  selectedProgramId,
  setSelectedProgramId,
  isMobile
}: DocumentTypeSelectorProps) => {
  const { programs } = useProgramContext();
  
  return (
    <div className="space-y-6">
      <Select 
        value={selectedProgramId || "all-documents"} 
        onValueChange={(value) => setSelectedProgramId(value === "all-documents" ? null : value)}
      >
        <SelectTrigger className={isMobile ? "h-12" : ""}>
          <SelectValue placeholder="All documents" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-documents">All documents</SelectItem>
          {programs.map(program => (
            <SelectItem key={program.id} value={program.id}>
              {program.programName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid grid-cols-3 mb-4",
            isMobile ? "h-12" : ""
          )}>
            <TabsTrigger value="sop" className={isMobile ? "text-xs" : ""}>SOPs</TabsTrigger>
            <TabsTrigger value="cv" className={isMobile ? "text-xs" : ""}>CVs</TabsTrigger>
            <TabsTrigger value="essay" className={isMobile ? "text-xs" : ""}>Essays</TabsTrigger>
          </TabsList>
          <TabsList className={cn(
            "grid grid-cols-3",
            isMobile ? "h-12" : ""
          )}>
            <TabsTrigger value="lor" className={isMobile ? "text-xs" : ""}>LORs</TabsTrigger>
            <TabsTrigger value="personalEssay" className={isMobile ? "text-xs" : ""}>Personal</TabsTrigger>
            <TabsTrigger value="scholarshipEssay" className={isMobile ? "text-xs" : ""}>Scholarship</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentTypeSelector;
