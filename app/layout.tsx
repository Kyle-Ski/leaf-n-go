// app/layout.tsx
import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import localFont from "next/font/local";
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
        {/* Sidebar Wrapper */}
        <SidebarProvider>
          <AppSidebar />

          {/* Main Content */}
          <main className="flex-grow p-4 md:p-6 lg:p-8 bg-gray-50">
            <SidebarTrigger />
            <div className="container mx-auto">{children}</div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
