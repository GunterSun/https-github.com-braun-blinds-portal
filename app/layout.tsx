import type { Metadata } from "next";
import "./globals.css";
import OfflineRuntime from "./offline-runtime";

export const metadata: Metadata = {
  title: "Braun Blinds Smart Portal",
  description: "Braun Blinds unified customer, order, finance, factory, logistics and installation portal.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <OfflineRuntime />
        {children}
      </body>
    </html>
  );
}
