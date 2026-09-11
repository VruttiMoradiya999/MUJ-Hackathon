from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'category', 'stock_quantity', 'reorder_level', 'unit_price', 'is_active']
    list_filter = ['is_active', 'category', 'unit']
    search_fields = ['sku', 'name']
    list_editable = ['stock_quantity', 'is_active']
    raw_id_fields = ['category']
