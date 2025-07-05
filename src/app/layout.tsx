/** @format */

import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Web3Providers from "@/components/providers/Web3Providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pat-Pet [Keep Your Pet, Keep Your Goal]",
  description: "Keep Your Pet, Keep Your Goal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/Backpack.png" />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Web3Providers>
          <Navbar />
          {children}
        </Web3Providers>
      </body>
    </html>
  );
}