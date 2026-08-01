"use client";

import { useEffect, useState } from "react";

export function useHydratedStorage<T>(read: () => T) {
  const [state, setState] = useState<{ hydrated: false; value: undefined } | { hydrated: true; value: T }>({ hydrated: false, value: undefined });
  useEffect(() => { setState({ hydrated: true, value: read() }); }, [read]);
  return state;
}
