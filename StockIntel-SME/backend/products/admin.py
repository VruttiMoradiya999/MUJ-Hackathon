from django.contrib import admin
from .models import Product, Supplier, Sale, SaleItem


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


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ("unit_price", "line_total")


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("sale_number", "status", "payment_method", "total_amount", "created_at")
    list_filter = ("status", "payment_method")
    search_fields = ("sale_number", "customer_name", "customer_phone")
    readonly_fields = ("sale_number", "subtotal", "total_amount", "created_at")
    inlines = [SaleItemInline]