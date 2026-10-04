# Plan de Investigación, Instrumentación y Corrección de Transparencia PNG

Plan de ejecución estructurado en 3 Fases para investigar el pipeline de imágenes, instrumentar diagnóstico visible en navegador y corregir la transparencia y pendientes visuales de la interfaz.

---

## FASE 1: Investigación del Código (Paso a Paso)

- **Etapa A (Selección)**: `<input type="file">` lee el archivo sin alteración mediante `FileReader.readAsDataURL`.
- **Etapa B (Procesamiento)**: `processProductImageHD` en `src/components/Admin.tsx` procesa la imagen.
  - Para archivos PNG/WebP, genera `image/webp` (0.9) o `image/png` con `alpha: true` y sin pintar ningún fondo (`ctx.fillRect` eliminado). Redimensiona a máximo **1600px**.
- **Etapa C (Almacenamiento)**: Las imágenes se persisten como Data URLs base64 con MIME type coherente (`data:image/webp;base64,...` o `data:image/png;base64,...`) directamente en Firestore/localforage.
- **Etapa D (Entrega)**: Se sirven directamente sin transformaciones de servidor Sharp o CDN externo.
- **Etapa E (Lectura)**: Se utiliza `images[0]` como portada principal.
- **Etapa F (Pintura)**:
  - Imágenes con transparencia: `object-fit: contain`, `background: transparent`, `filter: drop-shadow(0 24px 24px rgba(20,10,60,.28))`.
  - Imágenes aplanadas de origen: **Escenario Adaptable** que funde el color de las esquinas o muestra la foto en un recuadro limpio.

---

## FASE 2: Instrumentación y Diagnóstico Visible

1. **Crear `src/utils/analyzeAlpha.ts`**:
   - Función `analyzeAlpha(source: string | File | Blob)`:
     - Dibuja la imagen en un canvas reducido (128x128 px).
     - Calcula el porcentaje de píxeles con `alpha < 250`.
     - Analiza el valor de Alfa y color RGB en las 4 esquinas (`(0,0)`, `(127,0)`, `(0,127)`, `(127,127)`).
     - Determina si las 4 esquinas tienen un color uniforme.
     - Maneja errores de CORS con `try/catch` devolviendo `"no medible: [motivo]"`.
2. **Registros en consola `[IMG]`**:
   - Durante la subida en `Admin.tsx`, imprime cada etapa con etiqueta `[IMG]` y la tabla final marcando dónde sobrevive el Alfa.
3. **Prueba automatizada `window.__probarPipelineAlfa()`**:
   - Función global en el objeto `window` que genera un PNG sintético con transparencia, lo procesa con `processProductImageHD` y certifica en consola si el canal Alfa sobrevivió intacto.
4. **Modo depuración `?debugImg=1`**:
   - Al agregar `?debugImg=1` a la URL del navegador, se despliega una pequeña etiqueta superpuesta sobre cada tarjeta del catálogo con:
     - Formato real (Content-Type)
     - Dimensiones naturales (`naturalWidth` x `naturalHeight`)
     - Porcentaje de transparencia Alfa
     - Modo elegido (Recorte, Escenario Adaptable o Foto)
     - URL

---

## FASE 3: Correcciones y Pendientes Visuales

1. **Escenario Adaptable para imágenes aplanadas**:
   - Si la foto subida es opaca (0% transparencia):
     - Si las 4 esquinas son de un color uniforme (ej. negro o blanco), el contenedor del escenario se pinta exactamente con ese color de fondo y la foto se renderiza con `object-fit: contain`, logrando que los bordes de la foto se fundan perfectamente con el escenario sin mostrar rectángulos molestos.
     - Si las esquinas no son uniformes, se aplica el recuadro foto limpio (`border-radius: 20px`, `object-fit: contain`) sobre un fondo suave.
2. **Eliminación de Barra Oscura Flotante**:
   - Eliminar por completo el componente `FloatingBar` ("¿Buscas otro modelo? Escríbenos") de `src/components/Catalog.tsx`.
3. **Apilar Botones Flotantes (WhatsApp y Subir)**:
   - Apilar en la esquina inferior derecha: Botón "Subir arriba" (`56px`), Botón "WhatsApp abajo" (`56px`), con `12px` de separación entre sí y `16px` del borde de la pantalla.
   - Agregar `140px` de padding inferior a la página para evitar solapamientos.
4. **Etiquetas "2 fotos" / "3 fotos"**:
   - Posicionar la insignia centrada horizontalmente dentro de la zona de imagen a `12px` del borde inferior (`bottom-3`), completa y visible.
5. **Alineación de Títulos**:
   - Eliminar el espacio en blanco vacío cuando el título tiene solo 1 línea, manteniendo la alineación de las tarjetas mediante `margin-top: auto` en el pie de tarjeta.

---

## Plan de Ejecución de Archivos

1. **`src/utils/analyzeAlpha.ts`**: Crear funciones `analyzeAlpha`, `checkImageOpaqueCorners` e instalar `window.__probarPipelineAlfa`.
2. **`src/components/Admin.tsx`**: Integrar logs `[IMG]` y ajustar la función `processProductImageHD`.
3. **`src/components/Catalog.tsx`**:
   - Eliminar `FloatingBar`.
   - Ajustar `ProductCardImage` con Escenario Adaptable y soporte para `?debugImg=1`.
   - Reestructurar el pie y botones flotantes apilados de `56px`.
