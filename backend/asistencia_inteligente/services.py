import os
import json
from Eco_tools.src.ia import inicializar, generar_respuesta
from residuos.models import Residuo


class AsistenciaInteligenteService:

    @staticmethod
    def clasificar_por_imagen(ruta_image_local) -> dict:
        if not os.path.exists(ruta_image_local):
            return {"error": f"El archivo de imagen no existe: {ruta_image_local}"}

        residuos_db = Residuo.objects.all()

        mapeo_categorias = {r.tipo.lower().strip(): str(r.id)
                            for r in residuos_db}

        opciones_explicitas = ", ".join([r.tipo for r in residuos_db])

        cliente, modelo = inicializar()

        prompt = (
            "Analiza detalladamente la imagen de este residuo.\n"
            f"1. Identifica cuál de las siguientes categorías se menciona: [{opciones_explicitas}]. "
            "si se trata de algo parecido por ejemplo una botella de vidrio entonces lo asocias al tipo especifico que tienes en las opciones tal cual no le colocas tildes ni nada mas .\n"
            "Tu respuesta para 'categoria_detectada' debe ser estrictamente una de esas opciones.\n"
            "escrita exactamente igual.\n\n"
            "Responde ÚNICAMENTE un objeto JSON con la estructura exacta, sin bloques markdown:\n"
            '{"categoria_detectada": "nombre_de_la_categoria", "peso_estimado": "peso_estimado_double"}'
        )

        resultado = generar_respuesta(
            cliente, modelo, prompt, archivos=[ruta_image_local])

        if resultado["estado"] == "success":
            try:
                raw_text = resultado.get(
                    "texto") or resultado.get("text") or ""
                texto_limpio = raw_text.replace(
                    "```json", "").replace("```", "").strip()
                ans_json = json.loads(texto_limpio)

                detectado = ans_json.get(
                    "categoria_detectada", "").lower().strip()
                residuo_id = mapeo_categorias.get(detectado)

                if residuo_id:
                    return {"residuo_id": residuo_id}
                else:
                    return {"error": f"La IA detectó '{ans_json.get('categoria_detectada')}', pero no coincide exactamente con tus categorías predefinidas."}
            except Exception:
                return {"error_parsing": "Error al parsear el JSON de la IA."}
        else:
            return {"error": f"Error en la IA: {resultado.get('error')}"}

    @staticmethod
    def clasificar_por_voz(ruta_audio_local) -> dict:
        if not os.path.exists(ruta_audio_local):
            return {"error": f"El archivo de audio no existe: {ruta_audio_local}"}

        residuos_db = Residuo.objects.all()

        mapeo_categorias = {r.tipo.lower().strip(): str(r.id)
                            for r in residuos_db}

        opciones_explicitas = ", ".join([r.tipo for r in residuos_db])

        cliente, modelo = inicializar()

        prompt = (
            "Escucha atentamente el audio adjunto donde el usuario menciona un residuo y su peso.\n"
            f"1. Identifica cuál de las siguientes categorías se menciona: [{opciones_explicitas}]. "
            "si se trata de algo parecido por ejemplo una botella de vidrio entonces lo asocias al tipo especifico que tienes en las opciones tal cual no le colocas tildes ni nada mas .\n"
            "Tu respuesta para 'tipo' debe ser estrictamente una de esas opciones.\n"
            "2. Extrae la cantidad numérica de peso mencionada en kilogramos.\n\n"
            "Responde ÚNICAMENTE un objeto JSON con la estructura exacta, sin bloques markdown:\n"
            '{"tipo": "nombre_de_la_categoria", "cantidad_kg": 0.00}'
        )

        resultado = generar_respuesta(
            cliente, modelo, prompt, archivos=[ruta_audio_local])

        if resultado["estado"] == "success":
            try:
                raw_text = resultado.get(
                    "texto") or resultado.get("text") or ""
                texto_limpio = raw_text.replace(
                    "```json", "").replace("```", "").strip()
                ans_json = json.loads(texto_limpio)

                # ✅ CORRECCIÓN #2: el prompt usa 'tipo', no 'categoria_detectada'
                # Antes siempre era "" y nunca encontraba el residuo
                detectado = ans_json.get("tipo", "").lower().strip()
                residuo_id = mapeo_categorias.get(detectado)

                if residuo_id:
                    respuesta_voz = {"residuo_id": residuo_id}
                    try:
                        respuesta_voz["cantidad_kg"] = float(
                            ans_json.get("cantidad_kg", 0.0))
                    except (ValueError, TypeError):
                        respuesta_voz["cantidad_kg"] = ""

                    return respuesta_voz
                else:
                    return {"error": f"La IA detectó '{ans_json.get('tipo')}', pero no coincide exactamente con tus categorías predefinidas."}
            except Exception:
                return {"error_parsing": "Error al parsear el JSON de la IA."}
        else:
            return {"error": f"Error en la IA: {resultado.get('error')}"}
