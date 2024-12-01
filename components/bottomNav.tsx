"use client";

import Link from "next/link";
import { LayoutDashboard, ListTodo, Cog, BookOpenText, AxeIcon } from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Checklists", url: "/checklists", icon: ListTodo },
  { title: "Items", url: "/items", icon: AxeIcon },
  { title: "Settings", url: "/settings", icon: Cog },
  { title: "About", url: "/about", icon: BookOpenText },
];

interface BottomNavProps {
  currentPath: string;
}

export function BottomNav({ currentPath }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around py-2 z-10 shadow-md md:hidden">
      {menuItems.map((item) => {
        const isActive = currentPath === item.url;
        return (
          <Link
            key={item.title}
            href={item.url}
            className={`flex flex-col items-center text-gray-700 ${
              isActive ? "!text-blue-600" : ""
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
