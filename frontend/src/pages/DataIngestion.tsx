import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  Play,
} from "lucide-react";
import api from "../services/api";


// =========================================================
// TYPES
// =========================================================

type DatasetName =
  | "customers"
  | "warehouses"
  | "drivers"
  | "vehicles"
  | "orders"
  | "shipments";


interface ETLResult {
  run_id?: number;
  status?: string;
  records_extracted?: number;
  records_valid?: number;
  records_rejected?: number;
  records_loaded?: number;
  quality_errors?: number;

  datasets?: {
    customers?: number;
    warehouses?: number;
    drivers?: number;
    vehicles?: number;
    orders?: number;
    shipments?: number;
  };
}


interface UploadResponse {
  status: string;
  message: string;
  upload_id?: string;

  files?: Record<
    string,
    {
      filename: string;
      rows: number;
      columns: string[];
      extra_columns: string[];
      saved_file: string;
    }
  >;

  etl?: ETLResult;

  error?: string;
}


// =========================================================
// DATASET ORDER
// =========================================================

const datasetOrder: DatasetName[] = [
  "customers",
  "warehouses",
  "drivers",
  "vehicles",
  "orders",
  "shipments",
];


// =========================================================
// DATASET KEYWORDS
// =========================================================

const datasetKeywords: DatasetName[] = [
  "customers",
  "warehouses",
  "drivers",
  "vehicles",
  "orders",
  "shipments",
];


// =========================================================
// PAGE
// =========================================================

