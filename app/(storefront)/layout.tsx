import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {/* No top padding here on purpose — the homepage hero must bleed to y=0 behind the
          transparent-over-hero header. Every other page compensates with its own top
          padding on its root wrapper (see each page.tsx). */}
      <main>{children}</main>
      <Footer />
    </>
  );
}
