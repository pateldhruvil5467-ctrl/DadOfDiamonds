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
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthVisual />

      <div className="flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Join Us</p>
          <h1 className="mt-4 font-display text-4xl">Create Account</h1>
          <RegisterForm callbackUrl={callbackUrl || "/"} />
          <p className="mt-8 text-sm text-muted">
            Already have an account?{" "}
            <Link
              href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="link-reveal text-foreground"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
