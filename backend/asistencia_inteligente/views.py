from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .services import AsistenciaInteligenteService
import os


@csrf_exempt
def clasificar_residuo_view(request):
    if request.method == 'POST':
        if 'imagen' not in request.FILES:
            return JsonResponse({'error': 'No se proporcionó ninguna imagen'}, status=400)

        imagen = request.FILES['imagen']

        ruta_temporal = default_storage.save(
            f'tmp/{imagen.name}', ContentFile(imagen.read()))
        ruta_absoluta = os.path.join(default_storage.location, ruta_temporal)

        try:
            resultado = AsistenciaInteligenteService.clasificar_por_imagen(
                ruta_absoluta)
            return JsonResponse(resultado, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Error al procesar la IA: {str(e)}'}, status=500)

        finally:
            if os.path.exists(ruta_absoluta):
                os.remove(ruta_absoluta)

    return JsonResponse({'error': 'Método no permitido. Usa POST.'}, status=405)


@csrf_exempt
def clasificar_residuo_voz_view(request):
    if request.method == 'POST':
        if 'audio' not in request.FILES:
            return JsonResponse({'error': 'No se proporcionó ningún audio'}, status=400)

        audio = request.FILES['audio']

        nombre_archivo = f"audio_{audio.name}" if '.' in audio.name else f"audio_{audio.name}.webm"

        ruta_temporal = default_storage.save(
            f'tmp/{nombre_archivo}', ContentFile(audio.read()))
        ruta_absoluta = os.path.join(default_storage.location, ruta_temporal)

        try:
            resultado = AsistenciaInteligenteService.clasificar_por_voz(
                ruta_absoluta)
            return JsonResponse(resultado, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Error al procesar la IA: {str(e)}'}, status=500)

        finally:
            if os.path.exists(ruta_absoluta):
                os.remove(ruta_absoluta)

    return JsonResponse({'error': 'Método no permitido. Usa POST.'}, status=405)
