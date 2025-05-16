
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Documents from "./pages/Documents";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { TagProvider } from "./contexts/TagContext";
import { ProgramProvider } from "./contexts/ProgramContext";
import { PerplexityProvider } from "./contexts/PerplexityContext";
import { OpenAIProvider } from "./contexts/OpenAIContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProgramProvider>
        <TagProvider>
          <PerplexityProvider>
            <OpenAIProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="search" element={<Search />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="insights" element={<Insights />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </OpenAIProvider>
          </PerplexityProvider>
        </TagProvider>
      </ProgramProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
