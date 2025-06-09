
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  index: number;
}

export const SectionHeader = ({ title, index }: SectionHeaderProps) => {
  const cleanHeader = title.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
  
  return (
    <div key={index} className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">{cleanHeader}</h2>
      </div>
      <Separator className="mb-6" />
    </div>
  );
};
