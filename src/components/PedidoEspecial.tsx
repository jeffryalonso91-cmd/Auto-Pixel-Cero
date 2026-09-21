import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Watch, 
  Headphones, 
  Speaker, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  ChevronDown,
  Search,
  ArrowUp,
  CheckCircle2
} from 'lucide-react';
import { ConfigContext } from '../App';
import Header from './Header';
import Footer from './Footer';

interface PedidoEspecialProps {
  onBack?: () => void;
  onNavigate?: (route: string) => void;
}

interface DeviceHighlight {
  id: string;
  name: string;
  category: string;
  tagline: string;
  specs: string[];
  defaultQuote: string;
}

const DEVICES_DATA: DeviceHighlight[] = [
  {
    id: 'macbook',
    name: 'MacBook',
    category: 'Mac',
    tagline: 'Configuraciones de memoria y almacenamiento personalizadas',
    specs: [
      'Chips Apple Silicon de alto rendimiento y eficiencia',
      'Memoria unificada y almacenamiento SSD a tu medida',
      'Teclados disponibles en español o inglés',
      'Pantallas Liquid Retina con fidelidad de color profesional'
    ],
    defaultQuote: 'un MacBook a pedido especial'
  },
  {
    id: 'iphone',
    name: 'iPhone',
    category: 'iPhone',
    tagline: 'Cualquier generación, color y capacidad de almacenamiento',
    specs: [
      'Colores y acabados oficiales de Apple',
      'Capacidades de almacenamiento a tu elección',
      '100% desbloqueados de fábrica para cualquier operadora',
      'Inspección rigurosa y salud de batería garantizada'
    ],
    defaultQuote: 'un iPhone a pedido especial'
  },
  {
    id: 'ipad',
    name: 'iPad',
    category: 'iPad',
    tagline: 'Diferentes tamaños y compatibilidad con accesorios Apple',
    specs: [
      'Diferentes tamaños de pantalla y tecnologías Liquid Retina',
      'Modelos Wi-Fi o Wi-Fi + Cellular con eSIM',
      'Compatibilidad con Apple Pencil y teclados inteligentes',
      'Diseño ultra delgado y portabilidad superior'
    ],
    defaultQuote: 'un iPad a pedido especial'
  },
  {
    id: 'watch',
    name: 'Apple Watch',
    category: 'Watch',
    tagline: 'Cajas en titanio o aluminio en diversos tamaños y correas',
    specs: [
      'Diversos tamaños de caja y materiales a elección',
      'Sensores avanzados de actividad, salud y ritmo cardíaco',
      'Conectividad GPS o GPS + Cellular para total libertad',
      'Amplia variedad de correas intercambiables'
    ],
    defaultQuote: 'un Apple Watch a pedido especial'
  },
  {
    id: 'airpods',
    name: 'AirPods',
    category: 'Audio',
    tagline: 'Cancelación Activa de Ruido y audio espacial envolvente',
    specs: [
      'Estuches de carga inalámbrica y conector USB-C',
      'Audio espacial personalizado con seguimiento dinámico',
      'Aislamiento de voz inteligente y micrófonos de alta fidelidad',
      'Emparejamiento instantáneo con todos tus dispositivos Apple'
    ],
    defaultQuote: 'unos AirPods a pedido especial'
  },
  {
    id: 'homepod',
    name: 'HomePod',
    category: 'Hogar',
    tagline: 'Sonido acústico de alta fidelidad y centro del hogar inteligente',
    specs: [
      'Diseño acústico optimizado para cualquier habitación',
      'Audio computacional avanzado y asistencia por Siri',
      'Sensor de temperatura y humedad integrado',
      'Enlace estéreo emparejando dos unidades en la misma sala'
    ],
    defaultQuote: 'un HomePod a pedido especial'
  }
];

const FAQS_DATA = [
  {
    q: '¿Cuánto tiempo tarda en llegar mi pedido especial a Costa Rica?',
    a: 'El plazo habitual de importación y despacho es de 15 a 22 días hábiles a partir de la confirmación y pago del depósito inicial. Te brindamos un número de seguimiento y te notificamos en cada etapa: compra en USA, tránsito internacional, aduana e inspección en nuestras oficinas.'
  },
  {
    q: '¿Cómo funciona el pago del 50% de depósito y el 50% de saldo?',
    a: 'Para congelar el precio acordado y realizar la compra inmediata con nuestros proveedores en USA, solicitamos un depósito de respaldo del 50%. El 50% restante lo cancelas únicamente cuando el producto haya llegado a Costa Rica, haya sido inspeccionado físicamente por nuestros técnicos y esté listo para tu entrega.'
  },
  {
    q: '¿Qué garantía tengo si el equipo no llega en el estado acordado?',
    a: 'Tu inversión está 100% protegida. Si el producto llegara a presentar algún desperfecto físico o técnico que no haya sido especificado en la cotización, te reintegramos el 100% de tu depósito de manera inmediata o gestionamos una unidad de reemplazo sin costo adicional.'
  },
  {
    q: '¿Puedo cotizar configuraciones personalizadas que no se consiguen en Costa Rica?',
    a: '¡Totalmente! Es una de las principales ventajas de nuestro Pedido Especial. Podemos cotizarte cualquier MacBook, iPad o iPhone con la capacidad, memoria y color exacto que necesites.'
  },
  {
    q: '¿Los equipos vienen desbloqueados para las operadoras de Costa Rica?',
    a: 'Sí, absolutamente todos los dispositivos que importamos están garantizados 100% libres de fábrica (Factory Unlocked) y sin bloqueo de cuenta. Funcionan de forma nativa con Kölbi, Claro, Liberty y cualquier operadora internacional.'
  },
  {
    q: '¿Cómo se realiza la entrega en Costa Rica?',
    a: 'Ofrecemos entrega personal y coordinada dentro del Gran Área Metropolitana (GAM) donde puedes revisar tu equipo en persona antes de cancelar el saldo restante, o envío asegurado a cualquier rincón del país mediante Correos de Costa Rica.'
  }
];

