from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .services import AsistenciaInteligenteService

@csrf_exempt
def clasificar_imagen_view(request):
    """
    Endpoint para procesar la captura de la cámara web enviada por el frontend.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido. Use POST.'}, status=405)
        
    imagen_archivo = request.FILES.get('imagen')
    if not imagen_archivo:
        return JsonResponse({'error': 'No se proporcionó ninguna imagen en la petición.'}, status=400)
        
    ruta_temporal = default_storage.save(f'tmp/{imagen_archivo.name}', ContentFile(imagen_archivo.read()))
    ruta_completa = default_storage.path(ruta_temporal)
    
    try:
        resultado = AsistenciaInteligenteService.clasificar_por_imagen(ruta_completa)
        return JsonResponse(resultado, safe=False)
    finally:
        if os.path.exists(ruta_completa):
            os.remove(ruta_completa)


@csrf_exempt
def clasificar_voz_view(request):
    """
    Endpoint para recibir el flujo de audio del micrófono y remover muletillas antes de clasificar.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido. Use POST.'}, status=405)
        
    audio_archivo = request.FILES.get('audio')
    if not audio_archivo:
        return JsonResponse({'error': 'No se proporcionó ningún archivo de audio.'}, status=400)
        
    ruta_temporal = default_storage.save(f'tmp/{audio_archivo.name}', ContentFile(audio_archivo.read()))
    ruta_completa = default_storage.path(ruta_temporal)
    
    try:
        resultado = AsistenciaInteligenteService.clasificar_por_voz(ruta_completa)
        return JsonResponse(resultado, safe=False)
    finally:
        if os.path.exists(ruta_completa):
            os.remove(ruta_completa)