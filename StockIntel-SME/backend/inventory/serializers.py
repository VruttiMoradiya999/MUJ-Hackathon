from rest_framework import serializers
from .models import Supplier, Alert, Recommendation, Forecast, DashboardSnapshot


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone', 'address',
            'country', 'lead_time_days', 'reliability_score', 'is_active',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AlertSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)

    class Meta:
        model = Alert
        fields = [
            'id', 'title', 'message', 'alert_type', 'alert_type_display',
            'severity', 'severity_display', 'status', 'status_display',
            'product', 'product_name', 'supplier', 'supplier_name',
            'threshold_value', 'current_value',
            'created_by', 'acknowledged_by', 'acknowledged_at', 'resolved_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'acknowledged_at', 'resolved_at']


class RecommendationSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    recommendation_type_display = serializers.CharField(
        source='get_recommendation_type_display', read_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Recommendation
        fields = [
            'id', 'title', 'description', 'recommendation_type', 'recommendation_type_display',
            'status', 'status_display', 'product', 'product_name',
            'supplier', 'supplier_name', 'confidence_score', 'expected_impact',
            'suggested_action', 'priority', 'valid_until',
            'created_by', 'decided_by', 'decided_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'decided_at']


class ForecastSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    accuracy = serializers.SerializerMethodField()

    class Meta:
        model = Forecast
        fields = [
            'id', 'product', 'product_name', 'forecast_date',
            'predicted_demand', 'lower_bound', 'upper_bound', 'actual_demand',
            'method', 'method_display', 'confidence_level', 'accuracy',
            'notes', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_accuracy(self, obj):
        if obj.actual_demand is not None and obj.predicted_demand:
            error = abs(obj.actual_demand - obj.predicted_demand)
            return round(float(100 - (error / obj.predicted_demand * 100)), 2)
        return None


class DashboardSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardSnapshot
        fields = '__all__'
