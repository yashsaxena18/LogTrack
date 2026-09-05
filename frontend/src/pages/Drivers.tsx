import { useEffect, useMemo, useState } from "react";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getDrivers, type Driver } from "../services/driverService";

export default function Drivers() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchDrivers() {
      try {
        setLoading(true);
        setError("");

        const data = await getDrivers();
        setDrivers(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load drivers.");
      } finally {
        setLoading(false);
      }
    }

    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        driver.driver_id.toLowerCase().includes(searchTerm) ||
        driver.name.toLowerCase().includes(searchTerm) ||
        driver.phone.toLowerCase().includes(searchTerm);

      const matchesStatus =
        !status || driver.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, status]);

  const totalPages = Math.ceil(
    filteredDrivers.length / itemsPerPage
  );

  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const getStatusClass = (driverStatus: string) => {
    switch (driverStatus.toLowerCase()) {
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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <Users className="text-blue-600" size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Drivers
            </h1>

            <p className="text-sm text-slate-500">
              Manage logistics drivers and their assignments
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row">

        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search driver ID, name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading drivers...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Driver
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Experience
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Joining Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Shipments
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {paginatedDrivers.map((driver) => (
                  <tr
                    key={driver.driver_id}
                    onClick={() =>
                      navigate(`/drivers/${driver.driver_id}`)
                    }
                    className="cursor-pointer transition hover:bg-blue-50"
                  >

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {driver.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {driver.driver_id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.phone}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.experience_years} years
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                          driver.status
                        )}`}
                      >
                        {driver.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.joining_date
                        ? new Date(
                            driver.joining_date
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {driver.total_shipments}
                    </td>

                  </tr>
                ))}

                {paginatedDrivers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center"
                    >
                      <Users
                        size={32}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="text-sm font-medium text-slate-600">
                        No drivers found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredDrivers.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredDrivers.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {filteredDrivers.length}
                </span>
              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-2 text-sm text-slate-500">
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}