"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

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
    <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="flex flex-col gap-1 text-sm">
        <span>Name</span>
        <input
          {...register("name")}
          autoComplete="name"
          className="w-full border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
        {errors.name && (
          <span className="text-xs text-red-700" role="alert">
            {errors.name.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Email</span>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          className="w-full border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
        {errors.email && (
          <span className="text-xs text-red-700" role="alert">
            {errors.email.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Password</span>
        <input
          {...register("password")}
          type="password"
          autoComplete="new-password"
          className="w-full border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
        {errors.password && (
          <span className="text-xs text-red-700" role="alert">
            {errors.password.message}
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creating Account…" : "Create Account"}
      </button>

      {serverError && (
        <p className="text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}
    </form>
  );
}
