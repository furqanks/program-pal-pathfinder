
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out bg-background", 
        sidebarOpen ? (isMobile ? "ml-0" : "ml-56") : "ml-0 md:ml-14"
      )}>
        {/* Mobile menu button - always visible on mobile when sidebar closed */}
        {isMobile && !sidebarOpen && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-accent shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Content with proper top padding when menu button is shown */}
        <div className={cn(
          "w-full h-full",
          isMobile && !sidebarOpen && "pt-16"
        )}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
