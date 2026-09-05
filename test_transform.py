from etl.extract.csv_reader import load_all_csv_files
from etl.transform.transformers import (
    transform_orders,
    transform_shipments
)


data = load_all_csv_files()

orders = data["orders"]
shipments = data["shipments"]


transformed_orders = transform_orders(
    orders
)

transformed_shipments = transform_shipments(
    shipments
)


print("Original orders:", len(orders))
print("Transformed orders:", len(transformed_orders))

print("\nOriginal shipments:", len(shipments))
print("Transformed shipments:", len(transformed_shipments))


print("\nSample transformed orders:")
print(
    transformed_orders[
        [
            "order_id",
            "order_date",
            "order_amount",
            "order_status"
        ]
    ].head()
)


print("\nSample transformed shipments:")
print(
    transformed_shipments[
        [
            "shipment_id",
            "shipment_date",
            "actual_delivery",
            "status"
        ]
    ].head()
)