
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
        {isMobile && !sidebarOpen && (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-accent"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
