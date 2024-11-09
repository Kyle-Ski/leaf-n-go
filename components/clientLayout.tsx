"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottomNav";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the current pathname for active link

  return (
    <SidebarProvider>
      {/* Sidebar for desktop and tablet */}
      <div className="hidden md:flex">
        <AppSidebar />
        <SidebarTrigger />
      </div>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 lg:p-8 bg-gray-50">
        <div className="container mx-auto">{children}</div>
      </main>

      {/* Bottom Navigation for mobile, passing pathname */}
      <BottomNav currentPath={pathname} />
    </SidebarProvider>
  );
}
