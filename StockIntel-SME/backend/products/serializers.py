from rest_framework import serializers
from decimal import Decimal
from .models import Product, Sale, SaleItem


class ProductSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source="product_code")
    pricing = serializers.SerializerMethodField()
    inventory = serializers.SerializerMethodField()
    supplier = serializers.SerializerMethodField()
    shelf_life = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    last_updated = serializers.DateTimeField(source="updated_at")

    class Meta:
        model = Product
        fields = [
            "product_id",
            "sku",
            "name",
            "category",
            "brand",
            "pricing",
            "inventory",
            "supplier",
            "shelf_life",
            "image_url",
            "status",
            "last_updated",
        ]

    def get_pricing(self, obj):
        return {
            "cost_price": float(obj.cost_price),
            "selling_price": float(obj.selling_price),
        }

    def get_inventory(self, obj):
        available = obj.current_stock - obj.reserved_stock
        return {
            "current_stock": float(obj.current_stock),
            "reserved_stock": float(obj.reserved_stock),
            "available_stock": float(available),
            "reorder_level": float(obj.reorder_level) if obj.reorder_level is not None else None,
        }

    def get_supplier(self, obj):
        s = obj.primary_supplier
        if not s:
            return None
        return {
            "supplier_id": f"S{s.id:03d}",
            "supplier_name": s.name,
            "minimum_order_quantity": float(obj.minimum_order_quantity)
            if obj.minimum_order_quantity
            else None,
            "lead_time_days": s.quoted_lead_time_days,
        }

    def get_shelf_life(self, obj):
        return {
            "days": obj.shelf_life_days,
            "expiry_tracking": obj.is_perishable,
        }

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return obj.image_url or None


# --- Sales -------------------------------------------------------------

class SaleItemSerializer(serializers.ModelSerializer):
    """Read-only representation of a line item, nested inside SaleSerializer."""
    product_id = serializers.CharField(source="product.product_code", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = SaleItem
        fields = [
            "id", "product", "product_id", "product_name", "sku",
            "quantity", "unit_price", "line_total",
        ]
        read_only_fields = ["unit_price", "line_total"]


class SaleSerializer(serializers.ModelSerializer):
    """Read-only representation returned after a sale is created / listed."""
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id", "sale_number", "status", "payment_method",
            "customer_name", "customer_phone",
            "subtotal", "discount_amount", "tax_amount", "total_amount",
            "notes", "items", "created_at",
        ]
        read_only_fields = [
            "sale_number", "status", "subtotal", "total_amount", "created_at",
        ]


class SaleItemInputSerializer(serializers.Serializer):
    """One line item in an incoming POST /api/sales/ request."""
    product_code = serializers.CharField(required=False, allow_blank=True)
    barcode = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))

    def validate(self, attrs):
        if not attrs.get("product_code") and not attrs.get("barcode"):
            raise serializers.ValidationError(
                "Each item needs a product_code or a barcode."
            )
        return attrs


class SaleCreateSerializer(serializers.Serializer):
    """Validates the body of POST /api/sales/. Stock checks happen in the view,
    inside the atomic transaction, where row locks are available."""
    customer_name = serializers.CharField(required=False, allow_blank=True, default="")
    customer_phone = serializers.CharField(required=False, allow_blank=True, default="")
    payment_method = serializers.ChoiceField(
        choices=Sale.PAYMENT_CHOICES, default="CASH"
    )
    discount_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, min_value=Decimal("0"), default=Decimal("0")
    )
    tax_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, min_value=Decimal("0"), default=Decimal("0")
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = SaleItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value