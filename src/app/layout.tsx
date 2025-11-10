import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: {
    default: "Balance Transactions",
    template: "%s · Balance Transactions",
  },
  description: "Balance Transactions",
  applicationName: "Balance Transactions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#153d59",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${dmSans.variable}`}>
      <body className={`antialiased min-h-screen bg-gray-50`}>{children}</body>
    </html>
  );
}
