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
  return <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar with improved responsive behavior */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Main content area with proper responsive spacing */}
      <main className={cn("flex-1 overflow-auto sidebar-transition bg-background", "relative flex flex-col",
    // Responsive sidebar spacing
    sidebarOpen ? isMobile ? "ml-0" : "ml-64" : "ml-0 md:ml-16")}>
        {/* Always visible header with toggle button */}
        <div className={cn("sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border", "flex items-center justify-between", isMobile ? "px-4 py-3" : "px-6 py-4")}>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="nav-item h-9 w-9 flex-shrink-0 text-gray-500 bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
          
          {/* Optional: Add breadcrumbs or page title here */}
          <div className="flex items-center gap-2">
            {/* Placeholder for future header actions */}
          </div>
        </div>
        
        {/* Page content with proper padding and responsive design */}
        <div className={cn("flex-1 p-6 md:p-8 container-responsive", "min-h-0" // Allows proper flex shrinking
      )}>
          <Outlet />
        </div>
      </main>
    </div>;
};
export default Layout;