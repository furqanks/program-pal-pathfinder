
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

const SearchReportVerification = () => {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
              Important: Verify All Information
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              This AI-generated report provides insights from official sources with at least 5 program options. 
              <strong> Always verify details directly with universities</strong> before applying. 
              Information may change frequently.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                Check Current Fees
              </Badge>
              <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                Verify Deadlines
              </Badge>
              <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                Confirm Requirements
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchReportVerification;
