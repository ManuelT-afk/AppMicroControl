// src/services/antigravity.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Servicio ultra-compatible de Antigravity IA
 */
export const analizarGastoConIA = async (
  monto: number,
  comercio: string,
  saldoRestante: number
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    if (!apiKey) return 'Falta API Key';

    const genAI = new GoogleGenerativeAI(apiKey);
    // Usamos el modelo estándar sin configuraciones adicionales para evitar errores 404/v1beta
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      INSTRUCCIÓN: Eres Antigravity, un asistente financiero. 
      Analiza este gasto y da un consejo breve (una sola frase).
      
      DATOS:
      - Monto: $${monto}
      - Comercio/Nota: ${comercio}
      - Saldo restante: $${saldoRestante}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const texto = response.text();
    
    console.log('[IA] Análisis completado con éxito.');
    return texto;
  } catch (error: any) {
    console.error('[IA Error]:', error);
    return `Error IA: ${error.message || 'Sin respuesta'}`;
  }
};

// Función simplificada para el chat (aunque el chatbot fue eliminado, 
// la mantenemos por si se requiere en el futuro)
export const chatearConAntigravity = async (mensaje: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(mensaje);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    return `Error: ${error.message}`;
  }
};
