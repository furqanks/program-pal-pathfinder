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
    // Responsive sidebar spacing - simplified
    sidebarOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16")}>
        {/* Always visible header with toggle button */}
        <div className={cn(
          "sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border",
          "grid grid-cols-3 items-center h-16",
          "px-3 sm:px-6"
        )}>
          {/* Left: Hamburger (always visible on mobile) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9 text-foreground hover:bg-accent md:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: Logo (non-interactive to avoid overlapping the menu) */}
          <div className="flex items-center justify-center pointer-events-none">
            <div className="w-28 h-10 sm:w-32 sm:h-12">
              <img
                src="/lovable-uploads/9804e8a0-76d7-4ec7-9860-5ce7921027ff.png"
                alt="Hey Grad' Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
          </div>

          {/* Right: Placeholder for future actions (keeps layout balanced) */}
          <div className="flex items-center justify-end" />
        </div>
        
        {/* Page content with proper padding and responsive design */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>;
};
export default Layout;