import api from "./api";

export interface Driver {
  driver_id: string;
  name: string;
  phone: string;
  experience_years: number;
  status: string;
  joining_date: string;
  total_shipments: number;
}

export async function getDrivers(): Promise<Driver[]> {
  const response = await api.get<Driver[]>("/api/drivers/");
  return response.data;
}

export async function getDriver(driverId: string): Promise<Driver> {
  const response = await api.get<Driver>(`/api/drivers/${driverId}`);
  return response.data;
}