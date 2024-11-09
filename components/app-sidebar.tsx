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
  import { Home, LayoutDashboard, ListTodo, Cog, BookOpenText } from "lucide-react"

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
      
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Checklists",
      url: "/checklists",
      icon: ListTodo
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
    },
  ]
  
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroupLabel>🌿 Leaf-N-Go</SidebarGroupLabel>
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
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  