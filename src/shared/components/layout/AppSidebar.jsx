// Icons
import {
  Home,
  LogOut,
  Store,
  BookOpen,
  Settings2,
  PanelLeft,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
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
  SidebarMenuSub,
  SidebarTrigger,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/shared/components/shadcn/sidebar";

// Collapsible
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/shadcn/collapsible";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Dropdown Menu
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/shared/components/shadcn/dropdown-menu";

// Custom icons
import { whiteLogoIcon } from "@/shared/assets/icons";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Hooks
import { useIsMobile } from "@/shared/hooks/useMobile";

// Navigation items
const navItems = [
  {
    title: "Asosiy",
    url: "/",
    icon: Home,
    isActive: true,
    items: [
      {
        title: "Bosh sahifa",
        url: "/",
      },
      {
        title: "Statistika",
        url: "/statistics",
      },
    ],
  },
  {
    title: "Ta'lim",
    url: "/classes",
    icon: BookOpen,
    isActive: true,
    items: [
      {
        title: "Baholar jurnali",
        url: "/grades",
      },
      {
        title: "Dars jadvali",
        url: "/schedules",
      },
      {
        title: "Dars mavzulari",
        url: "/topics",
      },
      {
        title: "Sinflar",
        url: "/classes",
      },
      {
        title: "Fanlar",
        url: "/subjects",
      },
    ],
  },
  {
    title: "Boshqaruv",
    url: "/users",
    icon: Settings2,
    isActive: false,
    items: [
      {
        title: "Foydalanuvchilar",
        url: "/users",
      },
      {
        title: "Xabarlar",
        url: "/messages",
      },
      {
        title: "Tanga sozlamalari",
        url: "/coin-settings",
      },
      {
        title: "Dam olish kunlari",
        url: "/holidays",
      },
    ],
  },
  {
    title: "Market",
    url: "/market/products",
    icon: Store,
    isActive: false,
    items: [
      {
        title: "Mahsulotlar",
        url: "/market/products",
      },
      {
        title: "Buyurtmalar",
        url: "/market/orders",
      },
    ],
  },
  {
    title: "Jarimalar",
    url: "/penalties",
    icon: AlertTriangle,
    isActive: false,
    items: [
      {
        title: "Jarimalar ro'yxati",
        url: "/penalties",
      },
      {
        title: "Kategoriyalar",
        url: "/penalties/categories",
      },
      {
        title: "Sozlamalar",
        url: "/penalties/settings",
      },
    ],
  },
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
      {/* Logo */}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => toggleSidebar()}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-400 to-blue-700">
              <img
                width={20}
                height={20}
                className="size-4 mt-0.5"
                src={whiteLogoIcon}
                alt="MBSI School white variant Logo icon svg"
              />
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">MBSI School</span>
              <p className="flex items-center gap-1.5 text-green-500">
                <span className="truncate text-xs">Day By Day</span>
                <TrendingUp size={18} strokeWidth={1.5} />
              </p>
            </div>
            <PanelLeft className="ml-auto" size={24} strokeWidth={1.5} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Collapse Button */}
      {!open && <SidebarTrigger className="size-8" />}
    </SidebarHeader>
  );
};

const Main = () => {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platforma</SidebarGroupLabel>
        <SidebarMenu>
          {navItems.map((item) => (
            <Collapsible
              asChild
              key={item.title}
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {/* Collapsible Trigger */}
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="h-auto py-2.5"
                  >
                    {item.icon && <item.icon strokeWidth={1.5} />}
                    <span>{item.title}</span>
                    <ChevronRight
                      size={20}
                      strokeWidth={1.5}
                      className="!size-5 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {/* Collapsible Content */}
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton className="h-auto py-2" asChild>
                          <Link to={subItem.url}>{subItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
};

const Footer = () => {
  const { data: user } = useQuery({
    retry: false,
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((res) => res.data.data),
  });

  const isMobile = useIsMobile();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
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
                {/* Avatar */}
                <div className="flex items-center justify-center size-8 shrink-0 bg-background rounded-lg">
                  {user?.firstName?.[0]}
                </div>

                {/* User Info */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.firstName}
                  </span>
                  <span className="truncate text-xs">{user.username}</span>
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
              {/* Profile */}
              <DropdownMenuLabel className="!p-0 font-normal">
                <div className="flex items-center gap-2 text-left text-sm">
                  {/* Avatar */}
                  <div className="flex items-center justify-center size-8 shrink-0 bg-background rounded-md">
                    {user?.firstName?.[0]}
                  </div>

                  {/* User Info */}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.firstName}
                    </span>
                    <span className="truncate text-xs opacity-70">
                      {user.username}
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
