import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Dad of Diamonds | Fine Diamond Jewelry",
  description:
    "Diamond rings, earrings, chains, and bracelets crafted for everyone. Explore the Dad of Diamonds collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} antialiased`}>
        <Header />
        {/* No top padding here on purpose — the homepage hero must bleed to y=0 behind the
            transparent-over-hero header. Every other page compensates with its own top
            padding on its root wrapper (see each page.tsx). */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
