import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 320px
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="scroll-to-top-button"
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 p-3.5 sm:p-4 rounded-full bg-white/95 text-apple-text hover:text-apple-blue shadow-[0_10px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-black/10 backdrop-blur-md transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
          aria-label="Subir al inicio de la página"
          title="Subir al inicio"
        >
          <ArrowUp size={22} strokeWidth={2.3} className="transition-transform group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
