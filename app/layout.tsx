import type { Metadata } from "next";
import { UserProvider } from "@/lib/userProvider";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "@/components/clientLayout"; // Import ClientLayout

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
  title: "Leaf-N-Go",
  description:
    "Packing tool designed to help outdoor adventurers prepare for their trips with efficiency, sustainability, and customization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen">
        <UserProvider>
          <ClientLayout>{children}</ClientLayout>
        </UserProvider>
      </body>
    </html>
  );
}
