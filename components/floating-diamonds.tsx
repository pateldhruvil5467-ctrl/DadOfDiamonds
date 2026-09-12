/**
 * Ambient background atmosphere for dark sections — a handful of large, soft-edged,
 * near-transparent faceted shapes drifting almost imperceptibly (32–44s per cycle). This is
 * deliberately NOT a field of small diamond-outline icons scattered around — that reads as
 * clip-art. The effect here is closer to light and shadow settling in a dark room: barely
 * perceptible, atmospheric, never something the eye tracks as "moving objects."
 *
 * Fixed, hand-picked positions/sizes — never Math.random() at render time, which would
 * mismatch between server and client renders. Server Component — no interactivity, no client
 * bundle cost.
 */
const SHAPES = [
  { top: "-10%", left: "-8%", size: 520, duration: "slower", rotate: -12 },
  { top: "40%", left: "78%", size: 380, duration: "slow", rotate: 20 },
  { top: "78%", left: "-6%", size: 420, duration: "slower", rotate: 8 },
] as const;

const DURATION_CLASS = {
  slow: "motion-safe:animate-drift-slow",
  slower: "motion-safe:animate-drift-slower",
} as const;

export function FloatingDiamonds({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {SHAPES.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 200 200"
          width={s.size}
          height={s.size}
          className={`absolute opacity-[0.05] blur-[1px] ${DURATION_CLASS[s.duration]}`}
          style={{ top: s.top, left: s.left, transform: `rotate(${s.rotate}deg)` }}
        >
          <polygon points="100,10 175,60 145,190 55,190 25,60" fill="none" stroke="var(--champagne)" strokeWidth="1" />
        </svg>
      ))}
    </div>
  );
}
