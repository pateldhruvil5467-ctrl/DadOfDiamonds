"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductStateBadge } from "@/components/admin/status-badge";
import type { AdminProductApiResponse } from "@/lib/admin/products";

/**
 * Deliberately its own small component/endpoint pair, separate from the main edit form — an
 * intentional, explicit action (confirm dialog + its own request) rather than a checkbox bundled
 * into a general "Save" that could flip visibility as a side effect of an unrelated field edit.
 */
export function ProductActivationToggle({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const confirmed = window.confirm(
      isActive
        ? "Deactivate this product? It will be hidden from the storefront immediately."
        : "Reactivate this product? It will become visible on the storefront again.",
    );
    if (!confirmed) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}/${isActive ? "deactivate" : "activate"}`, {
        method: "POST",
      });
      const data = (await response.json()) as AdminProductApiResponse;

      if (!response.ok || data.status === "error") {
        setError("Could not update the product's state. Please try again.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <ProductStateBadge isActive={isActive} />
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className="link-reveal text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? "Updating…" : isActive ? "Deactivate" : "Reactivate"}
      </button>
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
