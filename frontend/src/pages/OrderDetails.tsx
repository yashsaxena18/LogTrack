import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { getOrder } from "../services/orderService";

import type { Order } from "../services/orderService";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (value: string) => {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClass = (value: string) => {
    switch (value.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "confirmed":
        return "bg-indigo-100 text-indigo-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "in_transit":
      case "shipped":
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
          Loading order...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">
          {error || "Order not found."}
        </p>

        <button
          onClick={() => navigate("/orders")}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div>

      {/* BACK */}

      <button
        onClick={() => navigate("/orders")}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-blue-100 p-3">
            <ShoppingCart
              size={26}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {order.order_id}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Order details and customer information
            </p>
          </div>

        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
            order.order_status
          )}`}
        >
          {formatStatus(order.order_status)}
        </span>

      </div>

      {/* DETAILS */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ORDER INFORMATION */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-blue-50 p-2">
              <ShoppingCart
                size={20}
                className="text-blue-600"
              />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Order Information
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Order ID
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.order_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Customer ID
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.customer_id}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-slate-400" />

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Order Date
                </p>
              </div>

              <p className="mt-1 font-medium text-slate-800">
                {formatDate(order.order_date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Order Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800">
                ₹{Number(order.order_amount).toLocaleString("en-IN")}
              </p>
            </div>

          </div>

        </div>

        {/* CUSTOMER */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-blue-50 p-2">
              <User
                size={20}
                className="text-blue-600"
              />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Customer
            </h2>

          </div>

          <div className="space-y-5">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Customer Name
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.customer_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {order.customer_email}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* PAYMENT */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-blue-50 p-2">
            <CreditCard
              size={20}
              className="text-blue-600"
            />
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            Payment & Order Status
          </h2>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs uppercase tracking-wide text-slate-400">
              Payment Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                order.payment_status
              )}`}
            >
              {formatStatus(order.payment_status)}
            </span>

          </div>

          <div className="rounded-lg bg-slate-50 p-4">

            <p className="text-xs uppercase tracking-wide text-slate-400">
              Order Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                order.order_status
              )}`}
            >
              {formatStatus(order.order_status)}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}