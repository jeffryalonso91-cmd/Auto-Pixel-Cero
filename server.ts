import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  app.post('/api/generate-description', async (req, res) => {
    try {
      const {
        model,
        price,
        currencySymbol = '₡',
        storage,
        condition,
        battery,
        status,
        notes,
        tone = 'cercano',
        length = 'breve',
        storeName = 'Pixel Cero',
      } = req.body || {};

      if (!model || !String(model).trim()) {
        res.status(400).json({
          error: 'Por favor ingresa primero el modelo del artículo en la ficha para poder generar su descripción.',
        });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: 'No se encontró la clave GEMINI_API_KEY configurada en el servidor.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const toneInstructions: Record<string, string> = {
        cercano:
          'Enfoque de Asesor Cercano y Confiable: Escribe con calidez, empatía y total honestidad, como un vendedor experto y amable de Costa Rica que le cuenta a un cliente de confianza cómo está realmente el teléfono y por qué le va a encantar.',
        experiencia:
          'Enfoque en la Experiencia de Uso Diario: Escribe con un estilo fluido, moderno y práctico, centrándote en cómo se siente usar este equipo todos los días (la comodidad de su espacio, la tranquilidad de su batería para toda la jornada, cómo luce en mano).',
        oportunidad:
          'Enfoque en Oportunidad y Valor Inteligente: Escribe con entusiasmo natural y persuasivo, resaltando por qué esta unidad específica vale cada colón por el cuidado que tiene y el ahorro que representa frente a comprarlo nuevo.',
        directo:
          'Enfoque Directo, Transparente y Humano: Ve al grano con naturalidad y cercanía, dejando claros los puntos fuertes del estado real del equipo sin adornos innecesarios, ideal para quien busca comprar con total seguridad.',
      };

      const lengthInstructions: Record<string, string> = {
        breve:
          'Extensión Breve y Fluida: Redacta un único párrafo corto y ágil de 2 a 3 oraciones (aproximadamente 35 a 55 palabras) que se lea rápido y con ritmo natural en el catálogo.',
        parrafo:
          'Extensión de Párrafo Completo: Redacta un párrafo envolvente y bien hilado de 4 a 5 oraciones (aproximadamente 65 a 95 palabras) que transmita confianza y detalle cómo se conserva y se disfruta esta unidad.',
        puntos:
          'Formato de Frase + Puntos Clave: Inicia con una frase cálida y humana de 1 a 2 líneas, seguida de un salto de línea y 3 viñetas cortas (usando •) redactadas de forma conversacional y cercana (no como una lista fría de especificaciones).',
      };

      const selectedTone = toneInstructions[tone] || toneInstructions.cercano;
      const selectedLength = lengthInstructions[length] || lengthInstructions.breve;

      const formattedPrice =
        price && !isNaN(Number(price)) && Number(price) > 0
          ? `${currencySymbol}${Number(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
          : 'No especificado';

      const cleanNotes = notes ? String(notes).trim() : '';

      const systemInstruction = `Eres el redactor humano principal de "${storeName}", una tienda especializada en iPhones y dispositivos Apple seminuevos seleccionados con alto estándar de calidad.
Tu tarea es redactar la descripción de venta para un artículo basándote en los datos ingresados en la ficha.

REGLAS ESTRICTAS DE NATURALIDAD HUMANA (ANTI-IA):
1. Debe sonar 100% escrito por una persona real, amable y conocedora. Nunca uses frases robóticas o clichés de inteligencia artificial como: "¡Descubre!", "En el vertiginoso mundo actual", "No busques más", "Lleva tu experiencia al siguiente nivel", "Una joya tecnológica", "Redefine la excelencia", "Potencia sin límites" ni signos de exclamación exagerados.
2. No hagas un listado frío ni repitas mecánicamente los datos técnicos como un robot; traduce esos datos en beneficios reales y cotidianos (por ejemplo, qué significa tener ese porcentaje de batería en la rutina diaria, qué tan cuidado se ve por su condición o la tranquilidad de tener esa capacidad de almacenamiento).
3. Si el administrador incluyó apuntes o notas previas sobre esta unidad (como accesorios incluidos, detalles estéticos, origen de la batería, único dueño, garantía, etc.), intégralos de manera protagónica, fiel y fluida en la redacción.
4. Si NO hay apuntes adicionales del administrador, NO inventes accesorios (no digas que incluye caja o cargador si no se menciona en los apuntes). Basa tu redacción únicamente en las características reales proporcionadas.
5. Usa español natural, neutro-cálido (adecuado para clientes en Costa Rica y Latinoamérica, tratando al lector de "tú" o "vos/usted" suave sin exagerar modismos).
6. Devuelve ÚNICAMENTE el texto final de la descripción, sin títulos, sin comillas al inicio ni al final y sin frases introductorias como "Aquí tienes la descripción:".`;

      const prompt = `Datos recién ingresados del artículo en la ficha:
- Modelo: ${model}
- Capacidad de almacenamiento: ${storage || 'No especificada'}
- Condición estética: ${condition || 'Excelente'}
- Salud de batería: ${battery || 'No especificada'}
- Precio: ${formattedPrice}
- Disponibilidad: ${status || 'Disponible'}
${
  cleanNotes
    ? `- Apuntes / observaciones específicas del administrador sobre esta unidad (INTEGRAR OBLIGATORIAMENTE): "${cleanNotes}"`
    : '- Apuntes adicionales del administrador: Ninguno (basarse solo en los datos de arriba sin inventar accesorios extra).'
}

Instrucción de enfoque elegida por el administrador:
${selectedTone}

Instrucción de extensión y formato elegida por el administrador:
${selectedLength}

Redacta ahora la descripción humana de venta para colocarla directamente en el campo de descripción del artículo:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });

      const generatedText = response.text?.trim() || '';
      if (!generatedText) {
        res.status(502).json({
          error: 'No se pudo obtener una respuesta válida del generador. Intenta de nuevo.',
        });
        return;
      }

      res.json({ description: generatedText });
    } catch (error: any) {
      console.error('Error generating product description:', error);
      res.status(500).json({
        error:
          error?.message ||
          'Ocurrió un error al generar la descripción con IA. Por favor intenta nuevamente.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
