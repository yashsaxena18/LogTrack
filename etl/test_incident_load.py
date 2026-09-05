from etl.extract.api_client import fetch_incidents
from etl.transform.transformers import transform_incidents
from etl.load.postgres_loader import load_incidents


# Extract
incidents = fetch_incidents()

# Transform
transformed = transform_incidents(incidents)

# Load
loaded = load_incidents(transformed)

print(f"Loaded {loaded} incidents into PostgreSQL.")