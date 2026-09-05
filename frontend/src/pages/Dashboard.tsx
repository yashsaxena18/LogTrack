import { useEffect, useState } from "react";

import { Package, CheckCircle, Clock, XCircle } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getDashboardKPIs,
  getWarehousePerformance,
} from "../services/dashboardService";

import type {
  DashboardKPIs,
  WarehousePerformance,
} from "../services/dashboardService";

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  const [warehouses, setWarehouses] = useState<WarehousePerformance[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [kpiData, warehouseData] = await Promise.all([
          getDashboardKPIs(),
          getWarehousePerformance(),
        ]);

        setKpis(kpiData);

        setWarehouses(warehouseData);
      } catch (err) {
        console.error(err);

        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Shipments",
      value: kpis?.total_shipments ?? 0,
      icon: Package,
    },

    {
      title: "Delivered",
      value: kpis?.delivered_shipments ?? 0,
      icon: CheckCircle,
    },

    {
      title: "Delayed",
      value: kpis?.delayed_shipments ?? 0,
      icon: Clock,
    },

    {
      title: "Failed",
      value: kpis?.failed_shipments ?? 0,
      icon: XCircle,
    },
  ];

  const shipmentStatusData = [
    {
      name: "Delivered",
      value: kpis?.delivered_shipments ?? 0,
    },

    {
      name: "Delayed",
      value: kpis?.delayed_shipments ?? 0,
    },

    {
      name: "In Transit",
      value: kpis?.in_transit_shipments ?? 0,
    },

    {
      name: "Cancelled",
      value: kpis?.cancelled_shipments ?? 0,
    },

    {
      name: "Failed",
      value: kpis?.failed_shipments ?? 0,
    },
  ];

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your logistics operations
        </p>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>

                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-100 p-3">
                  <Icon size={24} className="text-slate-700" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADDITIONAL KPIs */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Customers</p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {kpis?.total_customers ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Orders</p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {kpis?.total_orders ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Delivery Success Rate</p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {kpis?.delivery_success_rate ?? 0}%
          </p>
        </div>
      </div>

      {/* CHARTS */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SHIPMENT STATUS */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Shipment Status</h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shipmentStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {shipmentStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ["#2563eb", "#22c55e", "#f59e0b", "#ef4444"][index % 4]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WAREHOUSE PERFORMANCE */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">
            Warehouse Delivery Rate
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={warehouses}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="warehouse_name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis domain={[0, 100]} unit="%" />

                <Tooltip />

                <Bar
                  dataKey="total_shipments"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
