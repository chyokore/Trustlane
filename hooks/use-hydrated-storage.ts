"use client";

import { useEffect, useState } from "react";
import { trustlaneStorageUpdatedEvent } from "@/lib/dashboard-storage";

export function useHydratedStorage<T>(read: () => T) {
  const [state, setState] = useState<{ hydrated: false; value: undefined } | { hydrated: true; value: T }>({ hydrated: false, value: undefined });
  useEffect(() => { const refresh = () => setState({ hydrated: true, value: read() }); refresh(); window.addEventListener("storage", refresh); window.addEventListener(trustlaneStorageUpdatedEvent, refresh); return () => { window.removeEventListener("storage", refresh); window.removeEventListener(trustlaneStorageUpdatedEvent, refresh); }; }, [read]);
  return state;
}
