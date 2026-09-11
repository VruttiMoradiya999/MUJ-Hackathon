from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count', 'created_at']
        read_only_fields = ['created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)
    inventory_value = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description', 'category', 'category_name',
            'unit_price', 'cost_price', 'stock_quantity', 'reorder_level',
            'unit', 'is_active', 'image',
            'is_low_stock', 'is_out_of_stock', 'inventory_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
