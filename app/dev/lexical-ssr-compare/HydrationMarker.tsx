"use client";

import { useEffect, useState } from "react";

export function HydrationMarker() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div
      data-testid="hydration-marker"
      data-hydrated={hydrated ? "true" : "false"}
      className="text-xs text-slate-500"
    >
      {hydrated ? "hydrated" : "server"}
    </div>
  );
}
