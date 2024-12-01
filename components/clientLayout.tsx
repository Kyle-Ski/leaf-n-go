"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottomNav";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      {/* Sidebar for desktop and tablet */}
      <div className="hidden md:flex">
        <AppSidebar />
        <SidebarTrigger />
      </div>

      {/* Main Content with Spinner */}
      <main className="flex-grow p-4 md:p-6 lg:p-8 bg-gray-50 relative">
        <div className={`max-w-screen-sm sm:max-w-screen-md lg:max-w-screen-lg w-full px-4 pb-20 "opacity-100"`}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation for mobile */}
      <BottomNav currentPath={pathname} />
    </SidebarProvider>
  );
}
