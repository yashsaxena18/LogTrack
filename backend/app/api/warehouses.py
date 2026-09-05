from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db


router = APIRouter(
    prefix="/api/warehouses",
    tags=["Warehouses"]
)


@router.get("/")
def get_warehouses(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            w.warehouse_id,
            w.warehouse_name,
            w.city,
            w.state,
            w.capacity,
            w.status,
            COUNT(s.shipment_id) AS total_shipments

        FROM core.warehouses w

        LEFT JOIN core.shipments s
            ON w.warehouse_id = s.warehouse_id

        GROUP BY
            w.warehouse_id,
            w.warehouse_name,
            w.city,
            w.state,
            w.capacity,
            w.status

        ORDER BY w.warehouse_id
    """)

    result = db.execute(query)

    return result.mappings().all()


@router.get("/{warehouse_id}")
def get_warehouse(
    warehouse_id: str,
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            w.warehouse_id,
            w.warehouse_name,
            w.city,
            w.state,
            w.capacity,
            w.status,
            COUNT(s.shipment_id) AS total_shipments

        FROM core.warehouses w

        LEFT JOIN core.shipments s
            ON w.warehouse_id = s.warehouse_id

        WHERE w.warehouse_id = :warehouse_id

        GROUP BY
            w.warehouse_id,
            w.warehouse_name,
            w.city,
            w.state,
            w.capacity,
            w.status
    """)

    result = db.execute(
        query,
        {"warehouse_id": warehouse_id}
    )

    warehouse = result.mappings().first()

    if not warehouse:
        return {
            "message": "Warehouse not found"
        }

    return warehouse