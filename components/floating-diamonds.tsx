/**
 * A sparse field of slowly drifting diamond outlines, absolutely positioned within a relative
 * parent. Positions/sizes/delays are a fixed, hand-picked table — never Math.random() at
 * render time, which would mismatch between server and client renders. Deliberately sparse
 * (7 elements) and GPU-cheap (transform + opacity only, via the shared `float` keyframe).
 * Server Component — no interactivity, so no client bundle cost.
 */
// Tailwind's scanner needs statically-visible class names, so the animation class is looked up
// here rather than built with a template literal.
const DURATION_CLASS = {
  slow: "motion-safe:animate-float-slow",
  slower: "motion-safe:animate-float-slower",
} as const;

const LAYOUT = [
  { top: "12%", left: "8%", size: 14, duration: "slow", delay: 0 },
  { top: "22%", left: "88%", size: 10, duration: "slower", delay: 2 },
  { top: "68%", left: "5%", size: 12, duration: "slower", delay: 4 },
  { top: "78%", left: "92%", size: 16, duration: "slow", delay: 1 },
  { top: "45%", left: "50%", size: 8, duration: "slower", delay: 3 },
  { top: "8%", left: "45%", size: 10, duration: "slow", delay: 5 },
  { top: "85%", left: "60%", size: 12, duration: "slower", delay: 6 },
] as const;

export function FloatingDiamonds({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {LAYOUT.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={d.size}
          height={d.size}
          className={`absolute opacity-60 ${DURATION_CLASS[d.duration]}`}
          style={{ top: d.top, left: d.left, animationDelay: `${d.delay}s` }}
        >
          <polygon
            points="12,2 20,9 16,22 8,22 4,9"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  );
}
