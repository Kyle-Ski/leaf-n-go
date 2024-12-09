"use client";

import Link from "next/link";
import { LayoutDashboard, ListTodo, Cog, AxeIcon, TicketsPlaneIcon } from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Checklists", url: "/checklists", icon: ListTodo },
  { title: "Items", url: "/items", icon: AxeIcon },
  { title: "Trips", url: "/trips", icon: TicketsPlaneIcon },
  { title: "Settings", url: "/settings", icon: Cog },
];

interface BottomNavProps {
  currentPath: string;
}

export function BottomNav({ currentPath }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around py-2 z-10 shadow-md md:hidden">
      {menuItems.map((item) => {
        const isActive = new RegExp(`^${item.url}(/|$)`).test(currentPath);
        return (
          <Link
            key={item.title}
            href={item.url}
            className={`
              flex flex-col items-center justify-center w-full py-2 text-gray-700 
              transition-colors duration-300 ease-in-out
              ${isActive ? "!bg-blue-500 text-white" : ""}
            `}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.title}</span>
          </Link>

        );
      })}
    </nav>
  );
}
