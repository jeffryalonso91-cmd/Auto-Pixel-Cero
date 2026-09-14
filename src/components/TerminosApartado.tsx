import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookmarkCheck, Calendar, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { ConfigContext } from '../App';
import Header from './Header';
import Footer from './Footer';

interface TerminosApartadoProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

interface TermItem {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  highlight?: string;
  warning?: boolean;
  success?: boolean;
}

const termsList: TermItem[] = [
  {
    number: "1",
    title: "¿En qué consiste tu apartado?",
    description: "Es el servicio que te permite reservar y asegurar de inmediato cualquier producto Apple disponible en inventario con una inversión inicial mínima, garantizando que el equipo quede apartado exclusivamente para ti sin riesgo de venta a terceros.",
    icon: BookmarkCheck
  },
  {
    number: "2",
    title: "Monto accesible del adelanto",
    description: "Para asegurar tu equipo únicamente solicitamos un adelanto del 25% del valor total del producto, facilitándote planificar tu compra a tu propio ritmo con tranquilidad.",
    icon: ShieldCheck,
    highlight: "25% del valor total"
  },
  {
    number: "3",
    title: "Plazo amplio de 45 días para retirar",
    description: "Cuentas con un periodo extendido de hasta 45 días naturales a partir de la fecha del adelanto para cancelar el saldo restante. Durante este tiempo el equipo permanece seguro y custodiado para ti. Al cumplirse los 45 días sin haber completado el saldo, el sistema libera la reserva para permitir la venta del artículo.",
    icon: Calendar,
    highlight: "Hasta 45 días naturales"
  },
  {
    number: "4",
    title: "Facilidades y medios de pago",
    description: "El saldo restante se cancela cómodamente antes de retirar o recibir el producto. Ponemos a tu disposición SINPE Móvil, transferencia bancaria y efectivo para tu mayor conveniencia.",
    icon: CheckCircle2
  },
  {
    number: "5",
    title: "Transparencia y verificación del equipo",
    description: "Nos aseguramos de que compres con total confianza: puedes revisar y verificar personalmente el estado estético y funcional del producto antes de efectuar tu apartado, garantizando que estás satisfecho con tu elección.",
    icon: CheckCircle2
  },
  {
    number: "6",
    title: "Respaldo y exclusividad de tu reserva",
    description: "Al apartar, el equipo se retira inmediatamente de la venta al público y queda reservado de forma exclusiva para ti. Debido a este compromiso comercial y custodia dedicada, el adelanto no es reembolsable si decides cancelar la compra por razones voluntarias.",
    icon: ShieldCheck,
    highlight: "Reserva exclusiva"
  },
  {
    number: "7",
    title: "Flexibilidad de cambio por otro modelo",
    description: "Si durante tu periodo de apartado prefieres otro equipo disponible en stock (de mayor o menor valor), con gusto te facilitamos el cambio aplicando el monto de tu adelanto y ajustando la diferencia correspondiente.",
    icon: RefreshCw,
    success: true
  },
  {
    number: "8",
    title: "Confirmación inmediata por WhatsApp",
    description: "Tu reserva queda formalmente confirmada y respaldada en cuanto nos compartes tu comprobante de pago vía WhatsApp, recibiendo una validación directa por parte de nuestro equipo.",
    icon: CheckCircle2
  },
  {
    number: "9",
    title: "Disponibilidad en stock físico",
    description: "El sistema de apartados aplica para todos los equipos en inventario físico listo para entrega. Si buscas un modelo que requiera traerse desde USA, dispones de nuestro servicio de Cotización e Importación.",
    icon: ShieldCheck
  }
];

