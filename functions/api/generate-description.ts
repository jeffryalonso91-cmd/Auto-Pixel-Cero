import {
  type DescriptionParams,
  buildPromptAndSystemInstruction,
  buildHumanFallbackDescription,
} from '../../src/descriptionGenerator';

interface CloudflareContext {
  request: Request;
  env?: Record<string, string | undefined>;
}

export const onRequestPost = async (context: CloudflareContext): Promise<Response> => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body: DescriptionParams = await context.request.json();
    const { model } = body || {};

    if (!model || !String(model).trim()) {
      return new Response(
        JSON.stringify({
          error:
            'Por favor ingresa primero el modelo del artículo en la ficha para poder generar su descripción.',
        }),
        { status: 400, headers }
      );
    }

    const apiKey =
      context.env?.GEMINI_API_KEY ||
      context.env?.VITE_GEMINI_API_KEY ||
      context.env?.API_KEY ||
      '';

    if (apiKey) {
      try {
        const { systemInstruction, prompt } = buildPromptAndSystemInstruction(body);
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            apiKey
          )}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'aistudio-build',
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.75,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiJson: any = await geminiRes.json();
          const generatedText =
            geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (generatedText) {
            return new Response(JSON.stringify({ description: generatedText }), {
              status: 200,
              headers,
            });
          }
        }
      } catch (_err) {
        // Fallback to contextual human generator below
      }
    }

    const fallbackDescription = buildHumanFallbackDescription(body);
    return new Response(JSON.stringify({ description: fallbackDescription }), {
      status: 200,
      headers,
    });
  } catch (_err) {
    return new Response(
      JSON.stringify({
        error: 'No se pudo procesar la solicitud para generar la descripción.',
      }),
      { status: 400, headers }
    );
  }
};
