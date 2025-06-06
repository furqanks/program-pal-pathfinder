
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, GraduationCap, FileText, BarChart, X, LogOut, User, BookOpen, Target, StickyNote } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 py-4">
        <h1 className={cn("font-semibold text-lg", !open && "md:hidden")}>
          UniApp Space
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X className="h-4 w-4" />
          ) : (
            <Target className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className={cn("", !open && "md:hidden")}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        {user ? (
          <div className={cn("flex items-center justify-between", !open && "md:justify-center")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  {open && <span className="text-sm font-medium md:hidden">{user.email}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {open && (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="md:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className={cn("text-xs text-muted-foreground", !open && "md:hidden")}>
            <p>UniApp Space © 2025</p>
            <p className="mt-1">AI-powered university applications</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
