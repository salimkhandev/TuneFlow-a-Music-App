"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export function useRoutePrefetch() {
  const router = useRouter();

  const prefetchRoute = useCallback((href) => {
    // Prefetch the route in the background
    router.prefetch(href);
  }, [router]);

  // Prefetch common routes on mount
  useEffect(() => {
    const commonRoutes = [
      '/songs',
      '/playlists', 
      '/artists',
      '/albums',
      '/liked-songs'
    ];

    // Prefetch routes after a short delay to not block initial load
    const timeoutId = setTimeout(() => {
      commonRoutes.forEach(route => {
        router.prefetch(route);
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return { prefetchRoute };
}
