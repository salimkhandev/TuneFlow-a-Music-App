"use client";
import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const swUrl = "/service-worker.js?v=" + Date.now();
      navigator.serviceWorker
        .register(swUrl, { updateViaCache: "none" })
        .then((reg) => {
          console.log("Service Worker registered");
          // Check immediately for updates
          reg.update().catch(() => {});

          // If there's a waiting worker, activate it
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          // When the controller changes, reload to take control
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
          });
        })
        .catch((err) => console.log("SW registration failed", err));
    }
  }, []);

  return null;
}
