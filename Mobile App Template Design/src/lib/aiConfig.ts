// src/lib/aiConfig.ts
// Integración con Gemini para análisis de gastos hormiga en tiempo real.
// La API Key se lee desde variables de entorno (OWASP A02).

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY ?? ''
);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Analiza un gasto entrante y devuelve una advertencia personalizada.
 * @param monto        Monto del gasto detectado
 * @param comercio     Nombre del comercio (Oxxo, Amazon, etc.)
 * @param limiteActual Límite quincenal configurado por el usuario
 * @param totalGastado Total gastado hasta ahora en la quincena
 */
export async function obtenerAdvertenciaIA(
  monto: number,
  comercio: string,
  limiteActual: number,
  totalGastado: number
): Promise<{ titulo: string; mensaje: string; nivel: 'info' | 'alerta' | 'critico' }> {
  const porcentajeUsado = ((totalGastado + monto) / limiteActual) * 100;

  // Si no hay API Key configurada, devuelve análisis local básico
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return analisisLocal(monto, comercio, porcentajeUsado);
  }

  try {
    const prompt = `
Eres un asesor financiero conciso y empático para una app de control de gastos hormiga en México.

Datos del gasto:
- Comercio: ${comercio}
- Monto: $${monto} MXN
- Total gastado esta quincena: $${totalGastado} MXN
- Límite quincenal: $${limiteActual} MXN
- Porcentaje del límite usado después de este gasto: ${porcentajeUsado.toFixed(1)}%

Responde SOLO en formato JSON sin markdown con esta estructura:
{
  "titulo": "Título corto (max 5 palabras)",
  "mensaje": "Mensaje motivador o de alerta (max 25 palabras, en español de México)",
  "nivel": "info|alerta|critico"
}

Reglas para el nivel:
- "info" si porcentaje < 60%
- "alerta" si porcentaje entre 60% y 90%
- "critico" si porcentaje > 90%

Sé directo, amigable y usa emojis ocasionalmente.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parsear la respuesta JSON de Gemini
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        titulo: parsed.titulo ?? '¡Gasto detectado!',
        mensaje: parsed.mensaje ?? `$${monto} en ${comercio}`,
        nivel: parsed.nivel ?? 'info',
      };
    }

    return analisisLocal(monto, comercio, porcentajeUsado);
  } catch {
    // Si falla Gemini, usar análisis local como fallback
    return analisisLocal(monto, comercio, porcentajeUsado);
  }
}

// ── Análisis local de fallback (sin IA) ─────────────────────────────────────
function analisisLocal(
  monto: number,
  comercio: string,
  porcentajeUsado: number
): { titulo: string; mensaje: string; nivel: 'info' | 'alerta' | 'critico' } {
  if (porcentajeUsado > 90) {
    return {
      titulo: '⚠️ Límite casi alcanzado',
      mensaje: `$${monto} en ${comercio}. Llevas el ${porcentajeUsado.toFixed(0)}% de tu presupuesto. ¡Cuidado!`,
      nivel: 'critico',
    };
  }
  if (porcentajeUsado > 60) {
    return {
      titulo: '👀 Vas por la mitad',
      mensaje: `$${monto} en ${comercio}. Ya usaste el ${porcentajeUsado.toFixed(0)}% de tu quincena.`,
      nivel: 'alerta',
    };
  }
  return {
    titulo: '✅ Gasto registrado',
    mensaje: `$${monto} en ${comercio}. Vas bien, llevas el ${porcentajeUsado.toFixed(0)}% de tu límite.`,
    nivel: 'info',
  };
}
