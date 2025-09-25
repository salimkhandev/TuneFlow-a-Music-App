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
          // navigator.serviceWorker.addEventListener("controllerchange", () => {
          //   window.location.reload();
          // });

          // Expose helpers to clear caches and trigger update programmatically
          // const clearCaches = () => {
          //   if (reg.active) {
          //     return new Promise((resolve) => {
          //       const onMessage = (e) => {
          //         if (e.data?.type === "CACHES_CLEARED") {
          //           navigator.serviceWorker.removeEventListener("message", onMessage);
          //           resolve(true);
          //         }
          //       };
          //       navigator.serviceWorker.addEventListener("message", onMessage);
          //       reg.active.postMessage({ type: "CLEAR_CACHES" });
          //       // Fallback resolve after 5s
          //       setTimeout(() => {
          //         navigator.serviceWorker.removeEventListener("message", onMessage);
          //         resolve(false);
          //       }, 5000);
          //     });
          //   }
          //   return Promise.resolve(false);
          // };

          const checkForUpdate = () => reg.update().catch(() => {});

          // Attach to window for easy triggering anywhere
          try {
            window.__sw = { clearCaches, checkForUpdate, reg };
          } catch {}
        })
        .catch((err) => console.log("SW registration failed", err));
    }
  }, []);

  return null;
}
