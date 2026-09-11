"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

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
    <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="flex flex-col gap-1 text-sm">
        <span>Email</span>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          className="w-full border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
        {errors.email && (
          <span className="text-xs text-red-400" role="alert">
            {errors.email.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Password</span>
        <input
          {...register("password")}
          type="password"
          autoComplete="current-password"
          className="w-full border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
        {errors.password && (
          <span className="text-xs text-red-400" role="alert">
            {errors.password.message}
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Signing In…" : "Sign In"}
      </button>

      {authError && (
        <p className="text-sm text-red-400" role="alert">
          {authError}
        </p>
      )}
    </form>
  );
}
