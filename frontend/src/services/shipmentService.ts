import api from "./api";

export interface Shipment {
  shipment_id: string;
  order_id: string;
  shipment_date: string;
  expected_delivery: string;
  actual_delivery: string | null;
  status: string;
  destination_city: string;

  warehouse_name: string;
  warehouse_city: string;

  vehicle_number: string;
  vehicle_type: string;

  driver_name: string;
}

export async function getShipments(
  status?: string
): Promise<Shipment[]> {
  const response = await api.get<Shipment[]>(
    "/api/shipments/",
    {
      params: status ? { status } : {},
    }
  );

  return response.data;
}

export async function getShipment(
  shipmentId: string
): Promise<Shipment> {
  const response = await api.get<Shipment>(
    `/api/shipments/${shipmentId}`
  );

  return response.data;
}