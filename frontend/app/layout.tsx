import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chat with PDF",
  description: "Phase 3 frontend for upload + PDF chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-[var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}
