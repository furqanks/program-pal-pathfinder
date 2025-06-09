
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface ProgramCardProps {
  number: string;
  title: string;
  url: string;
  index: number;
}

export const ProgramCard = ({ number, title, url, index }: ProgramCardProps) => {
  return (
    <Card key={index} className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Badge variant="outline" className="text-xs font-normal shrink-0 bg-primary/10">
            #{number}
          </Badge>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground mb-3 leading-relaxed">
              {title}
            </h3>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Program Page
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
