import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { ConfigContext } from '../App';

export default function PopupBanner() {
  const config = useContext(ConfigContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (config.popupEnabled && config.popupImageUrl) {
      const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
      if (!hasSeenPopup) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [config.popupEnabled, config.popupImageUrl]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center bg-transparent"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
              aria-label="Cerrar banner"
            >
              <X size={20} />
            </button>
            <img 
              src={config.popupImageUrl} 
              alt="Banner de promoción" 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-3xl block"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
