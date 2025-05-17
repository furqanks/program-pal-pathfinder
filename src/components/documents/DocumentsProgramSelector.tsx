
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useProgramContext } from "@/contexts/ProgramContext";

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
  
  return (
    <Select 
      value={selectedProgramId || "no-program"} 
      onValueChange={(value) => setSelectedProgramId(value === "no-program" ? null : value)}
    >
      <SelectTrigger className={isMobile ? "w-full" : "w-[200px]"}>
        <SelectValue placeholder="Link to program" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="no-program">No program link</SelectItem>
        {programs.map(program => (
          <SelectItem key={program.id} value={program.id}>
            {program.programName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DocumentsProgramSelector;
