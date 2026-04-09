// Icons
import {
  Home,
  LogOut,
  Users,
  BarChart2,
  BookMarked,
  Calendar,
  BookOpen,
  School,
  Atom,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  AlertTriangle,
  Tag,
  Settings,
  Settings2,
  BadgeDollarSign,
  Shield,
  CalendarOff,
  Monitor,
  MessageSquare,
  Share2,
  PanelLeft,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

// Router
import { Link } from "react-router-dom";

// Sidebar
import {
  Sidebar,
  useSidebar,
  SidebarRail,
  SidebarMenu,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/components/shadcn/sidebar";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// logo
import logo from "../../assets/icons/logo.svg";

// Dropdown Menu
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/shared/components/shadcn/dropdown-menu";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Hooks
import { useIsMobile } from "@/shared/hooks/useMobile";

// Navigation items — flat list
const navItems = [
  { title: "Bosh sahifa", url: "/", icon: Home },
  { title: "Foydalanuvchilar", url: "/users", icon: Users },
  { title: "Statistika", url: "/statistics", icon: BarChart2 },
  // { title: "Baholar jurnali", url: "/grades", icon: BookMarked },
  // { title: "Dars jadvali", url: "/schedules", icon: Calendar },
  { title: "O'tuvchilar", url: "/topics", icon: BookOpen },
  { title: "Guruhlar", url: "/classes", icon: School },
  // { title: "Fanlar", url: "/subjects", icon: Atom },
  // { title: "Mahsulotlar", url: "/market/products", icon: ShoppingBag },
  // { title: "Buyurtmalar", url: "/market/orders", icon: ShoppingCart },
  // { title: "Topshiriqlar", url: "/tasks", icon: ClipboardList },
  // { title: "Jarimalar", url: "/penalties", icon: AlertTriangle },
  // { title: "Jarima kategoriyalar", url: "/penalties/categories", icon: Tag },
  // { title: "Jarima sozlamalar", url: "/penalties/settings", icon: Settings },
  // { title: "Tanga tarqatish", url: "/coin-distribution", icon: BadgeDollarSign },
  // { title: "Tanga sozlamalar", url: "/coin-settings", icon: Settings2 },
  // { title: "Rollar", url: "/roles", icon: Shield },
  // { title: "Dam olish kunlari", url: "/holidays", icon: CalendarOff },
  // { title: "Monitorlar", url: "/monitors", icon: Monitor },
  { title: "Xabarlar", url: "/messages", icon: MessageSquare },
  { title: "Ijtimoiy tarmoqlar", url: "/social-networks", icon: Share2 },
];

const AppSidebar = ({ ...props }) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <Header />

      {/* Content */}
      <Main />

      {/* Footer */}
      <Footer />

      {/* Rail (Vertical divider) */}
      <SidebarRail />
    </Sidebar>
  );
};

const Header = () => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => toggleSidebar()}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <img
              src="{logo}"
              alt="logo"
              className="aspect-square size-8 rounded-md object-cover bg-white"
            />

            <div className="grid flex-1 gap-0.5 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Bayyina School</span>
              <p className="w-1/2 flex items-center justify-center gap-1.5 bg-green-200 rounded-xl text-green-700">
                <span className="truncate text-xs">kunlik</span>
                <TrendingUp size={18} strokeWidth={1.5} />
              </p>
            </div>
            <PanelLeft className="ml-auto" size={24} strokeWidth={1.5} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {!open && <SidebarTrigger className="size-8" />}
    </SidebarHeader>
  );
};

const Main = () => {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                barMenuButton
                asChild
                tooltip={item.title}
                className="h-auto py-2.5"
              >
                <Link to={item.url}>
                  <item.icon strokeWidth={1.5} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
};

const Footer = () => {
  const { data: user } = useQuery({
    retry: false,
    queryKey: ["auth", "profile"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
  });

  const isMobile = useIsMobile();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex items-center justify-center size-8 shrink-0 bg-sidebar-accent text-sidebar-accent-foreground rounded-lg font-semibold">
                  {user?.firstName?.[0]}
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.firstName}
                  </span>
                  <span className="truncate text-xs">{user?.username}</span>
                </div>

                <ChevronRight
                  size={20}
                  strokeWidth={1.5}
                  className="ml-auto !size-5"
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              side={isMobile ? "bottom" : "right"}
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            >
              <DropdownMenuLabel className="!p-0 font-normal">
                <div className="flex items-center gap-2 text-left text-sm">
                  <div className="flex items-center justify-center size-8 shrink-0 bg-sidebar-accent text-sidebar-accent-foreground rounded-md font-semibold">
                    {user?.firstName?.[0]}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.firstName}
                    </span>
                    <span className="truncate text-xs opacity-70">
                      {user?.username}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut strokeWidth={1.5} />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default AppSidebar;
