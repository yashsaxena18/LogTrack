import pandas as pd


# ============================================================
# BASIC VALIDATION FUNCTIONS
# ============================================================

def find_duplicate_ids(df, id_column):
    """
    Find all rows containing duplicate IDs.

    Args:
        df (DataFrame): Input data.
        id_column (str): Column containing the unique ID.

    Returns:
        DataFrame: Rows containing duplicate IDs.
    """

    duplicates = df[
        df.duplicated(
            subset=[id_column],
            keep=False
        )
    ]

    return duplicates


def find_missing_values(df, required_columns):
    """
    Find rows where one or more required columns are missing.

    Args:
        df (DataFrame): Input data.
        required_columns (list): Columns that cannot be missing.

    Returns:
        DataFrame: Rows containing missing required values.
    """

    missing_rows = df[
        df[required_columns]
        .isnull()
        .any(axis=1)
    ]

    return missing_rows


def find_invalid_dates(df, date_column):
    """
    Find rows containing invalid date values.

    Invalid date strings are converted to NaT instead
    of causing the pipeline to crash.

    Args:
        df (DataFrame): Input data.
        date_column (str): Date column to validate.

    Returns:
        DataFrame: Rows containing invalid dates.
    """

    converted_dates = pd.to_datetime(
        df[date_column],
        errors="coerce"
    )

    invalid_rows = df[
        converted_dates.isnull()
    ]

    return invalid_rows


def find_negative_values(df, column):
    """
    Find rows where a numeric column contains
    negative values.

    Args:
        df (DataFrame): Input data.
        column (str): Numeric column to validate.

    Returns:
        DataFrame: Rows containing negative values.
    """

    invalid_rows = df[
        df[column] < 0
    ]

    return invalid_rows


def find_invalid_statuses(df, column, valid_statuses):
    """
    Find rows containing statuses that are not
    present in the allowed status list.

    Args:
        df (DataFrame): Input data.
        column (str): Status column.
        valid_statuses (list): Allowed statuses.

    Returns:
        DataFrame: Rows containing invalid statuses.
    """

    invalid_rows = df[
        ~df[column].isin(valid_statuses)
    ]

    return invalid_rows


def find_invalid_foreign_keys(
    child_df,
    child_column,
    parent_df,
    parent_column
):
    """
    Find rows where a foreign-key value does not
    exist in the parent dataset.

    Example:
        orders.customer_id
            →
        customers.customer_id

    Args:
        child_df (DataFrame): Child dataset.
        child_column (str): Foreign-key column.
        parent_df (DataFrame): Parent dataset.
        parent_column (str): Parent ID column.

    Returns:
        DataFrame: Rows containing invalid foreign keys.
    """

    valid_values = set(
        parent_df[parent_column].dropna()
    )

    invalid_rows = child_df[
        ~child_df[child_column].isin(valid_values)
    ]

    return invalid_rows


def find_invalid_delivery_dates(df):
    """
    Find shipments where actual delivery happened
    before the shipment date.

    Rule:
        actual_delivery >= shipment_date

    Returns:
        DataFrame: Shipments violating the date rule.
    """

    shipment_dates = pd.to_datetime(
        df["shipment_date"],
        errors="coerce"
    )

    delivery_dates = pd.to_datetime(
        df["actual_delivery"],
        errors="coerce"
    )

    invalid_rows = df[
        delivery_dates.notna()
        & shipment_dates.notna()
        & (delivery_dates < shipment_dates)
    ]

    return invalid_rows


# ============================================================
# VALIDATION ERROR HELPER
# ============================================================

def create_validation_error(
    source,
    record_id,
    table_name,
    error_type,
    error_message
):
    """
    Create a structured data-quality error.

    Returns:
        dict: Structured validation error.
    """

    return {
        "source": source,
        "record_id": record_id,
        "table_name": table_name,
        "error_type": error_type,
        "error_message": error_message
    }


# ============================================================
# ORDER VALIDATION
# ============================================================

