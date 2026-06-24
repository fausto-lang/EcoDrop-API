from django.urls import path
from . import views

urlpatterns = [
    path('clasificar/imagen/', views.clasificar_residuo_view,
         name='clasificar_imagen'),
    path('clasificar/voz/', views.clasificar_residuo_voz_view, name='clasificar_voz'),
]
