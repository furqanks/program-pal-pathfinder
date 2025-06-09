
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  index: number;
}

export const SectionHeader = ({ title, index }: SectionHeaderProps) => {
  const cleanHeader = title.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
  
  return (
    <div key={index} className="mb-6 mt-8 first:mt-0">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
        <h2 className="text-xl font-bold text-foreground leading-tight">{cleanHeader}</h2>
      </div>
      <Separator className="mb-4" />
    </div>
  );
};
