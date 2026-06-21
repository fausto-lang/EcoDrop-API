from django.db import models
from django.utils import timezone
from usuarios.models import Usuario
from residuos.models import Residuo


class Contabilidad(models.Model):
    TIPO_MOVIMIENTO = [
        ('INGRESO', 'Ingreso de material'),
        ('VENTA', 'Material reciclado/vendido'),
        ('PERDIDA', 'Pérdida o desperdicio')
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    tipo_residuo = models.ForeignKey(Residuo, on_delete=models.RESTRICT)
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO, default='INGRESO')
    kilos = models.DecimalField(max_digits=10, decimal_places=2)
    ganancia_obtenida = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    fecha = models.DateField(default=timezone.now) 
    
    def __str__(self):
        return f"{self.tipo_movimiento} | {self.kilos}kg - {self.tipo_residuo.tipo}"

