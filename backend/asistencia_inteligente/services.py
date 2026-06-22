import os
import json
from Eco_tools.src.ia import inicializar, generar_respuesta
from Eco_tools.src.gramatica import normalizar_texto, verificar_estructura_basica  

class AsistenciaInteligenteService:
    
    @staticmethod
    def clasificar_por_imagen(ruta_imagen_local) -> dict:
        """
        Toma la foto enviada desde el frontend
        y usa el módulo de IA para clasificarla y asignarle un valor.
        """
        cliente, modelo = inicializar()
        
        prompt = (
            "Analiza detalladamente la imagen de este residuo. "
            "Determina el tipo de material predominante (Plástico, Vidrio, Papel/Cartón, Orgánico o No reciclable) "
            "y calcula un valor económico estimado o un puntaje aproximado de reciclaje. "
            "Responde ÚNICAMENTE un objeto JSON con esta estructura exacta, sin bloques de código markdown: "
            '{"material": "tipo", "valor_estimado": 0.00, "confianza": "alta|media|baja"}'
        )
        
        resultado = generar_respuesta(cliente, modelo, prompt, archivos=[ruta_imagen_local])
        
        if resultado["estado"] == "success":
            try:
                texto_limpio = resultado["texto"].replace("```json", "").replace("```", "").strip()
                return json.loads(texto_limpio)
            except json.JSONDecodeError:
                return {
                    "material": "No identificado",
                    "valor_estimado": 0.0,
                    "error_parsing": "La IA no devolvió un JSON válido",
                    "raw_text": resultado["texto"]
                }
        else:
            return {"error": f"Error en el módulo de IA: {resultado['errores']}"}

    @staticmethod
    def clasificar_por_voz(ruta_audio_local) -> dict:
        """
        Recibe el archivo de audio grabado desde el micrófono del navegador frontend.
        Usa la IA multimodal de pibble para escuchar el audio, identificar el residuo mencionado,
        evaluar si contiene muletillas e imprecisiones, y retornar los datos limpios.
        """
        cliente, modelo = inicializar()
        
        prompt = (
            "Escucha atentamente el audio adjunto donde el usuario menciona un objeto a reciclar. "
            "1. Transcribe lo que dice.\n"
            "2. Analiza si el usuario usa muletillas de duda (ej. 'ehh', 'mmm', 'este', 'bueno...').\n"
            "3. Clasifica el objeto en una categoría de reciclaje y asígnale un valor estimado.\n"
            "Devuelve la respuesta ÚNICAMENTE en este formato JSON estricto:\n"
            '{"texto_original": "transcripción completa", '
            '"tiene_muletillas": true|false, '
            '"material": "Plástico|Vidrio|Cartón|Orgánico|No reciclable", '
            '"valor_estimado": 0.00}'
        )
        
        resultado = generar_respuesta(cliente, modelo, prompt, archivos=[ruta_audio_local])
        
        if resultado["estado"] == "success":
            try:
                texto_limpio = resultado["texto"].replace("```json", "").replace("```", "").strip()
                data_ia = json.loads(texto_limpio)
                
                texto_transcrito = data_ia.get("texto_original", "")
                data_ia["analisis_texto_base"] = normalizar_texto(texto_transcrito)
                
                return data_ia
            except json.JSONDecodeError:
                return {
                    "error_parsing": "La IA no estructuró la respuesta de voz en JSON",
                    "raw_text": resultado["texto"]
                }
        else:
            return {"error": f"Error procesando audio con IA: {resultado['errores']}"}