import api from "./api";

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

export interface DriverPerformance {
  driver_id: string;
  driver_name: string;
  status: string;
  total_shipments: number;
  delivered_shipments: number;
  delayed_shipments: number;
  active_shipments: number;
  delivery_rate: number;
}

export interface VehicleUtilization {
  vehicle_id: string;
  vehicle_number: string;
  vehicle_type: string;
  status: string;
  fuel_level: number;
  total_shipments: number;
  delivered_shipments: number;
  active_shipments: number;
  delayed_shipments: number;
}

export interface DestinationPerformance {
  destination_city: string;
  total_shipments: number;
  delivered_shipments: number;
  delayed_shipments: number;
  in_transit_shipments: number;
  delivery_rate: number;
}

export async function getWarehousePerformance(): Promise<
  WarehousePerformance[]
> {
  const response = await api.get<WarehousePerformance[]>(
    "/api/analytics/warehouses"
  );

  return response.data;
}

export async function getDriverPerformance(): Promise<
  DriverPerformance[]
> {
  const response = await api.get<DriverPerformance[]>(
    "/api/analytics/drivers"
  );

  return response.data;
}

export async function getVehicleUtilization(): Promise<
  VehicleUtilization[]
> {
  const response = await api.get<VehicleUtilization[]>(
    "/api/analytics/vehicles"
  );

  return response.data;
}

export async function getDestinationPerformance(): Promise<
  DestinationPerformance[]
> {
  const response = await api.get<DestinationPerformance[]>(
    "/api/analytics/destinations"
  );

  return response.data;
}