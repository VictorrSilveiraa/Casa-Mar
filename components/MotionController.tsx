"use client";

import { useEffect } from "react";
import { onIntroDone, startReveals } from "@/lib/motion";

/** Boots the scroll reveal system once the opening loader is done. Renders nothing. */
export function MotionController() {
  useEffect(() => {
    document.documentElement.dataset.motion = "ready";
    let stop: (() => void) | undefined;
    const unsubscribe = onIntroDone(() => { stop = startReveals(); });
    return () => { unsubscribe(); stop?.(); };
  }, []);
  return null;
}
