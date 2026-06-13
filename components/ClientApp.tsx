"use client";

import { useEffect, useState } from "react";
import { CapabilityGate } from "./CapabilityGate";
import { CameraScanner } from "./CameraScanner";
import { getBrowserCapabilities } from "@/lib/browserCapabilities";
import type { CapabilityResult } from "@/lib/types";

export function ClientApp({ hasGeminiKey }: { hasGeminiKey: boolean }) {
  const [capabilityResult, setCapabilityResult] = useState<CapabilityResult | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCapabilityResult(getBrowserCapabilities());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <CapabilityGate result={capabilityResult}>
      <CameraScanner hasGeminiKey={hasGeminiKey} />
    </CapabilityGate>
  );
}
