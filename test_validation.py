from etl.extract.csv_reader import load_all_csv_files

from etl.validate.validators import (
    find_duplicate_ids,
    find_missing_values,
    find_invalid_dates,
    find_negative_values,
    find_invalid_statuses,
    find_invalid_foreign_keys,
    find_invalid_delivery_dates,
    validate_orders,
    validate_shipments
)


# ============================================================
# LOAD DATA
# ============================================================

data = load_all_csv_files()

customers = data["customers"]
warehouses = data["warehouses"]
drivers = data["drivers"]
vehicles = data["vehicles"]
orders = data["orders"]
shipments = data["shipments"]


# ============================================================
# INDIVIDUAL ORDER VALIDATIONS
# ============================================================

duplicates = find_duplicate_ids(
    orders,
    "order_id"
)

print("Duplicate orders:")
print(duplicates)


missing_orders = find_missing_values(
    orders,
    [
        "order_id",
        "customer_id",
        "order_date"
    ]
)

print("\nOrders with missing required values:")
print(missing_orders)


invalid_dates = find_invalid_dates(
    orders,
    "order_date"
)

print("\nOrders with invalid dates:")
print(invalid_dates)


negative_orders = find_negative_values(
    orders,
    "order_amount"
)

print("\nOrders with negative amounts:")
print(negative_orders)


valid_order_statuses = [
    "pending",
    "confirmed",
    "shipped",
    "in_transit",
    "delayed",
    "delivered",
    "cancelled",
    "failed"
]

invalid_statuses = find_invalid_statuses(
    orders,
    "order_status",
    valid_order_statuses
)

print("\nOrders with invalid statuses:")
print(invalid_statuses)


invalid_customer_ids = find_invalid_foreign_keys(
    orders,
    "customer_id",
    customers,
    "customer_id"
)

print("\nOrders with invalid customer IDs:")
print(invalid_customer_ids)


# ============================================================
# INDIVIDUAL SHIPMENT VALIDATIONS
# ============================================================

invalid_shipment_orders = find_invalid_foreign_keys(
    shipments,
    "order_id",
    orders,
    "order_id"
)

print("\nShipments with invalid order IDs:")
print(invalid_shipment_orders)


invalid_shipment_warehouses = find_invalid_foreign_keys(
    shipments,
    "warehouse_id",
    warehouses,
    "warehouse_id"
)

print("\nShipments with invalid warehouse IDs:")
print(invalid_shipment_warehouses)


invalid_shipment_vehicles = find_invalid_foreign_keys(
    shipments,
    "vehicle_id",
    vehicles,
    "vehicle_id"
)

print("\nShipments with invalid vehicle IDs:")
print(invalid_shipment_vehicles)


invalid_shipment_drivers = find_invalid_foreign_keys(
    shipments,
    "driver_id",
    drivers,
    "driver_id"
)

print("\nShipments with invalid driver IDs:")
print(invalid_shipment_drivers)


invalid_delivery_dates = find_invalid_delivery_dates(
    shipments
)

print("\nShipments with invalid delivery dates:")
print(invalid_delivery_dates)


# ============================================================
# CENTRALIZED ORDER VALIDATION
# ============================================================

order_errors = validate_orders(
    orders,
    customers
)

print("\n")
print("=" * 60)
print("CENTRALIZED ORDER VALIDATION")
print("=" * 60)

print(f"Total order validation errors: {len(order_errors)}")

for error in order_errors:
    print(error)


# ============================================================
# CENTRALIZED SHIPMENT VALIDATION
# ============================================================

shipment_errors = validate_shipments(
    shipments,
    orders,
    warehouses,
    vehicles,
    drivers
)

print("\n")
print("=" * 60)
print("CENTRALIZED SHIPMENT VALIDATION")
print("=" * 60)

print(
    f"Total shipment validation errors: "
    f"{len(shipment_errors)}"
)

for error in shipment_errors:
    print(error)


# ============================================================
# TOTAL VALIDATION ERRORS
# ============================================================

all_errors = order_errors + shipment_errors

print("\n")
print("=" * 60)
print("FINAL VALIDATION SUMMARY")
print("=" * 60)

print(f"Order errors:     {len(order_errors)}")
print(f"Shipment errors:  {len(shipment_errors)}")
print(f"Total errors:     {len(all_errors)}")