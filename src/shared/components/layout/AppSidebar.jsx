// Icons
import {
  Home,
  LogOut,
  Users,
  BarChart2,
  School,
  ChevronUp,
  Wallet,
  UserPlus,
  GraduationCap,
  Bell,
} from "lucide-react";

// Router
import { Link, useLocation } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import { useIsMobile } from "@/shared/hooks/useMobile";

// Dropdown Menu
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/shared/components/shadcn/dropdown-menu";

// Sidebar (shadcn primitives — keep for provider/inset)
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

// Navigation items
const navItems = [
  { title: "Bosh sahifa",   url: "/",             icon: Home      },
  { title: "Leadlar",       url: "/leads",         icon: UserPlus  },
  { title: "O'quvchilar",   url: "/users",         icon: Users     },
  { title: "O'qituvchilar", url: "/teachers",      icon: Users     },
  { title: "Statistika",    url: "/statistics",    icon: BarChart2 },
  { title: "Guruhlar",      url: "/classes",       icon: School    },
  { title: "To'lovlar",     url: "/payments",      icon: Wallet    },
  { title: "Xabarnomalar",  url: "/notifications", icon: Bell      },
];

const AppSidebar = ({ ...props }) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <Header />
      <Main />
      <Footer />
      <SidebarRail />
    </Sidebar>
  );
};

const Header = () => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarHeader className="border-b border-sidebar-border py-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => toggleSidebar()}
            className="data-[state=open]:bg-sidebar-accent hover:!bg-sidebar-accent"
          >
            <div className="flex items-center justify-center size-8 bg-brown-800 shrink-0">
              <GraduationCap size={13} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="grid flex-1 gap-0 text-left leading-tight">
              <span className="truncate text-sm font-semibold tracking-widest uppercase text-sidebar-foreground">
                Bayyina
              </span>
              <span className="truncate text-[9px] tracking-[0.18em] uppercase text-sidebar-foreground/40 font-medium">
                Admin Panel
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {!open && <SidebarTrigger className="size-7" />}
    </SidebarHeader>
  );
};

const Main = () => {
  const location = useLocation();

  return (
    <SidebarContent className="py-2">
      <SidebarGroup>
        <SidebarMenu className="gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.url === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-9 transition-all duration-150 !text-sidebar-foreground/70 hover:!text-sidebar-foreground hover:!bg-sidebar-accent",
                    isActive
                      ? "!text-white !bg-sidebar-accent border-l-2 border-brown-500 pl-[calc(0.75rem-2px)]"
                      : "border-l-2 border-transparent",
                  )}
                >
                  <Link to={item.url}>
                    <item.icon
                      size={14}
                      strokeWidth={isActive ? 2 : 1.5}
                      className={isActive ? "text-brown-400" : ""}
                    />
                    <span className={cn(
                      "text-[13px] tracking-wide",
                      isActive ? "font-medium" : "font-normal",
                    )}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
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
    queryFn: () => authAPI.getMe().then((res) => res.data.data ?? null),
  });

  const isMobile = useIsMobile();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <SidebarFooter className="border-t border-sidebar-border py-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent hover:!bg-sidebar-accent"
              >
                <div className="flex items-center justify-center size-7 shrink-0 bg-brown-800 text-white text-xs font-semibold tracking-wider">
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                <div className="grid flex-1 text-left leading-tight gap-0">
                  <span className="truncate text-[13px] font-medium tracking-wide text-sidebar-foreground">
                    {user?.firstName}
                  </span>
                  <span className="truncate text-[10px] text-sidebar-foreground/40 tracking-wider">
                    {user?.username}
                  </span>
                </div>
                <ChevronUp size={12} className="ml-auto text-sidebar-foreground/40" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              side={isMobile ? "bottom" : "right"}
              className="w-[--radix-dropdown-menu-trigger-width] min-w-48 border-border"
            >
              <DropdownMenuLabel className="!p-0 font-normal">
                <div className="flex items-center gap-2.5 px-3 py-2.5 text-left">
                  <div className="flex items-center justify-center size-7 shrink-0 bg-brown-800 text-white text-xs font-semibold">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="grid flex-1 text-left leading-tight gap-0">
                    <span className="truncate text-sm font-medium text-gray-900">{user?.firstName}</span>
                    <span className="truncate text-xs text-gray-400">{user?.username}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-red-600 hover:!text-red-600 hover:!bg-red-50 mx-1 my-0.5"
              >
                <LogOut size={13} strokeWidth={1.5} />
                <span className="text-sm">Chiqish</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default AppSidebar;
