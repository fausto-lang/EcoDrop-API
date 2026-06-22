import json  # ✅ CORRECCIÓN #1: faltaba este import

from django.http import JsonResponse
from django.db.models import Sum
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import transaction

from rest_framework.decorators import api_view
from rest_framework.response import Response

from usuarios.models import Usuario
from residuos.models import Residuo
from .models import Contabilidad


@csrf_exempt
def registrar_contabilidad(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            usuario_id = data.get('usuario')
            residuo_id = data.get('tipo_residuo')
            kilos = float(data.get('kilos', 0))

            usuario = Usuario.objects.get(id=usuario_id)
            residuo = Residuo.objects.get(id=residuo_id)
            ganancia = kilos * float(residuo.precio_por_kilo)

            nuevo_registro = Contabilidad(
                usuario=usuario,
                tipo_residuo=residuo,
                kilos=kilos,
                ganancia_obtenida=ganancia
            )
            nuevo_registro.save()

            return JsonResponse({
                "mensaje": "¡Registro guardado con éxito!",
                "ganancia_calculada": ganancia
            }, status=201)

        except Usuario.DoesNotExist:
            return JsonResponse({"error": "El usuario no existe."}, status=404)
        except Residuo.DoesNotExist:
            return JsonResponse({"error": "El tipo de residuo no existe."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def registrar_movimiento(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)

            usuario_id = body.get("usuario_id")
            residuo_id = body.get("residuo_id")
            kilos = float(body.get("kilos", 0))
            residuo = Residuo.objects.get(id=residuo_id)
            precio = float(getattr(residuo, 'precio_por_kilo', 0))
            ganancia = kilos * precio

            nuevo_registro = Contabilidad.objects.create(
                usuario_id=usuario_id,
                tipo_residuo_id=residuo_id,
                kilos=kilos,
                tipo_movimiento='INGRESO',
                ganancia_obtenida=ganancia
            )

            residuo.stock_kg = float(residuo.stock_kg or 0) + kilos
            residuo.save()

            return JsonResponse({"mensaje": "Registro guardado exitosamente", "ganancia": ganancia}, status=201)

        except Residuo.DoesNotExist:
            return JsonResponse({"error": "El residuo seleccionado no existe en el inventario."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


def contabilidad_diaria(request):
    try:
        hoy = timezone.now().date()
        mes_actual = hoy.month
        anio_actual = hoy.year

        # ✅ CORRECCIÓN #3: fecha es DateField, no DateTimeField.
        # Se usa fecha=hoy en vez de fecha__date=hoy
        registros_hoy = Contabilidad.objects.filter(fecha=hoy)
        registros_mes = Contabilidad.objects.filter(
            fecha__month=mes_actual, fecha__year=anio_actual)

        kilos_hoy = registros_hoy.aggregate(total=Sum('kilos'))['total'] or 0
        kilos_mes = registros_mes.aggregate(total=Sum('kilos'))['total'] or 0

        grafico_hoy_data = list(
            registros_hoy.values('tipo_residuo__tipo')
            .annotate(total=Sum('kilos'))
        )

        grafico_mes_data = list(
            registros_mes.values('tipo_residuo__tipo')
            .annotate(total=Sum('kilos'))
        )

        return JsonResponse({
            "totales": {
                "kilos_hoy": round(float(kilos_hoy), 1),
                "kilos_mes": round(float(kilos_mes), 1),
                "reciclado_mes": 0,
                "perdidas_mes": 0,
                "ganancia_mes": 0
            },
            "graficos": {
                "hoy": grafico_hoy_data,
                "mes": grafico_mes_data
            }
        }, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
def estadisticas_grafico(request):
    try:
        hoy = timezone.now().date()
        mes_actual = hoy.month
        anio_actual = hoy.year

        # ✅ fecha es DateField → se filtra directamente
        registros_hoy = Contabilidad.objects.filter(fecha=hoy)
        registros_mes = Contabilidad.objects.filter(
            fecha__month=mes_actual, fecha__year=anio_actual)

        ingresos_mes = registros_mes.filter(
            tipo_movimiento='INGRESO').aggregate(Sum('kilos'))['kilos__sum'] or 0
        ventas_mes = registros_mes.filter(tipo_movimiento='VENTA').aggregate(
            Sum('kilos'))['kilos__sum'] or 0
        perdidas_mes = registros_mes.filter(
            tipo_movimiento='PERDIDA').aggregate(Sum('kilos'))['kilos__sum'] or 0

        ganancia_mes = registros_mes.aggregate(Sum('ganancia_obtenida'))[
            'ganancia_obtenida__sum'] or 0

        ingresos_hoy = registros_hoy.filter(
            tipo_movimiento='INGRESO').aggregate(Sum('kilos'))['kilos__sum'] or 0
        ventas_hoy = registros_hoy.filter(tipo_movimiento='VENTA').aggregate(
            Sum('kilos'))['kilos__sum'] or 0

        datos_hoy = registros_hoy.filter(tipo_movimiento='INGRESO').values(
            'tipo_residuo__tipo').annotate(total=Sum('kilos'))
        datos_mes = registros_mes.filter(tipo_movimiento='INGRESO').values(
            'tipo_residuo__tipo').annotate(total=Sum('kilos'))

        grafico_hoy = [{"residuo__nombre": item['tipo_residuo__tipo']
                        or "Otros", "total": float(item['total'] or 0)} for item in datos_hoy]
        grafico_mes = [{"residuo__nombre": item['tipo_residuo__tipo']
                        or "Otros", "total": float(item['total'] or 0)} for item in datos_mes]

        entregas_hoy_qs = registros_hoy.filter(
            tipo_movimiento='INGRESO').select_related('usuario', 'tipo_residuo')

        lista_entregas_hoy = []
        for reg in entregas_hoy_qs:
            nombre_user = "Anónimo"
            if reg.usuario:
                nombre_user = getattr(reg.usuario, 'nombre',
                                      f"Usuario #{reg.usuario.id}")

            lista_entregas_hoy.append({
                "usuario_nombre": nombre_user,
                "material": reg.tipo_residuo.tipo if reg.tipo_residuo else "Desconocido",
                "kilos": float(reg.kilos or 0)
            })

        respuesta = {
            "mes_actual": {
                "ingresados_kg": float(ingresos_mes),
                "vendidos_kg": float(ventas_mes),
                "perdidos_kg": float(perdidas_mes),
                "ganancia_total": float(ganancia_mes)
            },
            "hoy": {
                "ingresados_kg": float(ingresos_hoy),
                "vendidos_kg": float(ventas_hoy)
            },
            "graficos": {
                "hoy": grafico_hoy,
                "mes": grafico_mes
            },
            "entregas_hoy": lista_entregas_hoy
        }

        return Response(respuesta)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error_interno_servidor": str(e)}, status=500)


@api_view(['POST'])
def registrar_venta_material(request):
    try:
        residuo_id = request.data.get('residuo_id')
        precio_venta_kilo = request.data.get('precio_venta')

        if not residuo_id or precio_venta_kilo is None:
            return Response({"error": "Faltan datos obligatorios"}, status=400)

        precio_venta_kilo = float(precio_venta_kilo)

        with transaction.atomic():
            residuo = Residuo.objects.select_for_update().get(id=residuo_id)

            kilos = float(residuo.stock_kg)

            if kilos <= 0:
                return Response({"error": "Sin stock disponible"}, status=400)

            ganancia = kilos * precio_venta_kilo

            Contabilidad.objects.create(
                tipo_residuo=residuo,
                tipo_movimiento='VENTA',
                kilos=kilos,
                ganancia_obtenida=ganancia,
                usuario=None
            )

            residuo.stock_kg = 0
            residuo.save()

        return Response({
            "mensaje": "Venta registrada",
            "kilos_vendidos": kilos,
            "stock_final": 0,
            "ganancia": ganancia
        })

    except Residuo.DoesNotExist:
        return Response({"error": "Residuo no existe"}, status=404)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
