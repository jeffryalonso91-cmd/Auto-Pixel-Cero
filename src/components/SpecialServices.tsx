import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Plane, BookmarkCheck, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { ConfigContext } from '../App';

interface SpecialServicesProps {
  onNavigate?: (route: string) => void;
}

export default function SpecialServices({ onNavigate }: SpecialServicesProps) {
  const config = useContext(ConfigContext);
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');

  const handleQuoteWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${config.storeName}, estoy buscando un producto Apple que no encontré en la página y me gustaría cotizarlo para importación.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleLayawayWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${config.storeName}, me gustaría apartar un equipo del inventario. ¿Me podrían dar los detalles para realizar el adelanto?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleLinkClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="servicios" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 text-apple-text text-xs font-semibold tracking-wide uppercase mb-4"
        >
          <span>Modalidades de Compra</span>
        </motion.div>
        
        <motion.h2 
          className="text-3xl md:text-5xl font-semibold tracking-tight text-apple-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Apartados y Pedido Especial
        </motion.h2>
        
        <motion.p
          className="text-base sm:text-lg text-apple-gray"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Elige entre apartar un equipo que ya tenemos listo en entrega inmediata o importar a pedido especial cualquier modelo Apple que no esté en nuestro catálogo.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BLOQUE 1: Sistema de Apartados (Para stock disponible de entrega inmediata) */}
        <motion.div
          className="bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden order-1"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Subtle background decoration */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookmarkCheck size={26} strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                Solo Productos en Stock Inmediato
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-apple-text mb-3">
              Sistema de Apartados
            </h3>

            <p className="text-apple-gray text-base leading-relaxed mb-6">
              Aplica <strong className="text-apple-text font-semibold">exclusivamente para equipos que ya tenemos disponibles para venta inmediata</strong> en nuestro catálogo. Reservá tu equipo hoy y retiralo a tu ritmo.
            </p>

            <div className="space-y-2.5 mb-8 text-sm text-apple-text/85">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
                <span>Disponible únicamente para equipos en inventario físico actual</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={17} className="text-emerald-600 shrink-0" />
                <span>Apartá con solo el 25% de adelanto del valor total</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={17} className="text-emerald-600 shrink-0" />
                <span>Plazo cómodo de hasta 45 días naturales para retirar tu equipo</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              onClick={handleLayawayWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 px-6 py-3.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Apartar por WhatsApp
            </button>

            <a
              href="/terminos-apartado"
              onClick={(e) => handleLinkClick(e, '/terminos-apartado')}
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-apple-gray hover:text-emerald-700 transition-colors group py-2"
            >
              <span>Ver términos y condiciones de apartado</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>

        {/* BLOQUE 2: Pedido Especial / Cotización e Importación */}
        <motion.div
          className="bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden order-2"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {/* Subtle background decoration */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-50/60 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 text-apple-blue flex items-center justify-center">
                <Plane size={26} strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-apple-blue rounded-full border border-blue-100">
                Pedido Especial &middot; No Disponible en Stock
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-apple-text mb-3">
              ¿Buscás un modelo que no tenemos disponible?
            </h3>

            <p className="text-apple-gray text-base leading-relaxed mb-6">
              Traemos a pedido especial <strong className="text-apple-text font-semibold">cualquier producto Apple que desees y no esté en nuestro catálogo</strong>. Importamos de USA con certificación original y los mejores precios.
            </p>

            <div className="space-y-2.5 mb-8 text-sm text-apple-text/85">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={17} className="text-apple-blue shrink-0" />
                <span>Cualquier modelo, color o capacidad Apple bajo pedido</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={17} className="text-apple-blue shrink-0" />
                <span>Tiempo proyectado de entrega: 15 a 22 días hábiles</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={17} className="text-apple-blue shrink-0" />
                <span>Equipos certificados con garantía de satisfacción en entrega</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              onClick={handleQuoteWhatsApp}
              className="bg-apple-text text-white hover:bg-black/85 active:scale-98 px-6 py-3.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Cotizar producto
            </button>

            <a
              href="/terminos-importacion"
              onClick={(e) => handleLinkClick(e, '/terminos-importacion')}
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-apple-gray hover:text-apple-blue transition-colors group py-2"
            >
              <span>Ver términos y condiciones de importación</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
