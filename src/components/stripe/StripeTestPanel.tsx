import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading' | 'pending';
  message: string;
}

export function StripeTestPanel() {
  const { user, session, subscription } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const updateTestResult = (name: string, status: TestResult['status'], message: string) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        return [...prev];
      }
      return [...prev, { name, status, message }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Authentication
    updateTestResult('Authentication', 'loading', 'Checking authentication...');
    if (user && session) {
      updateTestResult('Authentication', 'success', `Authenticated as ${user.email}`);
    } else {
      updateTestResult('Authentication', 'error', 'Not authenticated');
      setIsRunning(false);
      return;
    }

    // Test 2: Subscription Status
    updateTestResult('Subscription Status', 'loading', 'Checking subscription...');
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        updateTestResult('Subscription Status', 'error', `Error: ${error.message}`);
      } else {
        updateTestResult('Subscription Status', 'success', 
          `Subscribed: ${data.subscribed}, Tier: ${data.subscription_tier || 'None'}`);
      }
    } catch (error) {
      updateTestResult('Subscription Status', 'error', `Failed to check subscription: ${error.message}`);
    }

    // Test 3: Stripe Secret Key
    updateTestResult('Stripe Configuration', 'loading', 'Testing Stripe connection...');
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        if (error.message?.includes('already have an active subscription')) {
          updateTestResult('Stripe Configuration', 'warning', 'User already has subscription (Stripe working)');
        } else if (error.message?.includes('STRIPE_SECRET_KEY')) {
          updateTestResult('Stripe Configuration', 'error', 'Stripe secret key not configured');
        } else {
          updateTestResult('Stripe Configuration', 'error', `Stripe error: ${error.message}`);
        }
      } else {
        updateTestResult('Stripe Configuration', 'success', 'Stripe connection successful');
      }
    } catch (error) {
      updateTestResult('Stripe Configuration', 'error', `Failed to test Stripe: ${error.message}`);
    }

    // Test 4: Database Schema
    updateTestResult('Database Schema', 'loading', 'Checking subscribers table...');
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        updateTestResult('Database Schema', 'error', `Database error: ${error.message}`);
      } else if (!data) {
        updateTestResult('Database Schema', 'warning', 'No subscriber record found (normal for new users)');
      } else {
        updateTestResult('Database Schema', 'success', 
          `Subscriber record exists. Status: ${data.subscription_status || 'inactive'}`);
      }
    } catch (error) {
      updateTestResult('Database Schema', 'error', `Failed to check database: ${error.message}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Stripe Integration Test Panel
        </CardTitle>
        <CardDescription>
          Run diagnostic tests to verify your Stripe checkout and subscription system is working properly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Stripe Tests'
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}

        {subscription && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Current Subscription Status</h4>
            <div className="space-y-1 text-sm">
              <div>Subscribed: {subscription.subscribed ? 'Yes' : 'No'}</div>
              <div>Tier: {subscription.subscription_tier || 'None'}</div>
              {subscription.subscription_end && (
                <div>Ends: {new Date(subscription.subscription_end).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}