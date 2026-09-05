import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  Activity,
  Gauge,
} from "lucide-react";

import {
  getWarehouse,
} from "../services/warehouseService";
import type { Warehouse } from "../services/warehouseService";

export default function WarehouseDetails() {
  const { warehouseId } = useParams<{
    warehouseId: string;
  }>();

  const navigate = useNavigate();

  const [warehouse, setWarehouse] =
    useState<Warehouse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWarehouse() {
      try {
        setLoading(true);
        setError("");

        if (!warehouseId) {
          setError("Warehouse ID is missing.");
          return;
        }

        const data = await getWarehouse(warehouseId);
        setWarehouse(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load warehouse details.");
      } finally {
        setLoading(false);
      }
    }

    fetchWarehouse();
  }, [warehouseId]);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";

      case "inactive":
        return "bg-red-100 text-red-700";

      case "maintenance":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading warehouse details...
        </p>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">
          {error || "Warehouse not found."}
        </p>

        <button
          onClick={() => navigate("/warehouses")}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Warehouses
        </button>
      </div>
    );
  }

  const utilization =
    warehouse.capacity > 0
      ? Math.min(
          (warehouse.total_shipments / warehouse.capacity) * 100,
          100
        )
      : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <button
            onClick={() => navigate("/warehouses")}
            className="mb-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Warehouses
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <WarehouseIcon
                className="text-blue-600"
                size={23}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {warehouse.warehouse_name}
              </h1>

              <p className="text-sm text-slate-500">
                Warehouse ID: {warehouse.warehouse_id}
              </p>
            </div>

          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${getStatusClass(
            warehouse.status
          )}`}
        >
          {warehouse.status}
        </span>

      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Warehouse Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Warehouse Information
          </h2>

          <div className="space-y-5">

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <WarehouseIcon
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Warehouse Name
                </p>

                <p className="font-medium text-slate-800">
                  {warehouse.warehouse_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <MapPin
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Location
                </p>

                <p className="font-medium text-slate-800">
                  {warehouse.city}, {warehouse.state}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Activity
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Current Status
                </p>

                <p className="font-medium capitalize text-slate-800">
                  {warehouse.status}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Capacity */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Capacity & Operations
          </h2>

          <div className="space-y-6">

            {/* Capacity */}
            <div>
              <div className="mb-2 flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <Gauge
                    size={19}
                    className="text-slate-600"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Warehouse Capacity
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {warehouse.capacity.toLocaleString()}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${utilization}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Shipment activity relative to warehouse capacity
              </p>
            </div>

            {/* Shipments */}
            <div className="flex items-center gap-4">

              <div className="rounded-lg bg-slate-100 p-3">
                <Package
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Total Shipments
                </p>

                <p className="font-medium text-slate-800">
                  {warehouse.total_shipments}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Warehouse Summary
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Capacity
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {warehouse.capacity.toLocaleString()}
            </p>

            <p className="text-xs text-slate-400">
              units
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Shipments
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {warehouse.total_shipments}
            </p>

            <p className="text-xs text-slate-400">
              total shipments
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Location
            </p>

            <p className="mt-1 text-lg font-bold text-slate-800">
              {warehouse.city}
            </p>

            <p className="text-xs text-slate-400">
              {warehouse.state}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}