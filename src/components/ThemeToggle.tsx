
import * as React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="bg-white border-gray-300"
      onClick={() => setTheme('light')}
    >
      {/* Sun icon - always show light theme icon */}
      <svg
        className="h-[1.2rem] w-[1.2rem]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="5" />
        <path d="m12 1 0 2m0 18 0 2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12l2 0m18 0 2 0M4.22 19.78l1.42-1.42m12.72-12.72 1.42-1.42" />
      </svg>
      <span className="sr-only">Light theme</span>
    </Button>
  );
}
