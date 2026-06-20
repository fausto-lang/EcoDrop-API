from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import Usuario
import traceback


@csrf_exempt
def lista_usuarios(request):
    if request.method == "GET":
        try:
            usuarios = Usuario.objects.all()

            data = []
            for u in usuarios:
                data.append({
                    "id": u.id,
                    "nombre": u.nombre,
                    "total_reciclado": float(u.total_reciclado),
                })

            return JsonResponse(data, safe=False)

        except Exception as e:
            return JsonResponse({
                "error": str(e),
                "detalle": traceback.format_exc()
            }, status=500)

    elif request.method == "POST":
        try:
            body = json.loads(request.body)

            usuario = Usuario.objects.create(
                nombre=body.get("nombre", ""),
                total_reciclado=body.get("total_reciclado", 0)
            )

            return JsonResponse({
                "mensaje": "Usuario creado correctamente",
                "id": usuario.id
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=400)

    return JsonResponse({
        "error": "Método no permitido"
    }, status=405)


@csrf_exempt
def detalle_usuario(request, id):
    try:
        usuario = Usuario.objects.get(id=id)

    except Usuario.DoesNotExist:
        return JsonResponse({
            "error": "Usuario no encontrado"
        }, status=404)

    if request.method == "PUT":
        try:
            body = json.loads(request.body)

            usuario.nombre = body.get(
                "nombre",
                usuario.nombre
            )

            usuario.total_reciclado = body.get(
                "total_reciclado",
                usuario.total_reciclado
            )

            usuario.save()

            return JsonResponse({
                "mensaje": "Usuario actualizado correctamente",
                "id": usuario.id
            })

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=400)

    elif request.method == "DELETE":
        usuario.delete()

        return JsonResponse({
            "mensaje": "Usuario eliminado correctamente"
        })

    return JsonResponse({
        "error": "Método no permitido"
    }, status=405)
