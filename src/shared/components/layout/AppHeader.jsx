// Components
import { useSidebar } from "../shadcn/sidebar";

// Icons
import { Menu, GraduationCap } from "lucide-react";

const AppHeader = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="flex items-center justify-between h-11 px-4 sticky top-0 z-10 bg-white border-b border-border md:hidden">
      {/* Hamburger menu */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center w-7 h-7 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Menu strokeWidth={1.5} className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <GraduationCap size={16} className="text-[#7c5c3e]" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-gray-900">Bayyina School</span>
      </div>

      {/* Profile avatar */}
      <div className="flex items-center justify-center w-7 h-7 bg-[#7c5c3e] text-white text-xs font-semibold">
        A
      </div>
    </header>
  );
};

export default AppHeader;