export default function TerminosApartado({ onBack, onNavigate }: TerminosApartadoProps) {
  const config = useContext(ConfigContext);
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');
  // Estado para controlar qué viñetas están abiertas (por defecto la 1 abierta para indicar interactividad)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ "1": true });

  const toggleItem = (itemNumber: string) => {
    setOpenItems(prev => ({
      ...prev,
      [itemNumber]: !prev[itemNumber]
    }));
  };

  const toggleAll = (expand: boolean) => {
    const nextState: Record<string, boolean> = {};
    termsList.forEach(t => {
      nextState[t.number] = expand;
    });
    setOpenItems(nextState);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `Términos del Sistema de Apartado | ${config.storeName}`;
    return () => {
      document.title = config.storeName || "Pixel Cero";
    };
  }, [config.storeName]);

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hola ${config.storeName}, tengo una consulta sobre los Términos y Condiciones del Sistema de Apartado.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const navHandler = onNavigate || onBack;

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col selection:bg-apple-blue selection:text-white">
      <Header onNavigate={navHandler} />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-apple-text text-sm font-medium transition-all shadow-sm border border-black/5 active:scale-95 group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>Volver a la tienda</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-apple-gray">
              <button 
                onClick={() => toggleAll(true)}
                className="hover:text-apple-text px-2.5 py-1 rounded-md hover:bg-black/5 transition-colors"
              >
                Expandir todo
              </button>
              <span>&middot;</span>
              <button 
                onClick={() => toggleAll(false)}
                className="hover:text-apple-text px-2.5 py-1 rounded-md hover:bg-black/5 transition-colors"
              >
                Colapsar todo
              </button>
            </div>
          </div>

          {/* Hero / Header Card */}
          <motion.div 
            className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-sm mb-10 text-center sm:text-left relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
              <BookmarkCheck size={14} />
              <span>Pixel Cero CR &middot; Políticas Oficiales</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-apple-text mb-4">
              Términos y Condiciones del Sistema de Apartado
            </h1>

            <p className="text-apple-gray text-base sm:text-lg leading-relaxed max-w-2xl">
              Condiciones claras y transparentes para que reserves tu equipo Apple en inventario físico con total confianza y respaldo. Toca cada punto para ver el detalle.
            </p>
          </motion.div>

          {/* Terms List Collapsible Cards */}
          <div className="space-y-3.5 mb-12">
            {termsList.map((term, index) => {
              const isOpen = !!openItems[term.number];
              return (
                <motion.div
                  key={term.number}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:border-black/15 ${
                    term.warning 
                      ? 'border-amber-200/80' 
                      : (term as any).success
                        ? 'border-emerald-200/80'
                        : 'border-black/5'
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(term.number)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 transition-colors ${
                        term.warning 
                          ? 'bg-amber-100 text-amber-800' 
                          : (term as any).success
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOpen 
                              ? 'bg-apple-text text-white'
                              : 'bg-apple-bg text-apple-text'
                      }`}>
                        {term.number}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <h2 className="text-base sm:text-lg font-semibold text-apple-text tracking-tight">
                          {term.title}
                        </h2>
                        {term.highlight && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {term.highlight}
                          </span>
                        )}
                        {term.warning && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Importante
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`p-1.5 rounded-full transition-transform duration-300 text-apple-gray shrink-0 ${
                      isOpen ? 'rotate-180 text-apple-text bg-black/5' : 'bg-transparent'
                    }`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-apple-gray text-sm sm:text-base leading-relaxed pl-[4.25rem] sm:pl-[4.75rem] border-t border-gray-100/70">
                          <p className="mt-2.5">{term.description}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* WhatsApp Support Callout */}
          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-semibold text-apple-text mb-1">
                ¿Deseas apartar un producto o tienes alguna duda?
              </h3>
              <p className="text-sm text-apple-gray">
                Contáctanos directamente por WhatsApp y con gusto te asistiremos con la reserva de tu equipo.
              </p>
            </div>

            <button
              onClick={handleWhatsAppContact}
              className="bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 px-6 py-3 rounded-full text-sm font-medium transition-all shrink-0 flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </main>

      <Footer onNavigate={navHandler} />
    </div>
  );
}
