from fastapi import APIRouter


router = APIRouter(
    prefix="/mock-api",
    tags=["Mock External API"]
)


@router.get("/incidents")
def get_external_incidents():
    return [
        {
            "incident_id": "I0001",
            "shipment_id": "S0001",
            "incident_type": "Vehicle Breakdown",
            "severity": "high",
            "location": "Delhi",
            "reported_at": "2026-08-25 10:30:00",
            "resolved_at": "2026-08-25 14:30:00",
            "status": "resolved"
        },
        {
            "incident_id": "I0002",
            "shipment_id": "S0002",
            "incident_type": "Traffic Delay",
            "severity": "medium",
            "location": "Mumbai",
            "reported_at": "2026-08-26 09:15:00",
            "resolved_at": "2026-08-26 12:00:00",
            "status": "resolved"
        },
        {
            "incident_id": "I0003",
            "shipment_id": "S0003",
            "incident_type": "Package Damage",
            "severity": "high",
            "location": "Bangalore",
            "reported_at": "2026-08-27 16:45:00",
            "resolved_at": None,
            "status": "open"
        },
        {
            "incident_id": "I0004",
            "shipment_id": "S0004",
            "incident_type": "Wrong Address",
            "severity": "low",
            "location": "Pune",
            "reported_at": "2026-08-28 11:20:00",
            "resolved_at": "2026-08-28 15:00:00",
            "status": "resolved"
        },
        {
            "incident_id": "I0005",
            "shipment_id": "S0005",
            "incident_type": "Vehicle Breakdown",
            "severity": "critical",
            "location": "Hyderabad",
            "reported_at": "2026-08-29 08:00:00",
            "resolved_at": None,
            "status": "open"
        }
    ]