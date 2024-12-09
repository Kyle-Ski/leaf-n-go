"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottomNav";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-Context";
import { AppProvider } from "@/lib/appContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const alignmentClasses = user
    ? "max-w-screen-sm sm:max-w-screen-md lg:max-w-screen-lg px-4 pb-20"
    : "flex items-center justify-center min-h-screen";

  return (
    <AppProvider>
      <SidebarProvider>
        {/* Sidebar for desktop and tablet */}
        {user && (
          <div className="hidden md:flex">
            <AppSidebar />
            <SidebarTrigger />
          </div>)
        }
        {/* Main Content with Spinner */}
        <main className="flex-grow p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 relative">
          <div className={alignmentClasses}>
            {children}
          </div>
        </main>

        {/* Bottom Navigation for mobile */}
        {user && <BottomNav currentPath={pathname} />}
      </SidebarProvider>
    </AppProvider>
  );
}
