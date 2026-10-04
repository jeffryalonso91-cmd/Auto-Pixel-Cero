export interface AlphaAnalysisResult {
  transparentPixelPercent: number;
  cornerAlphas: [number, number, number, number];
  cornerColors: [string, string, string, string];
  cornerAvgColor: { r: number; g: number; b: number; hex: string; rgbStr: string };
  isCornerUniform: boolean;
  isAllCornersOpaque: boolean;
  contentType: string;
  naturalWidth: number;
  naturalHeight: number;
  error?: string;
}

export async function analyzeAlpha(source: string | File | Blob): Promise<AlphaAnalysisResult> {
  return new Promise((resolve) => {
    let objectUrl = '';
    let inferredType = 'image/png';

    if (source instanceof File || source instanceof Blob) {
      inferredType = source.type || 'image/png';
      objectUrl = URL.createObjectURL(source);
    } else if (typeof source === 'string') {
      objectUrl = source;
      if (source.startsWith('data:image/webp')) inferredType = 'image/webp';
      else if (source.startsWith('data:image/jpeg') || source.startsWith('data:image/jpg')) inferredType = 'image/jpeg';
      else if (source.startsWith('data:image/png')) inferredType = 'image/png';
      else if (source.startsWith('data:image/gif')) inferredType = 'image/gif';
      else if (/\.(webp)($|\?)/i.test(source)) inferredType = 'image/webp';
      else if (/\.(jpg|jpeg)($|\?)/i.test(source)) inferredType = 'image/jpeg';
      else if (/\.(png)($|\?)/i.test(source)) inferredType = 'image/png';
    } else {
      resolve({
        transparentPixelPercent: 0,
        cornerAlphas: [255, 255, 255, 255],
        cornerColors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        cornerAvgColor: { r: 255, g: 255, b: 255, hex: '#ffffff', rgbStr: 'rgb(255,255,255)' },
        isCornerUniform: true,
        isAllCornersOpaque: true,
        contentType: 'unknown',
        naturalWidth: 0,
        naturalHeight: 0,
        error: 'no medible: fuente invalida',
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width || 128;
        const h = img.naturalHeight || img.height || 128;

        const maxDim = 128;
        let scaleW = w;
        let scaleH = h;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            scaleH = Math.round((h * maxDim) / w);
            scaleW = maxDim;
          } else {
            scaleW = Math.round((w * maxDim) / h);
            scaleH = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(16, scaleW);
        canvas.height = Math.max(16, scaleH);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          if (source instanceof File || source instanceof Blob) URL.revokeObjectURL(objectUrl);
          resolve({
            transparentPixelPercent: 0,
            cornerAlphas: [255, 255, 255, 255],
            cornerColors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
            cornerAvgColor: { r: 255, g: 255, b: 255, hex: '#ffffff', rgbStr: 'rgb(255,255,255)' },
            isCornerUniform: true,
            isAllCornersOpaque: true,
            contentType: inferredType,
            naturalWidth: w,
            naturalHeight: h,
            error: 'no medible: canvas context error',
          });
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let transparentPixelCount = 0;
        const totalPixels = canvas.width * canvas.height;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 250) {
            transparentPixelCount++;
          }
        }

        const transparentPixelPercent = Math.round((transparentPixelCount / totalPixels) * 100);

        // Analyze 4 corners: (0,0), (width-1, 0), (0, height-1), (width-1, height-1)
        const getPixelAt = (x: number, y: number) => {
          const idx = (y * canvas.width + x) * 4;
          return {
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3],
          };
        };

        const corners = [
          getPixelAt(0, 0),
          getPixelAt(canvas.width - 1, 0),
          getPixelAt(0, canvas.height - 1),
          getPixelAt(canvas.width - 1, canvas.height - 1),
        ];

        const cornerAlphas: [number, number, number, number] = [
          corners[0].a,
          corners[1].a,
          corners[2].a,
          corners[3].a,
        ];

        const toHex = (r: number, g: number, b: number) =>
          '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');

        const cornerColors: [string, string, string, string] = [
          toHex(corners[0].r, corners[0].g, corners[0].b),
          toHex(corners[1].r, corners[1].g, corners[1].b),
          toHex(corners[2].r, corners[2].g, corners[2].b),
          toHex(corners[3].r, corners[3].g, corners[3].b),
        ];

        const avgR = Math.round(corners.reduce((acc, c) => acc + c.r, 0) / 4);
        const avgG = Math.round(corners.reduce((acc, c) => acc + c.g, 0) / 4);
        const avgB = Math.round(corners.reduce((acc, c) => acc + c.b, 0) / 4);

        // Check corner color uniformity
        const colorDiff = corners.reduce((acc, c) => {
          return acc + Math.abs(c.r - avgR) + Math.abs(c.g - avgG) + Math.abs(c.b - avgB);
        }, 0);

        const isCornerUniform = colorDiff < 24;
        const isAllCornersOpaque = cornerAlphas.every((a) => a >= 250);

        if (source instanceof File || source instanceof Blob) URL.revokeObjectURL(objectUrl);

        resolve({
          transparentPixelPercent,
          cornerAlphas,
          cornerColors,
          cornerAvgColor: {
            r: avgR,
            g: avgG,
            b: avgB,
            hex: toHex(avgR, avgG, avgB),
            rgbStr: `rgb(${avgR},${avgG},${avgB})`,
          },
          isCornerUniform,
          isAllCornersOpaque,
          contentType: inferredType,
          naturalWidth: w,
          naturalHeight: h,
        });
      } catch (err: any) {
        if (source instanceof File || source instanceof Blob) URL.revokeObjectURL(objectUrl);
        resolve({
          transparentPixelPercent: 0,
          cornerAlphas: [255, 255, 255, 255],
          cornerColors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
          cornerAvgColor: { r: 255, g: 255, b: 255, hex: '#ffffff', rgbStr: 'rgb(255,255,255)' },
          isCornerUniform: true,
          isAllCornersOpaque: true,
          contentType: inferredType,
          naturalWidth: 0,
          naturalHeight: 0,
          error: `no medible: ${err?.message || 'CORS o bloqueo de lienzo'}`,
        });
      }
    };

    img.onerror = () => {
      if (source instanceof File || source instanceof Blob) URL.revokeObjectURL(objectUrl);
      resolve({
        transparentPixelPercent: 0,
        cornerAlphas: [255, 255, 255, 255],
        cornerColors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
        cornerAvgColor: { r: 255, g: 255, b: 255, hex: '#ffffff', rgbStr: 'rgb(255,255,255)' },
        isCornerUniform: true,
        isAllCornersOpaque: true,
        contentType: inferredType,
        naturalWidth: 0,
        naturalHeight: 0,
        error: 'no medible: error al cargar imagen',
      });
    };

    img.src = objectUrl;
  });
}

