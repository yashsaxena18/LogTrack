import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Truck,
  BriefcaseBusiness,
  Activity,
} from "lucide-react";

import { getDriver } from "../services/driverService";
import type { Driver } from "../services/driverService";

export default function DriverDetails() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDriver() {
      try {
        setLoading(true);
        setError("");

        if (!driverId) {
          setError("Driver ID is missing.");
          return;
        }

        const data = await getDriver(driverId);
        setDriver(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load driver details.");
      } finally {
        setLoading(false);
      }
    }

    fetchDriver();
  }, [driverId]);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";

      case "inactive":
        return "bg-red-100 text-red-700";

      case "on_leave":
      case "on leave":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading driver details...
        </p>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">
          {error || "Driver not found."}
        </p>

        <button
          onClick={() => navigate("/drivers")}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Drivers
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
            onClick={() => navigate("/drivers")}
            className="mb-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Drivers
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <User className="text-blue-600" size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {driver.name}
              </h1>

              <p className="text-sm text-slate-500">
                Driver ID: {driver.driver_id}
              </p>
            </div>

          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${getStatusClass(
            driver.status
          )}`}
        >
          {driver.status.replace("_", " ")}
        </span>

      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Personal Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Driver Information
          </h2>

          <div className="space-y-5">

            {/* Name */}
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <User size={20} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Full Name
                </p>

                <p className="font-medium text-slate-800">
                  {driver.name}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Phone size={20} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Phone
                </p>

                <p className="font-medium text-slate-800">
                  {driver.phone}
                </p>
              </div>
            </div>

            {/* Joining Date */}
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Calendar size={20} className="text-slate-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Joining Date
                </p>

                <p className="font-medium text-slate-800">
                  {driver.joining_date
                    ? new Date(
                        driver.joining_date
                      ).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Experience & Work */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Work Information
          </h2>

          <div className="space-y-5">

            {/* Experience */}
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <BriefcaseBusiness
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Experience
                </p>

                <p className="font-medium text-slate-800">
                  {driver.experience_years} years
                </p>
              </div>
            </div>

            {/* Shipments */}
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-100 p-3">
                <Truck
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Total Shipments
                </p>

                <p className="font-medium text-slate-800">
                  {driver.total_shipments}
                </p>
              </div>
            </div>

            {/* Status */}
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
                  {driver.status.replace("_", " ")}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Driver Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Driver Summary
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Experience
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {driver.experience_years}
            </p>

            <p className="text-xs text-slate-400">
              years
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Shipments Handled
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {driver.total_shipments}
            </p>

            <p className="text-xs text-slate-400">
              total shipments
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Driver Status
            </p>

            <p className="mt-1 text-lg font-bold capitalize text-slate-800">
              {driver.status.replace("_", " ")}
            </p>

            <p className="text-xs text-slate-400">
              current status
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}