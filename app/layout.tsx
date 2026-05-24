import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "BudgBot",
  description: "Chat-first personal finance tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BudgBot",
  },
};

export const viewport: Viewport = {
  themeColor: "#F59E0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#FAFAF8",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#18181B",
          colorText: "#18181B",
          colorTextSecondary: "#52525B",
          colorPrimary: "#F59E0B",
          colorDanger: "#F43F5E",
          colorSuccess: "#10B981",
          borderRadius: "0.5rem",
          fontFamily: "var(--font-jakarta), sans-serif",
        },
      }}
    >
      <html
        lang="en"
        className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          <meta name="mobile-web-app-capable" content="yes" />
        </head>
        <body className="min-h-full flex flex-col">{children}</body>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }`}
        </Script>
      </html>
    </ClerkProvider>
  );
}
