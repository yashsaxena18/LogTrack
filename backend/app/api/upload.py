from pathlib import Path
from typing import List
from uuid import uuid4
import io

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from etl.user_upload_pipeline import run_uploaded_pipeline


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/upload",
    tags=["CSV Upload"],
)


# =========================================================
# CONFIGURATION
# =========================================================

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# DATASET TYPES
# =========================================================

DATASET_TYPES = [
    "customers",
    "warehouses",
    "drivers",
    "vehicles",
    "orders",
    "shipments",
]


# =========================================================
# EXPECTED CSV COLUMNS
# =========================================================

REQUIRED_COLUMNS = {

    "customers": {
        "customer_id",
        "name",
        "email",
        "phone",
        "city",
        "state",
        "country",
        "created_at",
    },

    "warehouses": {
        "warehouse_id",
        "warehouse_name",
        "city",
        "state",
        "capacity",
        "status",
    },

    "drivers": {
        "driver_id",
        "name",
        "phone",
        "experience_years",
        "status",
        "joining_date",
    },

    "vehicles": {
        "vehicle_id",
        "vehicle_number",
        "vehicle_type",
        "driver_id",
        "status",
        "fuel_level",
        "last_service_date",
    },

    "orders": {
        "order_id",
        "customer_id",
        "order_date",
        "order_amount",
        "payment_status",
        "order_status",
    },

    "shipments": {
        "shipment_id",
        "order_id",
        "warehouse_id",
        "vehicle_id",
        "driver_id",
        "shipment_date",
        "expected_delivery",
        "actual_delivery",
        "status",
        "destination_city",
    },
}


# =========================================================
# DATASET DISPLAY ORDER
# =========================================================

DATASET_ORDER = [
    "customers",
    "warehouses",
    "drivers",
    "vehicles",
    "orders",
    "shipments",
]


# =========================================================
# IDENTIFY DATASET
# =========================================================

def identify_dataset(
    filename: str,
    dataframe: pd.DataFrame,
):
    """
    Identify which logistics dataset the uploaded CSV belongs to.

    The system supports filenames such as:

        customers.csv
        customers_small.csv
        customers_demo.csv
        my_customers.csv

    If the filename does not clearly identify the dataset,
    the CSV columns are used as a fallback.
    """

    # -----------------------------------------------------
    # Normalize filename
    # -----------------------------------------------------

    file_stem = Path(
        filename
    ).stem.lower()

    normalized_stem = (
        file_stem
        .replace("-", "_")
        .replace(" ", "_")
    )

    # -----------------------------------------------------
    # 1. Try filename-based detection
    # -----------------------------------------------------

    for dataset in DATASET_TYPES:

        if (
            normalized_stem == dataset
            or normalized_stem.startswith(
                f"{dataset}_"
            )
        ):
            return dataset

        # Also support names such as:
        # my_customers
        # demo_customers

        if (
            f"_{dataset}_" in
            f"_{normalized_stem}_"
        ):
            return dataset

    # -----------------------------------------------------
    # 2. Try column-based detection
    # -----------------------------------------------------

    actual_columns = set(
        dataframe.columns
    )

    matching_datasets = []

    for dataset in DATASET_TYPES:

        required_columns = (
            REQUIRED_COLUMNS[dataset]
        )

        if required_columns.issubset(
            actual_columns
        ):
            matching_datasets.append(
                dataset
            )

    # -----------------------------------------------------
    # Exactly one dataset matched
    # -----------------------------------------------------

    if len(matching_datasets) == 1:
        return matching_datasets[0]

    # -----------------------------------------------------
    # Could not identify dataset
    # -----------------------------------------------------

    return None


# =========================================================
# READ + VALIDATE CSV
# =========================================================

