"use client";

import { useEffect, useRef } from "react";

interface UseIntersectionObserverOptions {
  onIntersect: () => void;
  enabled?: boolean;
  threshold?: number;
}

export function useIntersectionObserver({
  onIntersect,
  enabled = true,
  threshold = 0.1,
}: UseIntersectionObserverOptions) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { threshold }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [onIntersect, enabled, threshold]);

  return loaderRef;
}
