
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
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
import Auth from "./pages/Auth";
import Home from "./pages/Home";

// Create the query client instance
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// App routes component that has access to all contexts
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="search" element={<Search />} />
        <Route path="us-search" element={<USSearch />} />
        <Route path="documents" element={<Documents />} />
        <Route path="notes" element={<Notes />} />
        <Route path="insights" element={<Insights />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="uniapp-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <ProgramProvider>
              <TagProvider>
                <AINotesProvider>
                  <PerplexityProvider>
                    <BrowserRouter>
                      <div className="min-h-screen bg-background text-foreground">
                        <Toaster />
                        <Sonner />
                        <AppRoutes />
                      </div>
                    </BrowserRouter>
                  </PerplexityProvider>
                </AINotesProvider>
              </TagProvider>
            </ProgramProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
