import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  CreditCard, 
  BarChart3, 
  Shield, 
  Receipt, 
  Database, 
  HelpCircle,
  FileText,
  GraduationCap,
  Zap
} from "lucide-react";

import { ProfileSettings } from "./ProfileSettings";
import { SubscriptionManager } from "./SubscriptionManager";
import { UsageAnalytics } from "./UsageAnalytics";
import { SecuritySettings } from "./SecuritySettings";
import { BillingCenter } from "./BillingCenter";
import { DataPrivacy } from "./DataPrivacy";
import { SupportCenter } from "./SupportCenter";

interface UserProfile {
  full_name?: string;
  education_level?: string;
  intended_major?: string;
  target_countries?: string[];
}

interface UsageStats {
  documents_reviewed: number;
  programs_saved: number;
  notes_created: number;
  ai_requests: number;
}

export const AccountDashboard = () => {
  const { user, subscription } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    documents_reviewed: 0,
    programs_saved: 0,
    notes_created: 0,
    ai_requests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Load usage statistics
      const [documentsResult, programsResult, notesResult, usageResult] = await Promise.all([
        supabase.from('user_documents').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('programs_saved').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('ai_notes').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('usage_tracking').select('id', { count: 'exact' }).eq('user_id', user?.id)
      ]);

      setUsageStats({
        documents_reviewed: documentsResult.count || 0,
        programs_saved: programsResult.count || 0,
        notes_created: notesResult.count || 0,
        ai_requests: usageResult.count || 0
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { text: 'Loading...', variant: 'secondary' as const };
    if (subscription.subscribed) return { text: 'Premium Active', variant: 'default' as const };
    return { text: 'Free Plan', variant: 'secondary' as const };
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to access your account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={profile?.full_name || user.email} />
              <AvatarFallback className="text-lg">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {profile?.full_name || 'Student'}!
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant={subscriptionStatus.variant} className="mt-2">
                {subscriptionStatus.text}
              </Badge>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-auto">
            <Card className="text-center p-4">
              <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{usageStats.documents_reviewed}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </Card>
            <Card className="text-center p-4">
              <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{usageStats.programs_saved}</div>
              <div className="text-sm text-muted-foreground">Programs</div>
            </Card>
            <Card className="text-center p-4">
              <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{usageStats.notes_created}</div>
              <div className="text-sm text-muted-foreground">Notes</div>
            </Card>
            <Card className="text-center p-4">
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{usageStats.ai_requests}</div>
              <div className="text-sm text-muted-foreground">AI Requests</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings profile={profile} onProfileUpdate={setProfile} />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="usage">
          <UsageAnalytics usageStats={usageStats} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="billing">
          <BillingCenter />
        </TabsContent>

        <TabsContent value="data">
          <DataPrivacy />
        </TabsContent>

        <TabsContent value="support">
          <SupportCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};