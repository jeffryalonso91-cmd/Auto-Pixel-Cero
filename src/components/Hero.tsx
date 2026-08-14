import { motion } from 'motion/react';
import { useContext } from 'react';
import { ConfigContext } from '../App';
import { ShieldCheck, Truck, Unlock } from 'lucide-react';

export default function Hero() {
  const config = useContext(ConfigContext);

  return (
    <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
      {/* Left side: Image */}
      <motion.div 
        className="w-full md:w-1/2 flex justify-center md:justify-start"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative w-full max-w-md md:max-w-none aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden bg-transparent">
          {(config as any).heroImageUrl && (
            <img 
              src={(config as any).heroImageUrl} 
              alt="iPhones" 
              className="w-full h-full object-contain"
            />
          )}
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
        
        <div className="flex flex-wrap items-center gap-6 mb-10 text-apple-text/90 font-medium">
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

        <motion.a
          href="#catalog"
          className="bg-black text-white px-10 py-4 rounded-full font-medium tracking-wide hover:bg-gray-900 transition-all text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-1"
          whileTap={{ scale: 0.95 }}
        >
          Ver Catálogo
        </motion.a>
      </motion.div>
    </section>
  );
}
