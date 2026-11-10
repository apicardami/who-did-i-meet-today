import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "./globals.css";
import PausedBanner from "@/components/PausedBanner";
import Footer from "@/components/Footer";
import { APP_NAME, APP_ONE_LINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_ONE_LINE,
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
  appleWebApp: { capable: true, title: "Who Did I Meet", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0e4" },
    { media: "(prefers-color-scheme: dark)", color: "#111816" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PausedBanner />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
