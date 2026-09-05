import api from "./api";

export interface Incident {
  incident_id: string;
  shipment_id: string;
  incident_type: string;
  severity: string;
  location: string;
  reported_at: string;
  resolved_at: string | null;
  status: string;
  destination_city: string | null;
  shipment_status: string | null;
}

export async function getIncidents(
  severity?: string
): Promise<Incident[]> {
  const response = await api.get<Incident[]>(
    "/api/incidents/",
    {
      params: severity ? { severity } : {},
    }
  );

  return response.data;
}

export async function getIncident(
  incidentId: string
): Promise<Incident> {
  const response = await api.get<Incident>(
    `/api/incidents/${incidentId}`
  );

  return response.data;
}