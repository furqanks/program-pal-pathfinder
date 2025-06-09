
import { GraduationCap, DollarSign, Calendar, Clock, BookOpen } from "lucide-react";

interface ProgramDetailsSectionProps {
  content: string;
  index: number;
}

export const ProgramDetailsSection = ({ content, index }: ProgramDetailsSectionProps) => {
  const getIcon = (label: string) => {
    if (label.toLowerCase().includes('university')) return <GraduationCap className="h-5 w-5 text-primary" />;
    if (label.toLowerCase().includes('tuition') || label.toLowerCase().includes('fee')) return <DollarSign className="h-5 w-5 text-green-600" />;
    if (label.toLowerCase().includes('deadline')) return <Calendar className="h-5 w-5 text-red-600" />;
    if (label.toLowerCase().includes('duration')) return <Clock className="h-5 w-5 text-blue-600" />;
    return <BookOpen className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div key={index} className="bg-muted/20 p-6 rounded-lg border mb-6">
      <div className="space-y-4">
        {content.split('\n').map((line, lineIndex) => {
          const [label, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          
          if (!value) return null;

          return (
            <div key={lineIndex} className="flex items-start gap-4">
              {getIcon(label)}
              <div className="flex-1">
                <h4 className="font-bold text-base text-foreground mb-1">{label.trim()}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
