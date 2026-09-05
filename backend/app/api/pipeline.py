from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db

from etl.pipeline import run_pipeline
from etl.incident_pipeline import run_incident_pipeline


router = APIRouter(
    prefix="/api/pipeline",
    tags=["Pipeline Monitoring"]
)


# =========================================================
# GET ETL RUNS
# =========================================================

@router.get("/runs")
def get_etl_runs(
    db: Session = Depends(get_db),
):
    query = text("""
        SELECT
            run_id,
            pipeline_name,
            started_at,
            completed_at,
            status,
            records_extracted,
            records_valid,
            records_rejected,
            records_loaded,
            error_message
        FROM monitoring.etl_runs
        ORDER BY run_id DESC
    """)

    result = db.execute(query)

    return result.mappings().all()


# =========================================================
# GET DATA QUALITY ERRORS
# =========================================================

@router.get("/errors")
def get_data_quality_errors(
    db: Session = Depends(get_db),
):
    query = text("""
        SELECT
            error_id,
            run_id,
            source,
            record_id,
            table_name,
            error_type,
            error_message,
            created_at
        FROM monitoring.data_quality_errors
        ORDER BY error_id DESC
    """)

    result = db.execute(query)

    return result.mappings().all()


# =========================================================
# RUN MAIN ETL PIPELINE
# =========================================================

@router.post("/run")
def trigger_pipeline(
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(run_pipeline)

    return {
        "message": "Main ETL pipeline started successfully."
    }


# =========================================================
# RUN INCIDENT ETL PIPELINE
# =========================================================

@router.post("/run-incidents")
def trigger_incident_pipeline(
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(run_incident_pipeline)

    return {
        "message": "Incident ETL pipeline started successfully."
    }