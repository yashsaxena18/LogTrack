import pandas as pd

from etl.validate.validators import (
    validate_orders,
    validate_shipments,
)

from etl.transform.transformers import (
    transform_orders,
    transform_shipments,
)

from etl.load.postgres_loader import (
    load_dataframe,
    clear_core_tables,
)

from etl.load.monitoring_loader import (
    start_etl_run,
    finish_etl_run,
    save_data_quality_errors,
)


# =========================================================
# REQUIRED DATASETS
# =========================================================

REQUIRED_DATASETS = {
    "customers",
    "warehouses",
    "drivers",
    "vehicles",
    "orders",
    "shipments",
}


# =========================================================
# BASIC DATASET VALIDATION
# =========================================================

def validate_dataset_structure(data):
    """
    Make sure all six required datasets are present.
    """

    missing_datasets = (
        REQUIRED_DATASETS - set(data.keys())
    )

    if missing_datasets:
        raise ValueError(
            "Missing required datasets: "
            + ", ".join(sorted(missing_datasets))
        )


# =========================================================
# REMOVE DUPLICATE RECORDS
# =========================================================

def remove_duplicate_records(data):
    """
    Remove duplicate primary IDs from master datasets.

    Orders and shipments are handled by the main
    validation functions because they can produce
    detailed data-quality errors.
    """

    duplicate_info = []

    id_columns = {
        "customers": "customer_id",
        "warehouses": "warehouse_id",
        "drivers": "driver_id",
        "vehicles": "vehicle_id",
    }

    for dataset_name, id_column in id_columns.items():

        df = data[dataset_name].copy()

        duplicate_mask = df.duplicated(
            subset=[id_column],
            keep="first",
        )

        duplicate_rows = df[
            duplicate_mask
        ]

        if not duplicate_rows.empty:

            for _, row in duplicate_rows.iterrows():

                duplicate_info.append({
                    "source": f"{dataset_name}.csv",
                    "record_id": str(
                        row[id_column]
                    ),
                    "table_name": dataset_name,
                    "error_type": "DUPLICATE_ID",
                    "error_message": (
                        f"Duplicate {id_column}: "
                        f"{row[id_column]}"
                    ),
                })

        data[dataset_name] = df[
            ~duplicate_mask
        ].copy()

    return data, duplicate_info


# =========================================================
# VEHICLE VALIDATION
# =========================================================

def validate_vehicles(
    vehicles,
    drivers,
):
    """
    Validate vehicle records against uploaded drivers.
    """

    errors = []

    driver_ids = set(
        drivers["driver_id"]
        .astype(str)
        .str.strip()
    )

    for _, row in vehicles.iterrows():

        vehicle_id = str(
            row["vehicle_id"]
        ).strip()

        driver_id = str(
            row["driver_id"]
        ).strip()

        if driver_id not in driver_ids:

            errors.append({
                "source": "vehicles.csv",
                "record_id": vehicle_id,
                "table_name": "vehicles",
                "error_type": "INVALID_FOREIGN_KEY",
                "error_message": (
                    f"driver_id '{driver_id}' "
                    "does not exist in drivers."
                ),
            })

    return errors


# =========================================================
# FILTER INVALID RECORDS
# =========================================================

def filter_invalid_records(
    dataframe,
    errors,
    id_column,
):
    """
    Remove records that contain validation errors.
    """

    invalid_ids = {
        str(error["record_id"]).strip()
        for error in errors
    }

    if not invalid_ids:
        return dataframe.copy()

    return dataframe[
        ~dataframe[id_column]
        .astype(str)
        .str.strip()
        .isin(invalid_ids)
    ].copy()


# =========================================================
# MAIN UPLOAD PIPELINE
# =========================================================

