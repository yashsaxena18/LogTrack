import { useEffect, useMemo, useState } from "react";
import {
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getIncidents,
} from "../services/incidentService";
import type { Incident } from "../services/incidentService";

export default function Incidents() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchIncidents() {
      try {
        setLoading(true);
        setError("");

        const data = await getIncidents(
          severity || undefined
        );

        setIncidents(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load incidents.");
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, [severity]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        incident.incident_id
          .toLowerCase()
          .includes(searchTerm) ||
        incident.shipment_id
          .toLowerCase()
          .includes(searchTerm) ||
        incident.incident_type
          .toLowerCase()
          .includes(searchTerm) ||
        incident.location
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        !status ||
        incident.status.toLowerCase() ===
          status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [incidents, search, status]);

  const totalPages = Math.ceil(
    filteredIncidents.length / itemsPerPage
  );

  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, severity, status]);

  const getSeverityClass = (value: string) => {
    switch (value.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      case "low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusClass = (value: string) => {
    switch (value.toLowerCase()) {
      case "open":
        return "bg-red-100 text-red-700";

      case "investigating":
        return "bg-yellow-100 text-yellow-700";

      case "resolved":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle
              className="text-red-600"
              size={23}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Incidents
            </h1>

            <p className="text-sm text-slate-500">
              Monitor and manage shipment-related incidents
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
            placeholder="Search incident, shipment or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        {/* Severity */}
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
        >
          <option value="">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="investigating">
            Investigating
          </option>
          <option value="resolved">Resolved</option>
        </select>

      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading incidents...
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
            <table className="w-full min-w-[1100px] text-left">

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Incident
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Shipment
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Severity
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reported
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {paginatedIncidents.map((incident) => (
                  <tr
                    key={incident.incident_id}
                    onClick={() =>
                      navigate(
                        `/incidents/${incident.incident_id}`
                      )
                    }
                    className="cursor-pointer transition hover:bg-blue-50"
                  >

                    {/* Incident */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                          <AlertTriangle
                            size={17}
                            className="text-red-500"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">
                            {incident.incident_id}
                          </p>

                          <p className="text-xs text-slate-400">
                            {incident.destination_city || "—"}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Shipment */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {incident.shipment_id}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {incident.incident_type}
                    </td>

                    {/* Severity */}
                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getSeverityClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>

                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {incident.location}
                    </td>

                    {/* Reported */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {incident.reported_at
                        ? new Date(
                            incident.reported_at
                          ).toLocaleString()
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>

                    </td>

                  </tr>
                ))}

                {/* Empty */}
                {paginatedIncidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center"
                    >
                      <AlertTriangle
                        size={32}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="text-sm font-medium text-slate-600">
                        No incidents found
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
          {filteredIncidents.length > 0 && (
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
                    filteredIncidents.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {filteredIncidents.length}
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