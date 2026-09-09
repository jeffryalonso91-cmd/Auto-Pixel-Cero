import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../App';
import SocialLinks from './SocialIcons';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const config = useContext(ConfigContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 sm:gap-3 font-semibold text-base sm:text-lg tracking-tight text-apple-text shrink min-w-0">
          {config.logoUrl && (
            <img src={config.logoUrl} alt={`${config.storeName} Logo`} className="h-7 sm:h-8 w-auto object-contain shrink-0" />
          )}
          <span className="truncate">{config.storeName}</span>
        </a>

        <div className="flex items-center gap-1.5 sm:gap-6 shrink-0">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-apple-text hover:text-apple-blue transition-colors">Inicio</a>
            <a href="#catalog" className="text-apple-text hover:text-apple-blue transition-colors">Catálogo</a>
            <a href="#reviews" className="text-apple-text hover:text-apple-blue transition-colors">Reseñas</a>
            <a href="#contact" className="text-apple-text hover:text-apple-blue transition-colors">Contacto</a>
          </nav>
          
          <div className="h-4 w-px bg-gray-300/80 hidden md:block" />
          
          {/* Social Links */}
          <SocialLinks config={config} variant="header" size={17} />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-apple-text hover:bg-black/5 active:scale-95 transition-all focus:outline-none ml-1"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white/98 backdrop-blur-xl border-b border-gray-200/80 shadow-lg px-6 py-4"
          >
            <nav className="flex flex-col gap-1 text-base font-medium text-apple-text">
              <a
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-black/5 active:bg-black/10 transition-colors"
              >
                Inicio
              </a>
              <a
                href="#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-black/5 active:bg-black/10 transition-colors"
              >
                Catálogo
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-black/5 active:bg-black/10 transition-colors"
              >
                Reseñas
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-black/5 active:bg-black/10 transition-colors"
              >
                Contacto
              </a>
            </nav>

            <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-gray">
                Nuestras redes
              </span>
              <SocialLinks config={config} variant="header" size={19} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
