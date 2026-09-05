import os

import pandas as pd

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


# ============================================================
# DATABASE CONNECTION
# ============================================================

DATABASE_URL = (
    f"postgresql+psycopg2://"
    f"{DB_USER}:{DB_PASSWORD}@"
    f"{DB_HOST}:{DB_PORT}/"
    f"{DB_NAME}"
)


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# ============================================================
# TEST DATABASE CONNECTION
# ============================================================

def test_connection():
    """
    Test the PostgreSQL database connection.
    """

    try:

        with engine.connect() as connection:

            result = connection.execute(
                text("SELECT 1")
            )

            print(
                "Database connection successful:",
                result.scalar()
            )

    except Exception as error:

        print("Database connection failed.")
        print("Error:", error)


# ============================================================
# CLEAR CORE TABLES
# ============================================================

def clear_core_tables():
    """
    Clear existing data from core tables before
    performing a full ETL refresh.
    """

    try:

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    TRUNCATE TABLE
                        core.shipments,
                        core.orders,
                        core.vehicles,
                        core.drivers,
                        core.warehouses,
                        core.customers
                    CASCADE;
                    """
                )
            )

        print(
            "Core tables cleared successfully."
        )

    except Exception as error:

        print(
            "Failed to clear core tables."
        )

        print(
            "Error:",
            error
        )

        raise


# ============================================================
# LOAD DATAFRAME INTO POSTGRESQL
# ============================================================

def load_dataframe(
    df,
    table_name,
    schema="core"
):
    """
    Load a Pandas DataFrame into a PostgreSQL table.

    Returns:
        Number of records loaded.
    """

    if df.empty:

        print(
            f"No data to load into "
            f"{schema}.{table_name}"
        )

        return 0

    try:

        df.to_sql(
            name=table_name,
            con=engine,
            schema=schema,
            if_exists="append",
            index=False,
            method="multi"
        )

        print(
            f"Loaded {len(df)} records into "
            f"{schema}.{table_name}"
        )

        return len(df)

    except Exception as error:

        print(
            f"Failed to load "
            f"{schema}.{table_name}"
        )

        print(
            "Error:",
            error
        )

        raise


# ============================================================
# LOAD MULTIPLE CORE TABLES
# ============================================================

def load_core_tables(
    customers,
    warehouses,
    drivers,
    vehicles,
    orders,
    shipments
):
    """
    Load cleaned DataFrames into core tables.

    Tables are loaded in foreign-key dependency order.
    """

    loaded_counts = {}

    # --------------------------------------------------------
    # 1. CUSTOMERS
    # --------------------------------------------------------

    loaded_counts["customers"] = load_dataframe(
        customers,
        "customers"
    )

    # --------------------------------------------------------
    # 2. WAREHOUSES
    # --------------------------------------------------------

    loaded_counts["warehouses"] = load_dataframe(
        warehouses,
        "warehouses"
    )

    # --------------------------------------------------------
    # 3. DRIVERS
    # --------------------------------------------------------

    loaded_counts["drivers"] = load_dataframe(
        drivers,
        "drivers"
    )

    # --------------------------------------------------------
    # 4. VEHICLES
    # --------------------------------------------------------

    loaded_counts["vehicles"] = load_dataframe(
        vehicles,
        "vehicles"
    )

    # --------------------------------------------------------
    # 5. ORDERS
    # --------------------------------------------------------

    loaded_counts["orders"] = load_dataframe(
        orders,
        "orders"
    )

    # --------------------------------------------------------
    # 6. SHIPMENTS
    # --------------------------------------------------------

    loaded_counts["shipments"] = load_dataframe(
        shipments,
        "shipments"
    )

    return loaded_counts


# ============================================================
# LOAD INCIDENTS
# ============================================================

def load_incidents(df):
    """
    Load transformed incidents into staging first,
    then replace the core incidents table.
    """

    if df.empty:

        print(
            "No incidents to load."
        )

        return 0

    columns = [
        "incident_id",
        "shipment_id",
        "incident_type",
        "severity",
        "location",
        "reported_at",
        "resolved_at",
        "status"
    ]

    df = df[columns].copy()

    # --------------------------------------------------------
    # 1. CLEAR STAGING INCIDENTS
    # --------------------------------------------------------

    with engine.begin() as connection:

        connection.execute(
            text(
                """
                TRUNCATE TABLE staging.stg_incidents
                """
            )
        )

    # --------------------------------------------------------
    # 2. LOAD INCIDENTS INTO STAGING
    # --------------------------------------------------------

    load_dataframe(
        df,
        "stg_incidents",
        schema="staging"
    )

    # --------------------------------------------------------
    # 3. REPLACE CORE INCIDENTS
    # --------------------------------------------------------

    with engine.begin() as connection:

        connection.execute(
            text(
                """
                TRUNCATE TABLE core.incidents CASCADE
                """
            )
        )

        connection.execute(
            text(
                """
                INSERT INTO core.incidents (
                    incident_id,
                    shipment_id,
                    incident_type,
                    severity,
                    location,
                    reported_at,
                    resolved_at,
                    status
                )
                SELECT
                    incident_id,
                    shipment_id,
                    incident_type,
                    severity,
                    location,
                    reported_at,
                    resolved_at,
                    status
                FROM staging.stg_incidents
                """
            )
        )

    print(
        f"Loaded {len(df)} incidents into "
        "core.incidents"
    )

    return len(df)