import json
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Sum
from datetime import date
from .models import User, contabilidad, residuo
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def registrar_contabilidad(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            usuario_id = data.get('usuario')
            residuo_id = data.get('tipo_residuo')
            kilos = float(data.get('kilos'))
            usuario = User.objects.get(id=usuario_id)
            residuo = residuo.objects.get(id=residuo_id)
            ganancia = kilos * float(residuo.precio_por_kilo)

            nuevo_registro = contabilidad(
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

        except User.DoesNotExist:
            return JsonResponse({"error": "El usuario no existe."}, status=404)
        except residuo.DoesNotExist:
            return JsonResponse({"error": "El tipo de residuo no existe."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


def contabilidad_diaria(request, user_id):
    try:
        usuario = User.objects.get(id=user_id)
        hoy = date.today()
        contabilidad_hoy = contabilidad.objects.filter(
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
        else:
            separado_residuos[tipo_residuo] = registro.kilos

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
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)


def ranking_recicladores(request):
    ususarios = User.objects.all()
    ranking = []
    for usuario in ususarios:
        total_kilos = contabilidad.objects.filter(
            usuario=usuario).aggregate(Sum('kilos'))['kilos__sum'] or 0
        ranking.append({
            'username': usuario.username,
            'total_kilos': total_kilos})

    ordenado = sorted(ranking, key=lambda x: x['total_kilos'], reverse=True)
    return JsonResponse({"ranking": ordenado[:10]})


def estadisticas_grafico(request):
    hoy = date.today()
    total_kilos = contabilidad.objects.filter(
        fecha=hoy).aggregate(Sum('kilos'))['kilos__sum'] or 0
    total_ganancia = contabilidad.objects.aggregate(Sum('ganancia_obtenida'))[
        'ganancia_obtenida__sum'] or 0

    kilos_hoy = contabilidad.objects.filter(
        fecha=hoy).aggregate(Sum('kilos'))['kilos__sum'] or 0
    kilos_mes = contabilidad.objects.filter(
        fecha__month=hoy.month).aggregate(Sum('kilos'))['kilos__sum'] or 0

    regristris = contabilidad.objects.all()
    categorias = {}
    for registro in regristris:
        tipo_residuo = registro.tipo_residuo.nombre
        if tipo_residuo in categorias:
            categorias[tipo_residuo]['kilos'] += registro.kilos
            categorias[tipo_residuo]['ganancia'] += registro.ganancia_obtenida
        else:
            categorias[tipo_residuo] = {
                'kilos': registro.kilos,
                'ganancia': registro.ganancia_obtenida
            }
    respuesta = {
        "control": {
            "total_kilos": total_kilos,
            "total_ganancia": total_ganancia,
        },
        "comparacion": {
            "recoleccion_hoy": kilos_hoy,
            "recolectados_del_mes": kilos_mes
        },
        "grafica": categorias
    }
    return JsonResponse(respuesta)
