"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <Button
        variant="outline"
        className="flex items-center gap-2 px-3"
        onClick={() => {
          const next = (resolvedTheme || theme) === "light" ? "dark" : "light";
          setTheme(next);
        }}
      >
        {/* Sun icon (visible in light mode) */}
        <Sun className="h-5 w-5 transition-all dark:hidden" />

        {/* Moon icon (visible in dark mode) */}
        <Moon className="h-5 w-5 hidden dark:block transition-all" />

        {/* Text always visible */}
        <span className="text-sm">Toggle theme</span>
      </Button>
    </div>
  );
}
