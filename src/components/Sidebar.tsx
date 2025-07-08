import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, GraduationCap, FileText, BarChart, Target, StickyNote, User, Sparkles, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  {
    path: '/',
    label: 'My Applications',
    icon: Target
  },
  {
    path: '/search',
    label: 'Discover Programs',
    icon: Search
  },
  {
    path: '/updated-search',
    label: 'Updated Search',
    icon: Sparkles
  },
  {
    path: '/us-search',
    label: 'US Universities',
    icon: GraduationCap
  },
  {
    path: '/documents',
    label: 'Application Documents',
    icon: FileText
  },
  {
    path: '/notes',
    label: 'My Notes',
    icon: StickyNote
  },
  {
    path: '/insights',
    label: 'Progress & Analytics',
    icon: BarChart
  }
];

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const getUserInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col",
      "bg-sidebar text-sidebar-foreground border-r border-sidebar-border sidebar-transition",
      // Responsive width with smooth transitions
      open 
        ? "w-64 translate-x-0" 
        : "w-16 -translate-x-full md:translate-x-0",
      // Enhanced shadow for depth
      "shadow-elevated"
    )}>
      {/* Header with brand */}
      <div className={cn(
        "flex items-center justify-between border-b border-border/50",
        "h-16 px-4 py-3"
      )}>
        <div className={cn(
          "flex items-center gap-3 transition-opacity duration-200",
          !open && "md:justify-center"
        )}>
          {/* Brand icon */}
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
            <Target className="h-4 w-4 text-primary-foreground" />
          </div>
          
          {/* Brand text with smooth transition */}
          {open && (
            <div className="animate-fade-in">
              <h1 className="text-heading text-sm font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                UniApp Space
              </h1>
            </div>
          )}
        </div>

        {/* Theme toggle - only visible when open */}
        {open && (
          <div className="flex items-center gap-2 animate-fade-in">
            <ThemeToggle />
          </div>
        )}
      </div>

      {/* Navigation with improved spacing */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3",
                  "text-sm font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-ring",
                  // Active state styling with better visibility
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm" 
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                  // Responsive behavior
                  !open && "md:justify-center md:px-2"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors duration-200 flex-shrink-0",
                  isActive 
                    ? "text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                )} />
                
                {/* Label with fade animation */}
                {open && (
                  <span className="animate-fade-in truncate">
                    {item.label}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User section with enhanced styling */}
      <div className="border-t border-border/50 p-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full p-3 h-auto justify-start gap-3 hover:bg-accent",
                  "focus-ring rounded-xl transition-all duration-200",
                  !open && "md:justify-center md:px-2"
                )}
              >
                <Avatar className="h-8 w-8 border-2 border-border/50 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                {open && (
                  <div className="flex flex-col items-start animate-fade-in">
                    <span className="text-sm font-medium text-foreground truncate max-w-36">
                      {user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Account settings
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-popover border border-border shadow-lg"
            >
              <DropdownMenuItem 
                onClick={() => navigate("/account")}
                className="flex items-center gap-3 py-3 focus:bg-accent cursor-pointer"
              >
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium truncate">{user.email}</span>
                  <span className="text-xs text-muted-foreground">Manage account</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="flex items-center gap-3 py-3 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className={cn(
            "text-xs text-muted-foreground space-y-2 text-center",
            !open && "md:hidden"
          )}>
            <p className="font-medium text-foreground">UniApp Space</p>
            <p className="leading-relaxed">AI-powered university applications</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;