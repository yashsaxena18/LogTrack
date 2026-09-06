-- =========================================================
-- LOGITRACK DATABASE SCHEMA
-- =========================================================

-- =========================================================
-- SCHEMAS
-- =========================================================

CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS analytics;


-- =========================================================
-- STAGING TABLES
-- Raw/landing layer
-- No PK/FK constraints intentionally
-- =========================================================

CREATE TABLE IF NOT EXISTS staging.stg_customers (
    customer_id VARCHAR(50),
    name VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(30),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staging.stg_warehouses (
    warehouse_id VARCHAR(50),
    warehouse_name VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(100),
    capacity INTEGER,
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS staging.stg_drivers (
    driver_id VARCHAR(50),
    name VARCHAR(150),
    phone VARCHAR(30),
    experience_years INTEGER,
    status VARCHAR(50),
    joining_date DATE
);

CREATE TABLE IF NOT EXISTS staging.stg_vehicles (
    vehicle_id VARCHAR(50),
    vehicle_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    driver_id VARCHAR(50),
    status VARCHAR(50),
    fuel_level NUMERIC(5,2),
    last_service_date DATE
);

CREATE TABLE IF NOT EXISTS staging.stg_orders (
    order_id VARCHAR(50),
    customer_id VARCHAR(50),
    order_date VARCHAR(50),
    order_amount NUMERIC(12,2),
    payment_status VARCHAR(50),
    order_status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS staging.stg_shipments (
    shipment_id VARCHAR(50),
    order_id VARCHAR(50),
    warehouse_id VARCHAR(50),
    vehicle_id VARCHAR(50),
    driver_id VARCHAR(50),
    shipment_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    status VARCHAR(50),
    destination_city VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS staging.stg_incidents (
    incident_id VARCHAR(50),
    shipment_id VARCHAR(50),
    incident_type VARCHAR(100),
    severity VARCHAR(50),
    location VARCHAR(150),
    reported_at TIMESTAMP,
    resolved_at TIMESTAMP,
    status VARCHAR(50)
);


-- =========================================================
-- CORE TABLES
-- Clean validated data
-- =========================================================

CREATE TABLE IF NOT EXISTS core.customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS core.warehouses (
    warehouse_id VARCHAR(50) PRIMARY KEY,
    warehouse_name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    capacity INTEGER,
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS core.drivers (
    driver_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    experience_years INTEGER,
    status VARCHAR(50),
    joining_date DATE
);

CREATE TABLE IF NOT EXISTS core.vehicles (
    vehicle_id VARCHAR(50) PRIMARY KEY,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    driver_id VARCHAR(50),
    status VARCHAR(50),
    fuel_level NUMERIC(5,2),
    last_service_date DATE,

    CONSTRAINT fk_vehicle_driver
        FOREIGN KEY (driver_id)
        REFERENCES core.drivers(driver_id)
);

CREATE TABLE IF NOT EXISTS core.orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    order_date DATE,
    order_amount NUMERIC(12,2) NOT NULL,
    payment_status VARCHAR(50),
    order_status VARCHAR(50),

    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES core.customers(customer_id),

    CONSTRAINT chk_order_amount
        CHECK (order_amount >= 0)
);

CREATE TABLE IF NOT EXISTS core.shipments (
    shipment_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    driver_id VARCHAR(50) NOT NULL,
    shipment_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    status VARCHAR(50),
    destination_city VARCHAR(100),

    CONSTRAINT fk_shipment_order
        FOREIGN KEY (order_id)
        REFERENCES core.orders(order_id),

    CONSTRAINT fk_shipment_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES core.warehouses(warehouse_id),

    CONSTRAINT fk_shipment_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES core.vehicles(vehicle_id),

    CONSTRAINT fk_shipment_driver
        FOREIGN KEY (driver_id)
        REFERENCES core.drivers(driver_id),

    CONSTRAINT chk_delivery_date
        CHECK (
            actual_delivery IS NULL
            OR shipment_date IS NULL
            OR actual_delivery >= shipment_date
        )
);

CREATE TABLE IF NOT EXISTS core.incidents (
    incident_id VARCHAR(50) PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL,
    incident_type VARCHAR(100),
    severity VARCHAR(50),
    location VARCHAR(150),
    reported_at TIMESTAMP,
    resolved_at TIMESTAMP,
    status VARCHAR(50),

    CONSTRAINT fk_incident_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES core.shipments(shipment_id)
);


-- =========================================================
-- MONITORING TABLES
-- =========================================================

CREATE TABLE IF NOT EXISTS monitoring.etl_runs (
    run_id BIGSERIAL PRIMARY KEY,
    pipeline_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(30) NOT NULL,
    records_extracted INTEGER DEFAULT 0,
    records_valid INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    records_loaded INTEGER DEFAULT 0,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS monitoring.data_quality_errors (
    error_id BIGSERIAL PRIMARY KEY,
    run_id BIGINT REFERENCES monitoring.etl_runs(run_id),
    source VARCHAR(255),
    record_id VARCHAR(50),
    table_name VARCHAR(100),
    error_type VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- END OF SCHEMA
-- =========================================================