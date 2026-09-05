from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/warehouses")

def get_warehouse_performance(db: Session = Depends(get_db)):
    query = text("""
        SELECT *
        FROM analytics.warehouse_performance
        ORDER BY total_shipments DESC
    """)

    result = db.execute(query)

    return result.mappings().all()



@router.get("/drivers")
def get_driver_performance(db: Session = Depends(get_db)):
    query = text("""
        SELECT *
        FROM analytics.driver_performance
        ORDER BY total_shipments DESC
    """)

    result = db.execute(query)

    return result.mappings().all()


@router.get("/vehicles")
def get_vehicle_utilization(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT *
        FROM analytics.vehicle_utilization
        ORDER BY total_shipments DESC
    """)

    result = db.execute(query)

    return result.mappings().all()




@router.get("/destinations")
def get_destination_performance(
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT *
        FROM analytics.destination_performance
        ORDER BY total_shipments DESC
    """)

    result = db.execute(query)

    return result.mappings().all()