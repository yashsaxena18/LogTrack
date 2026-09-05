import { useEffect, useState } from "react";
import {
  BarChart3,
  Warehouse,
  Users,
  Truck,
  MapPin,
} from "lucide-react";

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
  getWarehousePerformance,
  getDriverPerformance,
  getVehicleUtilization,
  getDestinationPerformance,
} from "../services/analyticsService";

import type {
  WarehousePerformance,
  DriverPerformance,
  VehicleUtilization,
  DestinationPerformance,
} from "../services/analyticsService";

export default function Analytics() {
  const [warehouses, setWarehouses] = useState<
    WarehousePerformance[]
  >([]);

  const [drivers, setDrivers] = useState<
    DriverPerformance[]
  >([]);

  const [vehicles, setVehicles] = useState<
    VehicleUtilization[]
  >([]);

  const [destinations, setDestinations] = useState<
    DestinationPerformance[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [
          warehouseData,
          driverData,
          vehicleData,
          destinationData,
        ] = await Promise.all([
          getWarehousePerformance(),
          getDriverPerformance(),
          getVehicleUtilization(),
          getDestinationPerformance(),
        ]);

        setWarehouses(warehouseData);
        setDrivers(driverData);
        setVehicles(vehicleData);
        setDestinations(destinationData);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  /*
   * Calculate summary numbers from the analytics datasets.
   */

  const totalShipments = warehouses.reduce(
    (sum, warehouse) =>
      sum + Number(warehouse.total_shipments),
    0
  );

  const totalDelivered = warehouses.reduce(
    (sum, warehouse) =>
      sum + Number(warehouse.delivered_shipments),
    0
  );

  const totalDelayed = warehouses.reduce(
    (sum, warehouse) =>
      sum + Number(warehouse.delayed_shipments),
    0
  );

  const deliveryRate =
    totalShipments > 0
      ? (totalDelivered / totalShipments) * 100
      : 0;

  /*
   * Shipment status distribution
   */

  const shipmentStatusData = [
    {
      name: "Delivered",
      value: totalDelivered,
    },
    {
      name: "Delayed",
      value: totalDelayed,
    },
    {
      name: "Other",
      value: Math.max(
        totalShipments - totalDelivered - totalDelayed,
        0
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <BarChart3
              className="text-blue-600"
              size={23}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Analytics
            </h1>

            <p className="text-sm text-slate-500">
              Operational performance and logistics insights
            </p>
          </div>

        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Shipments
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {totalShipments}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <Truck
                size={21}
                className="text-blue-600"
              />
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Delivered
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {totalDelivered}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
              <BarChart3
                size={21}
                className="text-green-600"
              />
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Delayed
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {totalDelayed}
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-3">
              <Truck
                size={21}
                className="text-yellow-600"
              />
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Delivery Rate
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {deliveryRate.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-3">
              <BarChart3
                size={21}
                className="text-purple-600"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Warehouse Performance */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <div className="mb-5 flex items-center gap-3">

            <Warehouse
              size={20}
              className="text-blue-600"
            />

            <div>
              <h2 className="font-semibold text-slate-800">
                Warehouse Performance
              </h2>

              <p className="text-xs text-slate-400">
                Shipment volume by warehouse
              </p>
            </div>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={warehouses}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 45,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="warehouse_name"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11 }}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="total_shipments"
                  name="Shipments"
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Shipment Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <div className="mb-5 flex items-center gap-3">

            <BarChart3
              size={20}
              className="text-blue-600"
            />

            <div>
              <h2 className="font-semibold text-slate-800">
                Shipment Distribution
              </h2>

              <p className="text-xs text-slate-400">
                Current shipment outcome distribution
              </p>
            </div>

          </div>

          <div className="h-[320px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={shipmentStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >
                  {shipmentStatusData.map(
                    (_, index) => (
                      <Cell
                        key={`cell-${index}`}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>
            </ResponsiveContainer>

          </div>
        </div>

      </div>

      {/* Driver Performance */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="mb-5 flex items-center gap-3">

          <Users
            size={20}
            className="text-blue-600"
          />

          <div>
            <h2 className="font-semibold text-slate-800">
              Driver Performance
            </h2>

            <p className="text-xs text-slate-400">
              Shipment performance by driver
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px] text-left">

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Driver
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Shipments
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivered
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delayed
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivery Rate
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {drivers.map((driver) => (
                <tr
                  key={driver.driver_id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">
                      {driver.driver_name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {driver.driver_id}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">
                      {driver.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {driver.total_shipments}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {driver.delivered_shipments}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {driver.delayed_shipments}
                  </td>

                  <td className="px-5 py-4">

                    <span className="font-medium text-slate-700">
                      {Number(driver.delivery_rate).toFixed(1)}%
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

      {/* Vehicle Utilization */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="mb-5 flex items-center gap-3">

          <Truck
            size={20}
            className="text-blue-600"
          />

          <div>
            <h2 className="font-semibold text-slate-800">
              Vehicle Utilization
            </h2>

            <p className="text-xs text-slate-400">
              Vehicle activity and shipment utilization
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Vehicle
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fuel
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Shipments
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivered
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Active
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.vehicle_id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">
                      {vehicle.vehicle_number}
                    </p>

                    <p className="text-xs text-slate-400">
                      {vehicle.vehicle_id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm capitalize text-slate-600">
                    {vehicle.vehicle_type}
                  </td>

                  <td className="px-5 py-4 text-sm capitalize text-slate-600">
                    {vehicle.status}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {vehicle.fuel_level}%
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {vehicle.total_shipments}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {vehicle.delivered_shipments}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {vehicle.active_shipments}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

      {/* Destination Performance */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="mb-5 flex items-center gap-3">

          <MapPin
            size={20}
            className="text-blue-600"
          />

          <div>
            <h2 className="font-semibold text-slate-800">
              Destination Performance
            </h2>

            <p className="text-xs text-slate-400">
              Delivery performance by destination
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px] text-left">

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Destination
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Shipments
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivered
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delayed
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  In Transit
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivery Rate
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {destinations.map((destination) => (
                <tr
                  key={destination.destination_city}
                  className="hover:bg-slate-50"
                >

                  <td className="px-5 py-4 font-medium text-slate-800">
                    {destination.destination_city}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {destination.total_shipments}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {destination.delivered_shipments}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {destination.delayed_shipments}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {destination.in_transit_shipments}
                  </td>

                  <td className="px-5 py-4">

                    <span className="font-medium text-slate-700">
                      {Number(
                        destination.delivery_rate
                      ).toFixed(1)}
                      %
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}