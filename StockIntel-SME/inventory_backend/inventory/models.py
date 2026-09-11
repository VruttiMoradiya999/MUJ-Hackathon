from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal

User = get_user_model()


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    lead_time_days = models.PositiveIntegerField(default=7)
    reliability_score = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('80.00'))
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    TYPE_CHOICES = [
        ('stock_out', 'Stock Out'),
        ('low_stock', 'Low Stock'),
        ('overstock', 'Overstock'),
        ('expiry', 'Expiry Warning'),
        ('supplier_delay', 'Supplier Delay'),
        ('forecast_deviation', 'Forecast Deviation'),
        ('price_change', 'Price Change'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    alert_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='other')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    product = models.ForeignKey(
        'products.Product', on_delete=models.CASCADE, null=True, blank=True, related_name='alerts'
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='alerts'
    )
    threshold_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledged_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='acknowledged_alerts'
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_severity_display()} - {self.title}'


class Recommendation(models.Model):
    TYPE_CHOICES = [
        ('reorder', 'Reorder Suggestion'),
        ('price_adjust', 'Price Adjustment'),
        ('supplier_switch', 'Supplier Switch'),
        ('stock_transfer', 'Stock Transfer'),
        ('discontinue', 'Discontinue Product'),
        ('promote', 'Promote Product'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('implemented', 'Implemented'),
        ('expired', 'Expired'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    recommendation_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    product = models.ForeignKey(
        'products.Product', on_delete=models.CASCADE, null=True, blank=True, related_name='recommendations'
    )
    supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='recommendations'
    )
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('70.00'))
    expected_impact = models.TextField(blank=True)
    suggested_action = models.TextField(blank=True)
    priority = models.PositiveIntegerField(default=5)  # 1 = highest
    valid_until = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    decided_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='decided_recommendations'
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', '-created_at']

    def __str__(self):
        return self.title


class Forecast(models.Model):
    METHOD_CHOICES = [
        ('moving_average', 'Moving Average'),
        ('exponential_smoothing', 'Exponential Smoothing'),
        ('linear_regression', 'Linear Regression'),
        ('arima', 'ARIMA'),
        ('ml_model', 'ML Model'),
        ('manual', 'Manual'),
    ]

    product = models.ForeignKey(
        'products.Product', on_delete=models.CASCADE, related_name='forecasts'
    )
    forecast_date = models.DateField()
    predicted_demand = models.DecimalField(max_digits=12, decimal_places=2)
    lower_bound = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    upper_bound = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_demand = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    method = models.CharField(max_length=50, choices=METHOD_CHOICES, default='moving_average')
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('80.00'))
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-forecast_date']
        unique_together = ['product', 'forecast_date', 'method']

    def __str__(self):
        return f'{self.product} - {self.forecast_date} ({self.predicted_demand})'


class DashboardSnapshot(models.Model):
    """Store periodic dashboard KPIs for historical charts"""
    snapshot_date = models.DateField(unique=True)
    total_products = models.PositiveIntegerField(default=0)
    low_stock_count = models.PositiveIntegerField(default=0)
    out_of_stock_count = models.PositiveIntegerField(default=0)
    total_alerts_active = models.PositiveIntegerField(default=0)
    total_suppliers = models.PositiveIntegerField(default=0)
    inventory_value = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-snapshot_date']

    def __str__(self):
        return f'Dashboard Snapshot - {self.snapshot_date}'
