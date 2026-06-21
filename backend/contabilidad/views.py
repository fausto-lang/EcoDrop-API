import json
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Sum
from datetime import date
from .models import Usuario, Contabilidad, Residuo
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def registrar_contabilidad(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            usuario_id = data.get('usuario')
            residuo_id = data.get('tipo_residuo')
            kilos = float(data.get('kilos'))
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
        except residuo.DoesNotExist:
            return JsonResponse({"error": "El tipo de residuo no existe."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


def contabilidad_diaria(request, user_id):
    try:
        usuario = Usuario.objects.get(id=user_id)
        hoy = date.today()
        contabilidad_hoy = Contabilidad.objects.filter(
            usuario=usuario, fecha=hoy)
        total_kilos = 0.0
        total_ganancia = 0.0
        separado_residuos = {}

        for registro in contabilidad_hoy:
            total_kilos += registro.kilos
            total_ganancia += registro.ganancia_obtenida
            tipo_residuo = registro.tipo_residuo.nombre
            if tipo_residuo not in separado_residuos:
                separado_residuos[tipo_residuo] = 0.0
            separado_residuos[tipo_residuo] += registro.kilos

        respuesta = {
            'usuario': usuario.username,
            'fecha': hoy,
            "estadisticas_hoy": {
                'total_kilos': total_kilos,
                'total_ganancia': total_ganancia,
                'residuo_separado': separado_residuos
            }
        }

        return JsonResponse(respuesta)
    except Usuario.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)


def ranking_recicladores(request):
   usuarios_top = Usuario.objects.order_by('-total_reciclado')[:10]
   ranking = []
   
   for usuario in usuarios_top:
        ranking.append({
            'nombre': usuario.nombre,  # Tu amigo usó 'nombre' y no 'username'
            'total_kilos': float(usuario.total_reciclado) 
        })

   return JsonResponse({"ranking": ranking})


def estadisticas_grafico(request):
    hoy = date.today()

    registros_mes = Contabilidad.objects.filter(fecha__month=hoy.month, fecha__year=hoy.year)
    ingresos_mes = registros_mes.filter(tipo_movimiento='INGRESO').aggregate(Sum('kilos'))['kilos__sum'] or 0
    ventas_mes = registros_mes.filter(tipo_movimiento='VENTA').aggregate(Sum('kilos'))['kilos__sum'] or 0
    mermas_mes = registros_mes.filter(tipo_movimiento='MERMA').aggregate(Sum('kilos'))['kilos__sum'] or 0
    ganancia_mes = registros_mes.filter(tipo_movimiento='VENTA').aggregate(Sum('ganancia_obtenida'))['ganancia_obtenida__sum'] or 0

    registros_hoy = Contabilidad.objects.filter(fecha=hoy)
    ingresos_hoy = registros_hoy.filter(tipo_movimiento='INGRESO').aggregate(Sum('kilos'))['kilos__sum'] or 0
    ventas_hoy = registros_hoy.filter(tipo_movimiento='VENTA').aggregate(Sum('kilos'))['kilos__sum'] or 0

    respuesta = {
        "mes_actual": {
            "ingresados_kg": float(ingresos_mes),
            "vendidos_kg": float(ventas_mes),
            "perdidos_kg": float(mermas_mes),
            "ganancia_total": float(ganancia_mes)
        },
        "hoy": {
            "ingresados_kg": float(ingresos_hoy),
            "vendidos_kg": float(ventas_hoy)
        }
    }
    
    return JsonResponse(respuesta)

