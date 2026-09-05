import { useEffect, useState } from "react";
import { Search, Package, ChevronLeft, ChevronRight } from "lucide-react";

import { getShipments } from "../services/shipmentService";

import type { Shipment } from "../services/shipmentService";
import { useNavigate } from "react-router-dom";

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchShipments() {
      try {
        setLoading(true);

        const data = await getShipments(status || undefined);

        setShipments(data);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
        setError("Failed to load shipments.");
      } finally {
        setLoading(false);
      }
    }

    fetchShipments();
  }, [status]);

  // Search
  const filteredShipments = shipments.filter((shipment) => {
    const searchValue = search.toLowerCase();

    return (
      shipment.shipment_id.toLowerCase().includes(searchValue) ||
      shipment.order_id.toLowerCase().includes(searchValue) ||
      shipment.destination_city.toLowerCase().includes(searchValue) ||
      shipment.driver_name.toLowerCase().includes(searchValue) ||
      shipment.vehicle_number.toLowerCase().includes(searchValue)
    );
  });

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const currentShipments = filteredShipments.slice(startIndex, endIndex);

  // Status colors
  const getStatusClass = (shipmentStatus: string) => {
    switch (shipmentStatus.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "delayed":
        return "bg-yellow-100 text-yellow-700";

      case "in_transit":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatStatus = (shipmentStatus: string) => {
    return shipmentStatus
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
        <p className="text-slate-500">Loading shipments...</p>
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

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Package size={22} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">Shipments</h1>

            <p className="mt-1 text-sm text-slate-500">
              Track and manage logistics shipments
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search shipment, order, city, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* STATUS FILTER */}

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Statuses</option>

            <option value="delivered">Delivered</option>

            <option value="delayed">Delayed</option>

            <option value="in_transit">In Transit</option>

            <option value="cancelled">Cancelled</option>

            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* RESULTS COUNT */}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredShipments.length === 0 ? 0 : startIndex + 1}
          </span>
          {" - "}
          <span className="font-semibold text-slate-700">
            {Math.min(endIndex, filteredShipments.length)}
          </span>
          {" of "}
          <span className="font-semibold text-slate-700">
            {filteredShipments.length}
          </span>
          {" shipments"}
        </p>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Shipment</th>

                <th className="px-5 py-4">Order</th>

                <th className="px-5 py-4">Shipment Date</th>

                <th className="px-5 py-4">Expected</th>

                <th className="px-5 py-4">Actual</th>

                <th className="px-5 py-4">Status</th>

                <th className="px-5 py-4">Destination</th>

                <th className="px-5 py-4">Warehouse</th>

                <th className="px-5 py-4">Vehicle</th>

                <th className="px-5 py-4">Driver</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {currentShipments.map((shipment) => (
                <tr
                  key={shipment.shipment_id}
                  onClick={() => navigate(`/shipments/${shipment.shipment_id}`)}
                  className="cursor-pointer transition hover:bg-blue-50"
                >
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {shipment.shipment_id}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {shipment.order_id}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(shipment.shipment_date)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(shipment.expected_delivery)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(shipment.actual_delivery)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        shipment.status,
                      )}`}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {shipment.destination_city}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {shipment.warehouse_name}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {shipment.vehicle_number}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {shipment.driver_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NO RESULTS */}

        {filteredShipments.length === 0 && (
          <div className="p-10 text-center">
            <Package size={40} className="mx-auto text-slate-300" />

            <p className="mt-3 text-sm text-slate-500">No shipments found.</p>
          </div>
        )}

        {/* PAGINATION */}

        {filteredShipments.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-medium text-slate-700">{currentPage}</span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
