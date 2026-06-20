""" from django.db import models
from django.utils import timezone
from usuarios.models import Usuario
from residuos.models import Residuo


class Contabilidad(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    fecha = models.DateField(default=timezone.now)
    tipo_residuo = models.ForeignKey(Residuo, on_delete=models.RESTRICT)
    kilos = models.FloatField()
    ganancia_obtenida = models.FloatField()
 """
