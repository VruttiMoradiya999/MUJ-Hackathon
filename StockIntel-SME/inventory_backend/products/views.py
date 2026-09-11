from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, Sum

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'unit']
    search_fields = ['sku', 'name', 'description']
    ordering_fields = ['name', 'sku', 'stock_quantity', 'unit_price', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        qs = self.get_queryset().filter(stock_quantity__lte=F('reorder_level'))
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        qs = self.get_queryset().filter(stock_quantity=0)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def inventory_summary(self, request):
        total_value = self.get_queryset().aggregate(
            total=Sum(F('stock_quantity') * F('unit_price'))
        )['total'] or 0
        return Response({
            'total_products': self.get_queryset().count(),
            'active_products': self.get_queryset().filter(is_active=True).count(),
            'low_stock_count': self.get_queryset().filter(stock_quantity__lte=F('reorder_level')).count(),
            'out_of_stock_count': self.get_queryset().filter(stock_quantity=0).count(),
            'total_inventory_value': float(total_value),
        })
