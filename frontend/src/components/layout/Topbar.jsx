

import { Search, Bell } from "lucide-react";

function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Welcome back! Here's your workspace overview.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:flex">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-36 text-sm outline-none"
          />
        </div>

        <button className="relative text-slate-500 hover:text-slate-800">
          <Bell size={21} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
          J
        </div>
      </div>
    </header>
  );
}

export default Topbar;
