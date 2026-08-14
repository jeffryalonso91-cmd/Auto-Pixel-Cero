import { motion } from 'motion/react';
import { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../App';

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
        <nav className="flex items-center gap-4 sm:gap-8 text-sm font-medium">
          <a href="#" className="text-apple-text hover:text-apple-blue transition-colors">inicio</a>
          <a href="#catalog" className="text-apple-text hover:text-apple-blue transition-colors">catálogo</a>
          <a href="#contact" className="text-apple-text hover:text-apple-blue transition-colors">contacto</a>
        </nav>
      </div>
    </motion.header>
  );
}
