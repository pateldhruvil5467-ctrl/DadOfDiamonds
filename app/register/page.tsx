import Link from "next/link";
import { AuthVisual } from "@/components/auth-visual";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">
      <AuthVisual />

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Join Us</p>
          <h1 className="mt-3 font-display text-4xl">Create Account</h1>
          <RegisterForm callbackUrl={callbackUrl || "/"} />
          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link
              href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="link-reveal text-accent"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
