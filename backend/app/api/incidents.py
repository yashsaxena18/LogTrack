from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"]
)


@router.get("/")
def get_incidents(
    severity: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = """
        SELECT
            i.incident_id,
            i.shipment_id,
            i.incident_type,
            i.severity,
            i.location,
            i.reported_at,
            i.resolved_at,
            i.status,
            s.destination_city,
            s.status AS shipment_status

        FROM core.incidents i

        LEFT JOIN core.shipments s
            ON i.shipment_id = s.shipment_id
    """

    params = {}

    if severity:
        query += """
            WHERE i.severity = :severity
        """
        params["severity"] = severity

    query += """
        ORDER BY i.reported_at DESC
    """

    result = db.execute(
        text(query),
        params
    )

    return result.mappings().all()


@router.get("/{incident_id}")
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            i.incident_id,
            i.shipment_id,
            i.incident_type,
            i.severity,
            i.location,
            i.reported_at,
            i.resolved_at,
            i.status,
            s.destination_city,
            s.status AS shipment_status

        FROM core.incidents i

        LEFT JOIN core.shipments s
            ON i.shipment_id = s.shipment_id

        WHERE i.incident_id = :incident_id
    """)

    result = db.execute(
        query,
        {"incident_id": incident_id}
    )

    incident = result.mappings().first()

    if not incident:
        return {
            "message": "Incident not found"
        }

    return incident