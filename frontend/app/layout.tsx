import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";
import { DemoUserProvider } from "@/lib/session";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CIVORA — AI-Powered Grievance Redressal & Management Platform",
    template: "%s — CIVORA",
  },
  description:
    "Every grievance deserves a resolution. CIVORA is an AI-powered multilingual grievance redressal and management platform.",
  icons: {
    icon: [
      { url: "/civora-icon.png", type: "image/png" },
      { url: "/favicon.ico?v=2" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F3F6F8] text-[#172033] selection:bg-teal-100 selection:text-teal-900 font-sans">
        <DemoUserProvider>
          <I18nProvider><ToastProvider><AppShell>{children}</AppShell></ToastProvider></I18nProvider>
        </DemoUserProvider>
      </body>
    </html>
  );
}
