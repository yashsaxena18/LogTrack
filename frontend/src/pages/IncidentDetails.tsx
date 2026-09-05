import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Package,
  MapPin,
  Calendar,
  Activity,
} from "lucide-react";

import {
  getIncident,
} from "../services/incidentService";
import type { Incident } from "../services/incidentService";

export default function IncidentDetails() {
  const { incidentId } = useParams<{
    incidentId: string;
  }>();

  const navigate = useNavigate();

  const [incident, setIncident] =
    useState<Incident | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchIncident() {
      try {
        setLoading(true);
        setError("");

        if (!incidentId) {
          setError("Incident ID is missing.");
          return;
        }

        const data = await getIncident(incidentId);

        setIncident(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load incident details.");
      } finally {
        setLoading(false);
      }
    }

    fetchIncident();
  }, [incidentId]);

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
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

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
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

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading incident details...
        </p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">
          {error || "Incident not found."}
        </p>

        <button
          onClick={() => navigate("/incidents")}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Incidents
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
            onClick={() => navigate("/incidents")}
            className="mb-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Incidents
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle
                className="text-red-600"
                size={23}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {incident.incident_id}
              </h1>

              <p className="text-sm text-slate-500">
                {incident.incident_type}
              </p>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2">

          <span
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${getSeverityClass(
              incident.severity
            )}`}
          >
            {incident.severity}
          </span>

          <span
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${getStatusClass(
              incident.status
            )}`}
          >
            {incident.status}
          </span>

        </div>

      </div>

      {/* Incident Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Incident Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Incident Information
          </h2>

          <div className="space-y-5">

            {/* Incident Type */}
            <div className="flex items-center gap-4">

              <div className="rounded-lg bg-slate-100 p-3">
                <AlertTriangle
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Incident Type
                </p>

                <p className="font-medium text-slate-800">
                  {incident.incident_type}
                </p>
              </div>

            </div>

            {/* Severity */}
            <div className="flex items-center gap-4">

              <div className="rounded-lg bg-slate-100 p-3">
                <Activity
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Severity
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getSeverityClass(
                    incident.severity
                  )}`}
                >
                  {incident.severity}
                </span>
              </div>

            </div>

            {/* Location */}
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
                  {incident.location}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* Shipment Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Shipment Information
          </h2>

          <div className="space-y-5">

            {/* Shipment */}
            <div className="flex items-center gap-4">

              <div className="rounded-lg bg-slate-100 p-3">
                <Package
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Shipment ID
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/shipments/${incident.shipment_id}`
                    )
                  }
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  {incident.shipment_id}
                </button>
              </div>

            </div>

            {/* Destination */}
            <div className="flex items-center gap-4">

              <div className="rounded-lg bg-slate-100 p-3">
                <MapPin
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Destination
                </p>

                <p className="font-medium text-slate-800">
                  {incident.destination_city || "Not available"}
                </p>
              </div>

            </div>

            {/* Shipment Status */}
            <div className="flex items-center gap-4">

              <div className="rounded-lg bg-slate-100 p-3">
                <Activity
                  size={20}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Shipment Status
                </p>

                <p className="font-medium capitalize text-slate-800">
                  {incident.shipment_status || "Not available"}
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <h2 className="mb-6 text-lg font-semibold text-slate-800">
          Incident Timeline
        </h2>

        <div className="space-y-6">

          {/* Reported */}
          <div className="flex gap-4">

            <div className="relative flex flex-col items-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle
                  size={18}
                  className="text-red-600"
                />
              </div>

              <div className="absolute top-10 h-12 w-px bg-slate-200" />

            </div>

            <div>
              <p className="font-medium text-slate-800">
                Incident Reported
              </p>

              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <Calendar size={14} />

                {incident.reported_at
                  ? new Date(
                      incident.reported_at
                    ).toLocaleString()
                  : "Not available"}
              </p>
            </div>

          </div>

          {/* Resolved */}
          <div className="flex gap-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <Activity
                size={18}
                className="text-green-600"
              />
            </div>

            <div>
              <p className="font-medium text-slate-800">
                {incident.resolved_at
                  ? "Incident Resolved"
                  : "Incident Still Open"}
              </p>

              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <Calendar size={14} />

                {incident.resolved_at
                  ? new Date(
                      incident.resolved_at
                    ).toLocaleString()
                  : "No resolution recorded"}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Incident Summary
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Incident
            </p>

            <p className="mt-1 text-lg font-bold text-slate-800">
              {incident.incident_id}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Shipment
            </p>

            <p className="mt-1 text-lg font-bold text-slate-800">
              {incident.shipment_id}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Severity
            </p>

            <p className="mt-1 text-lg font-bold capitalize text-slate-800">
              {incident.severity}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Status
            </p>

            <p className="mt-1 text-lg font-bold capitalize text-slate-800">
              {incident.status}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}