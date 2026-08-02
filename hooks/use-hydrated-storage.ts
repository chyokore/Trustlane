"use client";

import { useEffect, useState } from "react";

export function useHydratedStorage<T>(read: () => T) {
  const [state, setState] = useState<{ hydrated: false; value: undefined } | { hydrated: true; value: T }>({ hydrated: false, value: undefined });
  useEffect(() => { const refresh = () => setState({ hydrated: true, value: read() }); refresh(); window.addEventListener("storage", refresh); return () => window.removeEventListener("storage", refresh); }, [read]);
  return state;
}
