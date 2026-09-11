from django.contrib import admin
from .models import Product, Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "contact_person", "quoted_lead_time_days")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "product_code",
        "sku",
        "name",
        "category",
        "brand",
        "current_stock",
        "status",
    )
    list_filter = ("category", "status", "is_perishable")
    search_fields = ("name", "sku", "product_code", "barcode")
    readonly_fields = ("product_code", "created_at", "updated_at")