def validate_orders(orders, customers):
    """
    Run all validation rules for orders.

    Returns:
        list: List of structured validation errors.
    """

    errors = []

    # --------------------------------------------------------
    # 1. Duplicate Order IDs
    # --------------------------------------------------------

    duplicates = find_duplicate_ids(
        orders,
        "order_id"
    )

    for _, row in duplicates.iterrows():

        errors.append(
            create_validation_error(
                source="orders.csv",
                record_id=row["order_id"],
                table_name="orders",
                error_type="DUPLICATE_ID",
                error_message=(
                    f"Duplicate order ID: "
                    f"{row['order_id']}"
                )
            )
        )

    # --------------------------------------------------------
    # 2. Missing Required Values
    # --------------------------------------------------------

    missing_values = find_missing_values(
        orders,
        [
            "order_id",
            "customer_id",
            "order_date"
        ]
    )

    for _, row in missing_values.iterrows():

        errors.append(
            create_validation_error(
                source="orders.csv",
                record_id=row["order_id"],
                table_name="orders",
                error_type="MISSING_VALUE",
                error_message=(
                    "One or more required "
                    "order fields are missing"
                )
            )
        )

    # --------------------------------------------------------
    # 3. Invalid Order Dates
    # --------------------------------------------------------

    invalid_dates = find_invalid_dates(
        orders,
        "order_date"
    )

    for _, row in invalid_dates.iterrows():

        errors.append(
            create_validation_error(
                source="orders.csv",
                record_id=row["order_id"],
                table_name="orders",
                error_type="INVALID_DATE",
                error_message="Invalid order date"
            )
        )

    # --------------------------------------------------------
    # 4. Negative Order Amounts
    # --------------------------------------------------------

    negative_amounts = find_negative_values(
        orders,
        "order_amount"
    )

    for _, row in negative_amounts.iterrows():

        errors.append(
            create_validation_error(
                source="orders.csv",
                record_id=row["order_id"],
                table_name="orders",
                error_type="NEGATIVE_AMOUNT",
                error_message=(
                    "Order amount cannot be negative"
                )
            )
        )

    # --------------------------------------------------------
    # 5. Invalid Order Status
    # --------------------------------------------------------

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

    for _, row in invalid_statuses.iterrows():

        errors.append(
            create_validation_error(
                source="orders.csv",
                record_id=row["order_id"],
                table_name="orders",
                error_type="INVALID_STATUS",
                error_message=(
                    f"Invalid order status: "
                    f"{row['order_status']}"
                )
            )
        )

    # --------------------------------------------------------
    # 6. Invalid Customer IDs
    # --------------------------------------------------------

    invalid_customers = find_invalid_foreign_keys(
        orders,
        "customer_id",
        customers,
        "customer_id"
    )

    for _, row in invalid_customers.iterrows():

        errors.append(
            create_validation_error(
                source="orders.csv",
                record_id=row["order_id"],
                table_name="orders",
                error_type="INVALID_FOREIGN_KEY",
                error_message=(
                    f"Customer ID "
                    f"{row['customer_id']} "
                    f"does not exist"
                )
            )
        )

    return errors


# ============================================================
# SHIPMENT VALIDATION
# ============================================================

def validate_shipments(
    shipments,
    orders,
    warehouses,
    vehicles,
    drivers
):
    """
    Run all validation rules for shipments.

    Returns:
        list: List of structured validation errors.
    """

    errors = []

    # --------------------------------------------------------
    # 1. Duplicate Shipment IDs
    # --------------------------------------------------------

    duplicates = find_duplicate_ids(
        shipments,
        "shipment_id"
    )

    for _, row in duplicates.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="DUPLICATE_ID",
                error_message=(
                    f"Duplicate shipment ID: "
                    f"{row['shipment_id']}"
                )
            )
        )

    # --------------------------------------------------------
    # 2. Missing Required Values
    # --------------------------------------------------------

    missing_values = find_missing_values(
        shipments,
        [
            "shipment_id",
            "order_id",
            "warehouse_id",
            "vehicle_id",
            "driver_id",
            "shipment_date"
        ]
    )

    for _, row in missing_values.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="MISSING_VALUE",
                error_message=(
                    "One or more required "
                    "shipment fields are missing"
                )
            )
        )

    # --------------------------------------------------------
    # 3. Invalid Shipment Order IDs
    # --------------------------------------------------------

    invalid_orders = find_invalid_foreign_keys(
        shipments,
        "order_id",
        orders,
        "order_id"
    )

    for _, row in invalid_orders.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="INVALID_FOREIGN_KEY",
                error_message=(
                    f"Order ID "
                    f"{row['order_id']} "
                    f"does not exist"
                )
            )
        )

    # --------------------------------------------------------
    # 4. Invalid Warehouse IDs
    # --------------------------------------------------------

    invalid_warehouses = find_invalid_foreign_keys(
        shipments,
        "warehouse_id",
        warehouses,
        "warehouse_id"
    )

    for _, row in invalid_warehouses.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="INVALID_FOREIGN_KEY",
                error_message=(
                    f"Warehouse ID "
                    f"{row['warehouse_id']} "
                    f"does not exist"
                )
            )
        )

    # --------------------------------------------------------
    # 5. Invalid Vehicle IDs
    # --------------------------------------------------------

    invalid_vehicles = find_invalid_foreign_keys(
        shipments,
        "vehicle_id",
        vehicles,
        "vehicle_id"
    )

    for _, row in invalid_vehicles.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="INVALID_FOREIGN_KEY",
                error_message=(
                    f"Vehicle ID "
                    f"{row['vehicle_id']} "
                    f"does not exist"
                )
            )
        )

    # --------------------------------------------------------
    # 6. Invalid Driver IDs
    # --------------------------------------------------------

    invalid_drivers = find_invalid_foreign_keys(
        shipments,
        "driver_id",
        drivers,
        "driver_id"
    )

    for _, row in invalid_drivers.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="INVALID_FOREIGN_KEY",
                error_message=(
                    f"Driver ID "
                    f"{row['driver_id']} "
                    f"does not exist"
                )
            )
        )

    # --------------------------------------------------------
    # 7. Invalid Delivery Dates
    # --------------------------------------------------------

    invalid_delivery_dates = find_invalid_delivery_dates(
        shipments
    )

    for _, row in invalid_delivery_dates.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="INVALID_DELIVERY_DATE",
                error_message=(
                    "Actual delivery cannot occur "
                    "before shipment date"
                )
            )
        )

    # --------------------------------------------------------
    # 8. Invalid Shipment Status
    # --------------------------------------------------------

    valid_shipment_statuses = [
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
        shipments,
        "status",
        valid_shipment_statuses
    )

    for _, row in invalid_statuses.iterrows():

        errors.append(
            create_validation_error(
                source="shipments.csv",
                record_id=row["shipment_id"],
                table_name="shipments",
                error_type="INVALID_STATUS",
                error_message=(
                    f"Invalid shipment status: "
                    f"{row['status']}"
                )
            )
        )

    return errors



