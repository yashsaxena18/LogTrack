from datetime import datetime

from etl.load.postgres_loader import engine
from sqlalchemy import text


# ============================================================
# START ETL RUN
# ============================================================

def start_etl_run(
    pipeline_name="logitrack_pipeline"
):
    """
    Create a new ETL run in monitoring.etl_runs.

    Returns:
        run_id of the newly created ETL run.
    """

    try:

        with engine.begin() as connection:

            result = connection.execute(
                text(
                    """
                    INSERT INTO monitoring.etl_runs (
                        pipeline_name,
                        started_at,
                        status,
                        records_extracted,
                        records_valid,
                        records_rejected,
                        records_loaded
                    )
                    VALUES (
                        :pipeline_name,
                        :started_at,
                        :status,
                        0,
                        0,
                        0,
                        0
                    )
                    RETURNING run_id;
                    """
                ),
                {
                    "pipeline_name": pipeline_name,
                    "started_at": datetime.now(),
                    "status": "RUNNING"
                }
            )

            run_id = result.scalar()

        print(
            f"ETL run started. Run ID: {run_id}"
        )

        return run_id

    except Exception as error:

        print("Failed to start ETL run.")
        print("Error:", error)

        raise


# ============================================================
# UPDATE ETL RUN
# ============================================================

def finish_etl_run(
    run_id,
    status,
    records_extracted,
    records_valid,
    records_rejected,
    records_loaded,
    error_message=None
):
    """
    Update an ETL run after pipeline completion.
    """

    try:

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    UPDATE monitoring.etl_runs
                    SET
                        completed_at = :completed_at,
                        status = :status,
                        records_extracted = :records_extracted,
                        records_valid = :records_valid,
                        records_rejected = :records_rejected,
                        records_loaded = :records_loaded,
                        error_message = :error_message
                    WHERE run_id = :run_id;
                    """
                ),
                {
                    "run_id": run_id,
                    "completed_at": datetime.now(),
                    "status": status,
                    "records_extracted": records_extracted,
                    "records_valid": records_valid,
                    "records_rejected": records_rejected,
                    "records_loaded": records_loaded,
                    "error_message": error_message
                }
            )

        print(
            f"ETL run {run_id} updated: {status}"
        )

    except Exception as error:

        print("Failed to update ETL run.")
        print("Error:", error)

        raise


# ============================================================
# SAVE DATA QUALITY ERRORS
# ============================================================

def save_data_quality_errors(
    run_id,
    errors
):
    """
    Save validation errors into
    monitoring.data_quality_errors.
    """

    if not errors:

        print("No data quality errors to save.")

        return 0


    saved_count = 0


    try:

        with engine.begin() as connection:

            for error in errors:

                connection.execute(
                    text(
                        """
                        INSERT INTO monitoring.data_quality_errors (
                            run_id,
                            source,
                            record_id,
                            table_name,
                            error_type,
                            error_message
                        )
                        VALUES (
                            :run_id,
                            :source,
                            :record_id,
                            :table_name,
                            :error_type,
                            :error_message
                        );
                        """
                    ),
                    {
                        "run_id": run_id,
                        "source": error.get(
                            "source"
                        ),
                        "record_id": error.get(
                            "record_id"
                        ),
                        "table_name": error.get(
                            "table_name"
                        ),
                        "error_type": error.get(
                            "error_type"
                        ),
                        "error_message": error.get(
                            "error_message"
                        )
                    }
                )

                saved_count += 1


        print(
            f"Saved {saved_count} data quality errors."
        )

        return saved_count


    except Exception as error:

        print(
            "Failed to save data quality errors."
        )

        print("Error:", error)

        raise