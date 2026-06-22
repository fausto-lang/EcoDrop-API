from django.urls import path
from . import views

urlpatterns = [
    path('clasificar/imagen/', views.clasificar_imagen_view, name='asistencia_clasificar_imagen'),
    path('clasificar/voz/', views.clasificar_voz_view, name='asistencia_clasificar_voz'),
]