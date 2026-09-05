from etl.extract.api_client import fetch_incidents
from etl.validate.validators import validate_incidents

import pandas as pd


# Fetch incidents from REST API
incidents = fetch_incidents()


# Read cleaned/core shipment data directly from PostgreSQL
from backend.app.database.connection import engine

shipments = pd.read_sql(
    "SELECT shipment_id FROM core.shipments",
    engine
)


# Validate incidents
errors = validate_incidents(
    incidents,
    shipments
)


print(f"Incidents fetched: {len(incidents)}")
print(f"Validation errors: {len(errors)}")


for error in errors:
    print(error)