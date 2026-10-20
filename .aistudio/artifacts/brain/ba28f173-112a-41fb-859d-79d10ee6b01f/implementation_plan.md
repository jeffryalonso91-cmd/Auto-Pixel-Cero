# Generador de Descripciones con Tono Humano para Artículos en Administración

Incorporación de un asistente de redacción inteligente dentro del formulario de creación y edición de artículos en el panel de administración, diseñado para transformar los datos del equipo y los apuntes rápidos del administrador en una descripción de venta natural, cercana y humana que puede personalizarse y editarse libremente.

## Decisiones Confirmadas y Revisión del Usuario

> [!IMPORTANT]
> A continuación se resumen las preferencias confirmadas para el funcionamiento del generador en la ficha de artículo:

- **Selector de enfoque y tono (Dropdown 1)**: Se incluirá un menú desplegable para elegir el enfoque antes de generar:
  - *Asesor Cercano y Confiable* (cálido, conversacional, transmite confianza y transparencia).
  - *Experiencia de Uso Diario* (elegante y práctico, enfocado en cómo se siente usar el equipo en el día a día).
  - *Oportunidad y Valor* (entusiasta y persuasivo, resaltando la relación calidad-precio y el estado del dispositivo).
- **Selector de extensión y formato (Dropdown 2)**: Se incluirá un segundo menú desplegable para definir la estructura:
  - *Breve y Fluida* (2 a 4 líneas directas, ideal para lectura rápida en el catálogo).
  - *Párrafo Completo* (narrativa envolvente de un párrafo detallando la experiencia y cuidado del equipo).
  - *Frase + Puntos Clave* (introducción humana seguida de viñetas naturales fáciles de escanear).
- **Enriquecimiento con apuntes previos**: Si el campo de descripción/comentarios ya contiene notas rápidas escritas por el usuario (por ejemplo: *"incluye caja, cable original, sin rayones"*), la inteligencia artificial tomará esos apuntes junto con los datos de la ficha (modelo, capacidad, condición, batería y precio) para integrarlos orgánicamente en la redacción.
- **Edición manual total**: Una vez colocada la descripción generada en el campo de texto, el administrador podrá modificar, borrar o ajustar cualquier palabra manualmente antes de guardar el artículo, o volver a generar con otro enfoque si lo desea.

---

## 1. Concepto General y Valor

- **Qué hace**: Permite que el administrador complete los datos básicos de un artículo (Modelo, Precio, Capacidad, Condición, Batería y apuntes opcionales) y, con un solo clic, obtenga una redacción de venta auténtica y empática, evitando el tono robótico o meramente técnico típico de textos generados por máquina.
- **Usuarios objetivo**: Administradores de la tienda **Pixel Cero** que publican inventario de equipos y desean agilizar la carga de productos manteniendo un estándar de atención cercano y humano.
- **Valor principal**: Ahorra tiempo de redacción en cada ingreso de inventario mientras eleva la conversión en el catálogo público con descripciones que conectan con el comprador real.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujo de Interacción Paso a Paso
1. **Ingreso de datos en la ficha**: El administrador abre el modal de *Nuevo Artículo* o *Editar Artículo* e ingresa los datos del equipo (Modelo, Precio, Capacidad, Condición, Batería).
2. **Apuntes opcionales**: Si el equipo tiene particularidades (ej. *"único dueño, incluye cargador original, detalle mínimo en esquina"*), el administrador las escribe brevemente en el área de texto.
3. **Configuración rápida de estilo**: Justo encima del campo de descripción/comentarios, el administrador dispone de una barra de herramientas compacta con:
   - Selector desplegable de **Enfoque / Tono**.
   - Selector desplegable de **Extensión / Formato**.
   - Botón de acción **Redactar con IA**.
4. **Generación y revisión**: Al presionar el botón, se muestra un estado de carga fluido (*"Redactando..."*) sin bloquear el resto del modal. En pocos segundos, el texto redactado aparece directamente en el campo de descripción, con opción de **Deshacer / Restaurar apuntes originales** por si desea volver a sus notas previas o probar otro tono.
5. **Edición libre y guardado**: El administrador revisa el texto, lo edita manualmente si quiere darle un toque final y guarda el artículo normalmente.