export default function PedidoEspecial({ onBack, onNavigate }: PedidoEspecialProps) {
  const config = useContext(ConfigContext);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('macbook');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleNextDevice = () => {
    const currentIndex = DEVICES_DATA.findIndex(d => d.id === selectedDevice);
    const nextIndex = (currentIndex + 1) % DEVICES_DATA.length;
    setSelectedDevice(DEVICES_DATA[nextIndex].id);
  };

  const handlePrevDevice = () => {
    const currentIndex = DEVICES_DATA.findIndex(d => d.id === selectedDevice);
    const prevIndex = (currentIndex - 1 + DEVICES_DATA.length) % DEVICES_DATA.length;
    setSelectedDevice(DEVICES_DATA[prevIndex].id);
  };

  const currentDevice = DEVICES_DATA.find(d => d.id === selectedDevice) || DEVICES_DATA[0];

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navHandler = onNavigate || onBack;

  // Resolve official WhatsApp phone number
  const getCleanPhone = () => {
    const raw = (config?.whatsappNumber || '').replace(/[^0-9]/g, '');
    return raw.length > 0 ? raw : '50660485912';
  };

  const handleOpenWhatsApp = (customMessage?: string) => {
    const cleanPhone = getCleanPhone();
    const defaultMsg = `Hola ${config.storeName || 'Pixel Cero'}, me gustaría solicitar una cotización para un pedido especial de importación Apple. ¿Me podrían brindar detalles de precio y tiempo de entrega?`;
    const message = encodeURIComponent(customMessage || defaultMsg);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleDeviceQuote = (device: DeviceHighlight) => {
    const target = device.defaultQuote || `un ${device.name} a pedido especial`;
    const text = `Hola ${config.storeName || 'Pixel Cero'}, me gustaría cotizar a pedido especial de importación el ${target}. ¿Qué opciones de precio y tiempo de entrega manejan a Costa Rica?`;
    handleOpenWhatsApp(text);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearch.trim()) return;
    const text = `Hola ${config.storeName || 'Pixel Cero'}, estoy buscando cotizar a pedido especial de importación: "${customSearch.trim()}". ¿Podrían verificar disponibilidad en USA, precio final estimado y tiempos de entrega?`;
    handleOpenWhatsApp(text);
  };

  const handleNav = (e: React.MouseEvent, route: string) => {
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
    <div className="min-h-screen bg-apple-bg text-apple-text selection:bg-apple-blue/20 selection:text-apple-blue">
      {/* Official Top Global Header */}
      <Header onNavigate={navHandler} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Navigation & Back to Catalog Button */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else if (onNavigate) {
                  onNavigate('/');
                } else {
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-apple-gray hover:text-apple-text transition-colors group cursor-pointer bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 shadow-2xs hover:border-black/15"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>Volver a la tienda</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-apple-gray">
              <span>Inicio</span>
              <ChevronRight size={12} />
              <span className="text-apple-blue font-semibold">Pedido Especial</span>
            </div>
          </div>

          {/* SECTION 1: HERO SPOTLIGHT BANNER */}
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-apple-blue text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100/80 shadow-2xs">
              <Sparkles size={14} />
              <span>Servicio de Importación Directa</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-apple-text mb-5 leading-[1.08]">
              Pedido Especial
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-apple-gray leading-relaxed max-w-2xl mx-auto mb-8">
              ¿No encontraste el producto, color o capacidad en nuestro inventario de entrega inmediata? Lo importamos directamente desde Estados Unidos con garantía, inspección técnica exhaustiva y pago del saldo contra entrega.
            </p>

            {/* Quick Interactive Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-black/5 shadow-xs max-w-3xl mx-auto">
              <button
                onClick={() => { setActiveCategory('all'); setSelectedDevice('macbook'); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeCategory === 'all' 
                    ? 'bg-apple-text text-white shadow-xs' 
                    : 'text-apple-gray hover:text-apple-text hover:bg-black/5'
                }`}
              >
                Todo el Ecosistema
              </button>
              {DEVICES_DATA.map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => { setActiveCategory(dev.id); setSelectedDevice(dev.id); }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === dev.id || (activeCategory === 'all' && selectedDevice === dev.id)
                      ? 'bg-apple-blue text-white shadow-xs' 
                      : 'text-apple-gray hover:text-apple-text hover:bg-black/5'
                  }`}
                >
                  {dev.id === 'macbook' && <Laptop size={14} />}
                  {dev.id === 'iphone' && <Smartphone size={14} />}
                  {dev.id === 'ipad' && <Tablet size={14} />}
                  {dev.id === 'watch' && <Watch size={14} />}
                  {dev.id === 'airpods' && <Headphones size={14} />}
                  {dev.id === 'homepod' && <Speaker size={14} />}
                  <span>{dev.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* SECTION 2: THE INTERACTIVE STAGE (SPACIOUS & NON-OVERLAPPING) */}
          <motion.div 
            className="bg-gradient-to-b from-white via-white to-gray-50/60 rounded-3xl sm:rounded-[36px] border border-black/5 p-6 sm:p-10 lg:p-12 shadow-sm mb-12 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Ambient Background Light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-gray block mb-1">
                Haz clic en cualquier producto para cotizar en WhatsApp oficial
              </span>
        
            </div>

            {/* Desktop & Tablet Constellation */}
            <div className="relative w-full min-h-[580px] lg:min-h-[640px] hidden md:block select-none">
              
              {/* 1. AIRPODS - Top Left */}
              <motion.div
                onClick={() => handleDeviceQuote(DEVICES_DATA.find(d => d.id === 'airpods')!)}
                onMouseEnter={() => setSelectedDevice('airpods')}
                className={`absolute left-[6%] top-[6%] z-20 cursor-pointer group transition-all duration-300 ${
                  selectedDevice === 'airpods' ? 'scale-105' : 'hover:scale-102'
                }`}
                whileHover={{ y: -6 }}
              >
                <div className="relative w-36 h-36 flex flex-col items-center justify-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-apple-text shadow-md border border-black/5 flex items-center gap-1.5 group-hover:border-apple-blue transition-colors">
                    <span>AirPods</span>
                    <span className="text-emerald-600 font-bold">WhatsApp ↗</span>
                  </div>

                  {/* White MagSafe Case */}
                  <div className="relative w-24 h-20 bg-gradient-to-b from-white via-gray-50 to-gray-200 rounded-[28px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-gray-300/80 flex flex-col items-center justify-between p-2">
                    <div className="w-8 h-1.5 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 rounded-full mt-0.5 opacity-80" />
                    <div className="flex justify-center gap-3">
                      <div className="w-5 h-7 bg-white rounded-full shadow-inner border border-gray-200 flex flex-col items-center justify-start pt-1">
                        <div className="w-2.5 h-1 bg-black/60 rounded-full" />
                      </div>
                      <div className="w-5 h-7 bg-white rounded-full shadow-inner border border-gray-200 flex flex-col items-center justify-start pt-1">
                        <div className="w-2.5 h-1 bg-black/60 rounded-full" />
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] mb-1" />
                  </div>
                  <div className="w-20 h-3 bg-black/10 rounded-full blur-sm mt-2" />
                </div>
              </motion.div>

              {/* 2. APPLE WATCH - Top Right */}
              <motion.div
                onClick={() => handleDeviceQuote(DEVICES_DATA.find(d => d.id === 'watch')!)}
                onMouseEnter={() => setSelectedDevice('watch')}
                className={`absolute right-[6%] top-[6%] z-20 cursor-pointer group transition-all duration-300 ${
                  selectedDevice === 'watch' ? 'scale-105' : 'hover:scale-102'
                }`}
                whileHover={{ y: -6 }}
              >
                <div className="relative w-40 h-44 flex flex-col items-center justify-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-apple-text shadow-md border border-black/5 flex items-center gap-1.5 group-hover:border-apple-blue transition-colors">
                    <span>Apple Watch</span>
                    <span className="text-emerald-600 font-bold">WhatsApp ↗</span>
                  </div>

                  <div className="w-12 h-6 bg-[#FF6A13] rounded-t-lg shadow-sm border border-[#E05300]" />
                  <div className="relative w-24 h-28 bg-gradient-to-b from-[#D4D2CD] via-[#ECEAE5] to-[#B8B5AE] rounded-[26px] p-2 shadow-[0_15px_35px_rgba(0,0,0,0.18)] border-2 border-[#E1DFD9] flex items-center justify-center">
                    <div className="absolute -left-1 top-8 w-1 h-5 bg-[#FF6A13] rounded-l-sm" />
                    <div className="absolute -right-1.5 top-6 w-2 h-7 bg-gradient-to-b from-gray-400 via-white to-gray-400 rounded-r-md border-r-2 border-[#FF6A13]" />

                    <div className="w-full h-full bg-black rounded-[18px] flex flex-col items-center justify-between p-2 text-[10px] text-white font-mono overflow-hidden relative">
                      <div className="absolute inset-1 rounded-[14px] border border-orange-500/40 pointer-events-none" />
                      <div className="flex justify-between w-full text-[9px] text-orange-400 font-bold z-10">
                        <span>9:41</span>
                        <span>44MM</span>
                      </div>
                      <div className="text-center text-xs font-bold text-white z-10">
                        <span className="text-[12px] text-orange-500">APPLE</span>
                        <div className="text-[9px] text-gray-400 font-normal">Watch</div>
                      </div>
                      <div className="flex justify-between w-full text-[8px] text-gray-400 z-10">
                        <span>100%</span>
                        <span className="text-emerald-400">GPS</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-[#FF6A13] rounded-b-lg shadow-sm border border-[#E05300]" />
                  <div className="w-20 h-3 bg-black/10 rounded-full blur-sm mt-1" />
                </div>
              </motion.div>

              {/* 3. MACBOOK - Centerpiece */}
              <motion.div
                onClick={() => handleDeviceQuote(DEVICES_DATA.find(d => d.id === 'macbook')!)}
                onMouseEnter={() => setSelectedDevice('macbook')}
                className={`absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group transition-all duration-300 ${
                  selectedDevice === 'macbook' ? 'scale-105' : 'hover:scale-102'
                }`}
                whileHover={{ y: -6 }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="mb-3 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-apple-text shadow-lg border border-black/5 flex items-center gap-2 group-hover:border-apple-blue transition-colors">
                    <Laptop size={14} className="text-apple-blue" />
                    <span>MacBook</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">Cotizar ↗</span>
                  </div>

                  {/* MacBook Display */}
                  <div className="relative w-[340px] sm:w-[420px] lg:w-[480px] h-[210px] sm:h-[260px] lg:h-[295px] bg-[#141416] rounded-t-[18px] p-[9px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-t border-x border-gray-700/60 flex flex-col justify-between">
                    <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-28 h-4 bg-[#141416] rounded-b-md z-20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-900 border border-black/40 shadow-xs" />
                      <div className="w-1 h-1 rounded-full bg-emerald-500 ml-1.5 opacity-80" />
                    </div>

                    <div className="w-full h-full rounded-[10px] overflow-hidden relative bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 flex flex-col justify-between p-3">
                      <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_top_right,#FF5E3A,transparent_60%),radial-gradient(circle_at_bottom_left,#007AFF,transparent_60%)]" />
                      
                      <div className="relative z-10 flex items-center justify-between text-[9px] text-white/90 font-medium px-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold"></span>
                          <span className="hidden sm:inline">Pixel Cero</span>
                          <span className="hidden sm:inline">Importación USA</span>
                        </div>
                        <div className="flex items-center gap-2 text-[8px] text-white/80">
                          <span>Configuración a medida</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-white/95">
                          MacBook
                        </span>
                        <span className="text-[11px] sm:text-xs text-white/70 font-medium mt-1">
                          Configuraciones a pedido especial
                        </span>
                      </div>

                      <div className="relative z-10 mx-auto px-3 py-1 bg-white/15 backdrop-blur-xl rounded-xl border border-white/20 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-blue-500/80" />
                        <div className="w-4 h-4 rounded-md bg-purple-500/80" />
                        <div className="w-4 h-4 rounded-md bg-emerald-500/80" />
                        <div className="w-4 h-4 rounded-md bg-amber-500/80" />
                      </div>
                    </div>
                  </div>

                  <div className="relative w-[360px] sm:w-[450px] lg:w-[510px] h-[16px] bg-gradient-to-b from-[#2B2B30] to-[#1E1E22] rounded-b-[14px] shadow-[0_15px_30px_rgba(0,0,0,0.35)] border-t border-gray-600/70 flex justify-center items-start">
                    <div className="w-16 h-1 bg-[#141416] rounded-b-md" />
                  </div>

                  <div className="w-[320px] sm:w-[420px] h-4 bg-black/20 rounded-full blur-md mt-1" />
                </div>
              </motion.div>

              {/* 4. IPHONE - Left Foreground */}
              <motion.div
                onClick={() => handleDeviceQuote(DEVICES_DATA.find(d => d.id === 'iphone')!)}
                onMouseEnter={() => setSelectedDevice('iphone')}
                className={`absolute left-[3%] bottom-[6%] z-30 cursor-pointer group transition-all duration-300 ${
                  selectedDevice === 'iphone' ? 'scale-105' : 'hover:scale-102'
                }`}
                whileHover={{ y: -6 }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="mb-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-apple-text shadow-md border border-black/5 flex items-center gap-1.5 group-hover:border-apple-blue transition-colors">
                    <Smartphone size={13} className="text-apple-blue" />
                    <span>iPhone</span>
                    <span className="text-emerald-600 font-bold">Cotizar ↗</span>
                  </div>

                  <div className="relative w-[150px] sm:w-[175px] h-[290px] sm:h-[330px] bg-[#9E9B97] rounded-[42px] p-[6px] shadow-[0_25px_45px_rgba(0,0,0,0.22)] border-2 border-[#BEBCB8] flex flex-col justify-between">
                    <div className="absolute -left-1.5 top-16 w-1 h-5 bg-[#8C8985] rounded-l-xs" />
                    <div className="absolute -left-1.5 top-24 w-1 h-7 bg-[#8C8985] rounded-l-xs" />
                    <div className="absolute -left-1.5 top-33 w-1 h-7 bg-[#8C8985] rounded-l-xs" />
                    <div className="absolute -right-1.5 top-28 w-1 h-9 bg-[#8C8985] rounded-r-xs" />

                    <div className="w-full h-full bg-black rounded-[36px] overflow-hidden relative flex flex-col justify-between p-3 border border-black/80">
                      <div className="w-20 h-5 bg-black rounded-full mx-auto mt-1 border border-white/10 flex items-center justify-between px-2 text-[8px] text-white/90">
                        <div className="w-2 h-2 rounded-full bg-blue-500/80" />
                        <span className="text-[7px] text-emerald-400 font-mono">100%</span>
                      </div>

                      <div className="text-center my-auto">
                        <span className="text-[10px] text-white/70 font-medium block">Lunes, 9 de Septiembre</span>
                        <span className="text-3xl sm:text-4xl font-light text-white tracking-tight">09:41</span>
                        
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.8 bg-white/15 backdrop-blur-md rounded-full text-[9px] text-white/90 border border-white/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Desbloqueado de fábrica</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-1 text-white/70">
                        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px]">🔦</div>
                        <div className="w-12 h-1 bg-white/70 rounded-full" />
                        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px]">📷</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-28 h-3 bg-black/15 rounded-full blur-sm mt-1" />
                </div>
              </motion.div>

              {/* 5. IPAD - Right Foreground */}
              <motion.div
                onClick={() => handleDeviceQuote(DEVICES_DATA.find(d => d.id === 'ipad')!)}
                onMouseEnter={() => setSelectedDevice('ipad')}
                className={`absolute right-[3%] bottom-[6%] z-30 cursor-pointer group transition-all duration-300 ${
                  selectedDevice === 'ipad' ? 'scale-105' : 'hover:scale-102'
                }`}
                whileHover={{ y: -6 }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="mb-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-apple-text shadow-md border border-black/5 flex items-center gap-1.5 group-hover:border-apple-blue transition-colors">
                    <Tablet size={13} className="text-apple-blue" />
                    <span>iPad</span>
                    <span className="text-emerald-600 font-bold">Cotizar ↗</span>
                  </div>

                  <div className="w-36 h-2 bg-gradient-to-r from-gray-100 via-white to-gray-200 rounded-full shadow-xs border border-gray-300/80 mb-1 flex items-center justify-end pr-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  </div>

                  <div className="relative w-[180px] sm:w-[210px] h-[260px] sm:h-[295px] bg-[#1C1C1E] rounded-[28px] p-[6px] shadow-[0_25px_45px_rgba(0,0,0,0.22)] border border-gray-700/60 flex flex-col justify-between">
                    <div className="w-full h-full bg-black rounded-[22px] overflow-hidden relative p-3 flex flex-col justify-between bg-gradient-to-tr from-cyan-950 via-slate-900 to-fuchsia-950">
                      <div className="flex justify-between items-center text-[8px] text-white/80 font-medium">
                        <span>9:41 AM</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[7px] bg-white/20 px-1.5 py-0.5 rounded-sm">Apple Pencil</span>
                        </div>
                      </div>

                      <div className="text-center my-auto">
                        <span className="text-sm sm:text-base font-bold text-white block tracking-tight">
                          iPad
                        </span>
                        <span className="text-[10px] text-cyan-300 font-medium">
                          Pantalla Liquid Retina
                        </span>
                      </div>

                      <div className="w-16 h-1 bg-white/60 rounded-full mx-auto" />
                    </div>
                  </div>
                  <div className="w-32 h-3 bg-black/15 rounded-full blur-sm mt-1" />
                </div>
              </motion.div>

              {/* 6. HOMEPOD - Lower Center */}
              <motion.div
                onClick={() => handleDeviceQuote(DEVICES_DATA.find(d => d.id === 'homepod')!)}
                onMouseEnter={() => setSelectedDevice('homepod')}
                className={`absolute left-1/2 bottom-[4%] -translate-x-1/2 z-20 cursor-pointer group transition-all duration-300 ${
                  selectedDevice === 'homepod' ? 'scale-110' : 'hover:scale-105'
                }`}
                whileHover={{ y: -4 }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="mb-2 bg-white/95 backdrop-blur-md px-3 py-0.8 rounded-full text-xs font-semibold text-apple-text shadow-sm border border-black/5 flex items-center gap-1.5 group-hover:border-apple-blue transition-colors">
                    <Speaker size={12} className="text-apple-blue" />
                    <span>HomePod</span>
                    <span className="text-emerald-600 font-bold">Cotizar ↗</span>
                  </div>

                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#3A3A3C] via-[#2C2C2E] to-[#1C1C1E] shadow-[0_12px_25px_rgba(0,0,0,0.25)] border border-gray-600/40 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
                    <div className="absolute top-1 w-11 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 opacity-90 shadow-[0_0_12px_#38BDF8] flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white/80 blur-xs" />
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-black/15 rounded-full blur-sm mt-1" />
                </div>
              </motion.div>

            </div>

            {/* Mobile Responsive Vertical Interactive Pedestal */}
            <div className="md:hidden space-y-4">
              {/* Horizontal Scrollable Device Selector Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2">
                    {DEVICES_DATA.map((dev) => {
                      const isSelected = dev.id === selectedDevice;
                      return (
                        <button
                          key={dev.id}
                          type="button"
                          onClick={() => setSelectedDevice(dev.id)}
                          className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-apple-blue text-white shadow-xs'
                              : 'bg-white text-apple-text border border-black/5 hover:border-apple-blue/40'
                          }`}
                        >
                          {dev.id === 'macbook' && <Laptop size={14} />}
                          {dev.id === 'iphone' && <Smartphone size={14} />}
                          {dev.id === 'ipad' && <Tablet size={14} />}
                          {dev.id === 'watch' && <Watch size={14} />}
                          {dev.id === 'airpods' && <Headphones size={14} />}
                          {dev.id === 'homepod' && <Speaker size={14} />}
                          <span>{dev.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* The Vertical Interactive Pedestal Stage Card */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/5 shadow-sm relative overflow-hidden">
                    {/* Ambient Spotlight Glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

                    {/* Stage Header: Category Badge + Counter & Navigation Arrows */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-apple-bg text-[11px] font-semibold text-apple-blue border border-black/5">
                          {currentDevice.category}
                        </span>
                        <span className="text-xs text-apple-gray">
                          {DEVICES_DATA.findIndex((d) => d.id === selectedDevice) + 1} de {DEVICES_DATA.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevDevice}
                          className="w-8 h-8 rounded-full bg-apple-bg hover:bg-black/5 active:scale-95 text-apple-text flex items-center justify-center transition-all border border-black/5 cursor-pointer"
                          aria-label="Anterior producto"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextDevice}
                          className="w-8 h-8 rounded-full bg-apple-bg hover:bg-black/5 active:scale-95 text-apple-text flex items-center justify-center transition-all border border-black/5 cursor-pointer"
                          aria-label="Siguiente producto"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Centered Device Graphic Stage with Floating Animation */}
                    <div className="relative min-h-[310px] flex items-center justify-center my-2 select-none">
                      <motion.div
                        className="w-full flex items-center justify-center"
                        animate={{ y: [0, -7, 0] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                      >
                        <AnimatePresence mode="wait">
                          {/* 1. MACBOOK VERTICAL RENDER */}
                          {selectedDevice === 'macbook' && (
                            <motion.div
                              key="macbook-vertical"
                              initial={{ opacity: 0, scale: 0.92, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -15 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleDeviceQuote(currentDevice)}
                              className="cursor-pointer flex flex-col items-center group"
                            >
                              <div className="relative w-[265px] xs:w-[290px] h-[165px] xs:h-[180px] bg-[#141416] rounded-t-[16px] p-[7px] shadow-[0_18px_40px_rgba(0,0,0,0.22)] border-t border-x border-gray-700/60 flex flex-col justify-between">
                                <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-24 h-3.5 bg-[#141416] rounded-b-md z-20 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-900 border border-black/40" />
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 ml-1.5 opacity-80" />
                                </div>

                                <div className="w-full h-full rounded-[9px] overflow-hidden relative bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 flex flex-col justify-between p-2.5">
                                  <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_top_right,#FF5E3A,transparent_60%),radial-gradient(circle_at_bottom_left,#007AFF,transparent_60%)]" />
                                  
                                  <div className="relative z-10 flex items-center justify-between text-[8px] text-white/90 font-medium px-1">
                                    <span className="font-bold"> Pixel Cero</span>
                                    <span>Importación USA</span>
                                  </div>

                                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                                    <span className="text-xl font-bold tracking-tight text-white/95">MacBook</span>
                                    <span className="text-[10px] text-white/70 font-medium mt-0.5">Chips Apple Silicon</span>
                                  </div>

                                  <div className="relative z-10 mx-auto px-2.5 py-0.5 bg-white/15 backdrop-blur-xl rounded-lg border border-white/20 flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-blue-500/80" />
                                    <div className="w-3 h-3 rounded bg-purple-500/80" />
                                    <div className="w-3 h-3 rounded bg-emerald-500/80" />
                                    <div className="w-3 h-3 rounded bg-amber-500/80" />
                                  </div>
                                </div>
                              </div>

                              <div className="relative w-[285px] xs:w-[310px] h-[13px] bg-gradient-to-b from-[#2B2B30] to-[#1E1E22] rounded-b-[12px] shadow-[0_12px_25px_rgba(0,0,0,0.3)] border-t border-gray-600/70 flex justify-center items-start">
                                <div className="w-14 h-1 bg-[#141416] rounded-b-md" />
                              </div>
                              <div className="w-[240px] h-3 bg-black/15 rounded-full blur-sm mt-1" />
                            </motion.div>
                          )}

                          {/* 2. IPHONE VERTICAL RENDER */}
                          {selectedDevice === 'iphone' && (
                            <motion.div
                              key="iphone-vertical"
                              initial={{ opacity: 0, scale: 0.92, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -15 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleDeviceQuote(currentDevice)}
                              className="cursor-pointer flex flex-col items-center group"
                            >
                              <div className="relative w-[160px] h-[310px] bg-[#9E9B97] rounded-[40px] p-[5px] shadow-[0_22px_40px_rgba(0,0,0,0.2)] border-2 border-[#BEBCB8] flex flex-col justify-between">
                                <div className="absolute -left-1.5 top-16 w-1 h-5 bg-[#8C8985] rounded-l-xs" />
                                <div className="absolute -left-1.5 top-23 w-1 h-7 bg-[#8C8985] rounded-l-xs" />
                                <div className="absolute -left-1.5 top-32 w-1 h-7 bg-[#8C8985] rounded-l-xs" />
                                <div className="absolute -right-1.5 top-26 w-1 h-8 bg-[#8C8985] rounded-r-xs" />

                                <div className="w-full h-full bg-black rounded-[35px] overflow-hidden relative flex flex-col justify-between p-3 border border-black/80">
                                  <div className="w-18 h-4.5 bg-black rounded-full mx-auto mt-0.5 border border-white/10 flex items-center justify-between px-2 text-[7px] text-white/90">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                                    <span className="text-[7px] text-emerald-400 font-mono">100%</span>
                                  </div>

                                  <div className="text-center my-auto">
                                    <span className="text-[10px] text-white/70 font-medium block">Lunes, 9 de Septiembre</span>
                                    <span className="text-3xl font-light text-white tracking-tight">09:41</span>
                                    
                                    <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 bg-white/15 backdrop-blur-md rounded-full text-[8px] text-white/90 border border-white/20">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      <span>100% Desbloqueado de Fábrica</span>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center px-1 text-white/70">
                                    <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[9px]">🔦</div>
                                    <div className="w-10 h-1 bg-white/70 rounded-full" />
                                    <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[9px]">📷</div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-24 h-3 bg-black/15 rounded-full blur-sm mt-1" />
                            </motion.div>
                          )}

                          {/* 3. IPAD VERTICAL RENDER */}
                          {selectedDevice === 'ipad' && (
                            <motion.div
                              key="ipad-vertical"
                              initial={{ opacity: 0, scale: 0.92, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -15 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleDeviceQuote(currentDevice)}
                              className="cursor-pointer flex flex-col items-center group"
                            >
                              <div className="w-32 h-2 bg-gradient-to-r from-gray-100 via-white to-gray-200 rounded-full shadow-xs border border-gray-300/80 mb-1 flex items-center justify-end pr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              </div>

                              <div className="relative w-[185px] h-[260px] bg-[#1C1C1E] rounded-[26px] p-[6px] shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-gray-700/60 flex flex-col justify-between">
                                <div className="w-full h-full bg-black rounded-[20px] overflow-hidden relative p-3 flex flex-col justify-between bg-gradient-to-tr from-cyan-950 via-slate-900 to-fuchsia-950">
                                  <div className="flex justify-between items-center text-[8px] text-white/80 font-medium">
                                    <span>9:41 AM</span>
                                    <span className="text-[7px] bg-white/20 px-1.5 py-0.5 rounded-sm">Apple Pencil</span>
                                  </div>

                                  <div className="text-center my-auto">
                                    <span className="text-base font-bold text-white block tracking-tight">iPad</span>
                                    <span className="text-[10px] text-cyan-300 font-medium">Pantalla Liquid Retina</span>
                                  </div>

                                  <div className="w-14 h-1 bg-white/60 rounded-full mx-auto" />
                                </div>
                              </div>
                              <div className="w-28 h-3 bg-black/15 rounded-full blur-sm mt-1" />
                            </motion.div>
                          )}

                          {/* 4. APPLE WATCH VERTICAL RENDER */}
                          {selectedDevice === 'watch' && (
                            <motion.div
                              key="watch-vertical"
                              initial={{ opacity: 0, scale: 0.92, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -15 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleDeviceQuote(currentDevice)}
                              className="cursor-pointer flex flex-col items-center group"
                            >
                              <div className="w-12 h-6 bg-[#FF6A13] rounded-t-lg shadow-xs border border-[#E05300]" />
                              <div className="relative w-24 h-28 bg-gradient-to-b from-[#D4D2CD] via-[#ECEAE5] to-[#B8B5AE] rounded-[26px] p-2 shadow-[0_15px_35px_rgba(0,0,0,0.18)] border-2 border-[#E1DFD9] flex items-center justify-center">
                                <div className="absolute -left-1 top-8 w-1 h-5 bg-[#FF6A13] rounded-l-xs" />
                                <div className="absolute -right-1.5 top-6 w-2 h-7 bg-gradient-to-b from-gray-400 via-white to-gray-400 rounded-r-md border-r-2 border-[#FF6A13]" />

                                <div className="w-full h-full bg-black rounded-[18px] flex flex-col items-center justify-between p-2 text-[10px] text-white font-mono overflow-hidden relative">
                                  <div className="absolute inset-1 rounded-[14px] border border-orange-500/40 pointer-events-none" />
                                  <div className="flex justify-between w-full text-[9px] text-orange-400 font-bold z-10">
                                    <span>9:41</span>
                                    <span>44MM</span>
                                  </div>
                                  <div className="text-center text-xs font-bold text-white z-10">
                                    <span className="text-[12px] text-orange-500">APPLE</span>
                                    <div className="text-[9px] text-gray-400 font-normal">Watch</div>
                                  </div>
                                  <div className="flex justify-between w-full text-[8px] text-gray-400 z-10">
                                    <span>100%</span>
                                    <span className="text-emerald-400">GPS</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-12 h-6 bg-[#FF6A13] rounded-b-lg shadow-xs border border-[#E05300]" />
                              <div className="w-20 h-3 bg-black/10 rounded-full blur-sm mt-1" />
                            </motion.div>
                          )}

                          {/* 5. AIRPODS VERTICAL RENDER */}
                          {selectedDevice === 'airpods' && (
                            <motion.div
                              key="airpods-vertical"
                              initial={{ opacity: 0, scale: 0.92, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -15 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleDeviceQuote(currentDevice)}
                              className="cursor-pointer flex flex-col items-center group"
                            >
                              <div className="relative w-28 h-24 bg-gradient-to-b from-white via-gray-50 to-gray-200 rounded-[30px] shadow-[0_15px_35px_rgba(0,0,0,0.12)] border border-gray-300/80 flex flex-col items-center justify-between p-2.5">
                                <div className="w-10 h-1.5 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 rounded-full mt-0.5 opacity-80" />
                                <div className="flex justify-center gap-3.5">
                                  <div className="w-6 h-8 bg-white rounded-full shadow-inner border border-gray-200 flex flex-col items-center justify-start pt-1">
                                    <div className="w-3 h-1 bg-black/60 rounded-full" />
                                  </div>
                                  <div className="w-6 h-8 bg-white rounded-full shadow-inner border border-gray-200 flex flex-col items-center justify-start pt-1">
                                    <div className="w-3 h-1 bg-black/60 rounded-full" />
                                  </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] mb-1" />
                              </div>
                              <div className="w-24 h-3 bg-black/10 rounded-full blur-sm mt-2" />
                            </motion.div>
                          )}

                          {/* 6. HOMEPOD VERTICAL RENDER */}
                          {selectedDevice === 'homepod' && (
                            <motion.div
                              key="homepod-vertical"
                              initial={{ opacity: 0, scale: 0.92, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -15 }}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleDeviceQuote(currentDevice)}
                              className="cursor-pointer flex flex-col items-center group"
                            >
                              <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-[#3A3A3C] via-[#2C2C2E] to-[#1C1C1E] shadow-[0_15px_30px_rgba(0,0,0,0.25)] border border-gray-600/40 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
                                <div className="absolute top-1.5 w-14 h-7 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 opacity-90 shadow-[0_0_14px_#38BDF8] flex items-center justify-center">
                                  <div className="w-3.5 h-3.5 rounded-full bg-white/80 blur-xs" />
                                </div>
                              </div>
                              <div className="w-20 h-2.5 bg-black/15 rounded-full blur-sm mt-1.5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>

                    {/* Device Information & Primary Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-center mb-3">
                        <h3 className="text-xl font-bold text-apple-text tracking-tight">
                          {currentDevice.name}
                        </h3>
                        <p className="text-xs text-apple-gray mt-0.5">
                          {currentDevice.tagline}
                        </p>
                      </div>

                      {/* Specs Highlights */}
                      <div className="space-y-1.5 mb-4 bg-apple-bg/70 p-3 rounded-2xl border border-black/5">
                        {currentDevice.specs.slice(0, 2).map((spec, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-left">
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-apple-text leading-tight">{spec}</span>
                          </div>
                        ))}
                      </div>

                      {/* Prominent Direct WhatsApp Quote Button */}
                      <button
                        type="button"
                        onClick={() => handleDeviceQuote(currentDevice)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span>Cotizar {currentDevice.name} en WhatsApp</span>
                        <ChevronRight size={14} />
                      </button>

                      {/* Pagination Indicator Dots */}
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        {DEVICES_DATA.map((dev) => {
                          const isActive = dev.id === selectedDevice;
                          return (
                            <button
                              key={dev.id}
                              type="button"
                              onClick={() => setSelectedDevice(dev.id)}
                              aria-label={`Ver ${dev.name}`}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                isActive ? 'w-6 bg-apple-blue' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
            </div>

            {/* DIRECT SEARCH INPUT */}
            <div className="mt-8 sm:mt-10 pt-8 border-t border-black/5 max-w-2xl mx-auto relative z-20">
              <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative w-full">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray" />
                  <input
                    type="text"
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    placeholder="¿Buscás algún producto Apple? Ej: MacBook, iPhone, iPad, Apple Watch..."
                    className="w-full pl-11 pr-4 py-3.5 bg-apple-bg rounded-2xl border border-black/5 focus:border-apple-blue focus:bg-white outline-none text-sm text-apple-text transition-all placeholder:text-apple-gray/70"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Cotizar en WhatsApp</span>
                </button>
              </form>
              <p className="text-center text-xs text-apple-gray mt-2">
                Consulta gratuita sin compromiso. Te respondemos con disponibilidad y cotización formal.
              </p>
            </div>

          </motion.div>

          {/* SECTION 3: STEP-BY-STEP IMPORT PROCESS */}
          <div className="bg-white rounded-3xl sm:rounded-[36px] p-8 sm:p-12 border border-black/5 shadow-sm mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-blue block mb-2">
                Paso a Paso
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-apple-text mb-3">
                ¿Cómo funciona el proceso de importación?
              </h2>
              <p className="text-apple-gray text-sm sm:text-base">
                Transparente, seguro y con respaldo garantizado desde el primer mensaje hasta que lo tienes en tus manos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-apple-bg/60 border border-black/5 relative">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-apple-blue font-bold text-lg flex items-center justify-center mb-3">
                  1
                </div>
                <h4 className="font-semibold text-sm text-apple-text mb-1.5">Cotización clara</h4>
                <p className="text-xs text-apple-gray leading-relaxed">
                  Nos indicas el producto, capacidad y color. Te cotizamos con precio final congelado.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-apple-bg/60 border border-black/5 relative">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-apple-blue font-bold text-lg flex items-center justify-center mb-3">
                  2
                </div>
                <h4 className="font-semibold text-sm text-apple-text mb-1.5">Anticipo del 50%</h4>
                <p className="text-xs text-apple-gray leading-relaxed">
                  Cancelas el 50% de adelanto mediante transferencia o SINPE para apartar y comprar de inmediato en USA.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-apple-bg/60 border border-black/5 relative">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-apple-blue font-bold text-lg flex items-center justify-center mb-3">
                  3
                </div>
                <h4 className="font-semibold text-sm text-apple-text mb-1.5">Tránsito 15 a 22 días</h4>
                <p className="text-xs text-apple-gray leading-relaxed">
                  Importación segura con seguimiento continuo y despacho aduanal gestionado completamente por Pixel Cero.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-apple-bg/60 border border-black/5 relative">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-apple-blue font-bold text-lg flex items-center justify-center mb-3">
                  4
                </div>
                <h4 className="font-semibold text-sm text-apple-text mb-1.5">Inspección técnica</h4>
                <p className="text-xs text-apple-gray leading-relaxed">
                  Al llegar a Costa Rica, verificamos minuciosamente el dispositivo: pantalla, batería y componentes.
                </p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-apple-bg/60 border border-black/5 relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 shadow-xs text-white font-bold text-lg flex items-center justify-center mb-3">
                  5
                </div>
                <h4 className="font-semibold text-sm text-apple-text mb-1.5">Entrega y saldo</h4>
                <p className="text-xs text-apple-gray leading-relaxed">
                  Recibes tu equipo en GAM o por Correos de CR y cancelas el 50% de saldo restante a satisfacción.
                </p>
              </div>
            </div>

            {/* Official Terms Link Callout */}
            <div className="mt-10 p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-apple-blue shrink-0" />
                <p className="text-xs sm:text-sm text-apple-text">
                  Conoce en detalle todas nuestras políticas de garantía de satisfacción, tiempos y condiciones legales.
                </p>
              </div>
              <a
                href="/terminos-importacion"
                onClick={(e) => handleNav(e, '/terminos-importacion')}
                className="px-4 py-2 rounded-xl bg-white text-apple-blue hover:bg-blue-50 font-semibold text-xs transition-colors shrink-0 shadow-2xs border border-blue-200 inline-flex items-center gap-1.5"
              >
                <span>Ver Términos de Importación</span>
                <ChevronRight size={14} />
              </a>
            </div>
          </div>

          {/* SECTION 4: FREQUENTLY ASKED QUESTIONS */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-blue block mb-2">
                Dudas Comunes
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-text mb-2">
                Preguntas frecuentes sobre Pedido Especial
              </h2>
              <p className="text-apple-gray text-xs sm:text-sm">
                Todo lo que necesitas saber antes de encargar tu dispositivo.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS_DATA.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-black/5 overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-apple-text hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-apple-gray shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-5 pb-5 text-xs sm:text-sm text-apple-gray leading-relaxed border-t border-gray-100 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: HIGH-IMPACT BOTTOM CTA BANNER */}
          <motion.div 
            className="rounded-3xl sm:rounded-[40px] bg-[#1D1D1F] text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Ambient Lighting Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-5 border border-white/10">
                <Sparkles size={14} className="text-amber-400" />
                <span>Atención personalizada en Costa Rica</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                ¿Listo para estrenar el Apple que buscas?
              </h2>

              <p className="text-white/70 text-sm sm:text-base md:text-lg mb-8 leading-relaxed">
                Escríbenos directamente a nuestro WhatsApp oficial. Te respondemos en minutos con opciones de disponibilidad, costo de importación y tiempos exactos.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  onClick={() => handleOpenWhatsApp()}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Cotizar por WhatsApp oficial</span>
                </button>

                <a
                  href="/terminos-importacion"
                  onClick={(e) => handleNav(e, '/terminos-importacion')}
                  className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors text-center border border-white/10 cursor-pointer"
                >
                  Términos y condiciones de importación →
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/50">
                <span>WhatsApp oficial: +506 6048-5912</span>
                <span>&middot;</span>
                <span>San José, Costa Rica</span>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Official Site Footer */}
      <Footer onNavigate={navHandler} />

      {/* Floating Scroll-to-Top Button */}
      {showBackToTop && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white text-apple-text shadow-lg border border-black/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer group"
          aria-label="Volver arriba"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <ArrowUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </div>
  );
}
