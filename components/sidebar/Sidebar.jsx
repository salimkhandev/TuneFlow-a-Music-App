"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GalleryHorizontalEnd,
  Heart,
  Home,
  ListMusic,
  Music,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Liked Songs",
    icon: Heart,
    href: "/liked-songs",
  },
  {
    label: "Songs",
    icon: Music,
    href: "/songs",
  },
  {
    label: "Playlists",
    icon: ListMusic,
    href: "/playlists",
  },
  {
    label: "Artists",
    icon: Users,
    href: "/artists",
  },
  {
    label: "Albums",
    icon: GalleryHorizontalEnd,
    href: "/albums",
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex flex-col h-full bg-card w-full overflow-auto scrollbar-hidden">
      <div className="flex flex-row sm:flex-col gap-2 sm:p-4">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} prefetch={true}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-3",
                pathname === route.href && "bg-accent",
                isMobile && "px-2"
              )}
            >
              <route.icon className={cn("h-5 w-5", isMobile && "h-4 w-4")} />
              {route.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
