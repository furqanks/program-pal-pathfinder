
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
        "flex-1 overflow-auto transition-all duration-300 ease-in-out p-3 md:p-6", 
        sidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        <div className="md:hidden mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <div className="container mx-auto max-w-6xl pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
