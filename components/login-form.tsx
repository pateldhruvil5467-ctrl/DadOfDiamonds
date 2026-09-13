"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { LuxuryButton } from "@/components/luxury-button";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setAuthError(null);
    const result = await signIn("credentials", { ...values, redirect: false });

    if (!result || result.error) {
      setAuthError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <input {...register("password")} type="password" autoComplete="current-password" className="field-underline" />
        {errors.password && (
          <span className="text-[11px] normal-case tracking-normal text-danger" role="alert">
            {errors.password.message}
          </span>
        )}
      </label>

      <div className="mt-2">
        <LuxuryButton type="submit" variant="solid" disabled={isSubmitting} arrow className="w-full">
          {isSubmitting ? "Signing In…" : "Sign In"}
        </LuxuryButton>
      </div>

      {authError && (
        <p className="text-sm text-danger" role="alert">
          {authError}
        </p>
      )}
    </form>
  );
}