def validate_incidents(incidents, shipments):
    """
    Validate incident records received from the REST API.
    """

    errors = []

    required_fields = [
        "incident_id",
        "shipment_id",
        "incident_type",
        "severity",
        "location",
        "reported_at",
        "status"
    ]

    valid_severities = {
        "low",
        "medium",
        "high",
        "critical"
    }

    valid_statuses = {
        "open",
        "resolved",
        "investigating"
    }

    # ---------------------------------------------------------
    # Duplicate incident IDs
    # ---------------------------------------------------------

    incident_ids = [
        incident.get("incident_id")
        for incident in incidents
    ]

    duplicates = {
        incident_id
        for incident_id in incident_ids
        if incident_ids.count(incident_id) > 1
    }

    for incident_id in duplicates:
        errors.append({
            "source": "incident_api",
            "record_id": incident_id,
            "table_name": "incidents",
            "error_type": "duplicate_id",
            "error_message": f"Duplicate incident ID: {incident_id}"
        })

    # ---------------------------------------------------------
    # Valid shipment IDs
    # ---------------------------------------------------------

    valid_shipment_ids = set(
        shipments["shipment_id"].astype(str)
    )

    # ---------------------------------------------------------
    # Validate each incident
    # ---------------------------------------------------------

    for incident in incidents:

        incident_id = incident.get("incident_id")

        # Required fields
        for field in required_fields:

            value = incident.get(field)

            if value is None or str(value).strip() == "":
                errors.append({
                    "source": "incident_api",
                    "record_id": incident_id,
                    "table_name": "incidents",
                    "error_type": "missing_value",
                    "error_message": f"Missing required field: {field}"
                })

        # Severity
        severity = incident.get("severity")

        if severity not in valid_severities:
            errors.append({
                "source": "incident_api",
                "record_id": incident_id,
                "table_name": "incidents",
                "error_type": "invalid_severity",
                "error_message": f"Invalid severity: {severity}"
            })

        # Status
        status = incident.get("status")

        if status not in valid_statuses:
            errors.append({
                "source": "incident_api",
                "record_id": incident_id,
                "table_name": "incidents",
                "error_type": "invalid_status",
                "error_message": f"Invalid status: {status}"
            })

        # Shipment foreign key
        shipment_id = incident.get("shipment_id")

        if shipment_id not in valid_shipment_ids:
            errors.append({
                "source": "incident_api",
                "record_id": incident_id,
                "table_name": "incidents",
                "error_type": "invalid_foreign_key",
                "error_message": (
                    f"Shipment does not exist: {shipment_id}"
                )
            })

        # Date validation
        reported_at = pd.to_datetime(
            incident.get("reported_at"),
            errors="coerce"
        )

        resolved_at = pd.to_datetime(
            incident.get("resolved_at"),
            errors="coerce"
        )

        if pd.isna(reported_at):
            errors.append({
                "source": "incident_api",
                "record_id": incident_id,
                "table_name": "incidents",
                "error_type": "invalid_date",
                "error_message": "Invalid reported_at date"
            })

        if (
            incident.get("resolved_at") is not None
            and not pd.isna(resolved_at)
            and not pd.isna(reported_at)
            and resolved_at < reported_at
        ):
            errors.append({
                "source": "incident_api",
                "record_id": incident_id,
                "table_name": "incidents",
                "error_type": "invalid_date_range",
                "error_message": (
                    "resolved_at cannot be earlier than reported_at"
                )
            })

    return errors