
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out", 
        isMobile ? "p-2" : "p-6",
        sidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        {isMobile && (
          <div className="mb-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-12 w-12"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className={cn(
          "container mx-auto max-w-6xl pb-8",
          isMobile ? "px-0" : "px-4"
        )}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
