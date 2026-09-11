import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-3xl">Create Account</h1>
      <RegisterForm callbackUrl={callbackUrl || "/"} />
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
