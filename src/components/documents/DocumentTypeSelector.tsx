
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";

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
    <div className="space-y-4">
      <Select 
        value={selectedProgramId || "all-documents"} 
        onValueChange={(value) => setSelectedProgramId(value === "all-documents" ? null : value)}
      >
        <SelectTrigger>
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="sop">SOPs</TabsTrigger>
          <TabsTrigger value="cv">CVs</TabsTrigger>
          <TabsTrigger value="essay">Essays</TabsTrigger>
        </TabsList>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="lor">LORs</TabsTrigger>
          <TabsTrigger value="personalEssay">Personal</TabsTrigger>
          <TabsTrigger value="scholarshipEssay">Scholarship</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default DocumentTypeSelector;
