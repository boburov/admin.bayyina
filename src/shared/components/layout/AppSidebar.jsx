// Icons
import {
  Home,
  LogOut,
  Users,
  BarChart2,
  School,
  TrendingUp,
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
  { title: "Bosh sahifa",    url: "/",            icon: Home      },
  { title: "Leadlar",        url: "/leads",        icon: UserPlus  },
  { title: "O'quvchilar",    url: "/users",        icon: Users     },
  { title: "O'qituvchilar",  url: "/teachers",     icon: Users     },
  { title: "Statistika",     url: "/statistics",   icon: BarChart2 },
  { title: "Guruhlar",       url: "/classes",      icon: School    },
  { title: "To'lovlar",      url: "/payments",     icon: Wallet    },
  { title: "Xabarnomalar",  url: "/notifications",  icon: Bell      },
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
    <SidebarHeader className="border-b border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => toggleSidebar()}
            className="data-[state=open]:bg-sidebar-accent"
          >
            <div className="flex items-center justify-center size-7 bg-[#7c5c3e] shrink-0">
              <GraduationCap size={14} className="text-white" />
            </div>
            <div className="grid flex-1 gap-0.5 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-sidebar-foreground">Bayyina School</span>
              <span className="truncate text-xs text-sidebar-foreground/60">Admin paneli</span>
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
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
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
                    "h-auto py-2 transition-colors !text-white hover:!text-white hover:!bg-white/10",
                    isActive
                      ? "border-l-2 border-white/60 !bg-white/10 pl-[calc(0.75rem-2px)]"
                      : "border-l-2 border-transparent",
                  )}
                >
                  <Link to={item.url}>
                    <item.icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                    <span className="text-sm">{item.title}</span>
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
    <SidebarFooter className="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent"
              >
                <div className="flex items-center justify-center size-7 shrink-0 bg-[#7c5c3e] text-white text-xs font-semibold">
                  {user?.firstName?.[0]}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-sidebar-foreground">
                    {user?.firstName}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {user?.username}
                  </span>
                </div>
                <ChevronUp size={14} className="ml-auto text-sidebar-foreground/60" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              side={isMobile ? "bottom" : "right"}
              className="w-[--radix-dropdown-menu-trigger-width] min-w-48 rounded-sm border-gray-200"
            >
              <DropdownMenuLabel className="!p-0 font-normal">
                <div className="flex items-center gap-2 p-2 text-left text-sm">
                  <div className="flex items-center justify-center size-7 shrink-0 bg-[#7c5c3e] text-white text-xs font-semibold">
                    {user?.firstName?.[0]}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.firstName}</span>
                    <span className="truncate text-xs text-gray-400">{user?.username}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 hover:!text-red-600 hover:!bg-red-50">
                <LogOut size={14} strokeWidth={1.5} />
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
