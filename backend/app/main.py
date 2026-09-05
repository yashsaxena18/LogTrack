from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.shipments import router as shipments_router
from backend.app.api.orders import router as orders_router
from backend.app.api.vehicles import router as vehicles_router
from backend.app.api.drivers import router as drivers_router
from backend.app.api.warehouses import router as warehouses_router
from backend.app.api.incidents import router as incidents_router
from backend.app.api.mock_incident_source import router as mock_incident_router
from backend.app.api.pipeline import router as pipeline_router
from backend.app.api.upload import router as upload_router


app = FastAPI(
    title="LogiTrack API",
    description="Logistics Data Engineering Platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(analytics_router)
app.include_router(shipments_router)
app.include_router(orders_router)
app.include_router(vehicles_router)
app.include_router(drivers_router)
app.include_router(warehouses_router)
app.include_router(incidents_router)
app.include_router(mock_incident_router)
app.include_router(pipeline_router)
app.include_router(upload_router)


@app.get("/")
def root():
    return {
        "message": "LogiTrack API is running"
    }