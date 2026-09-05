from datetime import datetime

from etl.extract.api_client import fetch_incidents
from etl.validate.validators import validate_incidents
from etl.transform.transformers import transform_incidents
from etl.load.postgres_loader import load_incidents

from backend.app.database.connection import engine

from sqlalchemy import text
import pandas as pd


def start_etl_run():
    """
    Create a monitoring record for the incident ETL run.
    """

    query = text("""
        INSERT INTO monitoring.etl_runs (
            pipeline_name,
            started_at,
            status
        )
        VALUES (
            :pipeline_name,
            :started_at,
            :status
        )
        RETURNING run_id
    """)

    with engine.begin() as connection:

        result = connection.execute(
            query,
            {
                "pipeline_name": "incident_api_pipeline",
                "started_at": datetime.now(),
                "status": "RUNNING"
            }
        )

        return result.scalar()


def finish_etl_run(
    run_id,
    status,
    extracted,
    valid,
    rejected,
    loaded,
    error_message=None
):
    """
    Update monitoring record after the pipeline finishes.
    """

    query = text("""
        UPDATE monitoring.etl_runs
        SET
            completed_at = :completed_at,
            status = :status,
            records_extracted = :records_extracted,
            records_valid = :records_valid,
            records_rejected = :records_rejected,
            records_loaded = :records_loaded,
            error_message = :error_message
        WHERE run_id = :run_id
    """)

    with engine.begin() as connection:

        connection.execute(
            query,
            {
                "run_id": run_id,
                "completed_at": datetime.now(),
                "status": status,
                "records_extracted": extracted,
                "records_valid": valid,
                "records_rejected": rejected,
                "records_loaded": loaded,
                "error_message": error_message
            }
        )


def save_quality_errors(run_id, errors):
    """
    Save validation errors into the monitoring table.
    """

    if not errors:
        return

    query = text("""
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
        )
    """)

    with engine.begin() as connection:

        for error in errors:

            connection.execute(
                query,
                {
                    "run_id": run_id,
                    "source": error["source"],
                    "record_id": error["record_id"],
                    "table_name": error["table_name"],
                    "error_type": error["error_type"],
                    "error_message": error["error_message"]
                }
            )


def run_incident_pipeline():

    print("=" * 60)
    print("INCIDENT API ETL PIPELINE")
    print("=" * 60)

    run_id = start_etl_run()

    print(f"Run ID: {run_id}")

    try:

        # -------------------------------------------------
        # 1. EXTRACT
        # -------------------------------------------------

        incidents = fetch_incidents()

        extracted = len(incidents)

        print(f"Extracted: {extracted}")

        # -------------------------------------------------
        # 2. VALIDATE
        # -------------------------------------------------

        shipments = pd.read_sql(
            "SELECT shipment_id FROM core.shipments",
            engine
        )

        errors = validate_incidents(
            incidents,
            shipments
        )

        invalid_ids = {
            error["record_id"]
            for error in errors
        }

        valid_incidents = [
            incident
            for incident in incidents
            if incident.get("incident_id") not in invalid_ids
        ]

        valid = len(valid_incidents)
        rejected = extracted - valid

        print(f"Valid: {valid}")
        print(f"Rejected: {rejected}")

        # -------------------------------------------------
        # 3. SAVE QUALITY ERRORS
        # -------------------------------------------------

        save_quality_errors(
            run_id,
            errors
        )

        # -------------------------------------------------
        # 4. TRANSFORM
        # -------------------------------------------------

        transformed = transform_incidents(
            valid_incidents
        )

        # -------------------------------------------------
        # 5. LOAD
        # -------------------------------------------------

        # Remove incidents from this API source before reload.
        with engine.begin() as connection:

            connection.execute(
                text("""
                    DELETE FROM core.incidents
                    WHERE incident_id IN (
                        SELECT incident_id
                        FROM staging.stg_incidents
                    )
                """)
            )

        loaded = load_incidents(
            transformed
        )

        print(f"Loaded: {loaded}")

        # -------------------------------------------------
        # 6. FINISH MONITORING
        # -------------------------------------------------

        finish_etl_run(
            run_id=run_id,
            status="SUCCESS",
            extracted=extracted,
            valid=valid,
            rejected=rejected,
            loaded=loaded
        )

        print("=" * 60)
        print("PIPELINE COMPLETED SUCCESSFULLY")
        print("=" * 60)

    except Exception as e:

        finish_etl_run(
            run_id=run_id,
            status="FAILED",
            extracted=0,
            valid=0,
            rejected=0,
            loaded=0,
            error_message=str(e)
        )

        print("=" * 60)
        print("PIPELINE FAILED")
        print("=" * 60)

        raise


if __name__ == "__main__":
    run_incident_pipeline()