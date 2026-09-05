import api from "./api";

export interface Vehicle {
  vehicle_id: string;
  vehicle_number: string;
  vehicle_type: string;
  driver_id: string | null;
  driver_name: string | null;
  status: string;
  fuel_level: number;
  last_service_date: string | null;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await api.get<Vehicle[]>(
    "/api/vehicles/"
  );

  return response.data;
}

export async function getVehicle(
  vehicleId: string
): Promise<Vehicle> {
  const response = await api.get<Vehicle>(
    `/api/vehicles/${vehicleId}`
  );

  return response.data;
}