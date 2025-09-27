"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <div>
      <Button
        variant="outline"
        className="flex items-center gap-2   px-3"
        onClick={() => {
          setTheme((prevTheme) =>
            prevTheme === "light" ? "dark" : "light"
          );
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
