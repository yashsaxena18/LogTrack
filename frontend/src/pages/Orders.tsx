import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getOrders } from "../services/orderService";

import type { Order } from "../services/orderService";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        const data = await getOrders(
          status || undefined
        );

        setOrders(data);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredOrders = orders.filter((order) => {
    const value = search.toLowerCase();

    return (
      order.order_id
        .toLowerCase()
        .includes(value) ||
      order.customer_id
        .toLowerCase()
        .includes(value) ||
      order.customer_name
        .toLowerCase()
        .includes(value) ||
      order.customer_email
        .toLowerCase()
        .includes(value)
    );
  });

  const totalPages = Math.ceil(
    filteredOrders.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  const formatStatus = (value: string) => {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getOrderStatusClass = (
    value: string
  ) => {
    switch (value.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "shipped":
      case "in_transit":
        return "bg-blue-100 text-blue-700";

      case "confirmed":
        return "bg-indigo-100 text-indigo-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPaymentStatusClass = (
    value: string
  ) => {
    switch (value.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

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
          Loading orders...
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
          <ShoppingCart
            size={22}
            className="text-blue-600"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track customer orders
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
              placeholder="Search order, customer..."
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

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="in_transit">
              In Transit
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="failed">
              Failed
            </option>
          </select>

        </div>

      </div>

      {/* RESULT COUNT */}

      <div className="mb-3 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {filteredOrders.length === 0
            ? 0
            : startIndex + 1}
        </span>{" "}
        -{" "}
        <span className="font-semibold text-slate-700">
          {Math.min(
            startIndex + itemsPerPage,
            filteredOrders.length
          )}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {filteredOrders.length}
        </span>{" "}
        orders
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">

              <tr>

                <th className="px-5 py-4">
                  Order
                </th>

                <th className="px-5 py-4">
                  Customer
                </th>

                <th className="px-5 py-4">
                  Order Date
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>

                <th className="px-5 py-4">
                  Payment
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {currentOrders.map((order) => (

                <tr
                  key={order.order_id}
                  onClick={() =>
                    navigate(
                      `/orders/${order.order_id}`
                    )
                  }
                  className="cursor-pointer transition hover:bg-blue-50"
                >

                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {order.order_id}
                  </td>

                  <td className="px-5 py-4">

                    <p className="font-medium text-slate-700">
                      {order.customer_name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {order.customer_email}
                    </p>

                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(order.order_date)}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-700">
                    ₹
                    {Number(
                      order.order_amount
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusClass(
                        order.payment_status
                      )}`}
                    >
                      {formatStatus(
                        order.payment_status
                      )}
                    </span>

                  </td>

                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusClass(
                        order.order_status
                      )}`}
                    >
                      {formatStatus(
                        order.order_status
                      )}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* NO RESULTS */}

        {filteredOrders.length === 0 && (
          <div className="p-10 text-center">

            <ShoppingCart
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-500">
              No orders found.
            </p>

          </div>
        )}

        {/* PAGINATION */}

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">

            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-medium text-slate-700">
                {currentPage}
              </span>{" "}
              of{" "}
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