export function AdminPageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      {/* Subtle diamond-glint accent — a single, very restrained nod to the storefront's
          animation language. Admin motion stays minimal by design. */}
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent motion-safe:animate-glint" />
        <h1 className="font-display text-2xl text-foreground">{title}</h1>
      </div>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
    </div>
  );
}
