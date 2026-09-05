import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Truck,
  User,
  Warehouse,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { getShipment } from "../services/shipmentService";

import type {
  Shipment,
} from "../services/shipmentService";

export default function ShipmentDetails() {
  const { shipmentId } = useParams();

  const navigate = useNavigate();

  const [shipment, setShipment] =
    useState<Shipment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchShipment() {
      if (!shipmentId) {
        setError("Shipment ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const data =
          await getShipment(shipmentId);

        setShipment(data);
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load shipment details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchShipment();
  }, [shipmentId]);

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatStatus = (
    status: string
  ) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "delayed":
        return "bg-yellow-100 text-yellow-700";

      case "in_transit":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">
          Loading shipment...
        </p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">

        <p className="text-red-600">
          {error || "Shipment not found."}
        </p>

        <button
          onClick={() =>
            navigate("/shipments")
          }
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Back to Shipments
        </button>

      </div>
    );
  }

  return (
    <div>

      {/* BACK BUTTON */}

      <button
        onClick={() =>
          navigate("/shipments")
        }
        className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
      >
        <ArrowLeft size={18} />

        Back to Shipments
      </button>


      {/* PAGE HEADER */}

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-blue-100 p-3">
            <Package
              size={26}
              className="text-blue-600"
            />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              {shipment.shipment_id}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Shipment details and tracking information
            </p>

          </div>

        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
            shipment.status
          )}`}
        >
          {formatStatus(
            shipment.status
          )}
        </span>

      </div>


      {/* INFORMATION GRID */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


        {/* SHIPMENT INFORMATION */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-blue-50 p-2">
              <Package
                size={20}
                className="text-blue-600"
              />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Shipment Information
            </h2>

          </div>


          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Shipment ID
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {shipment.shipment_id}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Order ID
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {shipment.order_id}
              </p>
            </div>


            <div>
              <div className="flex items-center gap-2">

                <Calendar
                  size={15}
                  className="text-slate-400"
                />

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Shipment Date
                </p>

              </div>

              <p className="mt-1 font-medium text-slate-800">
                {formatDate(
                  shipment.shipment_date
                )}
              </p>
            </div>


            <div>
              <div className="flex items-center gap-2">

                <Calendar
                  size={15}
                  className="text-slate-400"
                />

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Expected Delivery
                </p>

              </div>

              <p className="mt-1 font-medium text-slate-800">
                {formatDate(
                  shipment.expected_delivery
                )}
              </p>
            </div>


            <div>
              <div className="flex items-center gap-2">

                <Calendar
                  size={15}
                  className="text-slate-400"
                />

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Actual Delivery
                </p>

              </div>

              <p className="mt-1 font-medium text-slate-800">
                {formatDate(
                  shipment.actual_delivery
                )}
              </p>
            </div>


            <div>
              <div className="flex items-center gap-2">

                <MapPin
                  size={15}
                  className="text-slate-400"
                />

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Destination
                </p>

              </div>

              <p className="mt-1 font-medium text-slate-800">
                {shipment.destination_city}
              </p>
            </div>

          </div>

        </div>


        {/* ASSIGNMENT INFORMATION */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-blue-50 p-2">
              <Truck
                size={20}
                className="text-blue-600"
              />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Assignment
            </h2>

          </div>


          <div className="space-y-6">


            {/* WAREHOUSE */}

            <div className="flex items-start gap-3">

              <Warehouse
                size={20}
                className="mt-1 text-slate-400"
              />

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Warehouse
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {shipment.warehouse_name}
                </p>

                <p className="text-sm text-slate-500">
                  {shipment.warehouse_city}
                </p>

              </div>

            </div>


            {/* VEHICLE */}

            <div className="flex items-start gap-3">

              <Truck
                size={20}
                className="mt-1 text-slate-400"
              />

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Vehicle
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {shipment.vehicle_number}
                </p>

                <p className="text-sm text-slate-500">
                  {shipment.vehicle_type}
                </p>

              </div>

            </div>


            {/* DRIVER */}

            <div className="flex items-start gap-3">

              <User
                size={20}
                className="mt-1 text-slate-400"
              />

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Driver
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {shipment.driver_name}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* DELIVERY SUMMARY */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Delivery Summary
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs uppercase tracking-wide text-slate-400">
              Current Status
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              {formatStatus(
                shipment.status
              )}
            </p>

          </div>


          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs uppercase tracking-wide text-slate-400">
              Destination
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              {shipment.destination_city}
            </p>

          </div>


          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs uppercase tracking-wide text-slate-400">
              Actual Delivery
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              {formatDate(
                shipment.actual_delivery
              )}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}