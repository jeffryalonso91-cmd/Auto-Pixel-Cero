import { motion } from 'motion/react';
import React, { useContext } from 'react';
import { ConfigContext } from '../App';
import { ShieldCheck, Truck, Unlock, ArrowRight, Plane } from 'lucide-react';
import SocialLinks from './SocialIcons';

interface HeroProps {
  onNavigate?: (route: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const config = useContext(ConfigContext);

  const handleServiceScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('servicios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onNavigate) {
      onNavigate('/#servicios');
    }
  };

  return (
    <section className="pt-28 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Interactive Top Spotlight Banner for Import & Apartados */}
      <motion.div
        className="w-full mb-8 sm:mb-12"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <a
          href="#servicios"
          onClick={handleServiceScroll}
          className="group block relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white text-apple-text p-4 sm:p-6 shadow-sm border border-black/5 hover:border-black/15 hover:shadow-md transition-all duration-300 active:scale-[0.99]"
        >
          {/* Subtle warm/cool background tint accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/70 rounded-full blur-3xl pointer-events-none group-hover:bg-slate-200/50 transition-all" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0">
              {/* Store Icon / Logo from config */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-apple-bg border border-black/5 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt={config.storeName || 'Logo'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-7 h-7 text-apple-text"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.63 1.34-.56.64-1.04 1.71-.91 2.74 1.01.08 2.01-.52 2.62-1.21Z"/>
                  </svg>
                )}
              </div>
              
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-apple-text">
                  ¿Buscás apartar para entrega inmediata o importar un modelo a pedido especial?
                </h2>
                <p className="text-xs sm:text-sm text-apple-gray mt-0.5 sm:mt-1 leading-relaxed">
                  Apartá productos de entrega inmediata con un adelanto o pedí cualquier producto Apple exclusivo importado de USA.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <span className="inline-flex items-center gap-2 bg-apple-text text-white group-hover:bg-black/85 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs">
                <span>Apartados y pedido especial</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </a>
      </motion.div>

      {/* Main Hero Body */}
      <div className="w-full flex flex-col md:flex-row items-center gap-10 md:gap-12">
        {/* Left side: Image */}
        <motion.div 
          className="w-full md:w-1/2 flex justify-center md:justify-start"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative w-full max-w-md md:max-w-none aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden bg-transparent">
            <img 
              src={(config as any).heroImageUrl || "https://images.unsplash.com/photo-1603898037225-83606be13426?auto=format&fit=crop&q=80&w=1200"} 
              alt="iPhones" 
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1603898037225-83606be13426?auto=format&fit=crop&q=80&w=1200";
              }}
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Right side: Text and CTA */}
        <motion.div 
          className="w-full md:w-1/2 flex flex-col items-start text-left"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-apple-text mb-6 leading-[1.1]">
            Confianza y pasión<br />por Apple
          </h1>
          
          <p className="text-lg md:text-xl text-apple-text/80 max-w-xl font-medium tracking-tight mb-8 leading-relaxed">
            iPhones seminuevos premium en perfectas condiciones. Rigurosamente probados, totalmente desbloqueados y listos para ti.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 mb-8 text-apple-text/90 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-apple-blue" size={24} />
              <span>Garantía</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="text-apple-blue" size={24} />
              <span>Envío rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <Unlock className="text-apple-blue" size={24} />
              <span>100% desbloqueado</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
            <motion.a
              href="#catalog"
              className="bg-black text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-medium tracking-wide hover:bg-gray-900 transition-all text-base sm:text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 inline-block"
              whileTap={{ scale: 0.95 }}
            >
              Ver Disponibles
            </motion.a>

            <motion.a
              href="#servicios"
              onClick={handleServiceScroll}
              className="bg-white text-apple-text hover:bg-gray-100 border border-black/10 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full font-medium text-base sm:text-lg transition-all inline-flex items-center gap-2 shadow-xs hover:border-black/20"
              whileTap={{ scale: 0.95 }}
            >
              <Plane size={18} className="text-apple-blue" />
              <span>Apartados y pedido especial</span>
            </motion.a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-gray">Síguenos:</span>
            <SocialLinks config={config} variant="pills" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