async def read_uploaded_csv(
    file: UploadFile,
    dataset_type: str,
):
    """
    Read uploaded CSV using Pandas and validate
    the required columns.
    """

    contents = await file.read()

    # -----------------------------------------------------
    # Empty file
    # -----------------------------------------------------

    if not contents:

        raise HTTPException(
            status_code=400,
            detail=(
                f"{file.filename} is empty."
            ),
        )

    # -----------------------------------------------------
    # Read CSV
    # -----------------------------------------------------

    try:

        dataframe = pd.read_csv(
            io.BytesIO(contents)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Unable to read "
                f"{file.filename}: {str(exc)}"
            ),
        )

    # -----------------------------------------------------
    # Validate columns
    # -----------------------------------------------------

    actual_columns = set(
        dataframe.columns
    )

    required_columns = (
        REQUIRED_COLUMNS[
            dataset_type
        ]
    )

    missing_columns = sorted(
        required_columns -
        actual_columns
    )

    extra_columns = sorted(
        actual_columns -
        required_columns
    )

    # -----------------------------------------------------
    # Missing columns
    # -----------------------------------------------------

    if missing_columns:

        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    f"{file.filename} is missing "
                    "required columns."
                ),
                "dataset_type": dataset_type,
                "missing_columns": missing_columns,
                "extra_columns": extra_columns,
            },
        )

    return (
        dataframe,
        contents,
        extra_columns,
    )


# =========================================================
# UPLOAD + RUN COMPLETE ETL
# =========================================================

