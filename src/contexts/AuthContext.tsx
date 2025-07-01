
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionInfo = {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionInfo | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  checkSubscription: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Only synchronous state updates here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check subscription after auth state change
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setTimeout(() => {
            checkSubscription();
          }, 0);
        } else {
          setSubscription(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription for existing session
      if (session?.user) {
        setTimeout(() => {
          checkSubscription();
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('Sign in result:', result.error ? 'Error' : 'Success');
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error, data: { user: null, session: null } };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Starting signup process for:', email);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            signup_timestamp: new Date().toISOString()
          }
        }
      });
      
      console.log('Signup API response:', {
        hasUser: !!result.data?.user,
        hasSession: !!result.data?.session,
        userEmail: result.data?.user?.email,
        userConfirmed: result.data?.user?.email_confirmed_at ? 'Yes' : 'No',
        error: result.error?.message || 'None'
      });
      
      return result;
    } catch (error) {
      console.error('Signup unexpected error:', error);
      return { 
        error: error as Error, 
        data: { user: null, session: null } 
      };
    }
  };

  const signOut = async () => {
    setSubscription(null);
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        subscription, 
        signIn, 
        signUp, 
        signOut, 
        checkSubscription, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
