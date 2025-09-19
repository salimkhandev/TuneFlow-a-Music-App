"use client";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";

export function RoutePrefetcher() {
  useRoutePrefetch();
  return null; // This component doesn't render anything
}
