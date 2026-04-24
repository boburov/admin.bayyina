// Components
import { useSidebar } from "../shadcn/sidebar";

// Icons
import { Menu, GraduationCap } from "lucide-react";

const AppHeader = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="flex items-center justify-between h-12 px-4 sticky top-0 z-10 bg-white border-b border-border md:hidden">
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Menu strokeWidth={1.5} className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-6 bg-brown-800">
          <GraduationCap size={12} className="text-white" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-semibold tracking-widest uppercase text-gray-900">Bayyina</span>
      </div>

      <div className="flex items-center justify-center w-8 h-8 bg-brown-800 text-white text-xs font-semibold tracking-wider">
        A
      </div>
    </header>
  );
};

export default AppHeader;
