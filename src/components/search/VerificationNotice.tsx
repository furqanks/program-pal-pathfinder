
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export const VerificationNotice = () => {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-amber-800 dark:text-amber-200">
              Verification Required
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                This report provides AI-generated insights from official university sources. 
                <strong className="font-bold"> Always verify all program details, fees, deadlines, and requirements directly with the universities</strong> before making application decisions.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                University information can change frequently, and admission requirements may vary by student status and academic year.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                <strong>Check Current Fees</strong>
              </Badge>
              <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                <strong>Verify Deadlines</strong>
              </Badge>
              <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700">
                <strong>Confirm Requirements</strong>
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
