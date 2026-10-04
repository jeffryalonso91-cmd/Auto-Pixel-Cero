import React, { useContext } from 'react';
import { ConfigContext } from '../App';
import SocialLinks from './SocialIcons';

interface FooterProps {
  onNavigate?: (route: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const config = useContext(ConfigContext);
  const currentYear = new Date().getFullYear();

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
    <footer id="contact" className="bg-apple-bg pt-20 pb-10 px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 mb-16">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4">{config.storeName}</h2>
          <p className="text-apple-gray max-w-xs mb-6">
            Dispositivos Apple reacondicionados premium. Calidad en la que puedes confiar, precios que te encantarán.
          </p>
          
          <div className="mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-gray block mb-3">Síguenos en redes</span>
            <SocialLinks config={config} size={20} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-10 sm:gap-14 md:gap-16">
          <div>
            <h3 className="font-semibold tracking-tight mb-4">Términos y Políticas</h3>
            <ul className="space-y-3 text-sm text-apple-gray">
              <li>
                <a 
                  href="/terminos-apartado" 
                  onClick={(e) => handleLinkClick(e, '/terminos-apartado')}
                  className="hover:text-apple-text transition-colors"
                >
                  Términos de Apartado
                </a>
              </li>
              <li>
                <a 
                  href="/terminos-importacion" 
                  onClick={(e) => handleLinkClick(e, '/terminos-importacion')}
                  className="hover:text-apple-text transition-colors"
                >
                  Términos de Importación
                </a>
              </li>
            </ul>
          </div>

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
