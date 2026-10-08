"use client";

import { useEffect, useState } from "react";
import AndroidHardwareTest from "@/components/hardware/AndroidHardwareTest";
import DesktopHardwareTest from "@/components/hardware/DesktopHardwareTest";
import IosHardwareTest from "@/components/hardware/IosHardwareTest";
import MacHardwareTest from "@/components/hardware/MacHardwareTest";
import {
  detectPlatform,
  type Platform,
} from "@/components/hardware/hardware-shared";

const PLATFORMS: Platform[] = ["iphone", "ipad", "android", "mac", "desktop"];

export default function HardwareTestPage() {
  // null until the browser has been checked, so the server render and the
  // first client render match (no hydration warning).
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    let detected = detectPlatform();

    // Dev only: /hardware-test?platform=ipad (iphone / ipad / android / mac /
    // desktop) lets you preview each version from any browser.
    if (process.env.NODE_ENV !== "production") {
      const override = new URLSearchParams(window.location.search).get(
        "platform",
      );

      const match = PLATFORMS.find((item) => item === override);

      if (match) {
        detected = match;
      }
    }

    setPlatform(detected);
  }, []);

  if (platform === null) {
    return <main className="min-h-dvh bg-black" />;
  }

  switch (platform) {
    case "iphone":
      return <IosHardwareTest device="iphone" />;
    case "ipad":
      return <IosHardwareTest device="ipad" />;
    case "android":
      return <AndroidHardwareTest />;
    case "mac":
      return <MacHardwareTest />;
    default:
      return <DesktopHardwareTest />;
  }
}
