import api from "./api";

export interface DashboardKPIs {
  total_customers: number;
  total_orders: number;
  total_shipments: number;
  delivered_shipments: number;
  delayed_shipments: number;
  in_transit_shipments: number;
  cancelled_shipments: number;
  failed_shipments: number;
  delivery_success_rate: number;
}

export interface WarehousePerformance {
  warehouse_id: string;
  warehouse_name: string;
  city: string;
  total_shipments: number;
  delivered_shipments: number;
  delayed_shipments: number;
  in_transit_shipments: number;
  delivery_rate: number;
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const response = await api.get<DashboardKPIs>(
    "/api/dashboard/kpis"
  );

  return response.data;
}

export async function getWarehousePerformance(): Promise<
  WarehousePerformance[]
> {
  const response = await api.get<WarehousePerformance[]>(
    "/api/analytics/warehouses"
  );

  return response.data;
}