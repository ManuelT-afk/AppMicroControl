// src/services/antigravity.ts
// Servicio de IA Antigravity — analiza gastos y genera consejos financieros.
// Convertido de .js a .ts para cumplir con el stack TypeScript del proyecto.

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI  = new GoogleGenerativeAI(apiKey);

/**
 * Analiza un gasto con Gemini y devuelve un consejo financiero en una frase.
 * @param monto          Monto del gasto en MXN
 * @param comercio       Nombre del comercio (Oxxo, Amazon, etc.)
 * @param saldoRestante  Saldo disponible actual del usuario
 */
export const analizarGastoConIA = async (
  monto: number,
  comercio: string,
  saldoRestante: number
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `Eres Antigravity, un asistente financiero inteligente y proactivo. 
      Tu objetivo es ayudar al usuario a ser consciente de sus gastos diarios, especialmente 
      aquellos menores a $1,500. Analiza los datos de forma lógica y ofrece un consejo breve 
      o una advertencia sobre el impacto de ese gasto en su saldo actual. 
      Sé directo, empático y mantén las respuestas en una sola frase.`,
    });

    const prompt = `Gasto: $${monto} en '${comercio}'. Saldo disponible: $${saldoRestante}.`;

    const result   = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error en el servicio de IA Antigravity:', error);
    return 'No se pudo analizar el gasto en este momento.';
  }
};

/**
 * Permite una conversación general con el asistente Antigravity.
 * @param mensaje      Mensaje del usuario
 * @param historial    Historial de mensajes previos para contexto
 */
export const chatearConAntigravity = async (
  mensaje: string,
  historial: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    // Gemini requiere que el historial comience con un mensaje de 'user'.
    // Si el primer mensaje es del 'model' (asistente), lo ignoramos para el contexto inicial.
    const historialValido = historial[0]?.role === 'model' ? historial.slice(1) : historial;

    const chat = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `Eres Antigravity, un compañero financiero experto en el mercado mexicano. 
      Ayudas al usuario a entender sus gastos, da consejos de ahorro (tips) y responde dudas sobre la app. 
      Tu tono es amigable, directo y usas emojis ocasionalmente. 
      Si te preguntan sobre la app, diles que pueden ver gráficas, historial y configurar límites de "gasto hormiga".`,
    }).startChat({
      history: historialValido,
    });

    const result = await chat.sendMessage(mensaje);
    return result.response.text();
  } catch (error) {
    console.error('Error en el chat de Antigravity:', error);
    return 'Lo siento, mi conexión se interrumpió. ¿Podrías repetirlo?';
  }
};