export default function DataIngestion() {

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [result, setResult] =
    useState<UploadResponse | null>(null);

  const [error, setError] =
    useState("");


  // =======================================================
  // IDENTIFY DATASET
  // =======================================================

  const identifyDataset = (
    filename: string
  ): DatasetName | null => {

    const stem = filename
      .toLowerCase()
      .replace(".csv", "")
      .replace(/-/g, "_")
      .replace(/\s+/g, "_");


    for (const dataset of datasetKeywords) {

      if (
        stem === dataset ||
        stem.startsWith(`${dataset}_`) ||
        stem.endsWith(`_${dataset}`) ||
        stem.includes(`_${dataset}_`)
      ) {
        return dataset;
      }
    }


    return null;
  };


  // =======================================================
  // DATASET LABEL
  // =======================================================

  const getDatasetLabel = (
    dataset: DatasetName
  ) => {

    const labels: Record<
      DatasetName,
      string
    > = {

      customers: "Customers",

      warehouses: "Warehouses",

      drivers: "Drivers",

      vehicles: "Vehicles",

      orders: "Orders",

      shipments: "Shipments",
    };


    return labels[dataset];
  };


  // =======================================================
  // GET FILE DATASET
  // =======================================================

  const getFileDataset = (
    file: File
  ): DatasetName | null => {

    return identifyDataset(
      file.name
    );
  };


  // =======================================================
  // GET FILE FOR DATASET
  // =======================================================

  const getFileInfo = (
    dataset: DatasetName
  ) => {

    return selectedFiles.find(
      (file) =>
        getFileDataset(file) === dataset
    );
  };


  // =======================================================
  // HANDLE FILE SELECTION
  // =======================================================

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const newFiles = Array.from(
      event.target.files || []
    );


    setError("");

    setResult(null);


    if (newFiles.length === 0) {
      return;
    }


    // -----------------------------------------------------
    // CSV CHECK
    // -----------------------------------------------------

    const invalidExtension =
      newFiles.some(
        (file) =>
          !file.name
            .toLowerCase()
            .endsWith(".csv")
      );


    if (invalidExtension) {

      setError(
        "Only CSV files are supported."
      );

      event.target.value = "";

      return;
    }


    // -----------------------------------------------------
    // DATASET IDENTIFICATION
    // -----------------------------------------------------

    const unidentifiedFiles =
      newFiles.filter(
        (file) =>
          identifyDataset(
            file.name
          ) === null
      );


    if (
      unidentifiedFiles.length > 0
    ) {

      setError(
        `Could not identify dataset from: ${unidentifiedFiles
          .map((file) => file.name)
          .join(", ")}. Use names such as customers_small.csv, orders_small.csv, etc.`
      );

      event.target.value = "";

      return;
    }


    // -----------------------------------------------------
    // MERGE OLD + NEW FILES
    // -----------------------------------------------------

    const mergedFiles = [
      ...selectedFiles,
      ...newFiles,
    ];


    // -----------------------------------------------------
    // REMOVE DUPLICATE DATASETS
    // -----------------------------------------------------

    const uniqueFiles: File[] = [];

    const seenDatasets =
      new Set<DatasetName>();


    for (
      const file of mergedFiles
    ) {

      const dataset =
        identifyDataset(
          file.name
        );


      if (!dataset) {
        continue;
      }


      if (
        !seenDatasets.has(dataset)
      ) {

        seenDatasets.add(
          dataset
        );

        uniqueFiles.push(
          file
        );

      } else {

        const existingIndex =
          uniqueFiles.findIndex(
            (existingFile) =>
              identifyDataset(
                existingFile.name
              ) === dataset
          );


        if (
          existingIndex !== -1
        ) {

          uniqueFiles[
            existingIndex
          ] = file;

        }
      }
    }


    // -----------------------------------------------------
    // MAXIMUM 6 FILES
    // -----------------------------------------------------

    if (
      uniqueFiles.length > 6
    ) {

      setError(
        "You can select a maximum of 6 CSV files."
      );

      event.target.value = "";

      return;
    }


    // -----------------------------------------------------
    // SORT FILES
    // -----------------------------------------------------

    uniqueFiles.sort(
      (a, b) => {

        const datasetA =
          identifyDataset(
            a.name
          );

        const datasetB =
          identifyDataset(
            b.name
          );


        if (
          !datasetA ||
          !datasetB
        ) {
          return 0;
        }


        return (
          datasetOrder.indexOf(
            datasetA
          ) -
          datasetOrder.indexOf(
            datasetB
          )
        );
      }
    );


    setSelectedFiles(
      uniqueFiles
    );


    // -----------------------------------------------------
    // RESET INPUT
    // -----------------------------------------------------

    event.target.value = "";
  };


  // =======================================================
  // REMOVE FILE
  // =======================================================

  const removeFile = (
    dataset: DatasetName
  ) => {

    setSelectedFiles(
      selectedFiles.filter(
        (file) =>
          getFileDataset(file) !==
          dataset
      )
    );


    setResult(null);

    setError("");
  };


  // =======================================================
  // RESET
  // =======================================================

  const handleReset = () => {

    setSelectedFiles([]);

    setResult(null);

    setError("");


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";
    }
  };


  // =======================================================
  // UPLOAD + RUN ETL
  // =======================================================

  const handleUploadAndRun =
    async () => {

      setError("");

      setResult(null);


      // ---------------------------------------------------
      // CHECK 6 FILES
      // ---------------------------------------------------

      if (
        selectedFiles.length !== 6
      ) {

        setError(
          "Please select all 6 required CSV files before running the ETL pipeline."
        );

        return;
      }


      // ---------------------------------------------------
      // CHECK DATASETS
      // ---------------------------------------------------

      const selectedDatasetNames =
        selectedFiles
          .map(
            (file) =>
              identifyDataset(
                file.name
              )
          )
          .filter(
            (
              dataset
            ): dataset is DatasetName =>
              dataset !== null
          );


      const missingDatasets =
        datasetOrder.filter(
          (dataset) =>
            !selectedDatasetNames.includes(
              dataset
            )
        );


      if (
        missingDatasets.length > 0
      ) {

        setError(
          `Missing CSV file(s): ${missingDatasets
            .map(
              (dataset) =>
                `${dataset}.csv`
            )
            .join(", ")}`
        );

        return;
      }


      // ---------------------------------------------------
      // FORMDATA
      // ---------------------------------------------------

      const formData =
        new FormData();


      selectedFiles.forEach(
        (file) => {

          formData.append(
            "files",
            file
          );

        }
      );


      // ---------------------------------------------------
      // SEND TO BACKEND
      // ---------------------------------------------------

      try {

        setIsProcessing(true);


        const response =
          await api.post<UploadResponse>(
            "/api/upload/run",
            formData
          );


        setResult(
          response.data
        );


        if (
          response.data.status !==
          "SUCCESS"
        ) {

          setError(
            response.data.error ||
            response.data.message ||
            "ETL pipeline failed."
          );
        }


      } catch (err: any) {

        console.error(
          "Upload failed:",
          err
        );


        const backendMessage =
          err?.response?.data?.detail;


        if (
          typeof backendMessage ===
          "string"
        ) {

          setError(
            backendMessage
          );

        } else if (
          backendMessage?.message
        ) {

          setError(
            backendMessage.message
          );

        } else {

          setError(
            "Unable to connect to the backend. Make sure FastAPI is running on port 8000."
          );
        }


      } finally {

        setIsProcessing(
          false
        );
      }
    };


  // =======================================================
  // FORMAT FILE SIZE
  // =======================================================

  const formatFileSize = (
    bytes: number
  ) => {

    if (
      bytes < 1024
    ) {

      return `${bytes} B`;
    }


    if (
      bytes <
      1024 * 1024
    ) {

      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }


    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div className="min-h-screen bg-slate-50 p-6">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">

            <Database size={22} />

          </div>


          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Data Ingestion
            </h1>


            <p className="mt-1 text-sm text-slate-500">
              Upload logistics datasets and run the ETL pipeline
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          UPLOAD CARD
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">


        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-800">
            Upload Logistics Dataset
          </h2>


          <p className="mt-1 text-sm text-slate-500">
            Select all six CSV files to load the complete logistics dataset.
          </p>

        </div>


        {/* =================================================
            DATASET CARDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

          {datasetOrder.map(
            (dataset) => {

              const file =
                getFileInfo(
                  dataset
                );


              return (

                <div
                  key={dataset}
                  className={`rounded-lg border p-4 transition ${
                    file
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">


                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          file
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >

                        {file ? (

                          <CheckCircle
                            size={18}
                          />

                        ) : (

                          <FileText
                            size={18}
                          />

                        )}

                      </div>


                      <div>

                        <p className="text-sm font-semibold text-slate-700">
                          {getDatasetLabel(
                            dataset
                          )}
                        </p>


                        <p className="text-xs text-slate-400">
                          {file
                            ? file.name
                            : `${dataset}.csv`}
                        </p>

                      </div>

                    </div>


                    {file && (

                      <button
                        onClick={() =>
                          removeFile(
                            dataset
                          )
                        }
                        disabled={
                          isProcessing
                        }
                        className="text-slate-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Remove file"
                      >

                        <XCircle
                          size={18}
                        />

                      </button>

                    )}

                  </div>


                  {file && (

                    <div className="mt-3 border-t border-green-200 pt-3">

                      <p className="truncate text-xs font-medium text-green-700">
                        {file.name}
                      </p>


                      <p className="mt-1 text-xs text-green-600">
                        {formatFileSize(
                          file.size
                        )}
                      </p>

                    </div>

                  )}

                </div>

              );
            }
          )}

        </div>


        {/* =================================================
            FILE INPUT
        ================================================= */}

        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50">


          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            onChange={
              handleFileSelection
            }
            className="hidden"
            id="csv-upload"
            disabled={
              isProcessing
            }
          />


          <label
            htmlFor="csv-upload"
            className={
              isProcessing
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }
          >

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">

              <Upload
                size={26}
              />

            </div>


            <p className="text-sm font-semibold text-slate-700">
              Select CSV files
            </p>


            <p className="mt-1 text-xs text-slate-500">
              Select all 6 logistics CSV files at once
            </p>


            <div className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">

              Choose CSV Files

            </div>

          </label>

        </div>


        {/* =================================================
            FILE COUNT
        ================================================= */}

        <div className="mt-5 flex items-center justify-between">


          <div className="flex items-center gap-2">

            {selectedFiles.length === 6 ? (

              <>

                <CheckCircle
                  size={18}
                  className="text-green-500"
                />

                <span className="text-sm font-medium text-green-700">
                  All 6 files selected
                </span>

              </>

            ) : (

              <>

                <AlertTriangle
                  size={18}
                  className="text-amber-500"
                />

                <span className="text-sm text-slate-600">
                  {selectedFiles.length} of 6 files selected
                </span>

              </>

            )}

          </div>


          {selectedFiles.length > 0 && (

            <button
              onClick={
                handleReset
              }
              disabled={
                isProcessing
              }
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={16}
              />

              Reset

            </button>

          )}

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">

            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-500"
            />


            <div>

              <p className="text-sm font-semibold text-red-700">
                Upload / ETL Error
              </p>


              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* =================================================
            RUN BUTTON
        ================================================= */}

        <div className="mt-6 flex justify-end">

          <button
            onClick={
              handleUploadAndRun
            }
            disabled={
              selectedFiles.length !==
                6 ||
              isProcessing
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >

            {isProcessing ? (

              <>

                <RefreshCw
                  size={18}
                  className="animate-spin"
                />

                Processing ETL...

              </>

            ) : (

              <>

                <Play
                  size={18}
                />

                Upload & Run ETL

              </>

            )}

          </button>

        </div>

      </div>


      {/* =================================================
          ETL RESULT
      ================================================= */}

      {result?.etl && (

        <div className="mt-6">


          <div className="mb-4">

            <h2 className="text-lg font-semibold text-slate-800">
              ETL Pipeline Result
            </h2>


            <p className="mt-1 text-sm text-slate-500">
              Results from the latest uploaded dataset
            </p>

          </div>


          {/* =================================================
              STATUS
          ================================================= */}

          <div
            className={`mb-5 flex items-center gap-3 rounded-xl border p-4 ${
              result.status ===
              "SUCCESS"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >

            {result.status ===
            "SUCCESS" ? (

              <CheckCircle
                size={22}
                className="text-green-600"
              />

            ) : (

              <XCircle
                size={22}
                className="text-red-600"
              />

            )}


            <div>

              <p
                className={`text-sm font-semibold ${
                  result.status ===
                  "SUCCESS"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {result.message}
              </p>


              {result.etl.run_id && (

                <p className="mt-1 text-xs text-slate-500">
                  ETL Run ID:{" "}
                  {result.etl.run_id}
                </p>

              )}

            </div>

          </div>


          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


            {/* EXTRACTED */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-slate-500">
                Records Extracted
              </p>


              <p className="mt-2 text-2xl font-bold text-slate-800">
                {result.etl.records_extracted ??
                  0}
              </p>


              <p className="mt-1 text-xs text-slate-400">
                From 6 CSV files
              </p>

            </div>


            {/* VALID */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-slate-500">
                Valid Records
              </p>


              <p className="mt-2 text-2xl font-bold text-green-600">
                {result.etl.records_valid ??
                  0}
              </p>


              <p className="mt-1 text-xs text-slate-400">
                Passed validation
              </p>

            </div>


            {/* REJECTED */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-slate-500">
                Rejected Records
              </p>


              <p className="mt-2 text-2xl font-bold text-red-600">
                {result.etl.records_rejected ??
                  0}
              </p>


              <p className="mt-1 text-xs text-slate-400">
                Data quality issues
              </p>

            </div>


            {/* LOADED */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-slate-500">
                Records Loaded
              </p>


              <p className="mt-2 text-2xl font-bold text-blue-600">
                {result.etl.records_loaded ??
                  0}
              </p>


              <p className="mt-1 text-xs text-slate-400">
                Loaded into PostgreSQL
              </p>

            </div>

          </div>


          {/* =================================================
              DATASET SUMMARY
          ================================================= */}

          {result.etl.datasets && (

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">


              <div className="mb-5 flex items-center gap-2">

                <Database
                  size={20}
                  className="text-blue-600"
                />


                <h3 className="font-semibold text-slate-800">
                  Dataset Summary
                </h3>

              </div>


              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

                {datasetOrder.map(
                  (dataset) => {

                    // Avoid optional-chaining with
                    // computed property syntax.

                    const datasetCount =
                      result.etl &&
                      result.etl.datasets
                        ? result.etl.datasets[
                            dataset
                          ] ?? 0
                        : 0;


                    return (

                      <div
                        key={dataset}
                        className="rounded-lg bg-slate-50 p-4"
                      >

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          {getDatasetLabel(
                            dataset
                          )}
                        </p>


                        <p className="mt-2 text-xl font-bold text-slate-800">
                          {datasetCount}
                        </p>


                        <p className="text-xs text-slate-400">
                          records
                        </p>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          )}


          {/* =================================================
              DATA QUALITY
          ================================================= */}

          {result.etl.quality_errors !==
            undefined && (

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-slate-700">
                    Data Quality Issues
                  </p>


                  <p className="mt-1 text-xs text-slate-400">
                    Validation errors captured during the ETL run
                  </p>

                </div>


                <div
                  className={`rounded-lg px-4 py-2 text-lg font-bold ${
                    result.etl.quality_errors >
                    0
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >

                  {
                    result.etl
                      .quality_errors
                  }

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              UPLOAD ID
          ================================================= */}

          {result.upload_id && (

            <div className="mt-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Upload ID
                  </p>


                  <p className="mt-1 font-mono text-sm text-slate-700">
                    {result.upload_id}
                  </p>

                </div>


                <CheckCircle
                  size={20}
                  className="text-green-500"
                />

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  );
}