export async function checkImageOpaqueCorners(src: string): Promise<boolean> {
  const result = await analyzeAlpha(src);
  if (result.error) return false;
  return result.isAllCornersOpaque;
}

/**
 * Creates a synthetic transparent PNG Blob in browser memory for testing pipeline.
 */
export function createTestTransparentPngBlob(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear canvas (100% transparent alpha = 0)
      ctx.clearRect(0, 0, 128, 128);

      // Draw a solid circle in center (x=64, y=64, r=40)
      ctx.fillStyle = '#1FA855';
      ctx.beginPath();
      ctx.arc(64, 64, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      const file = new File([blob || new Blob()], 'test_transparent_phone.png', { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}

/**
 * Attaches window.__probarPipelineAlfa() to test pipeline in browser console.
 */
export function initPipelineTestHelper(processImageFn: (file: File) => Promise<string>) {
  if (typeof window !== 'undefined') {
    (window as any).__probarPipelineAlfa = async () => {
      console.log('%c[IMG PROBADOR ALFA] Generando PNG de prueba transparente...', 'color: #1FA855; font-weight: bold;');
      const testFile = await createTestTransparentPngBlob();

      const origAnalysis = await analyzeAlpha(testFile);
      console.log('[IMG Etapa 1: Archivo Original]', {
        name: testFile.name,
        type: testFile.type,
        bytes: testFile.size,
        transparentPercent: `${origAnalysis.transparentPixelPercent}%`,
        cornerAlphas: origAnalysis.cornerAlphas,
      });

      const processedDataUrl = await processImageFn(testFile);
      const procAnalysis = await analyzeAlpha(processedDataUrl);

      console.log('[IMG Etapa 2: Resultado Procesado]', {
        type: procAnalysis.contentType,
        dataUrlLength: processedDataUrl.length,
        transparentPercent: `${procAnalysis.transparentPixelPercent}%`,
        cornerAlphas: procAnalysis.cornerAlphas,
      });

      const alphaSurvived = procAnalysis.transparentPixelPercent > 20;

      console.table({
        'Etapa 1: Original': {
          Tipo: testFile.type,
          Tamaño: `${Math.round(testFile.size / 1024)} KB`,
          'Transparencia Alfa': `${origAnalysis.transparentPixelPercent}%`,
          Estado: 'OK',
        },
        'Etapa 2: Procesado': {
          Tipo: procAnalysis.contentType,
          Tamaño: `${Math.round(processedDataUrl.length / 1024)} KB base64`,
          'Transparencia Alfa': `${procAnalysis.transparentPixelPercent}%`,
          Estado: alphaSurvived ? 'SOBREVIVIO ALFA' : 'PERDIO ALFA (CULPABLE: COMPRESION)',
        },
      });

      if (alphaSurvived) {
        console.log('%c✅ ÉXITO: El canal Alfa transparente sobrevive 100% intacto a través de la función de procesamiento.', 'color: #1FA855; font-weight: bold;');
      } else {
        console.error('❌ ERROR: El canal Alfa se perdió durante el procesamiento.');
      }

      return {
        success: alphaSurvived,
        originalTransparentPercent: origAnalysis.transparentPixelPercent,
        processedTransparentPercent: procAnalysis.transparentPixelPercent,
      };
    };
  }
}
