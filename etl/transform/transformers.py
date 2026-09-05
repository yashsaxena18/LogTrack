import pandas as pd


# ============================================================
# STATUS NORMALIZATION
# ============================================================

ORDER_STATUS_MAP = {
    "pending": "pending",
    "confirmed": "confirmed",
    "shipped": "in_transit",
    "in_transit": "in_transit",
    "in-transit": "in_transit",
    "delayed": "delayed",
    "delivered": "delivered",
    "completed": "delivered",
    "cancelled": "cancelled",
    "failed": "failed"
}


def normalize_status(value):
    """
    Convert a source status into the standardized
    LogiTrack status.
    """

    if pd.isna(value):
        return value

    normalized = str(value).strip().lower()

    return ORDER_STATUS_MAP.get(
        normalized,
        normalized
    )


# ============================================================
# DATE TRANSFORMATION
# ============================================================

def convert_date_column(df, column):
    """
    Convert a column into datetime format.

    Invalid values become NaT.
    """

    df = df.copy()

    df[column] = pd.to_datetime(
        df[column],
        errors="coerce"
    )

    return df


# ============================================================
# ORDER TRANSFORMATION
# ============================================================

def transform_orders(orders):
    """
    Clean and transform valid order records.
    """

    df = orders.copy()

    # Normalize IDs and text fields
    df["order_id"] = (
        df["order_id"]
        .astype(str)
        .str.strip()
    )

    df["customer_id"] = (
        df["customer_id"]
        .astype(str)
        .str.strip()
    )

    # Convert date
    df = convert_date_column(
        df,
        "order_date"
    )

    # Convert amount
    df["order_amount"] = pd.to_numeric(
        df["order_amount"],
        errors="coerce"
    )

    # Normalize status
    df["order_status"] = (
        df["order_status"]
        .apply(normalize_status)
    )

    # Normalize payment status
    df["payment_status"] = (
        df["payment_status"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # Remove duplicate order IDs
    df = df.drop_duplicates(
        subset=["order_id"],
        keep="first"
    )

    return df


# ============================================================
# SHIPMENT TRANSFORMATION
# ============================================================

def transform_shipments(shipments):
    """
    Clean and transform valid shipment records.
    """

    df = shipments.copy()

    # Clean IDs
    id_columns = [
        "shipment_id",
        "order_id",
        "warehouse_id",
        "vehicle_id",
        "driver_id"
    ]

    for column in id_columns:
        df[column] = (
            df[column]
            .astype(str)
            .str.strip()
        )

    # Convert date columns
    date_columns = [
        "shipment_date",
        "expected_delivery",
        "actual_delivery"
    ]

    for column in date_columns:
        df = convert_date_column(
            df,
            column
        )

    # Normalize status
    df["status"] = (
        df["status"]
        .apply(normalize_status)
    )

    # Clean destination city
    df["destination_city"] = (
        df["destination_city"]
        .astype(str)
        .str.strip()
    )

    # Remove duplicate shipment IDs
    df = df.drop_duplicates(
        subset=["shipment_id"],
        keep="first"
    )

    return df



def transform_incidents(incidents):
    """
    Transform incident records received from the REST API
    into a clean DataFrame ready for PostgreSQL.
    """

    df = pd.DataFrame(incidents)

    if df.empty:
        return df

    # Clean string columns
    string_columns = [
        "incident_id",
        "shipment_id",
        "incident_type",
        "severity",
        "location",
        "status"
    ]

    for column in string_columns:
        if column in df.columns:
            df[column] = df[column].astype(str).str.strip()

    # Normalize severity
    df["severity"] = (
        df["severity"]
        .str.lower()
        .str.strip()
    )

    # Normalize status
    df["status"] = (
        df["status"]
        .str.lower()
        .str.strip()
    )

    # Convert timestamps
    df["reported_at"] = pd.to_datetime(
        df["reported_at"],
        errors="coerce"
    )

    df["resolved_at"] = pd.to_datetime(
        df["resolved_at"],
        errors="coerce"
    )

    # Remove duplicate incident IDs
    df = df.drop_duplicates(
        subset=["incident_id"],
        keep="first"
    )

    return df