import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, ListTodo, Cog, BookOpenText, LogOut, AxeIcon, TicketsPlaneIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-Context";
import Link from "next/link";
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Checklists",
    url: "/checklists",
    icon: ListTodo
  },
  {
    title: "Items",
    url: "/items",
    icon: AxeIcon
  },
  {
    title: "Trips",
    url: "/trips",
    icon: TicketsPlaneIcon
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Cog
  },
  {
    title: "About",
    url: "/about",
    icon: BookOpenText
  }
]

export function AppSidebar() {
  const { logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupLabel><Link href="/">🌿 Leaf-N-Go</Link></SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
