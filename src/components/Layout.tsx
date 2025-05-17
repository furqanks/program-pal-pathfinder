
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
  // Auto-collapse sidebar on mobile
  useState(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar className={cn(
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "fixed md:static z-20 h-full transition-transform duration-300 ease-in-out",
        isMobile && !sidebarOpen ? "w-0" : "w-64"
      )} />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out p-4 md:p-6 w-full", 
        sidebarOpen && !isMobile ? "md:ml-64" : "ml-0"
      )}>
        <div className="md:hidden mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-9 w-9"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Overlay to close sidebar on mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
