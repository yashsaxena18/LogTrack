from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db


router = APIRouter(
    prefix="/api/shipments",
    tags=["Shipments"]
)


@router.get("/")
def get_shipments(
    status: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = """
        SELECT
            s.shipment_id,
            s.order_id,
            s.shipment_date,
            s.expected_delivery,
            s.actual_delivery,
            s.status,
            s.destination_city,

            w.warehouse_name,
            w.city AS warehouse_city,

            v.vehicle_number,
            v.vehicle_type,

            d.name AS driver_name

        FROM core.shipments s

        LEFT JOIN core.warehouses w
            ON s.warehouse_id = w.warehouse_id

        LEFT JOIN core.vehicles v
            ON s.vehicle_id = v.vehicle_id

        LEFT JOIN core.drivers d
            ON s.driver_id = d.driver_id
    """

    params = {}

    if status:
        query += """
            WHERE s.status = :status
        """
        params["status"] = status

    query += """
        ORDER BY s.shipment_date DESC
    """

    result = db.execute(
        text(query),
        params
    )

    return result.mappings().all()


@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: str,
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            s.shipment_id,
            s.order_id,
            s.warehouse_id,
            s.vehicle_id,
            s.driver_id,
            s.shipment_date,
            s.expected_delivery,
            s.actual_delivery,
            s.status,
            s.destination_city,

            w.warehouse_name,
            w.city AS warehouse_city,

            v.vehicle_number,
            v.vehicle_type,

            d.name AS driver_name,
            d.phone AS driver_phone

        FROM core.shipments s

        LEFT JOIN core.warehouses w
            ON s.warehouse_id = w.warehouse_id

        LEFT JOIN core.vehicles v
            ON s.vehicle_id = v.vehicle_id

        LEFT JOIN core.drivers d
            ON s.driver_id = d.driver_id

        WHERE s.shipment_id = :shipment_id
    """)

    result = db.execute(
        query,
        {"shipment_id": shipment_id}
    )

    shipment = result.mappings().first()

    if not shipment:
        return {
            "message": "Shipment not found"
        }

    return shipment