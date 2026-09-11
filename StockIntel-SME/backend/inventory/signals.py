from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from products.models import Product
from .models import Alert

STOCK_ALERT_TYPES = ["stock_out", "low_stock"]


@receiver(post_save, sender=Product)
def sync_stock_alerts(sender, instance, **kwargs):
    """
    Keeps Alert rows in sync with a Product's current stock level.
    Runs on every Product save — a sale's stock deduction, a CSV import,
    or a manual admin edit all trigger this the same way.
    """
    product = instance

    if product.current_stock <= 0:
        _upsert_alert(
            product,
            alert_type="stock_out",
            severity="critical",
            title=f"{product.name} is out of stock",
            message=f"{product.name} ({product.sku}) has 0 units in stock.",
        )
    elif product.reorder_level is not None and product.current_stock <= product.reorder_level:
        _upsert_alert(
            product,
            alert_type="low_stock",
            severity="high",
            title=f"{product.name} is low on stock",
            message=(
                f"{product.name} ({product.sku}) has {product.current_stock} units left, "
                f"at or below the reorder level of {product.reorder_level}."
            ),
        )
    else:
        _resolve_active_stock_alerts(product)


def _upsert_alert(product, alert_type, severity, title, message):
    """Update the existing active stock alert for this product, or create one.
    Never creates a second active alert for the same product."""
    alert = Alert.objects.filter(
        product=product, alert_type__in=STOCK_ALERT_TYPES, status="active"
    ).first()

    if alert:
        alert.alert_type = alert_type
        alert.severity = severity
        alert.title = title
        alert.message = message
        alert.current_value = product.current_stock
        alert.threshold_value = product.reorder_level
        alert.save()
    else:
        Alert.objects.create(
            product=product,
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message,
            current_value=product.current_stock,
            threshold_value=product.reorder_level,
        )


def _resolve_active_stock_alerts(product):
    """Stock is healthy again — auto-resolve any open low_stock/stock_out alert."""
    Alert.objects.filter(
        product=product, alert_type__in=STOCK_ALERT_TYPES, status="active"
    ).update(status="resolved", resolved_at=timezone.now())