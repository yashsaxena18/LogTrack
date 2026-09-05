import api from "./api";

export interface ETLRun {
  run_id: number;
  pipeline_name: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  records_extracted: number;
  records_valid: number;
  records_rejected: number;
  records_loaded: number;
  error_message: string | null;
}

export interface DataQualityError {
  error_id: number;
  run_id: number;
  source: string;
  record_id: string;
  table_name: string;
  error_type: string;
  error_message: string;
  created_at: string;
}

export async function getETLRuns() {
  const response = await api.get<ETLRun[]>(
    "/api/pipeline/runs"
  );

  return response.data;
}

export async function getDataQualityErrors() {
  const response = await api.get<DataQualityError[]>(
    "/api/pipeline/errors"
  );

  return response.data;
}

export async function runMainPipeline(): Promise<{
  message: string;
}> {
  const response = await api.post<{ message: string }>(
    "/api/pipeline/run"
  );

  return response.data;
}

export async function runIncidentPipeline(): Promise<{
  message: string;
}> {
  const response = await api.post<{ message: string }>(
    "/api/pipeline/run-incidents"
  );

  return response.data;
}