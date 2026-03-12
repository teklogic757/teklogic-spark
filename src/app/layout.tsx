import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google"; // Brand Fonts
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { validateEnv } from "@/lib/env-validator";

validateEnv();

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });

export const metadata: Metadata = {
  title: "Teklogic Ideas",
  description: "Automation Idea Collector & Contest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${openSans.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
