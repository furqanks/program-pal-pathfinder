
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, ListChecks, FileText, BarChart, X } from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { path: '/', label: 'Shortlist', icon: ListChecks },
  { path: '/search', label: 'Program Search', icon: Search },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/insights', label: 'Insights', icon: BarChart },
];

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const location = useLocation();

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
            <ListChecks className="h-4 w-4" />
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
        <div className={cn("text-xs text-muted-foreground", !open && "md:hidden")}>
          <p>UniApp Space © 2025</p>
          <p className="mt-1">AI-powered university applications</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
