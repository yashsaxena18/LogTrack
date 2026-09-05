from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db


router = APIRouter(
    prefix="/api/vehicles",
    tags=["Vehicles"]
)


@router.get("/")
def get_vehicles(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            v.vehicle_id,
            v.vehicle_number,
            v.vehicle_type,
            v.driver_id,
            d.name AS driver_name,
            v.status,
            v.fuel_level,
            v.last_service_date

        FROM core.vehicles v

        LEFT JOIN core.drivers d
            ON v.driver_id = d.driver_id

        ORDER BY v.vehicle_id
    """)

    result = db.execute(query)

    return result.mappings().all()


@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            v.vehicle_id,
            v.vehicle_number,
            v.vehicle_type,
            v.driver_id,
            d.name AS driver_name,
            d.phone AS driver_phone,
            v.status,
            v.fuel_level,
            v.last_service_date

        FROM core.vehicles v

        LEFT JOIN core.drivers d
            ON v.driver_id = d.driver_id

        WHERE v.vehicle_id = :vehicle_id
    """)

    result = db.execute(
        query,
        {"vehicle_id": vehicle_id}
    )

    vehicle = result.mappings().first()

    if not vehicle:
        return {
            "message": "Vehicle not found"
        }

    return vehicle