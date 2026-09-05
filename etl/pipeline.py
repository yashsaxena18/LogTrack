from etl.extract.csv_reader import load_all_csv_files

from etl.validate.validators import (
    validate_orders,
    validate_shipments
)

from etl.transform.transformers import (
    transform_orders,
    transform_shipments
)

from etl.load.postgres_loader import (
    load_dataframe,
    clear_core_tables
)

from etl.load.monitoring_loader import (
    start_etl_run,
    finish_etl_run,
    save_data_quality_errors
)


def run_pipeline():

    print("=" * 60)
    print("LOGITRACK ETL PIPELINE")
    print("=" * 60)


    # ========================================================
    # START MONITORING
    # ========================================================

    run_id = start_etl_run(
        "logitrack_pipeline"
    )


    try:

        # ====================================================
        # 1. EXTRACT
        # ====================================================

        print("\n[1] EXTRACT")

        data = load_all_csv_files()

        customers = data["customers"]
        warehouses = data["warehouses"]
        drivers = data["drivers"]
        vehicles = data["vehicles"]
        orders = data["orders"]
        shipments = data["shipments"]

        records_extracted = (
            len(customers)
            + len(warehouses)
            + len(drivers)
            + len(vehicles)
            + len(orders)
            + len(shipments)
        )

        print("Data extraction completed.")

        print(
            f"Customers: {len(customers)}"
        )

        print(
            f"Warehouses: {len(warehouses)}"
        )

        print(
            f"Drivers: {len(drivers)}"
        )

        print(
            f"Vehicles: {len(vehicles)}"
        )

        print(
            f"Orders: {len(orders)}"
        )

        print(
            f"Shipments: {len(shipments)}"
        )


        # ====================================================
        # 2. VALIDATE ORDERS
        # ====================================================

        print("\n[2] VALIDATE ORDERS")

        order_errors = validate_orders(
            orders,
            customers
        )

        print(
            f"Order errors: "
            f"{len(order_errors)}"
        )


        # ====================================================
        # 3. FILTER VALID ORDERS
        # ====================================================

        print("\n[3] FILTER VALID ORDERS")

        invalid_order_ids = {
            error["record_id"]
            for error in order_errors
        }

        valid_orders = orders[
            ~orders["order_id"].isin(
                invalid_order_ids
            )
        ].copy()

        print(
            f"Original orders: "
            f"{len(orders)}"
        )

        print(
            f"Invalid orders: "
            f"{len(invalid_order_ids)}"
        )

        print(
            f"Valid orders: "
            f"{len(valid_orders)}"
        )


        # ====================================================
        # 4. TRANSFORM ORDERS
        # ====================================================

        print("\n[4] TRANSFORM ORDERS")

        transformed_orders = transform_orders(
            valid_orders
        )

        print(
            f"Orders transformed: "
            f"{len(transformed_orders)}"
        )


        # ====================================================
        # 5. VALIDATE SHIPMENTS
        # ====================================================

        print("\n[5] VALIDATE SHIPMENTS")

        shipment_errors = validate_shipments(
            shipments,
            transformed_orders,
            warehouses,
            vehicles,
            drivers
        )

        print(
            f"Shipment errors: "
            f"{len(shipment_errors)}"
        )


        # ====================================================
        # 6. FILTER VALID SHIPMENTS
        # ====================================================

        print("\n[6] FILTER VALID SHIPMENTS")

        invalid_shipment_ids = {
            error["record_id"]
            for error in shipment_errors
        }

        valid_shipments = shipments[
            ~shipments["shipment_id"].isin(
                invalid_shipment_ids
            )
        ].copy()

        print(
            f"Original shipments: "
            f"{len(shipments)}"
        )

        print(
            f"Invalid shipments: "
            f"{len(invalid_shipment_ids)}"
        )

        print(
            f"Valid shipments: "
            f"{len(valid_shipments)}"
        )


        # ====================================================
        # 7. TRANSFORM SHIPMENTS
        # ====================================================

        print("\n[7] TRANSFORM SHIPMENTS")

        transformed_shipments = transform_shipments(
            valid_shipments
        )

        print(
            f"Shipments transformed: "
            f"{len(transformed_shipments)}"
        )


        # ====================================================
        # 8. COMBINE ERRORS
        # ====================================================

        all_errors = (
            order_errors
            + shipment_errors
        )

        records_rejected = len(all_errors)


        records_valid = (
            records_extracted
            - records_rejected
        )


        records_loaded = (
            len(customers)
            + len(warehouses)
            + len(drivers)
            + len(vehicles)
            + len(transformed_orders)
            + len(transformed_shipments)
        )


        # ====================================================
        # 9. SAVE DATA QUALITY ERRORS
        # ====================================================

        print("\n[8] SAVE DATA QUALITY ERRORS")

        save_data_quality_errors(
            run_id,
            all_errors
        )


        # ====================================================
        # 10. LOAD INTO POSTGRESQL
        # ====================================================

        print("\n[9] LOAD INTO POSTGRESQL")

        clear_core_tables()


        print("Loading customers...")

        load_dataframe(
            customers,
            "customers"
        )


        print("Loading warehouses...")

        load_dataframe(
            warehouses,
            "warehouses"
        )


        print("Loading drivers...")

        load_dataframe(
            drivers,
            "drivers"
        )


        print("Loading vehicles...")

        load_dataframe(
            vehicles,
            "vehicles"
        )


        print("Loading orders...")

        load_dataframe(
            transformed_orders,
            "orders"
        )


        print("Loading shipments...")

        load_dataframe(
            transformed_shipments,
            "shipments"
        )


        # ====================================================
        # 11. FINISH MONITORING
        # ====================================================

        finish_etl_run(
            run_id=run_id,
            status="SUCCESS",
            records_extracted=records_extracted,
            records_valid=records_valid,
            records_rejected=records_rejected,
            records_loaded=records_loaded
        )


        # ====================================================
        # 12. FINAL SUMMARY
        # ====================================================

        print("\n")
        print("=" * 60)
        print("ETL PIPELINE COMPLETED")
        print("=" * 60)

        print(
            f"Run ID: {run_id}"
        )

        print(
            f"Records extracted: "
            f"{records_extracted}"
        )

        print(
            f"Records valid: "
            f"{records_valid}"
        )

        print(
            f"Records rejected: "
            f"{records_rejected}"
        )

        print(
            f"Records loaded: "
            f"{records_loaded}"
        )

        print("=" * 60)


    except Exception as error:

        # ====================================================
        # PIPELINE FAILURE
        # ====================================================

        print("\n")
        print("=" * 60)
        print("ETL PIPELINE FAILED")
        print("=" * 60)

        print("Error:", error)


        finish_etl_run(
            run_id=run_id,
            status="FAILED",
            records_extracted=0,
            records_valid=0,
            records_rejected=0,
            records_loaded=0,
            error_message=str(error)
        )

        raise


if __name__ == "__main__":
    run_pipeline()