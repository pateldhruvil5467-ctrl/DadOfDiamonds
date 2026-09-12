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
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthVisual />

      <div className="flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Welcome Back</p>
          <h1 className="mt-4 font-display text-4xl">Sign In</h1>
          <LoginForm callbackUrl={callbackUrl || "/"} />
          <p className="mt-8 text-sm text-muted">
            New here?{" "}
            <Link
              href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="link-reveal text-foreground"
            >
              Create an account
            </Link>
          </p>
          <Link href="/products" className="link-reveal mt-5 inline-block text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
