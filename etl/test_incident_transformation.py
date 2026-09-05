from etl.extract.api_client import fetch_incidents
from etl.transform.transformers import transform_incidents


incidents = fetch_incidents()

transformed = transform_incidents(incidents)


print("Raw records:", len(incidents))
print("Transformed records:", len(transformed))

print("\nData types:")
print(transformed.dtypes)

print("\nTransformed data:")
print(transformed)