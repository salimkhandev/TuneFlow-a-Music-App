"use client";
import { useNetworkDetection } from '@/hooks/useNetworkDetection';

export function NetworkDetector() {
    useNetworkDetection();
    return null; // This component doesn't render anything
}