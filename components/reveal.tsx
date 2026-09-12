"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps a section of content and fades/settles it into place the first time it enters the
 * viewport — via IntersectionObserver, not a scroll listener. Plays once (unobserves itself
 * after triggering), so re-scrolling past it doesn't replay the animation. Reduced-motion is
 * handled globally in globals.css (`.reveal` resolves to fully visible with no transition).
 */
export function Reveal({
  children,
  variant = "up",
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "up" | "scale";
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const baseClass = variant === "scale" ? "reveal-scale" : "reveal";

  return (
    <div
      ref={ref}
      className={`${baseClass} ${visible ? "reveal-visible" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
