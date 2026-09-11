import Link from "next/link";
import { AuthVisual } from "@/components/auth-visual";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
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
          <p className="eyebrow">Welcome Back</p>
          <h1 className="mt-3 font-display text-4xl">Sign In</h1>
          <LoginForm callbackUrl={callbackUrl || "/"} />
          <p className="mt-6 text-sm text-muted">
            New here?{" "}
            <Link
              href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="link-reveal text-accent"
            >
              Create an account
            </Link>
          </p>
          <Link href="/products" className="mt-4 inline-block link-reveal text-sm text-muted hover:text-accent transition-colors">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
