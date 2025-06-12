
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out bg-background", 
        isMobile ? "p-3" : "p-6",
        sidebarOpen ? (isMobile ? "ml-0" : "ml-56") : "ml-0 md:ml-14"
      )}>
        {(isMobile || !sidebarOpen) && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-10 w-10 bg-card/80 backdrop-blur-sm border-border/50"
            >
              <Menu className="h-4 w-4" />
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
