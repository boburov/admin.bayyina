// Router
import { NavLink, useNavigate } from "react-router-dom";

// Icons
import {
  Home,
  Users,
  Activity,
  BarChart2,
  School,
  Wallet,
  Banknote,
  UserPlus,
  GraduationCap,
  Bell,
  LogOut,
  Menu,
  X,
  ClipboardList,
  BookOpen,
  History,
  HistoryIcon,
} from "lucide-react";

// Hooks
import { useState } from "react";
import useAuth from "@/shared/hooks/useAuth";

// Utils
import { cn } from "@/shared/utils/cn";

const NAV_ITEMS = [
  { title: "Bosh sahifa", url: "/dashboard", icon: Home },
  { title: "Leadlar", url: "/leads", icon: UserPlus },
  { title: "O'quvchilar", url: "/users", icon: Users },
  { title: "O'qituvchilar", url: "/teachers", icon: GraduationCap },
  { title: "Guruhlar", url: "/classes", icon: School },
  { title: "Statistika", url: "/statistics", icon: BarChart2 },
  { title: "Davomat", url: "/attendance-statistics", icon: Activity },
  { title: "To'lovlar", url: "/payments", icon: Wallet },
  { title: "Oyliklar", url: "/salaries", icon: Banknote },
  { title: "Xabarnomalar", url: "/notifications", icon: Bell },
  { title: "Tarix", url: "/records", icon: HistoryIcon },
];

function getUserInitials(user) {
  if (!user) return "A";
  if (user.firstName && user.lastName)
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  return (user.firstName ?? "A")[0].toUpperCase();
}

function SidebarContent({ onNavClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="flex flex-col w-56 h-full bg-white border-r border-gray-200 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-center w-7 h-7 bg-brown-800 shrink-0">
          <GraduationCap size={14} className="text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            Bayyina
          </p>
          <p className="text-xs text-gray-400">Admin paneli</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-2">
          Menyu
        </p>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.url}>
              <NavLink
                to={item.url}
                onClick={onNavClick}
                end={item.url === "/dashboard"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-l-2 border-brown-800 text-brown-800 bg-brown-50 pl-[10px]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                    {item.title}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 px-3 py-3">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="flex items-center justify-center w-7 h-7 bg-brown-800 text-white text-xs font-semibold shrink-0">
            {getUserInitials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate leading-tight">
              {user
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : "—"}
            </p>
            {user?.role && (
              <p className="text-xs text-gray-400 truncate capitalize">
                {user.role}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={13} />
          Chiqish
        </button>
      </div>
    </aside>
  );
}

export function AppSidebarDesktop() {
  return (
    <div className="hidden lg:flex h-full">
      <SidebarContent />
    </div>
  );
}

export function AppSidebarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button — min 44px tap area per accessibility guidelines */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="lg:hidden fixed top-2 left-2 z-50 flex items-center justify-center w-11 h-11 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
        aria-expanded={open}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/20 z-40 transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer — slide transition */}
      <div
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full z-50 transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onNavClick={() => setOpen(false)} />
      </div>
    </>
  );
}

const AppSidebar = () => null;
export default AppSidebar;
