import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  User,
  Fuel,
  Calendar,
  Activity,
} from "lucide-react";

import { getVehicle } from "../services/vehicleService";
import type { Vehicle } from "../services/vehicleService";

export default function VehicleDetails() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVehicle() {
      try {
        setLoading(true);
        setError("");

        if (!vehicleId) {
          setError("Vehicle ID is missing.");
          return;
        }

        const data = await getVehicle(vehicleId);
        setVehicle(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    }

    fetchVehicle();
  }, [vehicleId]);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading vehicle details...
        </p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">
          {error || "Vehicle not found."}
        </p>

        <button
          onClick={() => navigate("/vehicles")}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/vehicles")}
            className="mb-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Vehicles
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <Truck className="text-blue-600" size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {vehicle.vehicle_number}
              </h1>

              <p className="text-sm text-slate-500">
                Vehicle ID: {vehicle.vehicle_id}
              </p>
            </div>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${getStatusClass(
            vehicle.status
          )}`}
        >
          {vehicle.status}
        </span>
      </div>

      {/* Vehicle Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Basic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Vehicle Information
          </h2>

          <div className="space-y-5">

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Truck size={20} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Vehicle Number
                </p>
                <p className="font-medium text-slate-800">
                  {vehicle.vehicle_number}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Activity size={20} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Vehicle Type
                </p>
                <p className="font-medium capitalize text-slate-800">
                  {vehicle.vehicle_type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Calendar size={20} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Last Service
                </p>
                <p className="font-medium text-slate-800">
                  {vehicle.last_service_date
                    ? new Date(
                        vehicle.last_service_date
                      ).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Driver & Fuel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Assignment & Fuel
          </h2>

          <div className="space-y-5">

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <User size={20} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Assigned Driver
                </p>

                <p className="font-medium text-slate-800">
                  {vehicle.driver_name || "Unassigned"}
                </p>

                {vehicle.driver_id && (
                  <p className="text-xs text-slate-400">
                    ID: {vehicle.driver_id}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel size={19} className="text-slate-600" />

                  <span className="text-sm font-medium text-slate-700">
                    Fuel Level
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {vehicle.fuel_level}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    vehicle.fuel_level <= 20
                      ? "bg-red-500"
                      : vehicle.fuel_level <= 50
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max(vehicle.fuel_level, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Current Status
        </h2>

        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${getStatusClass(
              vehicle.status
            )}`}
          >
            <Activity size={22} />
          </div>

          <div>
            <p className="font-semibold capitalize text-slate-800">
              {vehicle.status}
            </p>

            <p className="text-sm text-slate-500">
              Vehicle {vehicle.vehicle_number} is currently{" "}
              {vehicle.status.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}