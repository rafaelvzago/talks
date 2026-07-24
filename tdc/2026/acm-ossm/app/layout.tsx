import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenShift Service Mesh 3",
  description:
    "OSSM talk hub: mTLS primer and multi-cluster Istio mesh architecture animation.",
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
      <body>{children}</body>
    </html>
  );
}
