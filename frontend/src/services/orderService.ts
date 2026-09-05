import api from "./api";

export interface Order {
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;

  order_date: string;
  order_amount: number;
  payment_status: string;
  order_status: string;
}

export async function getOrders(
  status?: string
): Promise<Order[]> {
  const response = await api.get<Order[]>(
    "/api/orders/",
    {
      params: status ? { status } : {},
    }
  );

  return response.data;
}

export async function getOrder(
  orderId: string
): Promise<Order> {
  const response = await api.get<Order>(
    `/api/orders/${orderId}`
  );

  return response.data;
}