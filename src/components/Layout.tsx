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
        <div className={cn("sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border", "flex items-center justify-between h-16", "px-4 sm:px-6")}>
          
          {/* Left side - Hamburger menu button */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="h-9 w-9 text-foreground hover:bg-accent md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Centered logo and brand */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
              <img src="/lovable-uploads/9804e8a0-76d7-4ec7-9860-5ce7921027ff.png" alt="Hey Grad' Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
          </div>
          
          {/* Right side placeholder */}
          <div className="flex items-center gap-2 w-9">
            {/* Placeholder for future header actions */}
          </div>
        </div>
        
        {/* Page content with proper padding and responsive design */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>;
};
export default Layout;