@router.post("/run")
async def upload_and_run_etl(
    files: List[UploadFile] = File(...),
):
    """
    Upload all six logistics CSV files and run
    the complete ETL pipeline.

    Supported filenames include:

        customers.csv
        customers_small.csv

        warehouses.csv
        warehouses_small.csv

        drivers.csv
        drivers_small.csv

        vehicles.csv
        vehicles_small.csv

        orders.csv
        orders_small.csv

        shipments.csv
        shipments_small.csv
    """

    # =====================================================
    # 1. VALIDATE NUMBER OF FILES
    # =====================================================

    if len(files) != 6:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please upload exactly 6 CSV files: "
                "one Customers, one Warehouses, one Drivers, "
                "one Vehicles, one Orders and one Shipments file."
            ),
        )


    # =====================================================
    # 2. IDENTIFY UPLOADED DATASETS
    # =====================================================

    uploaded_datasets = {}

    # Store files temporarily in memory first
    prepared_files = []

    for file in files:

        # -------------------------------------------------
        # Filename check
        # -------------------------------------------------

        if not file.filename:

            raise HTTPException(
                status_code=400,
                detail=(
                    "One of the uploaded files "
                    "has no filename."
                ),
            )


        original_filename = Path(
            file.filename
        ).name


        # -------------------------------------------------
        # Extension check
        # -------------------------------------------------

        if not original_filename.lower().endswith(
            ".csv"
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    f"{original_filename} is not a CSV file. "
                    "Only CSV files are supported."
                ),
            )


        # -------------------------------------------------
        # Read file
        # -------------------------------------------------

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"{original_filename} is empty."
                ),
            )


        # -------------------------------------------------
        # Read with Pandas
        # -------------------------------------------------

        try:

            dataframe = pd.read_csv(
                io.BytesIO(contents)
            )

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unable to read "
                    f"{original_filename}: "
                    f"{str(exc)}"
                ),
            )


        # -------------------------------------------------
        # Identify dataset
        # -------------------------------------------------

        dataset_type = identify_dataset(
            original_filename,
            dataframe,
        )


        if dataset_type is None:

            raise HTTPException(
                status_code=400,
                detail={
                    "message": (
                        f"Could not identify the dataset "
                        f"from {original_filename}."
                    ),
                    "hint": (
                        "Use a filename such as "
                        "customers_small.csv, "
                        "orders_small.csv, etc., "
                        "or make sure the CSV contains "
                        "the correct required columns."
                    ),
                },
            )


        # -------------------------------------------------
        # Check duplicate dataset
        # -------------------------------------------------

        if dataset_type in uploaded_datasets:

            previous_file = (
                uploaded_datasets[
                    dataset_type
                ]["filename"]
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Multiple files detected for "
                    f"'{dataset_type}'. "
                    f"You uploaded both "
                    f"'{previous_file}' and "
                    f"'{original_filename}'. "
                    "Please upload only one file "
                    "for each dataset."
                ),
            )


        # -------------------------------------------------
        # Validate required columns
        # -------------------------------------------------

        actual_columns = set(
            dataframe.columns
        )

        required_columns = (
            REQUIRED_COLUMNS[
                dataset_type
            ]
        )

        missing_columns = sorted(
            required_columns -
            actual_columns
        )

        extra_columns = sorted(
            actual_columns -
            required_columns
        )


        if missing_columns:

            raise HTTPException(
                status_code=400,
                detail={
                    "message": (
                        f"{original_filename} is missing "
                        "required columns."
                    ),
                    "dataset_type": dataset_type,
                    "missing_columns": missing_columns,
                    "extra_columns": extra_columns,
                },
            )


        # -------------------------------------------------
        # Store prepared file
        # -------------------------------------------------

        prepared_files.append({
            "dataset_type": dataset_type,
            "filename": original_filename,
            "contents": contents,
            "dataframe": dataframe,
            "extra_columns": extra_columns,
        })


        uploaded_datasets[
            dataset_type
        ] = {
            "filename": original_filename,
        }


    # =====================================================
    # 3. CHECK ALL SIX DATASETS
    # =====================================================

    required_datasets = set(
        DATASET_TYPES
    )

    received_datasets = set(
        uploaded_datasets.keys()
    )

    missing_datasets = sorted(
        required_datasets -
        received_datasets
    )


    if missing_datasets:

        missing_files = [
            f"{dataset}.csv"
            for dataset in missing_datasets
        ]

        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    "Some required datasets are missing."
                ),
                "missing_datasets": missing_datasets,
                "expected_files": missing_files,
            },
        )


    # =====================================================
    # 4. CREATE UNIQUE UPLOAD DIRECTORY
    # =====================================================

    upload_id = uuid4().hex[:12]

    upload_path = (
        UPLOAD_DIR /
        upload_id
    )

    upload_path.mkdir(
        parents=True,
        exist_ok=True,
    )


    # =====================================================
    # 5. SAVE FILES + PREPARE DATA
    # =====================================================

    data = {}
    file_information = {}


    try:

        for item in prepared_files:

            dataset_type = (
                item["dataset_type"]
            )

            original_filename = (
                item["filename"]
            )

            dataframe = (
                item["dataframe"]
            )

            contents = (
                item["contents"]
            )

            extra_columns = (
                item["extra_columns"]
            )


            # ---------------------------------------------
            # Save uploaded file
            # ---------------------------------------------

            saved_path = (
                upload_path /
                original_filename
            )

            saved_path.write_bytes(
                contents
            )


            # ---------------------------------------------
            # Store dataframe
            # ---------------------------------------------

            data[
                dataset_type
            ] = dataframe


            # ---------------------------------------------
            # File information
            # ---------------------------------------------

            file_information[
                dataset_type
            ] = {
                "filename": original_filename,
                "rows": len(dataframe),
                "columns": list(
                    dataframe.columns
                ),
                "extra_columns": extra_columns,
                "saved_file": str(
                    saved_path
                ),
            }


    except Exception as exc:

        # -----------------------------------------------
        # Cleanup if saving fails
        # -----------------------------------------------

        if upload_path.exists():

            for path in upload_path.iterdir():

                if path.is_file():
                    path.unlink()

            upload_path.rmdir()


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed while saving uploaded files: "
                f"{str(exc)}"
            ),
        )


    # =====================================================
    # 6. RUN ETL PIPELINE
    # =====================================================

    try:

        result = run_uploaded_pipeline(
            data
        )


    except Exception as exc:

        return {
            "status": "FAILED",
            "message": (
                "The CSV files were uploaded, "
                "but the ETL pipeline failed."
            ),
            "upload_id": upload_id,
            "files": file_information,
            "error": str(exc),
        }


    # =====================================================
    # 7. SUCCESS RESPONSE
    # =====================================================

    return {

        "status": "SUCCESS",

        "message": (
            "All six CSV files were uploaded "
            "and processed successfully "
            "through the ETL pipeline."
        ),

        "upload_id": upload_id,

        "files": file_information,

        "etl": result,
    }