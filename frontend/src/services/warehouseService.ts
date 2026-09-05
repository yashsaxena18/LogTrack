import api from "./api";

export interface Warehouse {
  warehouse_id: string;
  warehouse_name: string;
  city: string;
  state: string;
  capacity: number;
  status: string;
  total_shipments: number;
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const response = await api.get<Warehouse[]>("/api/warehouses/");
  return response.data;
}

export async function getWarehouse(
  warehouseId: string
): Promise<Warehouse> {
  const response = await api.get<Warehouse>(
    `/api/warehouses/${warehouseId}`
  );

  return response.data;
}