from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db


router = APIRouter(
    prefix="/api/drivers",
    tags=["Drivers"]
)


@router.get("/")
def get_drivers(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            d.driver_id,
            d.name,
            d.phone,
            d.experience_years,
            d.status,
            d.joining_date,
            COUNT(s.shipment_id) AS total_shipments

        FROM core.drivers d

        LEFT JOIN core.shipments s
            ON d.driver_id = s.driver_id

        GROUP BY
            d.driver_id,
            d.name,
            d.phone,
            d.experience_years,
            d.status,
            d.joining_date

        ORDER BY d.driver_id
    """)

    result = db.execute(query)

    return result.mappings().all()


@router.get("/{driver_id}")
def get_driver(
    driver_id: str,
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            d.driver_id,
            d.name,
            d.phone,
            d.experience_years,
            d.status,
            d.joining_date,
            COUNT(s.shipment_id) AS total_shipments

        FROM core.drivers d

        LEFT JOIN core.shipments s
            ON d.driver_id = s.driver_id

        WHERE d.driver_id = :driver_id

        GROUP BY
            d.driver_id,
            d.name,
            d.phone,
            d.experience_years,
            d.status,
            d.joining_date
    """)

    result = db.execute(
        query,
        {"driver_id": driver_id}
    )

    driver = result.mappings().first()

    if not driver:
        return {
            "message": "Driver not found"
        }

    return driver