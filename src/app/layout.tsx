import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import AppearanceSync from "@/components/theme/AppearanceSync";
import { appearanceScript } from "@/components/theme/appearance";
import "./globals.css";

const lilita = Lilita_One({
  variable: "--font-lilita",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Trybe", template: "%s · Trybe" },
  description: "Curiosity killed the cat. Trybe brought it back.",
};

// viewport-fit=cover lets env(safe-area-inset-bottom) work for the bottom nav.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${lilita.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppearanceSync />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
