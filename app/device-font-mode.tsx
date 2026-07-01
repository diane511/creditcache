// main/app/device-font-mode.tsx
"use client";

import { useEffect } from "react";

function detectPlatform() {
  const ua = navigator.userAgent || navigator.vendor;

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isAndroid = /Android/i.test(ua);

  return isIOS ? "ios" : isAndroid ? "android" : "other";
}

export default function DeviceFontMode() {
  useEffect(() => {
    const platform = detectPlatform();
    document.documentElement.dataset.platform = platform;
  }, []);

  return null;
}