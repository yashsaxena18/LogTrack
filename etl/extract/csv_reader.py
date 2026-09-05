import pandas as pd
from pathlib import Path


# Path to the raw data directory
RAW_DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"


def read_csv_file(filename):
    """
    Read a CSV file from the raw data directory.

    Args:
        filename (str): Name of the CSV file.

    Returns:
        pandas.DataFrame: Loaded CSV data.
    """

    file_path = RAW_DATA_DIR / filename

    if not file_path.exists():
        raise FileNotFoundError(f"CSV file not found: {file_path}")

    return pd.read_csv(file_path)


def load_all_csv_files():
    """
    Load all LogiTrack CSV source files.
    """

    data = {
        "customers": read_csv_file("customers.csv"),
        "warehouses": read_csv_file("warehouses.csv"),
        "drivers": read_csv_file("drivers.csv"),
        "vehicles": read_csv_file("vehicles.csv"),
        "orders": read_csv_file("orders.csv"),
        "shipments": read_csv_file("shipments.csv"),
    }

    return data