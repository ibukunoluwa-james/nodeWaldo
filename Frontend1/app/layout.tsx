import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where's Waldo Style Game",
  description: "Find the hidden characters!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}