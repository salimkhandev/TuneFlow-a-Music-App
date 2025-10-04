"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleStart = () => {
      if (isNavigatingRef.current) return; // Already navigating
      
      isNavigatingRef.current = true;
      setIsNavigating(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    const handleComplete = () => {
      // Hide loading indicator immediately for fast navigation
      isNavigatingRef.current = false;
      setIsNavigating(false);
    };

    // Listen for route changes using a more compatible approach
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      handleStart();
      const result = originalPushState.apply(this, args);
      handleComplete();
      return result;
    };

    window.history.replaceState = function(...args) {
      handleStart();
      const result = originalReplaceState.apply(this, args);
      handleComplete();
      return result;
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleStart);
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleStart);
    };
  }, []);

  // Hide loading indicator when pathname changes (route completed)
  useEffect(() => {
    isNavigatingRef.current = false;
    setIsNavigating(false);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse">
        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </div>
    </div>
  );
}
