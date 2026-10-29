import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  type DescriptionParams,
  buildPromptAndSystemInstruction,
  buildHumanFallbackDescription,
} from './src/descriptionGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  app.post('/api/generate-description', async (req, res) => {
    const body: DescriptionParams = req.body || {};
    const { model } = body;

    if (!model || !String(model).trim()) {
      res.status(400).json({
        error: 'Por favor ingresa primero el modelo del artículo en la ficha para poder generar su descripción.',
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({ description: buildHumanFallbackDescription(body) });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const { systemInstruction, prompt } = buildPromptAndSystemInstruction(body);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });

      const generatedText = response.text?.trim() || '';
      if (generatedText) {
        res.json({ description: generatedText });
        return;
      }
    } catch (_apiErr) {
      // Si la cuota/créditos de la clave están agotados (ej. 402/429 RESOURCE_EXHAUSTED)
      // o hay intermitencia de red, usamos el redactor humano contextual sin interrumpir al administrador.
    }

    res.json({ description: buildHumanFallbackDescription(body) });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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
