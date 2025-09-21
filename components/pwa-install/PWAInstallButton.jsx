"use client";
import { useEffect, useState } from "react";

const InstallPWAButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Ensure we're on the client side
        setIsClient(true);
        
        // Check if app is already installed
        const checkInstalled = () => {
            if (typeof window !== 'undefined' && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true)) {
                setIsInstalled(true);
            }
        };

        // Check if iOS
        const checkIOS = () => {
            if (typeof window !== 'undefined') {
                const userAgent = window.navigator.userAgent.toLowerCase();
                setIsIOS(/iphone|ipad|ipod/.test(userAgent) && !window.MSStream);
            }
        };

        checkInstalled();
        checkIOS();

        // Listen for beforeinstallprompt (Android & desktop)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); // prevent auto prompt
            setDeferredPrompt(e);
        };
        
        if (typeof window !== 'undefined') {
            window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

            // Listen for appinstalled event
            const handleAppInstalled = () => {
                setIsInstalled(true);
                setDeferredPrompt(null);
            };
            window.addEventListener("appinstalled", handleAppInstalled);

            return () => {
                window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
                window.removeEventListener("appinstalled", handleAppInstalled);
            };
        }
    }, []);

    const handleInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt(); // show native prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                console.log("User choice:", choiceResult.outcome);
                setDeferredPrompt(null);
            });
        }
    };

    // Don't render on server side
    if (!isClient) return null;
    
    if (isInstalled) return null; // hide button if already installed

    return (
        <div className="fixed top-20 left-5 z-50">
            {deferredPrompt ? (
                <button
                    onClick={handleInstall}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
                >
                    Install App
                </button>
            ) : isIOS ? (
                <div className="p-3 bg-gray-100 rounded-md shadow-md max-w-xs text-sm text-gray-800">
                    To install this app on iOS: Tap <span className="font-bold">Share</span> → <span className="font-bold">Add to Home Screen</span>
                </div>
            ) : null}
        </div>
    );
};

export default InstallPWAButton;