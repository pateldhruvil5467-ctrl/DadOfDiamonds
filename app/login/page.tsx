import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-3xl">Sign In</h1>
      <LoginForm callbackUrl={callbackUrl || "/"} />
      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link
          href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="text-accent hover:underline"
        >
          Create an account
        </Link>
      </p>
      <Link href="/products" className="mt-4 inline-block text-sm text-muted hover:text-accent transition-colors">
        ← Continue shopping
      </Link>
    </div>
  );
}
