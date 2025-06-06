
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";
import { cn } from "@/lib/utils";

interface DocumentsProgramSelectorProps {
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  isMobile: boolean;
}

const DocumentsProgramSelector = ({
  selectedProgramId,
  setSelectedProgramId,
  isMobile
}: DocumentsProgramSelectorProps) => {
  const { programs } = useProgramContext();
  
  // Filter programs to ensure they have valid IDs
  const validPrograms = programs.filter(program => program.id && program.id.trim() !== "");
  
  return (
    <Select 
      value={selectedProgramId || "no-program"} 
      onValueChange={(value) => setSelectedProgramId(value === "no-program" ? null : value)}
    >
      <SelectTrigger className={cn(
        isMobile ? "w-full h-12" : "w-[200px]"
      )}>
        <SelectValue placeholder="Link to program" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="no-program">No program link</SelectItem>
        {validPrograms.map(program => (
          <SelectItem key={program.id} value={program.id}>
            {program.programName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DocumentsProgramSelector;
