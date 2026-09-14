"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/lib/validations/product";
import type { AdminProductApiResponse, AdminProductJson } from "@/lib/admin/products";
import { PRODUCT_CURRENCY } from "@/lib/admin/constants";
import { LuxuryButton } from "@/components/luxury-button";

type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  material: string;
  sku: string;
  stock: number;
  isFeatured: boolean;
  isUnisex: boolean;
  images: { url: string; altText?: string }[];
};

type Category = { id: string; name: string };

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  categories: Category[];
  initialValues?: ProductFormValues;
};

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  categoryId: "",
  material: "",
  sku: "",
  stock: 0,
  isFeatured: false,
  isUnisex: true,
  images: [{ url: "", altText: "" }],
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ mode, productId, categories, initialValues }: ProductFormProps) {
  const router = useRouter();
  const defaultValues = initialValues ?? EMPTY_VALUES;

  // The stock value the form was loaded/last-saved with — used only as the API's freshness
  // guard on edit (see lib/admin/products.ts updateProduct()). Never rendered as an editable
  // field, so it can't be tampered with via the form itself; it's rebased after each successful
  // save so a second consecutive edit doesn't spuriously conflict against a now-stale baseline.
  const [expectedStock, setExpectedStock] = useState(defaultValues.stock);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const slugManuallyEdited = useRef(mode === "edit");

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "images" });

  // Warn on tab close/refresh while there are unsaved changes — a lightweight, dependency-free
  // safety net; the in-app Cancel/back link below has its own explicit confirm() guard.
  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function handleNameBlur() {
    if (slugManuallyEdited.current) return;
    const name = getValues("name");
    const currentSlug = getValues("slug");
    if (!currentSlug) {
      setValue("slug", slugify(name), { shouldDirty: true });
    }
  }

  function confirmDiscardIfDirty(event: React.MouseEvent) {
    if (isDirty && !window.confirm("Discard unsaved changes?")) {
      event.preventDefault();
    }
  }

  async function onSubmit(values: ProductFormValues) {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setServerError(null);
    setSuccessMessage(null);

    const images = values.images.map((image) => ({ url: image.url.trim(), altText: image.altText?.trim() || "" }));

    const payload =
      mode === "create"
        ? { ...values, images }
        : { ...values, images, expectedStock };

    const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as AdminProductApiResponse;

      if (!response.ok || data.status === "error") {
        if (data.status === "error") {
          applyServerError(data);
        } else {
          setServerError("Something went wrong. Please try again.");
        }
        return;
      }

      const product: AdminProductJson = data.product;

      if (mode === "create") {
        router.push(`/admin/products/${product.id}`);
        return;
      }

      // Rebase the freshness guard to the value we just successfully saved, and refresh the
      // Server Component tree so the page's own data (and any parent list) reflects it too.
      setExpectedStock(product.stock);
      setSuccessMessage("Changes saved.");
      router.refresh();
    } catch {
      setServerError("Something went wrong submitting the form. Please check your connection and try again.");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  function applyServerError(data: Extract<AdminProductApiResponse, { status: "error" }>) {
    if (data.error === "duplicate_slug") {
      setError("slug", { message: "This slug is already in use." });
      return;
    }
    if (data.error === "duplicate_sku") {
      setError("sku", { message: "This SKU is already in use." });
      return;
    }
    if (data.error === "category_not_found") {
      setError("categoryId", { message: "Selected category no longer exists." });
      return;
    }
    if (data.error === "stock_conflict" && typeof data.currentStock === "number") {
      setExpectedStock(data.currentStock);
      setValue("stock", data.currentStock, { shouldDirty: true });
      setServerError(
        `Stock was changed elsewhere while you were editing (now ${data.currentStock}). The field below has been updated — review and save again.`,
      );
      return;
    }
    if (data.error === "validation_error" && data.issues) {
      for (const issue of data.issues) {
        setError(issue.path as keyof ProductFormValues, { message: issue.message });
      }
      return;
    }
    if (data.error === "unauthorized" || data.error === "forbidden") {
      setServerError("You are not authorized to perform this action.");
      return;
    }
    setServerError("Something went wrong. Please try again.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-10 flex flex-col gap-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input {...register("name")} onBlur={handleNameBlur} className="field-underline" />
        </Field>
        <Field label="Slug" error={errors.slug?.message}>
          <input
            {...register("slug")}
            onChange={(event) => {
              slugManuallyEdited.current = true;
              setValue("slug", event.target.value, { shouldDirty: true });
            }}
            className="field-underline"
          />
        </Field>
      </div>

      <Field label="Description" error={errors.description?.message}>
        <textarea {...register("description")} rows={4} className="field-underline resize-y" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label={`Price (${PRODUCT_CURRENCY})`} error={errors.price?.message}>
          <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" min="0" className="field-underline" />
        </Field>
        <Field label={`Compare-at price (${PRODUCT_CURRENCY})`} error={errors.compareAtPrice?.message} optional>
          <input
            {...register("compareAtPrice", { setValueAs: (value) => (value === "" ? undefined : Number(value)) })}
            type="number"
            step="0.01"
            min="0"
            className="field-underline"
          />
        </Field>
        <Field label="Stock" error={errors.stock?.message}>
          <input {...register("stock", { valueAsNumber: true })} type="number" step="1" min="0" className="field-underline" />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Category" error={errors.categoryId?.message}>
          <select {...register("categoryId")} className="field-underline">
            <option value="">Select a category…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Material" error={errors.material?.message}>
          <input {...register("material")} className="field-underline" />
        </Field>
      </div>

      <Field label="SKU" error={errors.sku?.message}>
        <input {...register("sku")} className="field-underline max-w-xs" />
      </Field>

      <div className="flex flex-wrap gap-8 text-xs uppercase tracking-[0.15em] text-muted">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 accent-accent" />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isUnisex")} className="h-4 w-4 accent-accent" />
          Unisex
        </label>
      </div>

      <section aria-labelledby="images-heading">
        <div className="flex items-center justify-between">
          <h2 id="images-heading" className="eyebrow">
            Images
          </h2>
          <button
            type="button"
            onClick={() => append({ url: "", altText: "" })}
            className="link-reveal text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors"
          >
            + Add Image
          </button>
        </div>
        {errors.images?.message && <p className="mt-2 text-xs text-danger">{errors.images.message}</p>}

        <ul className="mt-4 flex flex-col gap-5">
          {fields.map((field, index) => (
            <li key={field.id} className="grid gap-3 border-b border-border pb-5 sm:grid-cols-[1fr_1fr_auto]">
              <Field label={`Image ${index + 1} URL`} error={errors.images?.[index]?.url?.message}>
                <input {...register(`images.${index}.url`)} className="field-underline" />
              </Field>
              <Field label="Alt text" error={errors.images?.[index]?.altText?.message} optional>
                <input {...register(`images.${index}.altText`)} className="field-underline" />
              </Field>
              <div className="flex items-end gap-3 pb-2 text-xs uppercase tracking-[0.15em] text-muted">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move image ${index + 1} up`}
                  className="disabled:opacity-30 disabled:cursor-not-allowed hover:text-foreground transition-colors"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === fields.length - 1}
                  aria-label={`Move image ${index + 1} down`}
                  className="disabled:opacity-30 disabled:cursor-not-allowed hover:text-foreground transition-colors"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  aria-label={`Remove image ${index + 1}`}
                  className="disabled:opacity-30 disabled:cursor-not-allowed hover:text-danger transition-colors"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div aria-live="polite" className="min-h-5">
        {serverError && (
          <p className="text-sm text-danger" role="alert">
            {serverError}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-success" role="status">
            {successMessage}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <LuxuryButton type="submit" variant="solid" disabled={isSubmitting} arrow>
          {isSubmitting ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
        </LuxuryButton>
        <Link
          href="/admin/products"
          onClick={confirmDiscardIfDirty}
          className="link-reveal text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted">
      <span>
        {label}
        {optional && <span className="normal-case tracking-normal text-muted/70"> (optional)</span>}
      </span>
      {children}
      {error && (
        <span className="text-[11px] normal-case tracking-normal text-danger" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
