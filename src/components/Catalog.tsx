import { motion, AnimatePresence, useInView } from 'motion/react';
import { useContext } from 'react';
import { ConfigContext } from '../App';
import type { Product } from '../data';
import { MessageCircle, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import React, { useState, useMemo, useRef } from 'react';

function Lightbox({ images, onClose }: { images: string[], onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const next = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = (touchStartY.current || 0) - (touchEndY.current || 0);

    // 35px threshold for horizontal swipe
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swiped left -> next
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swiped right -> prev
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrentIndex((p) => (p + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none touch-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar with count & close */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        {images.length > 1 ? (
          <div className="bg-black/50 backdrop-blur-md text-white/90 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
            {currentIndex + 1} de {images.length}
          </div>
        ) : <div />}
        <button 
          className="text-white/80 hover:text-white p-2.5 transition-colors bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto active:scale-95"
          onClick={onClose}
          aria-label="Cerrar galería"
        >
          <X size={24} />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button 
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-20 transition-all bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 hidden sm:flex items-center justify-center active:scale-90"
            onClick={prev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-20 transition-all bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 hidden sm:flex items-center justify-center active:scale-90"
            onClick={next}
            aria-label="Siguiente foto"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div 
        className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center" 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.img 
          key={currentIndex}
          src={images[currentIndex]} 
          alt={`Vista en HD ${currentIndex + 1}`}
          decoding="async"
          initial={{ opacity: 0.6, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=1200';
          }}
          className="max-w-full max-h-[75vh] sm:max-h-[82vh] object-contain rounded-2xl shadow-2xl pointer-events-none"
        />
        
        {images.length > 1 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60 w-2'}`}
                />
              ))}
            </div>
            <span className="text-white/50 text-[11px] font-normal sm:hidden">
              Desliza el dedo para ver más fotos
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}


function ProductCard({ product, index, config, handleWhatsApp, setActiveGallery }: { product: Product, index: number, config: any, handleWhatsApp: any, setActiveGallery: any, key?: React.Key }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-30% 0px -30% 0px" });

  const images = product.images && product.images.length > 0 ? product.images : [(product as any).imageUrl];
  const displayImages = images.slice(0, 3);

  const handleCardClick = () => {
    if (product.status !== 'Vendido') {
      setActiveGallery(images);
    }
  };

  return (
    <motion.div 
      ref={ref}
      key={product.id}
      className={`bg-apple-card rounded-[24px] overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
        product.status === 'Vendido' ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCardClick}
    >
      <div 
        className={`aspect-[3/4] bg-apple-bg overflow-hidden flex items-center justify-center relative ${
          product.images && product.images.length > 1 ? 'p-6 sm:p-8' : ''
        }`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {displayImages.map((img, i) => {
            const zIndexes = [3, 2, 1];
            const baseTransforms = [
              'rotate-0 scale-100',
              '-rotate-[6deg] scale-[0.92]',
              'rotate-[6deg] scale-[0.85]'
            ];
            const hoverTransforms = product.status === 'Vendido' ? [
              '', '', ''
            ] : [
              `${isInView ? 'max-md:-translate-y-2 max-md:scale-[1.02]' : ''} md:group-hover:-translate-y-2 md:group-hover:scale-[1.02]`,
              `${isInView ? 'max-md:-rotate-[12deg] max-md:-translate-x-6 max-md:translate-y-2 max-md:scale-[0.95]' : ''} md:group-hover:-rotate-[12deg] md:group-hover:-translate-x-6 md:group-hover:translate-y-2 md:group-hover:scale-[0.95]`,
              `${isInView ? 'max-md:rotate-[12deg] max-md:translate-x-6 max-md:translate-y-2 max-md:scale-[0.88]' : ''} md:group-hover:rotate-[12deg] md:group-hover:translate-x-6 md:group-hover:translate-y-2 md:group-hover:scale-[0.88]`
            ];
            
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
          ) : (
            <span className="bg-white/95 backdrop-blur-sm text-apple-text text-sm font-medium px-4 py-2 rounded-full shadow-sm">
              Ver galería ({images.length})
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 sm:p-8 flex-grow flex flex-col">
        <h3 className="text-2xl font-semibold tracking-tight mb-2 group-hover:text-apple-blue transition-colors">{product.model}</h3>
        <p className="text-sm text-apple-gray mb-6 tracking-tight">
          {product.storage} &middot; Condición {product.condition} &middot; Batería {product.battery}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-medium tracking-tight">
            {config.currencySymbol}{product.price}
          </span>
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

  const handleWhatsApp = (model: string, price: number) => {
    const message = encodeURIComponent(`Hola ${config.storeName}, estoy interesado en el ${model} por ${config.currencySymbol}${price}. ¿Aún está disponible?`);
    window.open(`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Status Filter
      if (filter === 'available' && p.status === 'Vendido') return false;
      if (filter === 'sold' && p.status !== 'Vendido') return false;
      
      // 2. Search Query Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const searchString = `${p.model} ${p.storage} ${p.condition} ${p.battery} ${p.price}`.toLowerCase();
        if (!searchString.includes(query)) return false;
      }
      
      return true;
    });
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
          Catálogo de Productos
        </motion.h2>
        <motion.p
          className="text-lg text-apple-gray"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          El inventario se mueve rápido. Envíanos un mensaje para asegurar el tuyo.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
