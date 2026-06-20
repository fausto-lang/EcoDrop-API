import uuid
from django.db import models


class Residuo(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    tipo = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True)
    precio_por_kilo = models.DecimalField(max_digits=10, decimal_places=2)
    stock_kg = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reciclable = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
