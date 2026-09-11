"""
Run with: python manage.py shell < sample_data.py
Creates sample categories, products, suppliers, alerts, recommendations & forecasts.
"""
from decimal import Decimal
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from products.models import Category, Product
from inventory.models import Supplier, Alert, Recommendation, Forecast

User = get_user_model()

# Ensure at least one user exists
user, _ = User.objects.get_or_create(
    username='demo',
    defaults={'email': 'demo@example.com', 'is_staff': True}
)
if not user.has_usable_password():
    user.set_password('demo1234')
    user.save()

# Categories
cat_electronics, _ = Category.objects.get_or_create(name='Electronics', defaults={'description': 'Electronic items'})
cat_grocery, _ = Category.objects.get_or_create(name='Grocery', defaults={'description': 'Food & grocery'})
cat_clothing, _ = Category.objects.get_or_create(name='Clothing', defaults={'description': 'Apparel'})

# Products
products_data = [
    {'sku': 'ELEC-001', 'name': 'Wireless Mouse', 'category': cat_electronics, 'unit_price': Decimal('25.00'), 'cost_price': Decimal('12.00'), 'stock_quantity': 45, 'reorder_level': 20},
    {'sku': 'ELEC-002', 'name': 'USB-C Cable', 'category': cat_electronics, 'unit_price': Decimal('9.99'), 'cost_price': Decimal('3.50'), 'stock_quantity': 8, 'reorder_level': 30},
    {'sku': 'GROC-001', 'name': 'Organic Rice 1kg', 'category': cat_grocery, 'unit_price': Decimal('4.50'), 'cost_price': Decimal('2.80'), 'stock_quantity': 120, 'reorder_level': 50},
    {'sku': 'GROC-002', 'name': 'Olive Oil 500ml', 'category': cat_grocery, 'unit_price': Decimal('12.00'), 'cost_price': Decimal('7.00'), 'stock_quantity': 0, 'reorder_level': 15},
    {'sku': 'CLTH-001', 'name': 'Cotton T-Shirt', 'category': cat_clothing, 'unit_price': Decimal('18.00'), 'cost_price': Decimal('8.00'), 'stock_quantity': 5, 'reorder_level': 25},
]

products = []
for data in products_data:
    p, _ = Product.objects.get_or_create(sku=data['sku'], defaults=data)
    products.append(p)

# Suppliers
sup1, _ = Supplier.objects.get_or_create(
    name='TechSource Ltd',
    defaults={
        'contact_person': 'John Smith',
        'email': 'john@techsource.com',
        'phone': '+1-555-0101',
        'country': 'USA',
        'lead_time_days': 5,
        'reliability_score': Decimal('92.50'),
    }
)
sup2, _ = Supplier.objects.get_or_create(
    name='FreshFarm Co',
    defaults={
        'contact_person': 'Maria Garcia',
        'email': 'maria@freshfarm.com',
        'phone': '+1-555-0202',
        'country': 'Spain',
        'lead_time_days': 10,
        'reliability_score': Decimal('87.00'),
    }
)

# Alerts
Alert.objects.get_or_create(
    title='Low stock: USB-C Cable',
    defaults={
        'message': 'Stock is below reorder level (8 remaining, reorder at 30).',
        'alert_type': 'low_stock',
        'severity': 'high',
        'status': 'active',
        'product': products[1],
        'threshold_value': Decimal('30'),
        'current_value': Decimal('8'),
        'created_by': user,
    }
)
Alert.objects.get_or_create(
    title='Out of stock: Olive Oil 500ml',
    defaults={
        'message': 'Product is completely out of stock.',
        'alert_type': 'stock_out',
        'severity': 'critical',
        'status': 'active',
        'product': products[3],
        'created_by': user,
    }
)

# Recommendations
Recommendation.objects.get_or_create(
    title='Reorder USB-C Cable',
    defaults={
        'description': 'Current stock is critically low. Recommended order quantity: 100 units.',
        'recommendation_type': 'reorder',
        'status': 'pending',
        'product': products[1],
        'supplier': sup1,
        'confidence_score': Decimal('95.00'),
        'priority': 1,
        'suggested_action': 'Place PO for 100 units from TechSource Ltd.',
        'created_by': user,
    }
)
Recommendation.objects.get_or_create(
    title='Consider promoting Cotton T-Shirt',
    defaults={
        'description': 'Slow moving item with excess relative to demand.',
        'recommendation_type': 'promote',
        'status': 'pending',
        'product': products[4],
        'confidence_score': Decimal('72.00'),
        'priority': 4,
        'created_by': user,
    }
)

# Forecasts
today = date.today()
for i, product in enumerate(products[:3]):
    Forecast.objects.get_or_create(
        product=product,
        forecast_date=today + timedelta(days=30),
        method='moving_average',
        defaults={
            'predicted_demand': Decimal(str(50 + i * 20)),
            'lower_bound': Decimal(str(40 + i * 15)),
            'upper_bound': Decimal(str(70 + i * 25)),
            'confidence_level': Decimal('85.00'),
            'created_by': user,
        }
    )

print('Sample data created successfully!')
print('Demo user: demo / demo1234')
