import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, Globe, Mail, Settings } from "lucide-react";

interface UserProfile {
  full_name?: string;
  phone_number?: string;
  time_zone?: string;
  language_preference?: string;
  education_level?: string;
  target_application_year?: number;
  intended_major?: string;
  country_of_origin?: string;
  target_countries?: string[];
  academic_achievements?: string;
  theme_preference?: string;
  email_notifications?: boolean;
  marketing_communications?: boolean;
}

interface ProfileSettingsProps {
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const ProfileSettings = ({ profile, onProfileUpdate }: ProfileSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile || {});

  const timeZones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'America/Toronto'
  ];

  const educationLevels = [
    'High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'PhD'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia',
    'Netherlands', 'Sweden', 'Switzerland', 'Singapore', 'Japan', 'South Korea'
  ];

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetCountriesChange = (value: string) => {
    const countries = value.split(',').map(c => c.trim()).filter(c => c);
    setFormData(prev => ({ ...prev, target_countries: countries }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={formData.full_name || user?.email} />
              <AvatarFallback className="text-lg">
                {getInitials(formData.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                Change Picture
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Upload a profile picture to personalize your account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone_number || ''}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select 
                value={formData.time_zone || 'UTC'} 
                onValueChange={(value) => handleInputChange('time_zone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={formData.language_preference || 'en'} 
                onValueChange={(value) => handleInputChange('language_preference', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>Help us personalize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="education_level">Education Level</Label>
              <Select 
                value={formData.education_level || ''} 
                onValueChange={(value) => handleInputChange('education_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_year">Target Application Year</Label>
              <Input
                id="application_year"
                type="number"
                value={formData.target_application_year || ''}
                onChange={(e) => handleInputChange('target_application_year', parseInt(e.target.value))}
                placeholder="2025"
                min="2024"
                max="2030"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Intended Major/Field</Label>
              <Input
                id="major"
                value={formData.intended_major || ''}
                onChange={(e) => handleInputChange('intended_major', e.target.value)}
                placeholder="Computer Science, Business, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country_origin">Country of Origin</Label>
              <Select 
                value={formData.country_of_origin || ''} 
                onValueChange={(value) => handleInputChange('country_of_origin', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_countries">Target Countries (comma-separated)</Label>
            <Input
              id="target_countries"
              value={formData.target_countries?.join(', ') || ''}
              onChange={(e) => handleTargetCountriesChange(e.target.value)}
              placeholder="United States, Canada, United Kingdom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Academic Achievements</Label>
            <Textarea
              id="achievements"
              value={formData.academic_achievements || ''}
              onChange={(e) => handleInputChange('academic_achievements', e.target.value)}
              placeholder="GPA, test scores, awards, extracurriculars..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme Preference</Label>
            <Select 
              value={formData.theme_preference || 'system'} 
              onValueChange={(value) => handleInputChange('theme_preference', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your applications and account
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={formData.email_notifications ?? true}
                onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing">Marketing Communications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, updates, and promotional content
                </p>
              </div>
              <Switch
                id="marketing"
                checked={formData.marketing_communications ?? false}
                onCheckedChange={(checked) => handleInputChange('marketing_communications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};