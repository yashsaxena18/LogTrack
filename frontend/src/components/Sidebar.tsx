import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  AlertTriangle,
  BarChart3,
  Activity,
  Upload,
} from "lucide-react";

import { NavLink } from "react-router-dom";


const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Shipments",
    path: "/shipments",
    icon: Package,
  },
  {
    name: "Orders",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Vehicles",
    path: "/vehicles",
    icon: Truck,
  },
  {
    name: "Drivers",
    path: "/drivers",
    icon: Users,
  },
  {
    name: "Warehouses",
    path: "/warehouses",
    icon: Warehouse,
  },
  {
    name: "Incidents",
    path: "/incidents",
    icon: AlertTriangle,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "ETL Monitoring",
    path: "/etl-monitoring",
    icon: Activity,
  },
  {
    name: "Data Ingestion",
    path: "/data-ingestion",
    icon: Upload,
  },
];


export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">

      {/* LOGO */}

      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <h1 className="text-xl font-bold text-slate-800">
          LogiTrack
        </h1>
      </div>


      {/* NAVIGATION */}

      <nav className="p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Operations
        </p>


        <div className="space-y-1">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} />

                {item.name}

              </NavLink>
            );

          })}

        </div>

      </nav>

    </aside>
  );
}