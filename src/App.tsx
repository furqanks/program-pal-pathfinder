
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import UpdatedSearch from "./pages/UpdatedSearch";
import USSearch from "./pages/USSearch";
import Documents from "./pages/Documents";
import Notes from "./pages/Notes";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { TagProvider } from "./contexts/TagContext";
import { ProgramProvider } from "./contexts/ProgramContext";
import { PerplexityProvider } from "./contexts/PerplexityContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AINotesProvider } from "./contexts/AINotesContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StripeProvider } from "./components/stripe/StripeProvider";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";

// Create the query client instance
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Public Documents route - accessible without login
const PublicDocuments = () => {
  return <Documents />;
};

// App routes component that has access to all contexts
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/documents" element={<PublicDocuments />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="search" element={<Search />} />
        <Route path="updated-search" element={<UpdatedSearch />} />
        <Route path="us-search" element={<USSearch />} />
        <Route path="notes" element={<Notes />} />
        <Route path="insights" element={<Insights />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="uniapp-ui-theme">
        <TooltipProvider>
            <AuthProvider>
              <StripeProvider>
                <ProgramProvider>
                  <TagProvider>
                    <AINotesProvider>
                      <PerplexityProvider>
                        <BrowserRouter>
                      <div className="min-h-screen bg-white text-gray-900">
                        <Toaster />
                        <Sonner />
                        <AppRoutes />
                      </div>
                        </BrowserRouter>
                      </PerplexityProvider>
                    </AINotesProvider>
                  </TagProvider>
                </ProgramProvider>
              </StripeProvider>
            </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
