from django.db import models
from django.conf import settings
from decimal import Decimal


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    quoted_lead_time_days = models.PositiveIntegerField(null=True, blank=True)
    learned_lead_time_days = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    STATUS_CHOICES = [("ACTIVE", "Active"), ("INACTIVE", "Inactive")]

    product_code = models.CharField(max_length=20, unique=True)
    barcode = models.CharField(max_length=64, unique=True, null=True, blank=True, db_index=True)
    sku = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=100, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reserved_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_level = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    primary_supplier = models.ForeignKey(
        Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    minimum_order_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_perishable = models.BooleanField(default=False)
    shelf_life_days = models.PositiveIntegerField(null=True, blank=True)
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True, help_text="External image URL")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.product_code:
            last = Product.objects.order_by("-id").first()
            next_id = (last.id + 1) if last else 1
            self.product_code = f"P{next_id:03d}"
        super().save(*args, **kwargs)

    def get_image_url(self):
        if self.image:
            return self.image.url
        if self.image_url:
            return self.image_url
        return None

    def __str__(self):
        return f"{self.product_code} - {self.name}"


class Sale(models.Model):
    PAYMENT_CHOICES = [
        ("CASH", "Cash"),
        ("CARD", "Card"),
        ("UPI", "UPI"),
        ("OTHER", "Other"),
    ]
    STATUS_CHOICES = [
        ("PAID", "Paid"),
        ("CANCELLED", "Cancelled"),
    ]

    sale_number = models.CharField(max_length=20, unique=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PAID")
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default="CASH")
    customer_name = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.sale_number:
            last = Sale.objects.order_by("-id").first()
            next_id = (last.id + 1) if last else 1
            self.sale_number = f"SL-{next_id:06d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.sale_number


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="sale_items")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product.sku} x {self.quantity}"