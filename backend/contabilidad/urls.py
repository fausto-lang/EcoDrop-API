
from django.urls import path
from . import views

urlpatterns = [
    path('registrar/', views.registrar_contabilidad, name='registrar_contabilidad'),
    path('diaria/<uuid:user_id>/', views.contabilidad_diaria, name='contabilidad_diaria'),
    path('ranking/', views.ranking_recicladores, name='ranking_recicladores'),
    path('estadisticas/', views.estadisticas_grafico, name='estadisticas_grafico'),
    path('registrar/', views.registrar_movimiento, name='registrar_movimiento'),
    path('vender/', views.registrar_venta_material, name='registrar_venta_material'),
]