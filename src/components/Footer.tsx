import { useContext } from 'react';
import { ConfigContext } from '../App';
import { Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const config = useContext(ConfigContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-apple-bg pt-20 pb-10 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 mb-16">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4">{config.storeName}</h2>
          <p className="text-apple-gray max-w-xs mb-6">
            Dispositivos Apple reacondicionados premium. Calidad en la que puedes confiar, precios que te encantarán.
          </p>
          <div className="flex items-center gap-4 text-apple-gray">
            <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-apple-text transition-colors">
              <Instagram size={20} />
            </a>
            <a href={`mailto:${config.email}`} className="hover:text-apple-text transition-colors">
              <Mail size={20} />
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <div>
            <h3 className="font-semibold tracking-tight mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-apple-gray">
              <li>WhatsApp: {config.whatsappNumber}</li>
              <li>{config.email}</li>
              <li><a href="#admin" className="hover:text-apple-text transition-colors">Panel Admin</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold tracking-tight mb-4">Horario de Atención</h3>
            <ul className="space-y-3 text-sm text-apple-gray">
              <li>{config.businessHours}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200 text-xs text-apple-gray">
        <p>&copy; {currentYear} {config.storeName}. Todos los derechos reservados.</p>
        <p className="mt-2 md:mt-0">No afiliado con Apple Inc.</p>
      </div>
    </footer>
  );
}
