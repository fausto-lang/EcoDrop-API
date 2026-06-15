from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    telefono = models.CharField(max_length=20, blank=True)

class residuo(models.Model):
    nombre = models.CharField(max_length=50)
    precio_por_kilo = models.FloatField()

    def __str__(self):
        return self.nombre
    
class contabilidad(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha = models.DateField(default=timezone.now)
    tipo_residuo = models.ForeignKey(residuo, on_delete=models.RESTRICT)
    kilos = models.FloatField()
    ganancia_obtenida = models.FloatField()

    def __str__(self):
        return f"{self.usuario.username} - {self.tipo_residuo.nombre} - {self.fecha}"
    