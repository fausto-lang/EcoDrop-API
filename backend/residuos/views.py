from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import Residuo
import traceback


def safe_decimal(value, default=0):
    try:
        if value is None or value == "":
            return default
        return float(value)
    except:
        return default


def safe_iso(date):
    return date.isoformat() if date else None


@csrf_exempt
def lista_residuos(request):
    if request.method == "GET":
        try:
            residuos = Residuo.objects.all()
            data = []

            for r in residuos:
                data.append({
                    "id": r.id,
                    "tipo": r.tipo,
                    "descripcion": r.descripcion,
                    "precio_por_kilo": safe_decimal(r.precio_por_kilo),
                    "stock_kg": safe_decimal(r.stock_kg),
                    "reciclable": r.reciclable,
                    "fecha_registro": safe_iso(r.fecha_registro),
                    "fecha_actualizacion": safe_iso(r.fecha_actualizacion),
                })

            return JsonResponse(data, safe=False)

        except Exception as e:
            print(traceback.format_exc())

            return JsonResponse({
                "error": str(e),
                "detalle": traceback.format_exc()
            }, status=500)
    elif request.method == "POST":
        try:
            body = json.loads(request.body)

            residuo = Residuo.objects.create(
                tipo=body.get("tipo", ""),
                descripcion=body.get("descripcion", ""),
                precio_por_kilo=safe_decimal(body.get("precio_por_kilo")),
                stock_kg=0,
                reciclable=body.get("reciclable", False),
            )

            return JsonResponse({
                "mensaje": "Residuo creado correctamente",
                "id": residuo.id
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=400)

    return JsonResponse({
        "error": "Método no permitido"
    }, status=405)


@csrf_exempt
def detalle_residuo(request, id):
    try:
        residuo = Residuo.objects.get(id=id)
    except Residuo.DoesNotExist:
        return JsonResponse({
            "error": "Residuo no encontrado"
        }, status=404)

    if request.method == "PUT":
        try:
            body = json.loads(request.body)

            residuo.tipo = body.get("tipo", residuo.tipo)
            residuo.descripcion = body.get(
                "descripcion",
                residuo.descripcion
            )
            residuo.precio_por_kilo = safe_decimal(
                body.get(
                    "precio_por_kilo",
                    residuo.precio_por_kilo
                )
            )
            residuo.stock_kg = safe_decimal(
                body.get(
                    "stock_kg",
                    residuo.stock_kg
                )
            )
            residuo.reciclable = body.get(
                "reciclable",
                residuo.reciclable
            )

            residuo.save()

            return JsonResponse({
                "mensaje": "Residuo actualizado correctamente",
                "id": residuo.id
            })

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=400)

    if request.method == "DELETE":
        residuo.delete()

        return JsonResponse({
            "mensaje": "Residuo eliminado correctamente"
        })

    return JsonResponse({
        "error": "Método no permitido"
    }, status=405)
