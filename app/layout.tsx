import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Le blog de Lyon Palme",
  description: "Blog de Lyon Palme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-slate-50 text-slate-950 antialiased`}
      >
        <AuthProvider>
          <SiteHeader />

          <div className="flex-1">{children}</div>

          <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4 text-purple-950">
            <p className="text-center text-sm">
              Developpe avec amour par les SIO2 - 2026
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