def run_uploaded_pipeline(data):
    """
    Run the complete ETL pipeline using six uploaded CSV files.

    Expected datasets:

        customers
        warehouses
        drivers
        vehicles
        orders
        shipments

    Pipeline:

        Extract
           ↓
        Validate
           ↓
        Transform
           ↓
        Load
           ↓
        Monitoring
    """

    print("=" * 70)
    print("LOGITRACK USER UPLOAD ETL PIPELINE")
    print("=" * 70)

    # -----------------------------------------------------
    # START ETL RUN
    # -----------------------------------------------------

    run_id = start_etl_run(
        "logitrack_uploaded_pipeline"
    )

    try:

        # =================================================
        # 1. CHECK DATASETS
        # =================================================

        print("\n[1] CHECK UPLOADED DATASETS")

        validate_dataset_structure(data)

        customers = data["customers"].copy()
        warehouses = data["warehouses"].copy()
        drivers = data["drivers"].copy()
        vehicles = data["vehicles"].copy()
        orders = data["orders"].copy()
        shipments = data["shipments"].copy()

        print("✓ All six datasets received.")

        print(
            f"Customers:   {len(customers)}"
        )
        print(
            f"Warehouses:  {len(warehouses)}"
        )
        print(
            f"Drivers:     {len(drivers)}"
        )
        print(
            f"Vehicles:    {len(vehicles)}"
        )
        print(
            f"Orders:      {len(orders)}"
        )
        print(
            f"Shipments:   {len(shipments)}"
        )

        # =================================================
        # 2. EXTRACT METRICS
        # =================================================

        records_extracted = (
            len(customers)
            + len(warehouses)
            + len(drivers)
            + len(vehicles)
            + len(orders)
            + len(shipments)
        )

        # =================================================
        # 3. VALIDATE MASTER DATA
        # =================================================

        print("\n[2] VALIDATE MASTER DATA")

        data, master_errors = (
            remove_duplicate_records(data)
        )

        customers = data["customers"]
        warehouses = data["warehouses"]
        drivers = data["drivers"]
        vehicles = data["vehicles"]

        vehicle_errors = validate_vehicles(
            vehicles,
            drivers,
        )

        all_master_errors = (
            master_errors
            + vehicle_errors
        )

        print(
            f"Master-data errors: "
            f"{len(all_master_errors)}"
        )

        # -------------------------------------------------
        # Remove invalid vehicles
        # -------------------------------------------------

        vehicles = filter_invalid_records(
            vehicles,
            vehicle_errors,
            "vehicle_id",
        )

        # =================================================
        # 4. VALIDATE ORDERS
        # =================================================

        print("\n[3] VALIDATE ORDERS")

        order_errors = validate_orders(
            orders,
            customers,
        )

        print(
            f"Order errors: "
            f"{len(order_errors)}"
        )

        # -------------------------------------------------
        # Filter invalid orders
        # -------------------------------------------------

        valid_orders = filter_invalid_records(
            orders,
            order_errors,
            "order_id",
        )

        print(
            f"Original orders: "
            f"{len(orders)}"
        )

        print(
            f"Valid orders: "
            f"{len(valid_orders)}"
        )

        # =================================================
        # 5. TRANSFORM ORDERS
        # =================================================

        print("\n[4] TRANSFORM ORDERS")

        transformed_orders = (
            transform_orders(
                valid_orders
            )
        )

        print(
            f"Orders transformed: "
            f"{len(transformed_orders)}"
        )

        # =================================================
        # 6. VALIDATE SHIPMENTS
        # =================================================

        print("\n[5] VALIDATE SHIPMENTS")

        shipment_errors = validate_shipments(
            shipments,
            transformed_orders,
            warehouses,
            vehicles,
            drivers,
        )

        print(
            f"Shipment errors: "
            f"{len(shipment_errors)}"
        )

        # -------------------------------------------------
        # Filter invalid shipments
        # -------------------------------------------------

        valid_shipments = filter_invalid_records(
            shipments,
            shipment_errors,
            "shipment_id",
        )

        print(
            f"Original shipments: "
            f"{len(shipments)}"
        )

        print(
            f"Valid shipments: "
            f"{len(valid_shipments)}"
        )

        # =================================================
        # 7. TRANSFORM SHIPMENTS
        # =================================================

        print("\n[6] TRANSFORM SHIPMENTS")

        transformed_shipments = (
            transform_shipments(
                valid_shipments
            )
        )

        print(
            f"Shipments transformed: "
            f"{len(transformed_shipments)}"
        )

        # =================================================
        # 8. COMBINE DATA QUALITY ERRORS
        # =================================================

        all_errors = (
            all_master_errors
            + order_errors
            + shipment_errors
        )

        # Count rejected records by unique
        # table + record combination
        rejected_records = {
            (
                error["table_name"],
                str(error["record_id"]),
            )
            for error in all_errors
        }

        records_rejected = len(
            rejected_records
        )

        records_valid = (
            records_extracted
            - records_rejected
        )

        # =================================================
        # 9. SAVE QUALITY ERRORS
        # =================================================

        print(
            "\n[7] SAVE DATA QUALITY ERRORS"
        )

        save_data_quality_errors(
            run_id,
            all_errors,
        )

        print(
            f"Quality errors saved: "
            f"{len(all_errors)}"
        )

        # =================================================
        # 10. CLEAR CORE TABLES
        # =================================================

        print(
            "\n[8] PREPARE POSTGRESQL"
        )

        print(
            "Clearing existing core tables..."
        )

        clear_core_tables()

        print(
            "✓ Core tables cleared."
        )

        # =================================================
        # 11. LOAD CUSTOMERS
        # =================================================

        print(
            "\n[9] LOAD CUSTOMERS"
        )

        load_dataframe(
            customers,
            "customers",
        )

        print(
            f"✓ Loaded {len(customers)} customers."
        )

        # =================================================
        # 12. LOAD WAREHOUSES
        # =================================================

        print(
            "\n[10] LOAD WAREHOUSES"
        )

        load_dataframe(
            warehouses,
            "warehouses",
        )

        print(
            f"✓ Loaded {len(warehouses)} warehouses."
        )

        # =================================================
        # 13. LOAD DRIVERS
        # =================================================

        print(
            "\n[11] LOAD DRIVERS"
        )

        load_dataframe(
            drivers,
            "drivers",
        )

        print(
            f"✓ Loaded {len(drivers)} drivers."
        )

        # =================================================
        # 14. LOAD VEHICLES
        # =================================================

        print(
            "\n[12] LOAD VEHICLES"
        )

        load_dataframe(
            vehicles,
            "vehicles",
        )

        print(
            f"✓ Loaded {len(vehicles)} vehicles."
        )

        # =================================================
        # 15. LOAD ORDERS
        # =================================================

        print(
            "\n[13] LOAD ORDERS"
        )

        load_dataframe(
            transformed_orders,
            "orders",
        )

        print(
            f"✓ Loaded "
            f"{len(transformed_orders)} orders."
        )

        # =================================================
        # 16. LOAD SHIPMENTS
        # =================================================

        print(
            "\n[14] LOAD SHIPMENTS"
        )

        load_dataframe(
            transformed_shipments,
            "shipments",
        )

        print(
            f"✓ Loaded "
            f"{len(transformed_shipments)} shipments."
        )

        # =================================================
        # 17. CALCULATE LOADED RECORDS
        # =================================================

        records_loaded = (
            len(customers)
            + len(warehouses)
            + len(drivers)
            + len(vehicles)
            + len(transformed_orders)
            + len(transformed_shipments)
        )

        # =================================================
        # 18. FINISH ETL RUN
        # =================================================

        finish_etl_run(
            run_id=run_id,
            status="SUCCESS",
            records_extracted=records_extracted,
            records_valid=records_valid,
            records_rejected=records_rejected,
            records_loaded=records_loaded,
        )

        # =================================================
        # 19. FINAL RESULT
        # =================================================

        print("\n")
        print("=" * 70)
        print("USER UPLOAD ETL PIPELINE COMPLETED")
        print("=" * 70)

        print(
            f"Run ID:              {run_id}"
        )

        print(
            f"Records extracted:   {records_extracted}"
        )

        print(
            f"Records valid:       {records_valid}"
        )

        print(
            f"Records rejected:    {records_rejected}"
        )

        print(
            f"Records loaded:      {records_loaded}"
        )

        print("=" * 70)

        return {
            "run_id": run_id,
            "status": "SUCCESS",
            "records_extracted": records_extracted,
            "records_valid": records_valid,
            "records_rejected": records_rejected,
            "records_loaded": records_loaded,
            "quality_errors": len(all_errors),
            "datasets": {
                "customers": len(customers),
                "warehouses": len(warehouses),
                "drivers": len(drivers),
                "vehicles": len(vehicles),
                "orders": len(transformed_orders),
                "shipments": len(transformed_shipments),
            },
        }

    # =====================================================
    # PIPELINE FAILURE
    # =====================================================

    except Exception as error:

        print("\n")
        print("=" * 70)
        print("USER UPLOAD ETL PIPELINE FAILED")
        print("=" * 70)

        print(
            f"Error: {error}"
        )

        try:

            finish_etl_run(
                run_id=run_id,
                status="FAILED",
                records_extracted=0,
                records_valid=0,
                records_rejected=0,
                records_loaded=0,
                error_message=str(error),
            )

        except Exception as monitoring_error:

            print(
                "Failed to update ETL monitoring:",
                monitoring_error,
            )

        raise