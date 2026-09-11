from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'
    verbose_name = 'Inventory Management'

    def ready(self):
        from . import signals  # noqa: F401 — connects the post_save receiver