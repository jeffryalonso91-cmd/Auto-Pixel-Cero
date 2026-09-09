import { motion } from 'motion/react';
import { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../App';
import SocialLinks from './SocialIcons';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
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
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 font-semibold text-lg tracking-tight text-apple-text">
          {config.logoUrl && (
            <img src={config.logoUrl} alt={`${config.storeName} Logo`} className="h-8 w-auto object-contain" />
          )}
          {config.storeName}
        </a>
        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
            <a href="#" className="text-apple-text hover:text-apple-blue transition-colors">Inicio</a>
            <a href="#catalog" className="text-apple-text hover:text-apple-blue transition-colors">Catálogo</a>
            <a href="#reviews" className="text-apple-text hover:text-apple-blue transition-colors">Reseñas</a>
            <a href="#contact" className="text-apple-text hover:text-apple-blue transition-colors">Contacto</a>
          </nav>
          
          <div className="h-4 w-px bg-gray-300/80 hidden sm:block" />
          
          <SocialLinks config={config} variant="header" size={17} />
        </div>
      </div>
    </motion.header>
  );
}
