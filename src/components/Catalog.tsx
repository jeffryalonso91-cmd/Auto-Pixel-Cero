import { motion, AnimatePresence } from 'motion/react';
import { useContext } from 'react';
import { ConfigContext } from '../App';
import { type Product, formatPrice, sortProducts, normalizeProduct } from '../data';
import { checkImageOpaqueCorners } from './Admin';
import { analyzeAlpha, type AlphaAnalysisResult } from '../utils/analyzeAlpha';
import { X, ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';

// Temas de colores pastel inspirados en el formato editorial Pixel Cero
const PASTEL_THEMES = [
  { key: 'lilac', bg: 'bg-[#CDBBFF]', hex: '#CDBBFF', giantClass: 'text-white/55' },
  { key: 'sky', bg: 'bg-[#A9CBFF]', hex: '#A9CBFF', giantClass: 'text-white/55' },
  { key: 'mint', bg: 'bg-[#B6E6D8]', hex: '#B6E6D8', giantClass: 'text-white/60' },
  { key: 'peach', bg: 'bg-[#FFD1B3]', hex: '#FFD1B3', giantClass: 'text-white/55' },
  { key: 'butter', bg: 'bg-[#FFF1A8]', hex: '#FFF1A8', giantClass: 'text-white/60' },
  { key: 'ice', bg: 'bg-[#D6E0EA]', hex: '#D6E0EA', giantClass: 'text-white/60' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   LIGHTBOX MODAL (Full HD con Zoom, Pan, Swipe y Atajos de Teclado)
───────────────────────────────────────────────────────────────────────────── */
function Lightbox({ images, onClose }: { images: string[], onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef<number>(1);
  const dragStart = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const hasMoved = useRef<boolean>(false);
  const lastTapTime = useRef<number>(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const next = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    resetZoom();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length, resetZoom]);

  const prev = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    resetZoom();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length, resetZoom]);

  const handleToggleZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetZoom();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && scale === 1) {
        next();
      } else if (e.key === 'ArrowLeft' && scale === 1) {
        prev();
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(4, Math.round((s + 0.5) * 10) / 10));
      } else if (e.key === '-') {
        setScale((s) => {
          const n = Math.max(1, Math.round((s - 0.5) * 10) / 10);
          if (n === 1) setPosition({ x: 0, y: 0 });
          return n;
        });
      } else if (e.key === '0') {
        resetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale, next, prev, onClose, resetZoom]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartScale.current = scale;
      return;
    }
    if (e.touches.length === 1) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      touchStartX.current = clientX;
      touchStartY.current = clientY;
      touchEndX.current = clientX;
      touchEndY.current = clientY;
      hasMoved.current = false;
      dragStart.current = {
        x: clientX - position.x,
        y: clientY - position.y
      };
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime.current;
      if (tapLength < 300 && tapLength > 0) {
        if (scale > 1) {
          resetZoom();
        } else {
          setScale(2.5);
        }
      }
      lastTapTime.current = currentTime;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / pinchStartDist.current;
      const newScale = Math.min(4, Math.max(1, pinchStartScale.current * ratio));
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return;
    }
    if (e.touches.length === 1) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      touchEndX.current = clientX;
      touchEndY.current = clientY;
      if (scale > 1) {
        hasMoved.current = true;
        setPosition({
          x: clientX - dragStart.current.x,
          y: clientY - dragStart.current.y
        });
      }
    }
  };

  const handleTouchEnd = () => {
    pinchStartDist.current = null;
    if (scale === 1 && touchStartX.current !== null && touchEndX.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      const diffY = (touchStartY.current || 0) - (touchEndY.current || 0);
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) next();
        else prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center select-none"
      onClick={onClose}
    >
      {/* Top Header */}
      <div 
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/80 font-display font-bold text-sm sm:text-base tracking-wide pl-2">
          {currentIndex + 1} de {images.length}
        </span>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors active:scale-95 cursor-pointer"
          aria-label="Cerrar vista"
        >
          <X size={22} />
        </button>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && scale === 1 && (
        <>
          <button 
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-30 transition-all bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 hidden sm:flex items-center justify-center active:scale-90 shadow-xl cursor-pointer"
            onClick={prev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-30 transition-all bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 hidden sm:flex items-center justify-center active:scale-90 shadow-xl cursor-pointer"
            onClick={next}
            aria-label="Siguiente foto"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Main Image Viewport with Pan & Zoom */}
      <div 
        ref={imageContainerRef}
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden p-2 sm:p-6" 
        onClick={() => {
          if (hasMoved.current) {
            hasMoved.current = false;
            return;
          }
          onClose();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.img 
          key={currentIndex}
          src={images[currentIndex]} 
          alt={`Vista en HD ${currentIndex + 1}`}
          decoding="async"
          draggable={false}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleToggleZoom}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: scale === 1 ? 'zoom-in' : 'grab',
          }}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=1200';
          }}
          className="max-w-[95vw] max-h-[75vh] sm:max-h-[82vh] object-contain rounded-2xl shadow-2xl pointer-events-auto select-none"
        />

        {/* Bottom indicator */}
        <div 
          className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.length > 1 && scale === 1 && (
            <div className="flex justify-center gap-1.5 sm:gap-2 pointer-events-auto pt-1">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={(e) => {
                    e.stopPropagation();
                    resetZoom();
                    setCurrentIndex(i);
                  }}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60 w-2'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ZONA DE IMAGEN DE PRODUCTO (DETECCIÓN DINÁMICA: MODO RECORTE vs MODO FOTO)
───────────────────────────────────────────────────────────────────────────── */
function ProductCardImage({
  image,
  model,
  totalImages,
  onOpenGallery,
  index,
}: {
  image: string;
  model: string;
  totalImages: number;
  onOpenGallery: () => void;
  index: number;
}) {
  return (
    <div 
      onClick={onOpenGallery}
      className="mt-3 relative aspect-[10/11] w-full p-4 overflow-hidden cursor-pointer group flex items-center justify-center select-none"
    >
      <div className="w-full h-full rounded-[20px] overflow-hidden border border-black/8 bg-white/40 flex items-center justify-center shadow-xs">
        <img 
          src={image} 
          alt={model}
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=800';
          }}
        />
      </div>

      {/* Prompt para ver galería */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          Ver fotos ({totalImages})
        </span>
      </div>

      {/* Indicador de fotos */}
      {totalImages > 1 && (
        <div className="absolute bottom-6 right-6 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full z-20 pointer-events-none shadow-md">
          {totalImages} fotos
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TARJETA EDITORIAL "PIXEL CERO" (ESTRUCTURA UNIFICADA)
───────────────────────────────────────────────────────────────────────────── */
interface EditorialProductCardProps {
  key?: React.Key;
  product: Product;
  index: number;
  config: any;
  handleWhatsApp: (model: string, price?: number) => void;
  setActiveGallery: (images: string[]) => void;
}

function EditorialProductCard({
  product,
  index,
  config,
  setActiveGallery,
}: EditorialProductCardProps) {
  const normalized = useMemo(() => normalizeProduct(product), [product]);

  const images = product.images && product.images.length > 0 ? product.images : [(product as any).imageUrl];
  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=800';

  // Fondos rotativos por producto: Lila #CDBBFF, Celeste #A9CBFF, Menta #C5E9DB
  const bgColors = ['bg-[#CDBBFF]', 'bg-[#A9CBFF]', 'bg-[#C5E9DB]'];
  const cardBgClass = bgColors[index % bgColors.length];

  // Configuración de estados:
  const statusConfig = {
    stock: { label: 'Disponible', color: '#1FA855' },
    order: { label: 'Contra pedido', color: '#E39A00' },
    reserved: { label: 'Apartado', color: '#2F6BFF' },
    sold: { label: 'Vendido', color: '#8E8E98' },
  };

  const currentStatus = statusConfig[normalized.statusCode] || statusConfig.stock;

  const onWhatsAppClick = () => {
    const formattedPrice = normalized.price ? formatPrice(normalized.price, config.currencySymbol) : '';
    const message = formattedPrice
      ? `Hola ${config.storeName}, estoy interesado en el ${normalized.cleanModel} por ${formattedPrice}. ¿Aún está disponible?`
      : `Hola ${config.storeName}, estoy interesado en el ${normalized.cleanModel}. ¿Tienen disponibilidad?`;

    const cleanNum = config.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.article 
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-[28px] overflow-hidden flex flex-col ${cardBgClass} text-[#14131A] shadow-xs hover:shadow-xl transition-all duration-300`}
    >
      {/* ── 1. ZONA DE ENCABEZADO (padding 20px 20px 0) ── */}
      <div className="p-[20px_20px_0] flex flex-col gap-2">
        {/* Fila superior: Estado + Capacidad + Condición + Color en la misma fila */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#14131A] text-xs font-bold shadow-xs">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: currentStatus.color }} 
            />
            <span>{currentStatus.label}</span>
          </span>
          <span 
            className="h-7 inline-flex items-center rounded-full bg-white/70 text-[#14131A] font-semibold text-xs px-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {product.storage}
          </span>
          <span 
            className="h-7 inline-flex items-center rounded-full bg-white/70 text-[#14131A] font-semibold text-xs px-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {product.condition}
          </span>
          {product.color && (
            <span 
              className="h-7 inline-flex items-center rounded-full bg-white/70 text-[#14131A] font-semibold text-xs px-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {product.color}
            </span>
          )}
        </div>

        {/* Título Bricolage Grotesque 800 */}
        <h3 
          className="font-display font-extrabold text-[#14131A] line-clamp-2 mt-1"
          style={{
            fontFamily: "'Bricolage Grotesque', system-ui, -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(24px, 2.6vw, 30px)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            overflowWrap: 'anywhere',
          }}
        >
          {normalized.cleanModel}
        </h3>
      </div>

      {/* ── 2. ZONA DE IMAGEN (aspect ratio 10/11) ── */}
      <ProductCardImage 
        image={primaryImage}
        model={normalized.cleanModel}
        totalImages={images.length}
        onOpenGallery={() => setActiveGallery(images)}
        index={index}
      />

      {/* ── 3. PIE DE TARJETA (Background var(--surface), radio 24px 24px 0 0, margin-top auto) ── */}
      <div className="mt-auto bg-white rounded-t-[24px] p-[16px_20px_20px] flex items-center justify-between gap-3 shadow-[0_-8px_25px_rgba(0,0,0,0.03)]">
        {/* Izquierda: Etiqueta "Precio" encima del monto */}
        <div className="min-w-0">
          <small className="block text-[12px] font-semibold text-[#62606E]">
            Precio
          </small>
          {normalized.price > 0 ? (
            <strong 
              className="block font-display tracking-tight text-[#14131A] tabular-nums leading-tight"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: '30px',
              }}
            >
              {formatPrice(normalized.price, config.currencySymbol)}
            </strong>
          ) : (
            <span 
              className="block font-display tracking-tight text-[#14131A] leading-tight"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: '20px',
              }}
            >
              Consultar
            </span>
          )}
        </div>

        {/* Derecha: Botón WhatsApp 48px alto, radio 999px, #1FA855 */}
        <button
          type="button"
          onClick={onWhatsAppClick}
          className="h-[48px] px-4 rounded-full bg-[#1FA855] hover:bg-[#179347] active:scale-95 text-white font-bold text-[15px] inline-flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 whitespace-nowrap min-w-[132px]"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.04 2a9.9 9.9 0 00-8.43 15.1L2 22l5.05-1.55A9.9 9.9 0 1012.04 2zm5.8 14.07c-.25.7-1.45 1.34-2 1.4-.52.06-1.18.09-1.9-.12a17.3 17.3 0 01-1.72-.64c-3.03-1.3-5-4.35-5.15-4.55-.15-.2-1.23-1.64-1.23-3.13s.78-2.22 1.06-2.52c.27-.3.6-.38.8-.38h.57c.18 0 .43-.07.67.52.25.6.85 2.08.93 2.23.07.15.12.33.02.52-.1.2-.15.33-.3.5-.15.18-.31.4-.45.53-.15.15-.3.3-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.08 1.32 2.38 1.47.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.57.35.07.12.07.72-.18 1.42z" />
          </svg>
          <span>Preguntar</span>
        </button>
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARRUSEL DE VENDIDOS ("Ya encontraron dueño")
───────────────────────────────────────────────────────────────────────────── */
function SoldItemThumbnail({ img, model }: { img: string; model: string }) {
  return (
    <div className="relative h-[150px] rounded-2xl bg-[#E9E8EE] overflow-hidden flex items-center justify-center p-2">
      <div 
        className="w-[120px] h-[135px] relative overflow-hidden grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
        style={{
          WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 50%, transparent 98%)',
          maskImage: 'radial-gradient(ellipse 85% 85% at 50% 50%, black 50%, transparent 98%)',
        }}
      >
        <img 
          src={img} 
          alt={model}
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=400';
          }}
        />
      </div>
      <span className="absolute top-2 right-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
        Vendido
      </span>
    </div>
  );
}

function SoldSection({ 
  soldProducts, 
  handleWhatsApp 
}: { 
  soldProducts: Product[], 
  handleWhatsApp: (model: string) => void 
}) {
  if (soldProducts.length === 0) return null;

  return (
    <section className="mt-20 pt-10 border-t border-black/5" id="vendidos">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
        <div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-[#14131A]">
            Ya encontraron dueño
          </h2>
          <p className="text-[#62606E] font-medium text-base mt-1">
            Los últimos que salieron de la tienda. Puedes consultarnos para avisarte cuando llegue otro similar.
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {soldProducts.map((p) => {
          const img = (p.images && p.images[0]) || (p as any).imageUrl || 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=400';
          return (
            <div 
              key={p.id}
              onClick={() => handleWhatsApp(p.model)}
              className="flex-none w-[190px] sm:w-[210px] snap-start rounded-3xl bg-[#F4F3F7] p-3.5 border border-black/5 flex flex-col justify-between hover:bg-[#eae8f0] transition-colors cursor-pointer group"
            >
              <SoldItemThumbnail img={img} model={p.model} />

              <div className="mt-3">
                <strong className="block text-sm font-bold text-[#14131A] leading-snug line-clamp-1">
                  {p.model}
                </strong>
                <span className="block text-xs font-semibold text-[#62606E] mt-0.5">
                  {p.storage} &middot; Batería {p.battery}
                </span>
                <span className="inline-block mt-3 text-xs font-bold text-[#62606E] group-hover:text-[#1FA855] transition-colors">
                  Consultar similar &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL DEL CATÁLOGO
───────────────────────────────────────────────────────────────────────────── */
export default function Catalog({ products }: { products: Product[] }) {
  const [activeGallery, setActiveGallery] = useState<string[] | null>(null);
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const config = useContext(ConfigContext);

  const handleWhatsApp = (model: string, price?: number) => {
    let message = '';
    if (price !== undefined && price !== null) {
      const formattedPrice = formatPrice(price, config.currencySymbol);
      message = encodeURIComponent(`Hola ${config.storeName}, estoy interesado en el ${model} por ${formattedPrice}. ¿Aún está disponible para compra o entrega inmediata?`);
    } else {
      message = encodeURIComponent(`Hola ${config.storeName}, vi el ${model} que figura como vendido en el catálogo. ¿Tienen o recibirán unidades similares disponibles?`);
    }
    window.open(`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  // Separa los artículos disponibles de los vendidos para el formato editorial
  const { availableProducts, soldProducts } = useMemo(() => {
    const avail: Product[] = [];
    const sold: Product[] = [];

    products.forEach((p) => {
      const norm = normalizeProduct(p);
      if (norm.statusCode === 'sold') {
        sold.push(p);
      } else {
        avail.push(p);
      }
    });

    return {
      availableProducts: sortProducts(avail, false),
      soldProducts: sortProducts(sold, false),
    };
  }, [products]);

  // Lista de filtros rápidos por modelo
  const filterTabs = [
    { id: 'all', label: 'Todos' },
    { id: '13', label: 'iPhone 13' },
    { id: '14', label: 'iPhone 14' },
    { id: '15', label: 'iPhone 15' },
    { id: '16', label: 'iPhone 16' },
    { id: 'pro', label: 'Pro / Pro Max' },
  ];

  // Filtrado de productos disponibles
  const filteredAvailable = useMemo(() => {
    return availableProducts.filter((p) => {
      // 1. Filtro por pestaña de modelo
      if (modelFilter !== 'all') {
        const lowerModel = p.model.toLowerCase();
        if (modelFilter === 'pro') {
          if (!lowerModel.includes('pro')) return false;
        } else {
          // Coincidencia exacta de número de modelo (ej: '13', '14', '15', '16')
          if (!lowerModel.includes(modelFilter)) return false;
        }
      }

      // 2. Filtro por texto de búsqueda
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const cleanQuery = query.replace(/[₡$.,\s]/g, '');
        const formatted = formatPrice(p.price, config.currencySymbol).toLowerCase();
        const cleanFormatted = formatted.replace(/[₡$.,\s]/g, '');
        const rawPrice = String(p.price);
        const searchString = `${p.model} ${p.storage} ${p.condition} ${p.battery} ${rawPrice} ${formatted} ${cleanFormatted}`.toLowerCase();
        if (!searchString.includes(query) && (!cleanQuery || !searchString.includes(cleanQuery))) {
          return false;
        }
      }

      return true;
    });
  }, [availableProducts, modelFilter, searchQuery, config.currencySymbol]);

  return (
    <section id="catalog" className="pt-12 pb-[140px] px-4 sm:px-6 max-w-7xl mx-auto">
      {/* ── SECCIÓN HERO EDITORIAL ── */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#14131A] leading-none mb-3">
          Elige tu iPhone
        </h2>
        <p className="text-[#62606E] font-medium text-base sm:text-lg leading-relaxed">
          Todos pasan por nuestras manos antes de publicarse. Ves la batería real y la condición sin letra pequeña.
        </p>
      </div>

      {/* ── BARRA DE BÚSQUEDA Y PESTAÑAS DE MODELOS ── */}
      <div className="flex flex-col items-center gap-6 mb-10">
        {/* Buscador minimalista */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#62606E]">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar modelo, capacidad, batería o precio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F4F3F7] border-none rounded-full py-3 pl-11 pr-5 text-[#14131A] placeholder:text-[#62606E]/70 focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow text-sm sm:text-base font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#62606E] hover:text-[#14131A] cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── FEED DE TARJETAS DE COLOR ── */}
      {filteredAvailable.length === 0 ? (
        <div className="my-10 p-8 sm:p-12 rounded-3xl bg-[#F4F3F7] text-center max-w-md mx-auto">
          <p className="text-[#62606E] font-medium text-base leading-relaxed">
            Por ahora no tenemos este modelo específico disponible en inventario.{' '}
            <a 
              href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${config.storeName}, estoy buscando un ${modelFilter !== 'all' ? `iPhone modelo ${modelFilter}` : 'iPhone específico'}. ¿Me avisan cuando tengan disponible?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1FA855] font-bold hover:underline"
            >
              Escríbenos
            </a>{' '}
            y te avisamos tan pronto ingrese uno nuevo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-sm sm:max-w-md md:max-w-none mx-auto">
          {filteredAvailable.map((product, index) => (
            <EditorialProductCard 
              key={product.id}
              product={product}
              index={index}
              config={config}
              handleWhatsApp={handleWhatsApp}
              setActiveGallery={setActiveGallery}
            />
          ))}
        </div>
      )}

      {/* ── SECCIÓN "YA ENCONTRARON DUEÑO" (VENDIDOS) ── */}
      <SoldSection 
        soldProducts={soldProducts}
        handleWhatsApp={handleWhatsApp}
      />

      {/* ── LIGHTBOX GALERÍA HD ── */}
      <AnimatePresence>
        {activeGallery && (
          <Lightbox 
            images={activeGallery} 
            onClose={() => setActiveGallery(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
