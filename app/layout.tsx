import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "@/components/clientLayout"; // Import ClientLayout
import { supabaseServer } from "@/lib/supbaseClient";
import { AuthProvider } from "@/lib/auth-Context";
import { cookies } from 'next/headers';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  let user = null;

  if (accessToken) {
    const { data, error } = await supabaseServer.auth.getUser(accessToken);
    if (error) {
      console.error('Error fetching user:', error.message);
    } else {
      user = data.user;
    }
  }
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen">
        <AuthProvider initialUser={user}>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
