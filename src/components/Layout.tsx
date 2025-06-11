
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out", 
        isMobile ? "p-3" : "p-6",
        sidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        {isMobile && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-12 w-12 bg-card/80 backdrop-blur-sm border-border/50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        )}
        <div className={cn(
          "container mx-auto max-w-7xl pb-8",
          isMobile ? "px-0" : "px-4"
        )}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
