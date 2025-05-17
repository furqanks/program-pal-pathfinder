
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Documents from "./pages/Documents";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { TagProvider } from "./contexts/TagContext";
import { ProgramProvider } from "./contexts/ProgramContext";
import { PerplexityProvider } from "./contexts/PerplexityContext";
import React from 'react';

// Create the query client instance
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProgramProvider>
          <TagProvider>
            <PerplexityProvider>
              <BrowserRouter>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="search" element={<Search />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="insights" element={<Insights />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </PerplexityProvider>
          </TagProvider>
        </ProgramProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
