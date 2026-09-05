import { Bell, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">

      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Logistics Dashboard
        </h2>

        <p className="text-xs text-slate-500">
          Monitor your logistics operations
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button className="relative text-slate-600 hover:text-slate-900">
          <Bell size={21} />

          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={30} className="text-slate-500" />

          <div>
            <p className="text-sm font-medium text-slate-800">
              Admin
            </p>

            <p className="text-xs text-slate-500">
              Data Engineer
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}