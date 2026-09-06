-- =========================================================
-- LOGITRACK DATABASE INDEXES
-- =========================================================

-- =========================================================
-- CUSTOMER INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_customers_city
ON core.customers(city);

CREATE INDEX IF NOT EXISTS idx_customers_state
ON core.customers(state);


-- =========================================================
-- ORDER INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_id
ON core.orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_orders_order_date
ON core.orders(order_date);

CREATE INDEX IF NOT EXISTS idx_orders_order_status
ON core.orders(order_status);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
ON core.orders(payment_status);


-- =========================================================
-- SHIPMENT INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_shipments_order_id
ON core.shipments(order_id);

CREATE INDEX IF NOT EXISTS idx_shipments_warehouse_id
ON core.shipments(warehouse_id);

CREATE INDEX IF NOT EXISTS idx_shipments_vehicle_id
ON core.shipments(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_shipments_driver_id
ON core.shipments(driver_id);

CREATE INDEX IF NOT EXISTS idx_shipments_shipment_date
ON core.shipments(shipment_date);

CREATE INDEX IF NOT EXISTS idx_shipments_status
ON core.shipments(status);

CREATE INDEX IF NOT EXISTS idx_shipments_destination_city
ON core.shipments(destination_city);


-- =========================================================
-- VEHICLE INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id
ON core.vehicles(driver_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_status
ON core.vehicles(status);


-- =========================================================
-- DRIVER INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_drivers_status
ON core.drivers(status);


-- =========================================================
-- WAREHOUSE INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_warehouses_city
ON core.warehouses(city);

CREATE INDEX IF NOT EXISTS idx_warehouses_status
ON core.warehouses(status);


-- =========================================================
-- INCIDENT INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_incidents_shipment_id
ON core.incidents(shipment_id);

CREATE INDEX IF NOT EXISTS idx_incidents_type
ON core.incidents(incident_type);

CREATE INDEX IF NOT EXISTS idx_incidents_severity
ON core.incidents(severity);

CREATE INDEX IF NOT EXISTS idx_incidents_status
ON core.incidents(status);

CREATE INDEX IF NOT EXISTS idx_incidents_reported_at
ON core.incidents(reported_at);


-- =========================================================
-- ETL MONITORING INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_etl_runs_pipeline_name
ON monitoring.etl_runs(pipeline_name);

CREATE INDEX IF NOT EXISTS idx_etl_runs_started_at
ON monitoring.etl_runs(started_at);

CREATE INDEX IF NOT EXISTS idx_etl_runs_status
ON monitoring.etl_runs(status);


-- =========================================================
-- DATA QUALITY INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_quality_errors_run_id
ON monitoring.data_quality_errors(run_id);

CREATE INDEX IF NOT EXISTS idx_quality_errors_source
ON monitoring.data_quality_errors(source);

CREATE INDEX IF NOT EXISTS idx_quality_errors_table_name
ON monitoring.data_quality_errors(table_name);

CREATE INDEX IF NOT EXISTS idx_quality_errors_error_type
ON monitoring.data_quality_errors(error_type);

CREATE INDEX IF NOT EXISTS idx_quality_errors_created_at
ON monitoring.data_quality_errors(created_at);