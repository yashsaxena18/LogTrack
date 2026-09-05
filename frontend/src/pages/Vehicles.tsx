import { useEffect, useState } from "react";

import {
  Search,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getVehicles } from "../services/vehicleService";

import type { Vehicle } from "../services/vehicleService";

export default function Vehicles() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true);

        const data = await getVehicles();

        setVehicles(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vehicles.");
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      vehicle.vehicle_id
        .toLowerCase()
        .includes(searchValue) ||
      vehicle.vehicle_number
        .toLowerCase()
        .includes(searchValue) ||
      vehicle.vehicle_type
        .toLowerCase()
        .includes(searchValue) ||
      (vehicle.driver_name ?? "")
        .toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      !status ||
      vehicle.status.toLowerCase() ===
        status.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(
    filteredVehicles.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentVehicles =
    filteredVehicles.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  const getStatusClass = (value: string) => {
    switch (value.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";

      case "maintenance":
        return "bg-yellow-100 text-yellow-700";

      case "inactive":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getFuelClass = (fuel: number) => {
    if (fuel <= 20) {
      return "text-red-600";
    }

    if (fuel <= 50) {
      return "text-yellow-600";
    }

    return "text-green-600";
  };

  const formatDate = (date: string | null) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">
          Loading vehicles...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>

      {/* HEADER */}

      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-lg bg-blue-100 p-2">
          <Truck
            size={22}
            className="text-blue-600"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Vehicles
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor fleet vehicles and their status
          </p>
        </div>

      </div>

      {/* FILTERS */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search vehicle, number, type, driver..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="maintenance">
              Maintenance
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

        </div>

      </div>

      {/* COUNT */}

      <div className="mb-3 text-sm text-slate-500">

        Showing{" "}

        <span className="font-semibold text-slate-700">
          {filteredVehicles.length === 0
            ? 0
            : startIndex + 1}
        </span>

        {" - "}

        <span className="font-semibold text-slate-700">
          {Math.min(
            startIndex + itemsPerPage,
            filteredVehicles.length
          )}
        </span>

        {" of "}

        <span className="font-semibold text-slate-700">
          {filteredVehicles.length}
        </span>

        {" vehicles"}

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">

              <tr>

                <th className="px-5 py-4">
                  Vehicle
                </th>

                <th className="px-5 py-4">
                  Type
                </th>

                <th className="px-5 py-4">
                  Driver
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Fuel
                </th>

                <th className="px-5 py-4">
                  Last Service
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {currentVehicles.map((vehicle) => (

                <tr
                  key={vehicle.vehicle_id}
                  onClick={() =>
                    navigate(
                      `/vehicles/${vehicle.vehicle_id}`
                    )
                  }
                  className="cursor-pointer transition hover:bg-blue-50"
                >

                  <td className="px-5 py-4">

                    <p className="font-semibold text-slate-800">
                      {vehicle.vehicle_number}
                    </p>

                    <p className="text-xs text-slate-400">
                      {vehicle.vehicle_id}
                    </p>

                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {vehicle.vehicle_type}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {vehicle.driver_name || "-"}
                  </td>

                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        vehicle.status
                      )}`}
                    >
                      {vehicle.status}
                    </span>

                  </td>

                  <td className="px-5 py-4">

                    <span
                      className={`font-semibold ${getFuelClass(
                        Number(vehicle.fuel_level)
                      )}`}
                    >
                      {Number(vehicle.fuel_level)}%
                    </span>

                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(
                      vehicle.last_service_date
                    )}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* EMPTY */}

        {filteredVehicles.length === 0 && (
          <div className="p-10 text-center">

            <Truck
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-500">
              No vehicles found.
            </p>

          </div>
        )}

        {/* PAGINATION */}

        {filteredVehicles.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">

            <p className="text-sm text-slate-500">

              Page{" "}

              <span className="font-medium text-slate-700">
                {currentPage}
              </span>

              {" of "}

              <span className="font-medium text-slate-700">
                {totalPages}
              </span>

            </p>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(page - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      page + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  currentPage === totalPages
                }
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}