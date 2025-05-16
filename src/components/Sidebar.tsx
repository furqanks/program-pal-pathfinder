
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  FileText, 
  BarChart3, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const items = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home
    },
    {
      name: "Search",
      href: "/search",
      icon: Search
    },
    {
      name: "Documents",
      href: "/documents", 
      icon: FileText
    },
    {
      name: "Insights",
      href: "/insights",
      icon: BarChart3
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings
    }
  ];

  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            University App
          </h2>
          <div className="space-y-1">
            {items.map((item, index) => (
              <Link key={index} to={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
