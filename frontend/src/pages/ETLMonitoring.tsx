import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  AlertTriangle,
  RefreshCw,
  Play,
} from "lucide-react";

import {
  getETLRuns,
  getDataQualityErrors,
  runMainPipeline,
  runIncidentPipeline,
} from "../services/etlService";

import type {
  DataQualityError,
  ETLRun,
} from "../services/etlService";

export default function ETLMonitoring() {
  const [runs, setRuns] = useState<ETLRun[]>([]);
  const [errors, setErrors] = useState<DataQualityError[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [runningPipeline, setRunningPipeline] = useState<
    "main" | "incident" | null
  >(null);

  const [pipelineMessage, setPipelineMessage] = useState("");

  // =========================================================
  // FETCH MONITORING DATA
  // =========================================================

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError("");

      const [runsData, errorsData] = await Promise.all([
        getETLRuns(),
        getDataQualityErrors(),
      ]);

      // Backend should return latest runs first.
      const sortedRuns = [...runsData].sort(
        (a, b) => b.run_id - a.run_id
      );

      setRuns(sortedRuns);
      setErrors(errorsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load ETL monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  // =========================================================
  // RUN MAIN ETL PIPELINE
  // =========================================================

  const handleRunMainPipeline = async () => {
    try {
      setRunningPipeline("main");
      setPipelineMessage("");

      const response = await runMainPipeline();

      setPipelineMessage(
        response.message || "Main ETL pipeline started successfully."
      );

      // Give the background task a moment to create/update its run.
      setTimeout(() => {
        fetchMonitoringData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setPipelineMessage("Failed to start the main ETL pipeline.");
    } finally {
      setRunningPipeline(null);
    }
  };

  // =========================================================
  // RUN INCIDENT ETL PIPELINE
  // =========================================================

  const handleRunIncidentPipeline = async () => {
    try {
      setRunningPipeline("incident");
      setPipelineMessage("");

      const response = await runIncidentPipeline();

      setPipelineMessage(
        response.message || "Incident ETL pipeline started successfully."
      );

      setTimeout(() => {
        fetchMonitoringData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setPipelineMessage("Failed to start the incident ETL pipeline.");
    } finally {
      setRunningPipeline(null);
    }
  };

  // =========================================================
  // LATEST RUN
  // =========================================================

  const latestRun = runs.length > 0 ? runs[0] : null;

  // =========================================================
  // SUCCESSFUL RUNS
  // =========================================================

  const successfulRuns = useMemo(
    () =>
      runs.filter(
        (run) => run.status.toLowerCase() === "success"
      ).length,
    [runs]
  );

  // =========================================================
  // FAILED RUNS
  // =========================================================

  const failedRuns = useMemo(
    () =>
      runs.filter(
        (run) => run.status.toLowerCase() === "failed"
      ).length,
    [runs]
  );

  // =========================================================
  // TOTAL REJECTED RECORDS
  // =========================================================

  const totalRejected = useMemo(
    () =>
      runs.reduce(
        (sum, run) =>
          sum + Number(run.records_rejected || 0),
        0
      ),
    [runs]
  );

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-700";

      case "running":
        return "bg-blue-100 text-blue-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =========================================================
  // DURATION
  // =========================================================

  const getDuration = (run: ETLRun) => {
    if (!run.completed_at) {
      return "Running";
    }

    const start = new Date(run.started_at).getTime();
    const end = new Date(run.completed_at).getTime();

    const duration = Math.max(
      0,
      Math.round((end - start) / 1000)
    );

    if (duration < 60) {
      return `${duration}s`;
    }

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return `${minutes}m ${seconds}s`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading ETL monitoring...
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>

        <button
          onClick={fetchMonitoringData}
          className="mt-4 flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
              <Activity
                className="text-blue-600"
                size={23}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                ETL Monitoring
              </h1>

              <p className="text-sm text-slate-500">
                Monitor data pipeline executions and data quality
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="flex flex-wrap items-center gap-3">

          {/* Refresh */}

          <button
            onClick={fetchMonitoringData}
            disabled={loading || runningPipeline !== null}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {/* Main Pipeline */}

          <button
            onClick={handleRunMainPipeline}
            disabled={runningPipeline !== null}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {runningPipeline === "main" ? (
              <>
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Main Pipeline
              </>
            )}
          </button>

          {/* Incident Pipeline */}

          <button
            onClick={handleRunIncidentPipeline}
            disabled={runningPipeline !== null}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {runningPipeline === "incident" ? (
              <>
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Incident Pipeline
              </>
            )}
          </button>

        </div>
      </div>

      {/* =====================================================
          PIPELINE MESSAGE
      ===================================================== */}

      {pipelineMessage && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">

          <div className="flex items-center gap-2">
            <CheckCircle
              size={17}
              className="text-blue-600"
            />

            <p className="text-sm font-medium text-blue-700">
              {pipelineMessage}
            </p>
          </div>

          <button
            onClick={() => setPipelineMessage("")}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Dismiss
          </button>

        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Latest Status */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Latest Run
              </p>

              <p className="mt-1 text-lg font-bold capitalize text-slate-800">
                {latestRun
                  ? latestRun.status.toLowerCase()
                  : "No runs"}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
              <CheckCircle
                size={21}
                className="text-green-600"
              />
            </div>

          </div>
        </div>

        {/* Successful */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Successful Runs
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {successfulRuns}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
              <CheckCircle
                size={21}
                className="text-green-600"
              />
            </div>

          </div>
        </div>

        {/* Failed */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Failed Runs
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {failedRuns}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3">
              <XCircle
                size={21}
                className="text-red-600"
              />
            </div>

          </div>
        </div>

        {/* Rejected */}

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Records Rejected
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {totalRejected}
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-3">
              <AlertTriangle
                size={21}
                className="text-yellow-600"
              />
            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          LATEST PIPELINE
      ===================================================== */}

      {latestRun && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-800">
                Latest Pipeline Run
              </h2>

              <p className="text-xs text-slate-400">
                Run #{latestRun.run_id} ·{" "}
                {latestRun.pipeline_name}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${getStatusClass(
                latestRun.status
              )}`}
            >
              {latestRun.status.toLowerCase()}
            </span>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

            {/* Extracted */}

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Extracted
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800">
                {latestRun.records_extracted}
              </p>
            </div>

            {/* Valid */}

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Valid
              </p>

              <p className="mt-1 text-xl font-bold text-green-600">
                {latestRun.records_valid}
              </p>
            </div>

            {/* Rejected */}

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Rejected
              </p>

              <p className="mt-1 text-xl font-bold text-red-600">
                {latestRun.records_rejected}
              </p>
            </div>

            {/* Loaded */}

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Loaded
              </p>

              <p className="mt-1 text-xl font-bold text-blue-600">
                {latestRun.records_loaded}
              </p>
            </div>

            {/* Duration */}

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Duration
              </p>

              <p className="mt-1 flex items-center gap-1 text-xl font-bold text-slate-800">
                <Clock size={17} />
                {getDuration(latestRun)}
              </p>
            </div>

          </div>

          {/* Error */}

          {latestRun.error_message && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">

              <p className="text-xs font-semibold text-red-700">
                Pipeline Error
              </p>

              <p className="mt-1 text-sm text-red-600">
                {latestRun.error_message}
              </p>

            </div>
          )}

        </div>
      )}

      {/* =====================================================
          PIPELINE HISTORY
      ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="mb-5 flex items-center gap-3">

          <Database
            size={20}
            className="text-blue-600"
          />

          <div>
            <h2 className="font-semibold text-slate-800">
              Pipeline History
            </h2>

            <p className="text-xs text-slate-400">
              Previous ETL pipeline executions
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px] text-left">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Run
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pipeline
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Started
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Extracted
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Valid
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rejected
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Loaded
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duration
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {runs.map((run) => (
                <tr
                  key={run.run_id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-5 py-4 text-sm font-medium text-slate-800">
                    #{run.run_id}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {run.pipeline_name}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {new Date(
                      run.started_at
                    ).toLocaleString()}
                  </td>

                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                        run.status
                      )}`}
                    >
                      {run.status.toLowerCase()}
                    </span>

                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {run.records_extracted}
                  </td>

                  <td className="px-5 py-4 text-sm text-green-600">
                    {run.records_valid}
                  </td>

                  <td className="px-5 py-4 text-sm text-red-600">
                    {run.records_rejected}
                  </td>

                  <td className="px-5 py-4 text-sm text-blue-600">
                    {run.records_loaded}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {getDuration(run)}
                  </td>

                </tr>
              ))}

              {runs.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center"
                  >

                    <Database
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No pipeline runs found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Run an ETL pipeline to generate monitoring data.
                    </p>

                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          DATA QUALITY ERRORS
      ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="mb-5 flex items-center gap-3">

          <AlertTriangle
            size={20}
            className="text-red-600"
          />

          <div>
            <h2 className="font-semibold text-slate-800">
              Data Quality Errors
            </h2>

            <p className="text-xs text-slate-400">
              Records rejected during validation
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px] text-left">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Run
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Record
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Table
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Error Type
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Error
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {errors.map((item) => (
                <tr
                  key={item.error_id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-5 py-4 text-sm text-slate-600">
                    #{item.run_id}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {item.record_id}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.table_name}
                  </td>

                  <td className="px-5 py-4">

                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      {item.error_type}
                    </span>

                  </td>

                  <td className="max-w-[400px] px-5 py-4 text-sm text-slate-600">
                    {item.error_message}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </td>

                </tr>
              ))}

              {errors.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >

                    <CheckCircle
                      size={32}
                      className="mx-auto mb-3 text-green-400"
                    />

                    <p className="text-sm font-medium text-slate-600">
                      No data quality errors
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      All processed records passed validation.
                    </p>

                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}