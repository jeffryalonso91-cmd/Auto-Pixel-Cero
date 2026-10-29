import { motion, AnimatePresence, useInView } from 'motion/react';
import { useContext } from 'react';
import { ConfigContext } from '../App';
import { type Product, formatPrice, sortProducts } from '../data';
import { MessageCircle, X, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, RotateCcw, ChevronDown } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';

function Lightbox({ images, onClose }: { images: string[], onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // References for touch & mouse tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef<number>(1);
  const dragStart = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const hasMoved = useRef<boolean>(false);
  const lastTapTime = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Reset zoom and pan when changing image
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

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setScale((s) => Math.min(4, Math.round((s + 0.5) * 10) / 10));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setScale((s) => {
      const nextScale = Math.max(1, Math.round((s - 0.5) * 10) / 10);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  const handleToggleZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Keyboard navigation & zoom shortcuts
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
          const next = Math.max(1, Math.round((s - 0.5) * 10) / 10);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        resetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale, next, prev, onClose, resetZoom]);

  // Touch handling with Pinch-to-zoom & Pan & Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 fingers = Pinch to zoom
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
      if (scale > 1) {
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Two-finger pinch
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / pinchStartDist.current;
      const newScale = Math.min(4, Math.max(1, Math.round((pinchStartScale.current * ratio) * 10) / 10));
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return;
    }

    // Single finger
    if (e.touches.length === 1) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      touchEndX.current = clientX;
      touchEndY.current = clientY;

      if (scale > 1) {
        hasMoved.current = true;
        const newX = clientX - dragStart.current.x;
        const newY = clientY - dragStart.current.y;
        const maxPanX = (window.innerWidth * (scale - 1)) / 1.8 + 80;
        const maxPanY = (window.innerHeight * (scale - 1)) / 1.8 + 80;
        setPosition({
          x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
          y: Math.max(-maxPanY, Math.min(maxPanY, newY))
        });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (pinchStartDist.current !== null) {
      pinchStartDist.current = null;
      return;
    }

    const now = Date.now();
    // Check for double tap
    if (!hasMoved.current && now - lastTapTime.current < 320) {
      lastTapTime.current = 0;
      if (scale > 1) {
        resetZoom();
      } else {
        setScale(2.5);
      }
      return;
    }
    lastTapTime.current = now;

    // Single finger swipe only if scale is 1
    if (scale === 1 && touchStartX.current !== null && touchEndX.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      const diffY = (touchStartY.current || 0) - (touchEndY.current || 0);

      // 40px threshold for swipe
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          next();
        } else {
          prev();
        }
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Mouse drag handlers for desktop pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      isMouseDown.current = true;
      setIsDragging(true);
      hasMoved.current = false;
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMouseDown.current && scale > 1) {
      hasMoved.current = true;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      const maxPanX = (window.innerWidth * (scale - 1)) / 1.8 + 80;
      const maxPanY = (window.innerHeight * (scale - 1)) / 1.8 + 80;
      setPosition({
        x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newY))
      });
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  // Wheel zoom on desktop
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.3 : -0.3;
    setScale((s) => {
      const nextScale = Math.min(4, Math.max(1, Math.round((s + delta) * 10) / 10));
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
      return nextScale;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center select-none"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Top Bar: Counter & Controls */}
      <div
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/80 font-medium text-sm sm:text-base tracking-wide pl-2">
          {currentIndex + 1} / {images.length}
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="text-white/80 hover:text-white disabled:opacity-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors active:scale-95"
            aria-label="Alejar"
            title="Alejar"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-white/90 text-xs sm:text-sm font-mono min-w-[3.2rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="text-white/80 hover:text-white disabled:opacity-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors active:scale-95"
            aria-label="Acercar"
            title="Acercar"
          >
            <ZoomIn size={20} />
          </button>
          {scale > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors active:scale-95"
              aria-label="Restablecer zoom"
              title="Restablecer zoom"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors active:scale-95 ml-1"
            aria-label="Cerrar galería"
            title="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && scale === 1 && (
        <>
          <button
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-30 transition-all bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center active:scale-90 shadow-xl"
            onClick={prev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-30 transition-all bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center active:scale-90 shadow-xl"
            onClick={next}
            aria-label="Siguiente foto"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Main Image Container */}
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
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Vista en alta resolución ${currentIndex + 1}`}
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
            cursor: scale === 1 ? 'zoom-in' : isDragging ? 'grabbing' : 'grab',
          }}
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('photo-1678652197831')) {
              target.src = 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=1200';
            }
          }}
          className="max-w-[95vw] max-h-[75vh] sm:max-h-[82vh] object-contain rounded-2xl shadow-2xl pointer-events-auto select-none"
        />

        {/* Dots Indicator */}
        {images.length > 1 && scale === 1 && (
          <div
            className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                  setCurrentIndex(i);
                }}
                aria-label={`Ver foto ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60 w-2'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProductCard({
  product,
  index,
  config,
  handleWhatsApp,
  setActiveGallery,
}: {
  key?: React.Key;
  product: Product;
  index: number;
  config: any;
  handleWhatsApp: (model: string, price?: number) => void;
  setActiveGallery: (images: string[]) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { amount: 0.6 });

  const images = (product.images && product.images.length > 0
    ? product.images
    : ((product as any).imageUrl ? [(product as any).imageUrl] : [])
  ).filter((img): img is string => typeof img === 'string' && img.trim() !== '');
  const displayImages = images.slice(0, 3);
  const hasComments = Boolean(product.comments && product.comments.trim() !== '');

  return (
    <motion.div
      ref={cardRef}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`relative aspect-square bg-apple-bg overflow-hidden ${images.length > 0 ? 'cursor-pointer' : ''} p-6`}
        onClick={() => { if (images.length > 0) setActiveGallery(images); }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {displayImages.length === 0 ? (
            <div className="text-apple-gray/60 text-sm font-medium text-center px-4 select-none">
              Sin foto
            </div>
          ) : displayImages.map((img, i) => {
            const baseTransforms = [
              'scale-95 translate-y-1',
              'scale-90 -rotate-6 -translate-x-4 translate-y-2 opacity-90',
              'scale-90 rotate-6 translate-x-4 translate-y-2 opacity-90',
            ];
            const hoverTransforms = [
              isInView ? 'max-md:scale-100 max-md:translate-y-0 md:group-hover:scale-100 md:group-hover:translate-y-0' : 'md:group-hover:scale-100 md:group-hover:translate-y-0',
              isInView ? 'max-md:-rotate-12 max-md:-translate-x-8 max-md:translate-y-1 max-md:opacity-100 md:group-hover:-rotate-12 md:group-hover:-translate-x-8 md:group-hover:translate-y-1 md:group-hover:opacity-100' : 'md:group-hover:-rotate-12 md:group-hover:-translate-x-8 md:group-hover:translate-y-1 md:group-hover:opacity-100',
              isInView ? 'max-md:rotate-12 max-md:translate-x-8 max-md:translate-y-1 max-md:opacity-100 md:group-hover:rotate-12 md:group-hover:translate-x-8 md:group-hover:translate-y-1 md:group-hover:opacity-100' : 'md:group-hover:rotate-12 md:group-hover:translate-x-8 md:group-hover:translate-y-1 md:group-hover:opacity-100',
            ];
            const zIndexes = [10, 5, 4];

            return (
              <div
                key={i}
                className={`absolute w-full h-full ${displayImages.length > 1 ? 'rounded-2xl shadow-lg border border-black/5 overflow-hidden bg-white' : ''} transition-all duration-500 origin-center ${displayImages.length > 1 ? `${baseTransforms[i]} ${hoverTransforms[i]}` : ''}`}
                style={{ zIndex: zIndexes[i] }}
              >
                <img 
                  src={img}
                  alt={`${product.model} - foto ${i + 1}`}
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('photo-1678652197831')) {
                      target.src = 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=800';
                    }
                  }}
                  className={`w-full h-full transition-transform duration-700 ease-out object-cover ${product.status === 'Vendido' ? 'opacity-80 grayscale-[20%]' : ''}`}
                />
              </div>
            );
          })}
        </div>
        <div className={`absolute inset-0 transition-colors z-20 flex items-center justify-center ${product.status === 'Vendido' ? '' : `bg-black/0 ${isInView ? 'max-md:bg-black/5 max-md:opacity-100' : ''} md:group-hover:bg-black/5 opacity-0 md:group-hover:opacity-100`}`}>
          {product.status === 'Vendido' ? (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center z-30">
               <div className="bg-red-600/95 backdrop-blur-md text-white font-bold tracking-[0.2em] uppercase py-3 px-8 transform -rotate-[15deg] text-xl sm:text-2xl shadow-xl rounded-xl border border-white/20">
                 Vendido
               </div>
            </div>
          ) : images.length > 0 ? (
            <span className="bg-white/95 backdrop-blur-sm text-apple-text text-sm font-medium px-4 py-2 rounded-full shadow-sm">
              Ver galería ({images.length})
            </span>
          ) : null}
        </div>
      </div>
      
      <div className="p-6 sm:p-8 flex-grow flex flex-col">
        <h3 className="text-2xl font-semibold tracking-tight mb-2 group-hover:text-apple-blue transition-colors">{product.model}</h3>
        
        {/* Especificaciones principales */}
        {hasComments ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(prev => !prev);
            }}
            className="group/specs text-left mb-6 focus:outline-none"
            title="Haz clic para ver detalles y observaciones"
          >
            <div className="inline-flex items-center gap-1.5 flex-wrap text-sm text-apple-gray group-hover/specs:text-apple-blue transition-colors">
              <span className="font-normal">{product.storage} &middot; Condición {product.condition} &middot; Batería {product.battery}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-apple-blue bg-blue-50 px-2 py-0.5 rounded-full">
                <span>{showComments ? 'Ocultar detalles' : 'Ver detalles'}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${showComments ? 'rotate-180' : ''}`} />
              </span>
            </div>
          </button>
        ) : (
          <p className="text-sm text-apple-gray mb-6 tracking-tight">
            {product.storage} &middot; Condición {product.condition} &middot; Batería {product.battery}
          </p>
        )}

        {/* Despliegue condicional del campo de comentarios (solo si tiene contenido y se dio clic) */}
        <AnimatePresence>
          {hasComments && showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6 -mt-3"
            >
              <div className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-100/80 text-xs text-apple-text leading-relaxed">
                <p className="whitespace-pre-line text-apple-text/90 font-normal">
                  {product.comments}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-auto flex items-center justify-between pt-2">
          {product.status === 'Vendido' ? (
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
              Vendido
            </span>
          ) : (
            <span className="text-xl font-semibold tracking-tight text-apple-text">
              {formatPrice(product.price, config.currencySymbol)}
            </span>
          )}
          {product.status === 'Vendido' ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsApp(product.model);
              }}
              className="bg-apple-bg text-apple-gray hover:bg-green-500 hover:text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 relative z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Consultar
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsApp(product.model, product.price);
              }}
              className="bg-apple-bg text-apple-text hover:bg-green-500 hover:text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 relative z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Preguntar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Catalog({ products }: { products: Product[] }) {
  const [activeGallery, setActiveGallery] = useState<string[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const config = useContext(ConfigContext);

  const handleWhatsApp = (model: string, price?: number) => {
    let message = '';
    if (price !== undefined && price !== null) {
      const formattedPrice = formatPrice(price, config.currencySymbol);
      message = encodeURIComponent(`Hola ${config.storeName}, estoy interesado en el ${model} por ${formattedPrice}. ¿Aún está disponible?`);
    } else {
      message = encodeURIComponent(`Hola ${config.storeName}, vi el ${model} que figura como vendido en el catálogo. ¿Tienen o recibirán unidades similares disponibles?`);
    }
    window.open(`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const filteredProducts = useMemo(() => {
    const list = products.filter(p => {
      // 1. Status Filter
      if (filter === 'available' && p.status === 'Vendido') return false;
      if (filter === 'sold' && p.status !== 'Vendido') return false;
      
      // 2. Search Query Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const cleanQuery = query.replace(/[₡$.,\s]/g, '');
        const formatted = formatPrice(p.price, config.currencySymbol).toLowerCase();
        const cleanFormatted = formatted.replace(/[₡$.,\s]/g, '');
        const rawPrice = String(p.price);
        const searchString = `${p.model} ${p.storage} ${p.condition} ${p.battery} ${rawPrice} ${formatted} ${cleanFormatted}`.toLowerCase();
        if (!searchString.includes(query) && (!cleanQuery || !searchString.includes(cleanQuery))) return false;
      }
      
      return true;
    });

    // Mostrar primero los artículos disponibles (más recientes primero) y luego los vendidos (más recientes primero)
    return sortProducts(list, true);
  }, [products, filter, searchQuery]);

  return (
    <section id="catalog" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <motion.h2 
          className="text-4xl md:text-5xl font-semibold tracking-tight text-apple-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Disponibles para Entrega Inmediata
        </motion.h2>
        <motion.p
          className="text-lg text-apple-gray"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Equipos listos para entrega inmediata o para apartar con un 25% de adelanto.
        </motion.p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-apple-gray">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar modelo, capacidad, precio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-apple-bg border-none rounded-full py-3.5 pl-12 pr-6 text-apple-text placeholder:text-apple-gray/70 focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow text-base"
          />
        </div>

        <div className="flex justify-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-apple-text text-white' : 'bg-apple-bg text-apple-gray hover:bg-gray-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'available' ? 'bg-apple-text text-white' : 'bg-apple-bg text-apple-gray hover:bg-gray-200'}`}
          >
            Disponibles
          </button>
          <button
            onClick={() => setFilter('sold')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'sold' ? 'bg-apple-text text-white' : 'bg-apple-bg text-apple-gray hover:bg-gray-200'}`}
          >
            Vendidos
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-apple-gray">No hay artículos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {filteredProducts.map((product, index) => (
            <ProductCard 
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

      <AnimatePresence>
        {activeGallery && (
          <Lightbox images={activeGallery} onClose={() => setActiveGallery(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
