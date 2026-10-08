"use client";

import { useEffect, useState } from "react";
import AndroidHardwareTest from "@/components/hardware/AndroidHardwareTest";
import DesktopHardwareTest from "@/components/hardware/DesktopHardwareTest";
import IosHardwareTest from "@/components/hardware/IosHardwareTest";
import {
  detectPlatform,
  type Platform,
} from "@/components/hardware/hardware-shared";

export default function HardwareTestPage() {
  // null until the browser has been checked, so the server render and the
  // first client render match (no hydration warning).
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    let detected = detectPlatform();

    // Dev only: /hardware-test?platform=ios (or android / desktop) lets you
    // preview each version from a desktop browser.
    if (process.env.NODE_ENV !== "production") {
      const override = new URLSearchParams(window.location.search).get(
        "platform",
      );

      if (
        override === "ios" ||
        override === "android" ||
        override === "desktop"
      ) {
        detected = override;
      }
    }

    setPlatform(detected);
  }, []);

  if (platform === null) {
    return <main className="min-h-dvh bg-black" />;
  }

  if (platform === "ios") {
    return <IosHardwareTest />;
  }

  if (platform === "android") {
    return <AndroidHardwareTest />;
  }

  return <DesktopHardwareTest />;
}
