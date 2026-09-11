import csv
import io
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Supplier
from .serializers import ProductSerializer


class ProductListView(APIView):
    def get(self, request):
        qs = Product.objects.select_related("primary_supplier").all()
        search = request.query_params.get("search")
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(sku__icontains=search)
                | Q(category__icontains=search)
                | Q(brand__icontains=search)
            )
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        serializer = ProductSerializer(qs, many=True, context={"request": request})
        return Response({"products": serializer.data})


class ProductDetailView(APIView):
    def get(self, request, product_id):
        product = get_object_or_404(Product, product_code=product_id)
        serializer = ProductSerializer(product, context={"request": request})
        return Response({"product": serializer.data})


class ProductByBarcodeView(APIView):
    def get(self, request, barcode):
        try:
            product = Product.objects.get(barcode=barcode.strip())
        except Product.DoesNotExist:
            return Response(
                {"message": "Product not found", "error": "not_found"}, status=404
            )
        serializer = ProductSerializer(product, context={"request": request})
        return Response({"product": serializer.data})


class ProductImportView(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"message": "No file provided", "error": "missing_file"}, status=400
            )

        decoded = io.StringIO(file.read().decode("utf-8"))
        reader = csv.DictReader(decoded)
        rows_received = 0
        rows_valid = 0
        rows_rejected = 0

        for row in reader:
            rows_received += 1
            sku = row.get("sku", "").strip()
            name = row.get("name", "").strip()
            if not sku or not name:
                rows_rejected += 1
                continue

            supplier = None
            supplier_name = row.get("supplier_name", "").strip()
            if supplier_name:
                supplier, _ = Supplier.objects.get_or_create(
                    name=supplier_name,
                    defaults={"quoted_lead_time_days": row.get("lead_time_days") or None},
                )

            Product.objects.update_or_create(
                sku=sku,
                defaults={
                    "name": name,
                    "category": row.get("category", ""),
                    "brand": row.get("brand", ""),
                    "cost_price": row.get("cost_price") or 0,
                    "selling_price": row.get("selling_price") or 0,
                    "current_stock": row.get("current_stock") or 0,
                    "reorder_level": row.get("reorder_level") or None,
                    "primary_supplier": supplier,
                    "minimum_order_quantity": row.get("minimum_order_quantity") or None,
                    "image_url": row.get("image_url", "") or "",
                },
            )
            rows_valid += 1

        return Response(
            {
                "import_id": f"PRD-IMP-{Product.objects.count()}",
                "status": "PROCESSED",
                "message": "Catalog import processed.",
                "summary": {
                    "rows_received": rows_received,
                    "rows_valid": rows_valid,
                    "rows_rejected": rows_rejected,
                    "file_name": file.name,
                },
            },
            status=status.HTTP_200_OK,
        )
