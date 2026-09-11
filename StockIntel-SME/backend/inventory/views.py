from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, F
from django.utils import timezone
from datetime import timedelta

from .models import Supplier, Alert, Recommendation, Forecast, DashboardSnapshot
from .serializers import (
    SupplierSerializer, AlertSerializer, RecommendationSerializer,
    ForecastSerializer, DashboardSnapshotSerializer
)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'country']
    search_fields = ['name', 'contact_person', 'email']
    ordering_fields = ['name', 'reliability_score', 'lead_time_days', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def alerts(self, request, pk=None):
        supplier = self.get_object()
        alerts = supplier.alerts.all()
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.select_related('product', 'supplier', 'created_by').all()
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'severity', 'alert_type', 'product', 'supplier']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'severity', 'status']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        alert = self.get_object()
        if alert.status != 'active':
            return Response(
                {'detail': 'Only active alerts can be acknowledged.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        alert.status = 'acknowledged'
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
        alert.save()
        return Response(AlertSerializer(alert).data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.status = 'resolved'
        alert.resolved_at = timezone.now()
        alert.save()
        return Response(AlertSerializer(alert).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.get_queryset()
        data = {
            'total': qs.count(),
            'active': qs.filter(status='active').count(),
            'by_severity': dict(
                qs.values('severity').annotate(count=Count('id')).values_list('severity', 'count')
            ),
            'by_type': dict(
                qs.values('alert_type').annotate(count=Count('id')).values_list('alert_type', 'count')
            ),
        }
        return Response(data)


class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.select_related('product', 'supplier').all()
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'recommendation_type', 'product', 'supplier']
    search_fields = ['title', 'description']
    ordering_fields = ['priority', 'confidence_score', 'created_at']
    ordering = ['priority', '-created_at']

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        rec = self.get_object()
        rec.status = 'accepted'
        rec.decided_by = request.user
        rec.decided_at = timezone.now()
        rec.save()
        return Response(RecommendationSerializer(rec).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        rec = self.get_object()
        rec.status = 'rejected'
        rec.decided_by = request.user
        rec.decided_at = timezone.now()
        rec.save()
        return Response(RecommendationSerializer(rec).data)

    @action(detail=True, methods=['post'])
    def implement(self, request, pk=None):
        rec = self.get_object()
        rec.status = 'implemented'
        rec.decided_by = request.user
        rec.decided_at = timezone.now()
        rec.save()
        return Response(RecommendationSerializer(rec).data)


class ForecastViewSet(viewsets.ModelViewSet):
    queryset = Forecast.objects.select_related('product').all()
    serializer_class = ForecastSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'method', 'forecast_date']
    ordering_fields = ['forecast_date', 'predicted_demand', 'created_at']
    ordering = ['-forecast_date']

    @action(detail=False, methods=['get'])
    def accuracy_report(self, request):
        qs = self.get_queryset().filter(actual_demand__isnull=False)
        results = []
        for f in qs:
            if f.predicted_demand:
                error = abs(f.actual_demand - f.predicted_demand)
                accuracy = 100 - (error / f.predicted_demand * 100)
                results.append({
                    'id': f.id,
                    'product': f.product_id,
                    'forecast_date': f.forecast_date,
                    'predicted': float(f.predicted_demand),
                    'actual': float(f.actual_demand),
                    'accuracy': round(float(accuracy), 2),
                })
        return Response(results)


class DashboardViewSet(viewsets.ViewSet):
    """
    Aggregated dashboard endpoints.
    Pure analytics - no single model instance required.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Main dashboard overview"""
        from products.models import Product

        today = timezone.now().date()

        total_products = Product.objects.count()
        low_stock = Product.objects.filter(stock_quantity__lte=F('reorder_level')).count()
        out_of_stock = Product.objects.filter(stock_quantity=0).count()

        active_alerts = Alert.objects.filter(status='active').count()
        critical_alerts = Alert.objects.filter(status='active', severity='critical').count()

        pending_recommendations = Recommendation.objects.filter(status='pending').count()
        total_suppliers = Supplier.objects.filter(is_active=True).count()

        inventory_value = (
            Product.objects.aggregate(
                total=Sum(F('stock_quantity') * F('unit_price'))
            )['total'] or 0
        )

        recent_forecasts = Forecast.objects.filter(
            forecast_date__gte=today
        ).order_by('forecast_date')[:10]

        data = {
            'summary': {
                'total_products': total_products,
                'low_stock_count': low_stock,
                'out_of_stock_count': out_of_stock,
                'active_alerts': active_alerts,
                'critical_alerts': critical_alerts,
                'pending_recommendations': pending_recommendations,
                'active_suppliers': total_suppliers,
                'inventory_value': float(inventory_value),
            },
            'alerts_by_severity': dict(
                Alert.objects.filter(status='active')
                .values('severity')
                .annotate(count=Count('id'))
                .values_list('severity', 'count')
            ),
            'recent_forecasts': ForecastSerializer(recent_forecasts, many=True).data,
            'top_pending_recommendations': RecommendationSerializer(
                Recommendation.objects.filter(status='pending').order_by('priority')[:5],
                many=True
            ).data,
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def kpis(self, request):
        """Historical KPI snapshots"""
        snapshots = DashboardSnapshot.objects.all()[:90]
        serializer = DashboardSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generate_snapshot(self, request):
        """Manually trigger a dashboard snapshot (or call from a periodic task)"""
        from products.models import Product

        today = timezone.now().date()
        snapshot, created = DashboardSnapshot.objects.update_or_create(
            snapshot_date=today,
            defaults={
                'total_products': Product.objects.count(),
                'low_stock_count': Product.objects.filter(
                    stock_quantity__lte=F('reorder_level')
                ).count(),
                'out_of_stock_count': Product.objects.filter(stock_quantity=0).count(),
                'total_alerts_active': Alert.objects.filter(status='active').count(),
                'total_suppliers': Supplier.objects.filter(is_active=True).count(),
                'inventory_value': Product.objects.aggregate(
                    total=Sum(F('stock_quantity') * F('unit_price'))
                )['total'] or 0,
            },
        )
        return Response(
            DashboardSnapshotSerializer(snapshot).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
