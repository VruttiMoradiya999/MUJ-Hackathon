from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet, AlertViewSet, RecommendationViewSet,
    ForecastViewSet, DashboardViewSet, ProductForecastView
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'recommendations', RecommendationViewSet, basename='recommendation')
router.register(r'forecasts', ForecastViewSet, basename='forecast')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('forecast/<str:product_code>', ProductForecastView.as_view(), name='product-forecast'),
    path('', include(router.urls)),
]