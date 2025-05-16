
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar className={sidebarOpen ? "" : "hidden"} />
      
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out p-4 md:p-6", 
        sidebarOpen ? "md:ml-64" : "ml-0"
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
        <div className="container mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
