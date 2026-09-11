/**
 * The recurring section-header pattern used across the site: a small tracked-out gold eyebrow
 * label, a large serif heading, and an optional supporting line. Keeps typographic rhythm
 * consistent without repeating the same three-element markup in every section.
 */
export function SectionHeading({
  id,
  eyebrow,
  heading,
  supporting,
  align = "center",
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  heading: React.ReactNode;
  supporting?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`${alignClass} ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="mt-3 font-display text-4xl sm:text-5xl leading-[1.1]">
        {heading}
      </h2>
      {supporting && (
        <p className={`mt-5 text-muted leading-relaxed ${align === "center" ? "max-w-xl mx-auto" : "max-w-xl"}`}>
          {supporting}
        </p>
      )}
    </div>
  );
}
