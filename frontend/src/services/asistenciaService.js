const API_URL = 'http://127.0.0.1:8000/api/asistencia';

export const asistenciaService = {
  clasificarImagen: async (archivoImagen) => {
    const url = `${API_URL}/clasificar/imagen/`;
    
    const formData = new FormData();
    formData.append('imagen', archivoImagen); 

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en asistenciaService.clasificarImagen:', error);
      throw error;
    }
  }
};