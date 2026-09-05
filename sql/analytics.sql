-- ============================================================
-- LOGITRACK SQL ANALYTICS
-- ============================================================


-- ============================================================
-- 1. OVERALL LOGISTICS KPIs
-- ============================================================

SELECT
    (SELECT COUNT(*) FROM core.customers) AS total_customers,

    (SELECT COUNT(*) FROM core.orders) AS total_orders,

    (SELECT COUNT(*) FROM core.shipments) AS total_shipments,

    (SELECT COUNT(*)
     FROM core.shipments
     WHERE status = 'delivered') AS delivered_shipments,

    (SELECT COUNT(*)
     FROM core.shipments
     WHERE status = 'delayed') AS delayed_shipments,

    (SELECT COUNT(*)
     FROM core.shipments
     WHERE status = 'in_transit') AS in_transit_shipments,

    (SELECT COUNT(*)
     FROM core.shipments
     WHERE status = 'cancelled') AS cancelled_shipments,

    (SELECT COUNT(*)
     FROM core.shipments
     WHERE status = 'failed') AS failed_shipments;


    -- ============================================================
-- 2. DELIVERY SUCCESS RATE
-- ============================================================

SELECT
    COUNT(*) AS total_shipments,

    COUNT(*) FILTER (
        WHERE status = 'delivered'
    ) AS delivered_shipments,

    ROUND(
        100.0 *
        COUNT(*) FILTER (
            WHERE status = 'delivered'
        ) / NULLIF(COUNT(*), 0),
        2
    ) AS delivery_success_rate
FROM core.shipments;


-- ============================================================
-- 3. AVERAGE DELIVERY TIME
-- ============================================================

SELECT
    ROUND(
        AVG(
            EXTRACT(
                EPOCH FROM (
                    actual_delivery - shipment_date
                )
            ) / 3600
        ),
        2
    ) AS average_delivery_hours
FROM core.shipments
WHERE actual_delivery IS NOT NULL;


-- ============================================================
-- 4. ON-TIME DELIVERY RATE
-- ============================================================

SELECT
    COUNT(*) AS delivered_shipments,

    COUNT(*) FILTER (
        WHERE actual_delivery <= expected_delivery
    ) AS on_time_shipments,

    ROUND(
        100.0 *
        COUNT(*) FILTER (
            WHERE actual_delivery <= expected_delivery
        ) / NULLIF(COUNT(*), 0),
        2
    ) AS on_time_delivery_rate

FROM core.shipments
WHERE actual_delivery IS NOT NULL;


-- ============================================================
-- 5. WAREHOUSE PERFORMANCE
-- ============================================================

SELECT
    w.warehouse_id,
    w.warehouse_name,
    w.city,
    COUNT(s.shipment_id) AS total_shipments,

    COUNT(*) FILTER (
        WHERE s.status = 'delivered'
    ) AS delivered_shipments,

    COUNT(*) FILTER (
        WHERE s.status = 'delayed'
    ) AS delayed_shipments,

    ROUND(
        100.0 *
        COUNT(*) FILTER (
            WHERE s.status = 'delivered'
        ) / NULLIF(COUNT(s.shipment_id), 0),
        2
    ) AS delivery_rate

FROM core.warehouses w

LEFT JOIN core.shipments s
    ON w.warehouse_id = s.warehouse_id

GROUP BY
    w.warehouse_id,
    w.warehouse_name,
    w.city

ORDER BY
    delivery_rate DESC;




-- ============================================================
-- 6. DRIVER PERFORMANCE
-- ============================================================

SELECT
    d.driver_id,
    d.name,
    d.status,

    COUNT(s.shipment_id) AS total_shipments,

    COUNT(*) FILTER (
        WHERE s.status = 'delivered'
    ) AS delivered_shipments,

    COUNT(*) FILTER (
        WHERE s.status = 'delayed'
    ) AS delayed_shipments,

    ROUND(
        100.0 *
        COUNT(*) FILTER (
            WHERE s.status = 'delivered'
        ) / NULLIF(COUNT(s.shipment_id), 0),
        2
    ) AS delivery_rate

FROM core.drivers d

LEFT JOIN core.shipments s
    ON d.driver_id = s.driver_id

GROUP BY
    d.driver_id,
    d.name,
    d.status

ORDER BY
    delivery_rate DESC;



-- ============================================================
-- 7. VEHICLE UTILIZATION
-- ============================================================

SELECT
    v.vehicle_id,
    v.vehicle_number,
    v.vehicle_type,
    v.status,
    v.fuel_level,

    COUNT(s.shipment_id) AS total_shipments,

    COUNT(*) FILTER (
        WHERE s.status = 'delivered'
    ) AS delivered_shipments,

    COUNT(*) FILTER (
        WHERE s.status = 'in_transit'
    ) AS active_shipments

FROM core.vehicles v

LEFT JOIN core.shipments s
    ON v.vehicle_id = s.vehicle_id

GROUP BY
    v.vehicle_id,
    v.vehicle_number,
    v.vehicle_type,
    v.status,
    v.fuel_level

ORDER BY
    total_shipments DESC;




-- ============================================================
-- 8. SHIPMENTS BY DESTINATION
-- ============================================================

SELECT
    destination_city,
    COUNT(*) AS total_shipments,

    COUNT(*) FILTER (
        WHERE status = 'delivered'
    ) AS delivered_shipments,

    COUNT(*) FILTER (
        WHERE status = 'delayed'
    ) AS delayed_shipments,

    COUNT(*) FILTER (
        WHERE status = 'in_transit'
    ) AS in_transit_shipments

FROM core.shipments

GROUP BY
    destination_city

ORDER BY
    total_shipments DESC;



-- ============================================================
-- 9. ORDER REVENUE
-- ============================================================

SELECT
    COUNT(*) AS total_orders,

    ROUND(
        SUM(order_amount),
        2
    ) AS total_order_value,

    ROUND(
        AVG(order_amount),
        2
    ) AS average_order_value,

    ROUND(
        MAX(order_amount),
        2
    ) AS highest_order_value,

    ROUND(
        MIN(order_amount),
        2
    ) AS lowest_order_value

FROM core.orders;