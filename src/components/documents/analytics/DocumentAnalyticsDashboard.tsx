import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, FileText, Clock, Target, Award, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyticsData {
  writingProgress: any;
  documentAnalytics: any;
  productivityInsights: any;
  scoreProgression: any;
  portfolioOverview: any;
}

export const DocumentAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeframe]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all analytics data
      const [writingProgress, productivityInsights, scoreProgression, portfolioOverview] = await Promise.all([
        supabase.functions.invoke('document-analytics', {
          body: { action: 'get_writing_progress', userId: user.id, timeframe }
        }),
        supabase.functions.invoke('document-analytics', {
          body: { action: 'get_productivity_insights', userId: user.id, timeframe }
        }),
        supabase.functions.invoke('document-analytics', {
          body: { action: 'get_score_progression', userId: user.id }
        }),
        supabase.functions.invoke('document-analytics', {
          body: { action: 'get_portfolio_overview', userId: user.id }
        })
      ]);

      setAnalyticsData({
        writingProgress: writingProgress.data,
        documentAnalytics: null,
        productivityInsights: productivityInsights.data,
        scoreProgression: scoreProgression.data,
        portfolioOverview: portfolioOverview.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { writingProgress, productivityInsights, scoreProgression, portfolioOverview } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writingProgress?.totalWords?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {writingProgress?.avgWordsPerSession || 0} avg per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((writingProgress?.totalTimeSpent || 0) / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              {writingProgress?.avgTimePerSession || 0} min avg session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writingProgress?.streak || 0} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioOverview?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(portfolioOverview?.completionRate || 0)}% complete
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Writing Progress</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="scores">Score Trends</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Writing Activity</CardTitle>
                <CardDescription>Words written per day over the last {timeframe}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={Object.entries(writingProgress?.dailyProgress || {}).map(([date, data]: [string, any]) => ({
                    date: new Date(date).toLocaleDateString(),
                    words: data.words,
                    time: Math.round(data.time / 60)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="words" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
                <CardDescription>Distribution of your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(portfolioOverview?.documentsByType || {}).map(([type, count]) => ({
                        name: type,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      label
                    >
                      {Object.entries(portfolioOverview?.documentsByType || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity</CardTitle>
                <CardDescription>When you're most productive</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(productivityInsights?.hourlyActivity || {}).map(([hour, count]) => ({
                    hour: `${hour}:00`,
                    sessions: count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
                <CardDescription>Your writing patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Most Productive Hour</span>
                    <Badge>{productivityInsights?.mostProductiveHour || 'N/A'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Best Day</span>
                    <Badge variant="secondary">{productivityInsights?.bestDay || 'N/A'}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Insights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {productivityInsights?.insights?.map((insight: string, index: number) => (
                      <li key={index}>• {insight}</li>
                    )) || []}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Progression</CardTitle>
              <CardDescription>How your document scores improve over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={scoreProgression?.scoreData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(scoreProgression?.averageByType || {}).map(([type, avg]: [string, any]) => (
                  <div key={type} className="text-center">
                    <div className="text-2xl font-bold">{avg.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">{type}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Readiness</CardTitle>
                <CardDescription>Completion status for each program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioOverview?.applicationReadiness?.map((app: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{app.programName}</div>
                        <div className="text-sm text-muted-foreground">{app.university}</div>
                      </div>
                      <Badge variant={app.readinessScore >= 80 ? "default" : app.readinessScore >= 50 ? "secondary" : "destructive"}>
                        {Math.round(app.readinessScore)}%
                      </Badge>
                    </div>
                    <Progress value={app.readinessScore} />
                    {app.missingDocuments?.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Missing: {app.missingDocuments.join(', ')}
                      </div>
                    )}
                  </div>
                )) || []}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest document updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioOverview?.recentActivity?.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{doc.document_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {doc.score && (
                      <Badge variant={doc.score >= 7 ? "default" : "secondary"}>
                        {doc.score}/10
                      </Badge>
                    )}
                  </div>
                )) || []}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};