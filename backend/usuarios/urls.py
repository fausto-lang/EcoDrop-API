from django.urls import path
from . import views

urlpatterns = [
    path('usuarios/', views.lista_usuarios),
    path("usuarios/ranking/", views.ranking_recicladores),
    path("usuarios/<uuid:id>/", views.detalle_usuario),
]
