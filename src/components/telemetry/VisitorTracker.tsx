"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getOrCreateId(storage: Storage, key: string, prefix: string): string {
  try {
    let id = storage.getItem(key);
    if (!id) {
      id = `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  }
}

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  const sendPing = (isHeartbeat: boolean = false) => {
    try {
      if (typeof window === "undefined") return;

      const visitorId = getOrCreateId(localStorage, "_td_vid", "v");
      const sessionId = getOrCreateId(sessionStorage, "_td_sid", "s");
      const fullPath = searchParams?.toString() 
        ? `${pathname}?${searchParams.toString()}` 
        : pathname || "/";

      const payload = {
        visitorId,
        sessionId,
        path: fullPath,
        referrer: document.referrer || "",
        isHeartbeat
      };

      const jsonStr = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        const blob = new Blob([jsonStr], { type: "application/json" });
        navigator.sendBeacon("/api/telemetry/track", blob);
      } else {
        fetch("/api/telemetry/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jsonStr,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {
      // Telemetry must never crash application
    }
  };

  // Track pageviews on route change
  useEffect(() => {
    const fullPath = searchParams?.toString() 
      ? `${pathname}?${searchParams.toString()}` 
      : pathname || "/";

    if (lastTrackedPath.current !== fullPath) {
      lastTrackedPath.current = fullPath;
      sendPing(false);
    }
  }, [pathname, searchParams]);

  // Periodic heartbeat every 60 seconds when user tab is active
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendPing(true);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return null;
}

export default function VisitorTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
