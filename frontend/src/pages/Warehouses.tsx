import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Warehouse as WarehouseIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getWarehouses,
} from "../services/warehouseService";
import type { Warehouse } from "../services/warehouseService";

export default function Warehouses() {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        setLoading(true);
        setError("");

        const data = await getWarehouses();
        setWarehouses(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load warehouses.");
      } finally {
        setLoading(false);
      }
    }

    fetchWarehouses();
  }, []);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        warehouse.warehouse_id
          .toLowerCase()
          .includes(searchTerm) ||
        warehouse.warehouse_name
          .toLowerCase()
          .includes(searchTerm) ||
        warehouse.city
          .toLowerCase()
          .includes(searchTerm) ||
        warehouse.state
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        !status ||
        warehouse.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [warehouses, search, status]);

  const totalPages = Math.ceil(
    filteredWarehouses.length / itemsPerPage
  );

  const paginatedWarehouses = filteredWarehouses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const getStatusClass = (warehouseStatus: string) => {
    switch (warehouseStatus.toLowerCase()) {
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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
            <WarehouseIcon
              className="text-blue-600"
              size={23}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Warehouses
            </h1>

            <p className="text-sm text-slate-500">
              Manage warehouse locations and shipment operations
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
            placeholder="Search warehouse, city or state..."
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
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>

      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading warehouses...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
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
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Capacity
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Shipments
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {paginatedWarehouses.map((warehouse) => (
                  <tr
                    key={warehouse.warehouse_id}
                    onClick={() =>
                      navigate(
                        `/warehouses/${warehouse.warehouse_id}`
                      )
                    }
                    className="cursor-pointer transition hover:bg-blue-50"
                  >

                    {/* Warehouse */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {warehouse.warehouse_name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {warehouse.warehouse_id}
                        </p>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {warehouse.city}
                      </p>

                      <p className="text-xs text-slate-400">
                        {warehouse.state}
                      </p>
                    </td>

                    {/* Capacity */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {warehouse.capacity.toLocaleString()}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
                        units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                          warehouse.status
                        )}`}
                      >
                        {warehouse.status}
                      </span>
                    </td>

                    {/* Shipments */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {warehouse.total_shipments}
                      </span>
                    </td>

                  </tr>
                ))}

                {/* Empty */}
                {paginatedWarehouses.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <WarehouseIcon
                        size={32}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="text-sm font-medium text-slate-600">
                        No warehouses found
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
          {filteredWarehouses.length > 0 && (
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
                    filteredWarehouses.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {filteredWarehouses.length}
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