import localforage from 'localforage';
import { useState, useEffect } from 'react';

// Caché en memoria para acceso sincrónico instantáneo durante la sesión
const memoryCutoutCache = new Map<string, string>();

const CUTOUT_STORE_KEY = 'pixelcero_cutout_cache_v2_';

/**
 * Recorte inteligente mediante Canvas (fallback de ultra alta velocidad y sin dependencias de red):
 * Detecta el color de fondo predominante desde las esquinas y bordes (fondos negros, grises,
 * blancos o degradados de estudio), e inunda hacia el centro hasta encontrar el contorno
 * de alto contraste del teléfono, convirtiendo el fondo exterior en 100% transparente.
 */
export async function removeBackgroundWithCanvas(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Limitar dimensiones para procesamiento rápido en canvas (< 800px)
        const maxDim = 800;
        let targetW = width;
        let targetH = height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            targetH = Math.round((height * maxDim) / width);
            targetW = maxDim;
          } else {
            targetW = Math.round((width * maxDim) / height);
            targetH = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;

        // Verificar si la imagen ya tiene pixeles transparentes (PNG existente)
        let alreadyHasAlpha = false;
        for (let i = 3; i < data.length; i += 40) {
          if (data[i] < 200) {
            alreadyHasAlpha = true;
            break;
          }
        }
        if (alreadyHasAlpha) {
          resolve(imageSrc);
          return;
        }

        // Muestrear colores de fondo de las 4 esquinas y franjas perimetrales
        const cornerSamples: [number, number, number][] = [];
        const samplePoints = [
          [2, 2],
          [targetW - 3, 2],
          [2, targetH - 3],
          [targetW - 3, targetH - 3],
          [Math.floor(targetW / 2), 2],
          [2, Math.floor(targetH / 2)],
          [targetW - 3, Math.floor(targetH / 2)],
        ];

        samplePoints.forEach(([x, y]) => {
          const idx = (y * targetW + x) * 4;
          cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
        });

        // Promedio de color de fondo en bordes
        let avgR = 0, avgG = 0, avgB = 0;
        cornerSamples.forEach(([r, g, b]) => {
          avgR += r;
          avgG += g;
          avgB += b;
        });
        avgR = Math.round(avgR / cornerSamples.length);
        avgG = Math.round(avgG / cornerSamples.length);
        avgB = Math.round(avgB / cornerSamples.length);

        // Algoritmo de inundación (Flood Fill) desde los 4 bordes exteriores
        // para no alterar pixeles del interior de la pantalla ni cámaras
        const visited = new Uint8Array(targetW * targetH);
        const queue: number[] = [];

        // Agregar todos los píxeles perimetrales a la cola inicial
        for (let x = 0; x < targetW; x++) {
          queue.push(x, 0); // borde superior
          queue.push(x, targetH - 1); // borde inferior
        }
        for (let y = 1; y < targetH - 1; y++) {
          queue.push(0, y); // borde izquierdo
          queue.push(targetW - 1, y); // borde derecho
        }

        // Distancia euclidiana de color respecto al fondo
        const isBackground = (r: number, g: number, b: number) => {
          // Comparar con el promedio y con cada muestra de esquina
          const distAvg = Math.sqrt(
            Math.pow(r - avgR, 2) + Math.pow(g - avgG, 2) + Math.pow(b - avgB, 2)
          );
          if (distAvg < 48) return true;

          for (const [cr, cg, cb] of cornerSamples) {
            const distCorner = Math.sqrt(
              Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2)
            );
            if (distCorner < 36) return true;
          }
          return false;
        };

        // Procesar cola de inundación BFS
        let head = 0;
        while (head < queue.length) {
          const x = queue[head++];
          const y = queue[head++];
          const pIdx = y * targetW + x;

          if (visited[pIdx]) continue;
          visited[pIdx] = 1;

          const dIdx = pIdx * 4;
          const r = data[dIdx];
          const g = data[dIdx + 1];
          const b = data[dIdx + 2];

          if (isBackground(r, g, b)) {
            // Fondo detectado: volver 100% transparente
            data[dIdx + 3] = 0;

            // Expandir a vecinos contiguos
            if (x > 0 && !visited[pIdx - 1]) queue.push(x - 1, y);
            if (x < targetW - 1 && !visited[pIdx + 1]) queue.push(x + 1, y);
            if (y > 0 && !visited[pIdx - targetW]) queue.push(x, y - 1);
            if (y < targetH - 1 && !visited[pIdx + targetW]) queue.push(x, y + 1);
          }
        }

        // Suavizado de bordes (anti-aliasing) en la transición de transparencia
        for (let y = 1; y < targetH - 1; y++) {
          for (let x = 1; x < targetW - 1; x++) {
            const pIdx = y * targetW + x;
            const dIdx = pIdx * 4;
            if (data[dIdx + 3] > 0) {
              // Si tiene un vecino transparente, suavizar ligeramente el borde
              const hasTransNeighbor =
                data[(pIdx - 1) * 4 + 3] === 0 ||
                data[(pIdx + 1) * 4 + 3] === 0 ||
                data[(pIdx - targetW) * 4 + 3] === 0 ||
                data[(pIdx + targetW) * 4 + 3] === 0;

              if (hasTransNeighbor) {
                data[dIdx + 3] = 180; // Suavizado de corte
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const resultPng = canvas.toDataURL('image/png');
        resolve(resultPng);
      } catch (err) {
        // En caso de CORS estricto u otro error en canvas, devolver original
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

/**
 * Recorte con IA (@imgly/background-removal) con fallback automático al procesador Canvas:
 */
export async function cutOutProductImage(imageSrc: string): Promise<string> {
  if (!imageSrc) return '';

  // 1. Revisar caché en memoria
  if (memoryCutoutCache.has(imageSrc)) {
    return memoryCutoutCache.get(imageSrc)!;
  }

  // 2. Revisar almacenamiento persistente (localforage)
  try {
    const cached = await localforage.getItem<string>(CUTOUT_STORE_KEY + imageSrc);
    if (cached && typeof cached === 'string') {
      memoryCutoutCache.set(imageSrc, cached);
      return cached;
    }
  } catch (e) {}

  let cutoutResult = '';

  // 3. Intentar recorte con IA (@imgly/background-removal) con tiempo límite de 5s
  try {
    const aiPromise = (async () => {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(imageSrc, {
        publicPath: 'https://static.img.ly/background-removal-data/1.7.0/dist/',
        model: 'isnet_quint8', // Modelo cuantizado ultra liviano y rápido
      });
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    })();

    const timeoutPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve(''), 4500); // 4.5s máximo
    });

    const aiResult = await Promise.race([aiPromise, timeoutPromise]);
    if (aiResult && aiResult.length > 100) {
      cutoutResult = aiResult;
    }
  } catch (err) {
    // Si la IA falla o no tiene conexión, usamos el motor Canvas
  }

  // 4. Si la IA no produjo resultado o tardó mucho, usar motor inteligente Canvas
  if (!cutoutResult) {
    try {
      cutoutResult = await removeBackgroundWithCanvas(imageSrc);
    } catch (e) {
      cutoutResult = imageSrc;
    }
  }

  // 5. Guardar en memoria y localforage
  if (cutoutResult && cutoutResult.startsWith('data:image/')) {
    memoryCutoutCache.set(imageSrc, cutoutResult);
    try {
      await localforage.setItem(CUTOUT_STORE_KEY + imageSrc, cutoutResult);
    } catch (e) {}
  }

  return cutoutResult || imageSrc;
}

/**
 * Hook de React para obtener la silueta recortada de forma asíncrona y fluida
 */
export function useProductCutout(originalSrc: string, fallbackCutout?: string) {
  const [cutoutSrc, setCutoutSrc] = useState<string>(() => {
    if (fallbackCutout) return fallbackCutout;
    if (memoryCutoutCache.has(originalSrc)) return memoryCutoutCache.get(originalSrc)!;
    return '';
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(!cutoutSrc);

  useEffect(() => {
    let isMounted = true;

    if (fallbackCutout) {
      setCutoutSrc(fallbackCutout);
      setIsProcessing(false);
      return;
    }

    if (memoryCutoutCache.has(originalSrc)) {
      setCutoutSrc(memoryCutoutCache.get(originalSrc)!);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    cutOutProductImage(originalSrc)
      .then((res) => {
        if (isMounted) {
          setCutoutSrc(res || originalSrc);
          setIsProcessing(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCutoutSrc(originalSrc);
          setIsProcessing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [originalSrc, fallbackCutout]);

  return { cutoutSrc: cutoutSrc || originalSrc, isProcessing };
}
