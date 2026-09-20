import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { BookmarkCheck, ArrowRight, ShieldCheck, Clock, CheckCircle2, BadgeCheck } from 'lucide-react';
import { ConfigContext } from '../App';

interface SpecialServicesProps {
  onNavigate?: (route: string) => void;
}

export default function SpecialServices({ onNavigate }: SpecialServicesProps) {
  const config = useContext(ConfigContext);
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');

  const handleLayawayWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola ${config.storeName}, me gustaría apartar un equipo del inventario de entrega inmediata. ¿Me podrían dar los detalles para realizar el adelanto?`
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
      <div className="text-center max-w-3xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide uppercase mb-4 border border-emerald-100"
        >
          <BookmarkCheck size={14} />
          <span>Facilidades de Compra</span>
        </motion.div>
        
        <motion.h2 
          className="text-3xl md:text-5xl font-semibold tracking-tight text-apple-text mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Sistema de Apartados
        </motion.h2>
        
        <motion.p
          className="text-base sm:text-lg text-apple-gray max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Asegurá tu equipo favorito en inventario hoy mismo con un adelanto y retíralo a tu propio ritmo.
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Subtle background decoration */}
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-emerald-50/60 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookmarkCheck size={28} strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                Solo Productos en Stock Inmediato
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-text mb-3">
              ¿Cómo funciona el apartado?
            </h3>

            <p className="text-apple-gray text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              Aplica <strong className="text-apple-text font-semibold">exclusivamente para equipos que ya tenemos disponibles para venta inmediata</strong> en nuestro inventario físico. Congelás el precio y reservás la unidad para ti.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-apple-bg/70 border border-black/5">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-apple-text">Stock físico asegurado</h4>
                  <p className="text-xs text-apple-gray mt-0.5 leading-relaxed">
                    Disponible únicamente para equipos verificados en inventario físico para entrega inmediata.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-apple-bg/70 border border-black/5">
                <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-apple-text">25% de anticipo</h4>
                  <p className="text-xs text-apple-gray mt-0.5 leading-relaxed">
                    Apartá y congelá el precio con solo el 25% de adelanto del valor total del equipo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-apple-bg/70 border border-black/5">
                <Clock size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-apple-text">Hasta 45 días naturales</h4>
                  <p className="text-xs text-apple-gray mt-0.5 leading-relaxed">
                    Disfrutá de un plazo cómodo de hasta 45 días para cancelar el saldo restante y retirar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-apple-bg/70 border border-black/5">
                <BadgeCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-apple-text">Garantía y respaldo</h4>
                  <p className="text-xs text-apple-gray mt-0.5 leading-relaxed">
                    Recibo oficial a tu nombre y garantía Pixel Cero activa desde el momento de la entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              onClick={handleLayawayWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 px-7 py-3.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>Apartar por WhatsApp</span>
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
      </div>
    </section>
  );
}
