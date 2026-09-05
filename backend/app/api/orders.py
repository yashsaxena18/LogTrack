from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


@router.get("/")
def get_orders(
    status: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = """
        SELECT
            o.order_id,
            o.customer_id,
            c.name AS customer_name,
            c.email AS customer_email,
            o.order_date,
            o.order_amount,
            o.payment_status,
            o.order_status

        FROM core.orders o

        LEFT JOIN core.customers c
            ON o.customer_id = c.customer_id
    """

    params = {}

    if status:
        query += """
            WHERE o.order_status = :status
        """
        params["status"] = status

    query += """
        ORDER BY o.order_date DESC
    """

    result = db.execute(
        text(query),
        params
    )

    return result.mappings().all()


@router.get("/{order_id}")
def get_order(
    order_id: str,
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT
            o.order_id,
            o.customer_id,
            c.name AS customer_name,
            c.email AS customer_email,
            c.phone AS customer_phone,
            o.order_date,
            o.order_amount,
            o.payment_status,
            o.order_status

        FROM core.orders o

        LEFT JOIN core.customers c
            ON o.customer_id = c.customer_id

        WHERE o.order_id = :order_id
    """)

    result = db.execute(
        query,
        {"order_id": order_id}
    )

    order = result.mappings().first()

    if not order:
        return {
            "message": "Order not found"
        }

    return order