### Identidad Visual y Tema
- **Dirección Estética**: Minimalismo limpio inspirado en el ecosistema Apple que ya caracteriza a Pixel Cero, manteniendo superficies claras (`#F5F5F7` y `#FFFFFF`), bordes redondeados suaves y jerarquía tipográfica nítida.
- **Paleta y Controles**:
  - Controles desplegables compactos integrados armónicamente sobre el área de comentarios, usando tonos neutros (`bg-apple-bg`, texto `text-apple-text`) y acento azul institucional (`#0071E3`) para la acción principal de generación.
  - Retroalimentación visual clara para estados de carga, error (por ejemplo, si aún no se ha escrito el modelo del artículo) y opción de restaurar el texto previo.

---

## 3. Decisiones de Producto y Alternativas

- **Decisión 1: Procesamiento de IA en servidor (Backend Proxy)**
  - *Enfoque elegido*: El llamado al modelo `gemini-3.8-flash` se realiza a través de una ruta segura en el servidor de la aplicación (`/api/generate-description`), manteniendo la clave de API protegida en el entorno del servidor.
  - *Por qué*: Garantiza seguridad, rapidez de respuesta y permite ajustar con precisión las instrucciones de estilo humano en español costarricense/latinoamericano neutro sin exponer credenciales en el navegador.
- **Decisión 2: Preservación de apuntes mediante botón de "Restaurar notas"**
  - *Enfoque elegido*: Cuando el usuario escribe apuntes rápidos y presiona "Redactar con IA", el sistema guarda temporalmente esos apuntes originales en memoria durante la sesión del modal. Si el usuario quiere cambiar el enfoque o el formato en el dropdown y volver a generar, la IA seguirá teniendo presentes sus apuntes originales sin perderlos.
  - *Por qué*: Evita que una segunda generación sobrescriba o diluya los detalles específicos que el administrador anotó al principio.

---

## 4. Arquitectura Técnica y Estrategia de Datos

### Diagrama de Arquitectura y Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                MODAL DE ARTÍCULO (Panel de Administración)              │
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────┐  │
│  │ Modelo / Cap. │  │   Condición   │  │  Batería (%)  │  │  Precio  │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └────┬─────┘  │
│          └──────────────────┴─────────┬────────┴───────────────┘        │
│                                       ▼                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Barra de Redacción IA                                             │  │
│  │ [Dropdown: Enfoque/Tono ▾] [Dropdown: Extensión ▾] [Redactar IA] │  │
│  └────────────────────────────────────┬──────────────────────────────┘  │
│                                       │ Lee datos + apuntes previos     │
│                                       ▼                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Campo Editable de Descripción / Comentarios (Controlado en React) │  │
│  │ + Opción rápida: "Restaurar apuntes originales"                   │  │
│  └────────────────────────────────────┬──────────────────────────────┘  │
└───────────────────────────────────────┼─────────────────────────────────┘
                                        │ POST /api/generate-description
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SERVIDOR EXPRESS + VITE (server.ts)                 │
│                                                                         │
│  • Valida datos del artículo recibidos del formulario                   │
│  • Construye prompt especializado anti-clichés robóticos                │
│  • Invoca @google/genai (modelo: gemini-3.8-flash)                      │
│  • Devuelve descripción humana lista para mostrar y editar              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mapeo de Estado e Interacciones
- **Estado controlado del formulario**: El campo `comments` (descripción) y los campos de especificaciones dentro del modal de administración estarán sincronizados para que el botón de generación lea en tiempo real los valores recién escritos por el usuario sin necesidad de haber guardado antes el artículo.
- **Instrucciones del Modelo (Prompt Engineering Humano)**:
  - Prohibición explícita de frases cliché de IA (*"¡Descubre el poder de...!", "En el vertiginoso mundo actual", "No busques más"*).
  - Uso de lenguaje natural, honesto y fluido, traduciendo los datos técnicos (como el porcentaje de batería, la capacidad o la condición estética) en beneficios reales para el comprador e integrando cualquier observación escrita por el administrador.
