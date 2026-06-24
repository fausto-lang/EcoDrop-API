from django.urls import path
from . import views

urlpatterns = [
    path('clasificar/imagen/', views.clasificar_residuo_view,
         name='clasificar_imagen'),
]
