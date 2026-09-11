from rest_framework import serializers
from .models import Product


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
