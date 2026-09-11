from django.contrib import admin
from .models import Supplier, Alert, Recommendation, Forecast, DashboardSnapshot


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'email', 'lead_time_days', 'reliability_score', 'is_active']
    list_filter = ['is_active', 'country']
    search_fields = ['name', 'contact_person', 'email']


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'alert_type', 'severity', 'status', 'product', 'created_at']
    list_filter = ['status', 'severity', 'alert_type']
    search_fields = ['title', 'message']
    raw_id_fields = ['product', 'supplier']


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recommendation_type', 'status', 'priority', 'confidence_score', 'created_at']
    list_filter = ['status', 'recommendation_type']
    search_fields = ['title', 'description']
    raw_id_fields = ['product', 'supplier']


@admin.register(Forecast)
class ForecastAdmin(admin.ModelAdmin):
    list_display = ['product', 'forecast_date', 'predicted_demand', 'method', 'confidence_level']
    list_filter = ['method']
    search_fields = ['product__name']
    raw_id_fields = ['product']


@admin.register(DashboardSnapshot)
class DashboardSnapshotAdmin(admin.ModelAdmin):
    list_display = ['snapshot_date', 'total_products', 'low_stock_count', 'out_of_stock_count', 'inventory_value']
    date_hierarchy = 'snapshot_date'
