// hooks/useNetworkDetection.js
"use client";
import { setNetAvail, setValue } from '@/lib/slices/networkSlice';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export function useNetworkDetection() {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    // Define paths that require online access (you can customize this)
    const onlinePathsOnly = ["/songs", "/playlists", "/artists", "/albums","/"];
    const isOfflineRestrictedPage = onlinePathsOnly.includes(pathname);

    useEffect(() => {
        // Ensure we're on the client side
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Only run network detection on client side
        if (!isClient || typeof window === 'undefined') return;

        const checkInternet = () => {
            return fetch("https://api.ipify.org?format=json")
                .then(response => response.ok)
                .catch(() => false);
        };

        const detectNetwork = () => {
            return Promise.race([
                new Promise(resolve => {
                    window.addEventListener('online', () => resolve(true), { once: true });
                    window.addEventListener('offline', () => resolve(false), { once: true });
                }),
                checkInternet()
            ]);
        };

        detectNetwork().then(isOnline => {
            dispatch(setNetAvail(isOnline));
            dispatch(setValue(isOnline ? true : false));
            
            if (isOnline) {
                console.log('🌐 Network: Online');
            } else {
                console.log('📴 Network: Offline');
                // Redirect to liked songs when offline (unless already there)
                if (pathname !== '/liked-songs') {
                    console.log('🔄 Redirecting to liked songs (offline mode)');
                    router.push('/liked-songs');
                }
            }
            
            // Handle offline restricted pages
            if (!isOnline && isOfflineRestrictedPage) {
                console.log('🔄 Redirecting from offline-restricted page');
                router.push('/liked-songs');
            }
        });

    }, [dispatch, isClient, router, pathname, isOfflineRestrictedPage]);
}