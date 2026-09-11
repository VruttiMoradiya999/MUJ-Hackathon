from django.core.management.base import BaseCommand
from products.models import Supplier, Product
from decimal import Decimal


class Command(BaseCommand):
    help = "Seed 10 demo products with suppliers and image URLs"

    def handle(self, *args, **options):
        Product.objects.all().delete()
        Supplier.objects.all().delete()

        s1 = Supplier.objects.create(
            name="FreshFarms Dairy",
            contact_person="Ravi Kumar",
            phone="+91-9876543210",
            email="orders@freshfarms.in",
            quoted_lead_time_days=2,
        )
        s2 = Supplier.objects.create(
            name="Grocery Wholesale Co",
            contact_person="Priya Sharma",
            phone="+91-9123456780",
            email="sales@gwc.com",
            quoted_lead_time_days=5,
        )
        s3 = Supplier.objects.create(
            name="Spice Route Traders",
            contact_person="Amit Patel",
            phone="+91-9988776655",
            quoted_lead_time_days=7,
        )
        s4 = Supplier.objects.create(
            name="HomeCare Distributors",
            contact_person="Sneha Reddy",
            phone="+91-9000112233",
            quoted_lead_time_days=4,
        )

        # Using free placeholder product-style images from picsum / loremflickr / similar
        products = [
            {
                "sku": "MILK-1L",
                "name": "Amul Taaza Milk 1L",
                "brand": "Amul",
                "category": "Dairy",
                "cost_price": Decimal("48.00"),
                "selling_price": Decimal("56.00"),
                "current_stock": Decimal("120"),
                "reserved_stock": Decimal("8"),
                "reorder_level": Decimal("40"),
                "primary_supplier": s1,
                "minimum_order_quantity": Decimal("24"),
                "is_perishable": True,
                "shelf_life_days": 5,
                "barcode": "8901030865123",
                "image_url": "https://picsum.photos/seed/milk1l/400/400",
            },
            {
                "sku": "RICE-5KG",
                "name": "India Gate Basmati Rice 5kg",
                "brand": "India Gate",
                "category": "Grains",
                "cost_price": Decimal("420.00"),
                "selling_price": Decimal("499.00"),
                "current_stock": Decimal("35"),
                "reserved_stock": Decimal("2"),
                "reorder_level": Decimal("15"),
                "primary_supplier": s2,
                "minimum_order_quantity": Decimal("10"),
                "barcode": "8901491101234",
                "image_url": "https://picsum.photos/seed/rice5kg/400/400",
            },
            {
                "sku": "OIL-1L",
                "name": "Fortune Sunflower Oil 1L",
                "brand": "Fortune",
                "category": "Oils",
                "cost_price": Decimal("135.00"),
                "selling_price": Decimal("159.00"),
                "current_stock": Decimal("80"),
                "reserved_stock": Decimal("5"),
                "reorder_level": Decimal("30"),
                "primary_supplier": s2,
                "minimum_order_quantity": Decimal("12"),
                "barcode": "8901030123456",
                "image_url": "https://picsum.photos/seed/oil1l/400/400",
            },
            {
                "sku": "TEA-250G",
                "name": "Tata Tea Gold 250g",
                "brand": "Tata",
                "category": "Beverages",
                "cost_price": Decimal("95.00"),
                "selling_price": Decimal("115.00"),
                "current_stock": Decimal("55"),
                "reserved_stock": Decimal("0"),
                "reorder_level": Decimal("20"),
                "primary_supplier": s3,
                "minimum_order_quantity": Decimal("24"),
                "barcode": "8901030865999",
                "image_url": "https://picsum.photos/seed/tea250/400/400",
            },
            {
                "sku": "SOAP-100G",
                "name": "Dove Beauty Bar 100g",
                "brand": "Dove",
                "category": "Personal Care",
                "cost_price": Decimal("42.00"),
                "selling_price": Decimal("55.00"),
                "current_stock": Decimal("200"),
                "reserved_stock": Decimal("15"),
                "reorder_level": Decimal("50"),
                "primary_supplier": s4,
                "minimum_order_quantity": Decimal("48"),
                "barcode": "8901030123999",
                "image_url": "https://picsum.photos/seed/soap100/400/400",
            },
            {
                "sku": "BREAD-400G",
                "name": "Britannia Whole Wheat Bread 400g",
                "brand": "Britannia",
                "category": "Bakery",
                "cost_price": Decimal("38.00"),
                "selling_price": Decimal("45.00"),
                "current_stock": Decimal("28"),
                "reserved_stock": Decimal("4"),
                "reorder_level": Decimal("20"),
                "primary_supplier": s1,
                "minimum_order_quantity": Decimal("12"),
                "is_perishable": True,
                "shelf_life_days": 4,
                "barcode": "8901063123456",
                "image_url": "https://picsum.photos/seed/bread400/400/400",
            },
            {
                "sku": "ATTA-5KG",
                "name": "Aashirvaad Whole Wheat Atta 5kg",
                "brand": "Aashirvaad",
                "category": "Grains",
                "cost_price": Decimal("245.00"),
                "selling_price": Decimal("289.00"),
                "current_stock": Decimal("42"),
                "reserved_stock": Decimal("3"),
                "reorder_level": Decimal("18"),
                "primary_supplier": s2,
                "minimum_order_quantity": Decimal("8"),
                "barcode": "8901030865111",
                "image_url": "https://picsum.photos/seed/atta5kg/400/400",
            },
            {
                "sku": "DETERGENT-1KG",
                "name": "Surf Excel Matic 1kg",
                "brand": "Surf Excel",
                "category": "Household",
                "cost_price": Decimal("185.00"),
                "selling_price": Decimal("220.00"),
                "current_stock": Decimal("65"),
                "reserved_stock": Decimal("6"),
                "reorder_level": Decimal("25"),
                "primary_supplier": s4,
                "minimum_order_quantity": Decimal("12"),
                "barcode": "8901030123888",
                "image_url": "https://picsum.photos/seed/detergent1/400/400",
            },
            {
                "sku": "BISCUIT-200G",
                "name": "Parle-G Glucose Biscuits 200g",
                "brand": "Parle",
                "category": "Snacks",
                "cost_price": Decimal("18.00"),
                "selling_price": Decimal("25.00"),
                "current_stock": Decimal("150"),
                "reserved_stock": Decimal("10"),
                "reorder_level": Decimal("60"),
                "primary_supplier": s3,
                "minimum_order_quantity": Decimal("48"),
                "barcode": "8901030123777",
                "image_url": "https://picsum.photos/seed/biscuit200/400/400",
            },
            {
                "sku": "SHAMPOO-180ML",
                "name": "Clinic Plus Shampoo 180ml",
                "brand": "Clinic Plus",
                "category": "Personal Care",
                "cost_price": Decimal("78.00"),
                "selling_price": Decimal("99.00"),
                "current_stock": Decimal("48"),
                "reserved_stock": Decimal("2"),
                "reorder_level": Decimal("20"),
                "primary_supplier": s4,
                "minimum_order_quantity": Decimal("24"),
                "barcode": "8901030123666",
                "image_url": "https://picsum.photos/seed/shampoo180/400/400",
            },
        ]

        for p in products:
            Product.objects.create(**p)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {Supplier.objects.count()} suppliers and {Product.objects.count()} products with images"
            )
        )
