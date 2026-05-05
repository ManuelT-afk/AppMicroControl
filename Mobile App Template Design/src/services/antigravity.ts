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
