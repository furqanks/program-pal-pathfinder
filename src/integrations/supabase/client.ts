
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljoxowcnyiqsbmzkkudn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb3hvd2NueWlxc2JtemtrdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODIwMzEsImV4cCI6MjA2MzA1ODAzMX0.Ogn9ZXzTrEwKns_EQXrH1g04GXbnSPAUDN4-0hEHcHw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
