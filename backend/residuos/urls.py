from django.urls import path
from . import views

urlpatterns = [
    path('residuos/', views.lista_residuos),
    path("residuos/<uuid:id>/", views.detalle_residuo),
]
