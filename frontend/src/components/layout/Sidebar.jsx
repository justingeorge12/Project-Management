import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Settings,
  LogOut,
  BriefcaseBusiness,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Projects",
    icon: FolderKanban,
    active: false,
  },
  {
    label: "My Tasks",
    icon: CheckSquare,
    active: false,
  },
];

function Sidebar() {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };


  return (
    // <aside className="flex h-screen w-64 flex-col bg-slate-900 px-5 py-6 text-white">
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-900 px-5 py-6 text-white">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="rounded-lg bg-indigo-500 p-2">
          <BriefcaseBusiness size={22} />
        </div>

        <h1 className="text-xl font-bold tracking-wide">
          FinBase
        </h1>
      </div>

      {/* Navigation */}
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Workspace
      </p>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
  key={item.label}
  
  onClick={() => {
    if (item.label === "Projects") navigate("/projects");
    else if (item.label === "Dashboard") navigate("/");
    else if (item.label === "My Tasks") navigate("/my-tasks");
  }}

  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
    item.active
      ? "bg-indigo-600 text-white"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`}
>
  <Icon size={19} />
  {item.label}
</button>
          );
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="space-y-2 border-t border-slate-700 pt-5">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-slate-800">
          <Settings size={19} />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={19} />
          Logout
        </button>

      </div>
    </aside>
  );
}

export default Sidebar;
