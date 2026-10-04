# Orden de Inventario por Fecha de Adición Reciente

Implementación del ordenamiento cronológico inverso (los más nuevos primero) en el catálogo de la página principal y en el panel de administración, priorizando los artículos disponibles recién agregados y ubicando los artículos vendidos al final.

---

### Decisiones Críticas y Confirmaciones del Usuario

> [!IMPORTANT]
> Se han incorporado las preferencias confirmadas en la etapa de clarificación:

- **Jerarquía en Catálogo Principal**:
  1. **Disponibles recién agregados** (ordenados de más nuevo a más antiguo).
  2. **Disponibles anteriores** (según fecha de adición).
  3. **Artículos vendidos** (agrupados al final, ordenados también de forma cronológica).
- **Consistencia en Panel de Administración**:
  - La tabla de gestión de inventario en `#admin` mostrará igualmente los artículos más recientes en la parte superior para facilitar su edición y control de stock inmediato.

---

## 1. Visión General y Concepto

- **Qué hace**: Registra automáticamente la marca de tiempo (`createdAt`) en cada producto creado o existente. Organiza la vitrina pública y la vista administrativa para que cualquier equipo nuevo añadido aparezca de inmediato como primer elemento destacado.
- **Público Objetivo**: Clientes de Pixel Cero que visitan la web en busca de nuevos ingresos de inventario de iPhones y el administrador de la tienda al registrar nuevos lotes.
- **Valor Clave**: Mayor dinamismo comercial, visibilidad inmediata para las últimas adquisiciones y mejor experiencia de navegación sin necesidad de reordenar manualmente.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujo de Usuario

1. **Ingreso a la Página Principal**:
   - En la sección **"Disponibles para Entrega Inmediata"**, los primeros productos visibles en el carrusel y cuadrícula son los últimos modelos ingresados al stock.
   - Los productos con etiqueta o estado *"Vendido"* se desplazan automáticamente a la sección final del catálogo para no opacar el inventario disponible.
2. **Registro de un Nuevo Producto en Administración**:
   - Al completar el formulario de nuevo iPhone en `#admin` y guardar, el sistema asigna la fecha y hora exacta.
   - El nuevo producto encabeza inmediatamente la tabla de administración y la portada de la tienda.

### Lineamientos de Diseño e Identidad

- **Tipografía y Jerarquía**: Mantiene la estética sobria inspirada en Apple, con tipografía Inter, números tabulares y espaciado generoso.
- **Sin Elementos Invasivos**: No se añaden insignias recargadas innecesarias; el orden natural y fluido comunica la novedad de manera limpia y profesional.
- **Filtros Interactivos**: El buscador y los selectores de estado respetan el orden cronológico predeterminado.

---

## 3. Decisiones de Producto y Trade-Offs

- **Estructura del Campo de Fecha (`createdAt`)**:
  - *Enfoque Elegido*: Incorporar `createdAt` como marca de tiempo ISO 8601 estándar (`string`) en el tipo `Product`, con fallback inteligente para productos previos basado en su orden o ID.
  - *Razón*: Máxima compatibilidad con Supabase (PostgreSQL `created_at` / `timestamp`), Firestore y almacenamiento local (`localforage` / `localStorage`).
- **Lógica de Partición y Ordenamiento en Catálogo**:
  - *Enfoque Elegido*: Función de ordenamiento pura y memoizada `sortProductsByDateAndAvailability(products)` que separa en dos grupos (`status !== 'Vendido'` vs `status === 'Vendido'`), ordena cada grupo por `createdAt` descendente, y los concatena.
  - *Razón*: Garantiza que ningún producto vendido desplace a un producto disponible de los primeros lugares, manteniendo los nuevos ingresos como prioridad de venta.

---

## 4. Arquitectura Técnica y Estrategia de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    Fuentes de Datos                         │
│  Supabase (PostgreSQL) / Firestore / Cache LocalForage      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Estado Global (App.tsx)                   │
│   • Normalización de productos y timestamps (createdAt)     │
│   • Sincronización en tiempo real vía suscripciones         │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│   Catálogo (Catalog.tsx)     │ │     Admin (Admin.tsx)       │
│  • Separación: Disponibles   │ │  • Creación con timestamp   │
│    vs. Vendidos              │ │    ISO actual               │
│  • Orden: Recientes primero  │ │  • Tabla ordenada con los   │
│  • Búsqueda y filtrado fluido│ │    más recientes arriba     │
└──────────────────────────────┘ └─────────────────────────────┘
```

### Mapeo de Componentes y Funciones

- `src/data.ts`:
  - Extensión del tipo `Product` con `createdAt?: string`.
  - Asignación de marcas de tiempo en el inventario base inicial `PRODUCTS`.
  - Función de utilidad para ordenamiento `sortProductsByRecency(products, prioritizeAvailable)`.
- `src/App.tsx`:
  - Mantenimiento y persistencia del campo `createdAt` al cargar y fusionar datos de base de datos y caché.
- `src/components/Catalog.tsx`:
  - Aplicación del ordenamiento con prioridad de disponibles más recientes en la visualización de tarjetas y resultados filtrados.
- `src/components/Admin.tsx`:
  - Inclusión automática de `createdAt: new Date().toISOString()` al añadir productos.
  - Ordenamiento descendente en la tabla de gestión de inventario.
