from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    ProductByBarcodeView,
    ProductImportView,
)

urlpatterns = [
    path("products/import", ProductImportView.as_view(), name="product-import"),
    path(
        "products/barcode/<str:barcode>",
        ProductByBarcodeView.as_view(),
        name="product-by-barcode",
    ),
    path(
        "products/<str:product_id>",
        ProductDetailView.as_view(),
        name="product-detail",
    ),
    path("products", ProductListView.as_view(), name="product-list"),
]
