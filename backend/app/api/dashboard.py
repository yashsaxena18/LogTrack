from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.database.connection import get_db

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

@router.get("/kpis")

def get_kpis(db:Session = Depends(get_db)):
    
    query = text(""" SELECT * FROM analytics.dashboard_kpis """)
    result = db.execute(query)
    row=result.mappings().first()
    return row