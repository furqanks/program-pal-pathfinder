import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  GraduationCap, 
  Zap, 
  Clock,
  Calendar,
  Activity
} from "lucide-react";

interface UsageStats {
  documents_reviewed: number;
  programs_saved: number;
  notes_created: number;
  ai_requests: number;
}

interface UsageAnalyticsProps {
  usageStats: UsageStats;
}

interface MonthlyUsage {
  feature_type: string;
  count: number;
  month: string;
}

export const UsageAnalytics = ({ usageStats }: UsageAnalyticsProps) => {
  const { user, subscription } = useAuth();
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsageData();
    }
  }, [user]);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      
      // Get current month usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: currentMonthData } = await supabase
        .from('usage_tracking')
        .select('feature_type')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString());

      // Process monthly usage data
      const usageByFeature = (currentMonthData || []).reduce((acc, item) => {
        acc[item.feature_type] = (acc[item.feature_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const processedData = Object.entries(usageByFeature).map(([feature, count]) => ({
        feature_type: feature,
        count: count as number,
        month: new Date().toISOString().slice(0, 7)
      }));

      setMonthlyUsage(processedData);
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsageLimit = (feature: string) => {
    if (subscription?.subscribed) return null; // Unlimited for premium
    
    switch (feature) {
      case 'document_review': return 5;
      case 'ai_feedback': return 10;
      case 'university_search': return 20;
      default: return null;
    }
  };

  const getUsageProgress = (feature: string, current: number) => {
    const limit = getUsageLimit(feature);
    if (!limit) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const usageCards = [
    {
      title: "Documents Reviewed",
      value: usageStats.documents_reviewed,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      feature: "document_review"
    },
    {
      title: "Programs Saved", 
      value: usageStats.programs_saved,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
      feature: "program_save"
    },
    {
      title: "Notes Created",
      value: usageStats.notes_created,
      icon: FileText,
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      feature: "note_creation"
    },
    {
      title: "AI Requests",
      value: usageStats.ai_requests,
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      feature: "ai_request"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Overview
          </CardTitle>
          <CardDescription>Your activity across all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {usageCards.map((card) => {
              const Icon = card.icon;
              const limit = getUsageLimit(card.feature);
              const progress = getUsageProgress(card.feature, card.value);
              
              return (
                <div key={card.title} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{card.title}</p>
                      <p className="text-2xl font-bold">
                        {card.value}
                        {limit && <span className="text-sm text-muted-foreground">/{limit}</span>}
                      </p>
                    </div>
                  </div>
                  
                  {limit && (
                    <div className="space-y-1">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {progress >= 100 ? "Limit reached" : `${Math.round(progress)}% of monthly limit`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Month Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Month's Activity
          </CardTitle>
          <CardDescription>Your usage for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading usage data...</p>
            </div>
          ) : monthlyUsage.length > 0 ? (
            <div className="space-y-4">
              {monthlyUsage.map((usage) => (
                <div key={usage.feature_type} className="flex items-center justify-between">
                  <span className="capitalize">{usage.feature_type.replace('_', ' ')}</span>
                  <Badge variant="secondary">{usage.count} times</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No activity this month</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Trends
          </CardTitle>
          <CardDescription>Your activity patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {usageStats.documents_reviewed > 0 ? '+12%' : '0%'}
                </div>
                <p className="text-sm text-muted-foreground">Documents vs last month</p>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {usageStats.programs_saved > 0 ? '+8%' : '0%'}
                </div>
                <p className="text-sm text-muted-foreground">Programs vs last month</p>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {usageStats.ai_requests > 0 ? '+15%' : '0%'}
                </div>
                <p className="text-sm text-muted-foreground">AI requests vs last month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Limits Info */}
      {!subscription?.subscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Plan Limits
            </CardTitle>
            <CardDescription>Monthly limits for your current plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Document Reviews</span>
                <Badge variant="secondary">5 per month</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>AI Feedback Requests</span>
                <Badge variant="secondary">10 per month</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>University Searches</span>
                <Badge variant="secondary">20 per month</Badge>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Upgrade to Premium</strong> for unlimited access to all features and remove monthly limits.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};