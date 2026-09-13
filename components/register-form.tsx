"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { LuxuryButton } from "@/components/luxury-button";

interface RegisterErrorResponse {
  status: "error";
  error: string;
  issues?: { path: string; message: string }[];
}

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setServerError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as RegisterErrorResponse;
      setServerError(
        data.error === "email_taken"
          ? "An account with this email already exists."
          : "We couldn't create your account. Please check your details and try again.",
      );
      return;
    }

    // Registration succeeded — sign in immediately so the customer doesn't have to log in twice.
    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (!result || result.error) {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted">
        <span>Name</span>
        <input {...register("name")} autoComplete="name" className="field-underline" />
        {errors.name && (
          <span className="text-[11px] normal-case tracking-normal text-danger" role="alert">
            {errors.name.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted">
        <span>Email</span>
        <input {...register("email")} type="email" autoComplete="email" className="field-underline" />
        {errors.email && (
          <span className="text-[11px] normal-case tracking-normal text-danger" role="alert">
            {errors.email.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted">
        <span>Password</span>
        <input {...register("password")} type="password" autoComplete="new-password" className="field-underline" />
        {errors.password && (
          <span className="text-[11px] normal-case tracking-normal text-danger" role="alert">
            {errors.password.message}
          </span>
        )}
      </label>

      <div className="mt-2">
        <LuxuryButton type="submit" variant="solid" disabled={isSubmitting} arrow className="w-full">
          {isSubmitting ? "Creating Account…" : "Create Account"}
        </LuxuryButton>
      </div>

      {serverError && (
        <p className="text-sm text-danger" role="alert">
          {serverError}
        </p>
      )}
    </form>
  );
}
