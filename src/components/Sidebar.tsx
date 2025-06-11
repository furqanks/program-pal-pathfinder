
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, GraduationCap, FileText, BarChart, X, Target, StickyNote, User } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { path: '/', label: 'My Applications', icon: Target },
  { path: '/search', label: 'Discover Programs', icon: Search },
  { path: '/us-search', label: 'US Universities', icon: GraduationCap },
  { path: '/documents', label: 'Application Documents', icon: FileText },
  { path: '/notes', label: 'My Notes', icon: StickyNote },
  { path: '/insights', label: 'Progress & Analytics', icon: BarChart },
];

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();
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

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card/95 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 py-4 border-b border-border/50">
        <div className={cn("flex items-center gap-2", !open && "md:hidden")}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
            <Target className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-semibold text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            UniApp Space
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-accent/50",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/50 text-muted-foreground group-hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className={cn("", !open && "md:hidden")}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User section */}
      <div className="border-t border-border/50 p-4">
        {user ? (
          <div className={cn("flex items-center justify-between", !open && "md:justify-center")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center gap-3 w-full justify-start">
                  <Avatar className="h-10 w-10 border-2 border-border/50">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {open && (
                    <div className="flex flex-col items-start md:hidden">
                      <span className="text-sm font-medium text-foreground">{user.email}</span>
                      <span className="text-xs text-muted-foreground">Account settings</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className={cn("text-xs text-muted-foreground space-y-1", !open && "md:hidden")}>
            <p className="font-medium">UniApp Space</p>
            <p>AI-powered university applications</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
