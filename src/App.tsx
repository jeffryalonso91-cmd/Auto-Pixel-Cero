import ErrorBoundary from './components/ErrorBoundary';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, lazy, Suspense } from 'react';
import { supabase } from './supabase';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Trust from './components/Trust';
import Footer from './components/Footer';
const Admin = lazy(() => import('./components/Admin'));
import Reviews from './components/Reviews';
import PopupBanner from './components/PopupBanner';
import { PRODUCTS, Product, CONFIG } from './data';

export const ConfigContext = createContext(CONFIG);

const getInitialProducts = (): Product[] => {
  try {
    const cached = localStorage.getItem('pixelcero_products_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return PRODUCTS;
};

const getInitialConfig = () => {
  try {
    const cached = localStorage.getItem('pixelcero_config_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') return { ...CONFIG, ...parsed };
    }
  } catch (e) {}
  return CONFIG;
};

export default function App() {
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [storeConfig, setStoreConfig] = useState(getInitialConfig);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let productsSubscription: any;
    let configSubscription: any;
    let isMounted = true;

    if (!isMounted) return;

    // Subscriptions (Supabase Realtime)
    productsSubscription = supabase
      .channel('products_changes_' + Math.random().toString(36).substring(7))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
         supabase.from('products').select('*').then(({ data }) => {
           if (data && data.length > 0 && isMounted) {
             setProducts(data as Product[]);
             try { localStorage.setItem('pixelcero_products_cache', JSON.stringify(data)); } catch (e) {}
           }
         });
      })
      .subscribe();

    configSubscription = supabase
      .channel('config_changes_' + Math.random().toString(36).substring(7))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, () => {
         supabase.from('store_config').select('*').in('id', ['store', 'hero', 'favicon', 'socials']).then(({ data }) => {
           if (data && isMounted) {
             const storeData = data.find((d: any) => d.id === 'store') || {};
             const heroData = data.find((d: any) => d.id === 'hero') || {};
             const faviconData = data.find((d: any) => d.id === 'favicon') || {};
             const socialsData = data.find((d: any) => d.id === 'socials') || {};

             let parsedSocials: any = {};
             if (socialsData.store_name) {
               try { parsedSocials = JSON.parse(socialsData.store_name); } catch (e) {}
             }
             
             setStoreConfig(prev => {
               const updated = {
                 ...prev,
                 storeName: storeData.store_name ?? prev.storeName,
                 whatsappNumber: storeData.whatsapp_number ?? prev.whatsappNumber,
                 email: storeData.email ?? prev.email,
                 instagramUrl: storeData.instagram_url ?? prev.instagramUrl,
                 facebookUrl: parsedSocials.facebookUrl ?? storeData.facebook_url ?? prev.facebookUrl,
                 tiktokUrl: parsedSocials.tiktokUrl ?? storeData.tiktok_url ?? prev.tiktokUrl,
                 businessHours: storeData.business_hours ?? prev.businessHours,
                 currencySymbol: storeData.currency_symbol ?? prev.currencySymbol,
                 logoUrl: storeData.logo_url ?? prev.logoUrl,
                 
                 popupEnabled: storeData.popup_enabled ?? prev.popupEnabled,
                 popupImageUrl: storeData.popup_image_url ?? prev.popupImageUrl,
                 heroImageUrl: heroData.popup_image_url ?? prev.heroImageUrl
               };
               try { localStorage.setItem('pixelcero_config_cache', JSON.stringify(updated)); } catch (e) {}
               return updated;
             });
           }
         });
      })
      .subscribe();

    // Fast background fetch without blocking UI
    supabase.from('products').select('*').then(({ data, error }) => {
      if (error) {
        console.warn('Network notice fetching products:', error);
      } else if (data && data.length > 0 && isMounted) {
        setProducts(data as Product[]);
        try {
          localStorage.setItem('pixelcero_products_cache', JSON.stringify(data));
        } catch (e) {}
      }
    });

    supabase.from('store_config').select('*').in('id', ['store', 'hero', 'favicon', 'socials']).then(({ data, error }) => {
      if (error) {
        console.warn('Network notice fetching store_config:', error);
      } else if (data && isMounted) {
         const storeData = data.find((d: any) => d.id === 'store') || {};
         const heroData = data.find((d: any) => d.id === 'hero') || {};
         const faviconData = data.find((d: any) => d.id === 'favicon') || {};
         const socialsData = data.find((d: any) => d.id === 'socials') || {};

         let parsedSocials: any = {};
         if (socialsData.store_name) {
           try { parsedSocials = JSON.parse(socialsData.store_name); } catch (e) {}
         }
         
         setStoreConfig(prev => {
           const updated = {
             ...prev,
             storeName: storeData.store_name ?? prev.storeName,
             whatsappNumber: storeData.whatsapp_number ?? prev.whatsappNumber,
             email: storeData.email ?? prev.email,
             instagramUrl: storeData.instagram_url ?? prev.instagramUrl,
             facebookUrl: parsedSocials.facebookUrl ?? storeData.facebook_url ?? prev.facebookUrl,
             tiktokUrl: parsedSocials.tiktokUrl ?? storeData.tiktok_url ?? prev.tiktokUrl,
             businessHours: storeData.business_hours ?? prev.businessHours,
             currencySymbol: storeData.currency_symbol ?? prev.currencySymbol,
             logoUrl: storeData.logo_url ?? prev.logoUrl,
                 
             popupEnabled: storeData.popup_enabled ?? prev.popupEnabled,
             popupImageUrl: storeData.popup_image_url ?? prev.popupImageUrl,
             heroImageUrl: heroData.popup_image_url ?? prev.heroImageUrl
           };
           try { localStorage.setItem('pixelcero_config_cache', JSON.stringify(updated)); } catch (e) {}
           return updated;
         });
      }
    });


    return () => {
      isMounted = false;
      
        if (productsSubscription) supabase.removeChannel(productsSubscription);
        if (configSubscription) supabase.removeChannel(configSubscription);
    };
  }, []);

    useEffect(() => {
    document.title = storeConfig.storeName || "Pixel Cero";
    if (storeConfig.logoUrl) {
      // Standard Favicon
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = storeConfig.logoUrl;

      // Apple Touch Icon
      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = storeConfig.logoUrl;
      
      // Shortcut Icon (for older browsers)
      let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
      if (!shortcutLink) {
        shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        document.head.appendChild(shortcutLink);
      }
      shortcutLink.href = storeConfig.logoUrl;
    }
  }, [storeConfig.logoUrl, storeConfig.storeName]);

  useEffect(() => {
    const checkHash = () => setIsAdmin(window.location.hash === '#admin');
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);



  if (isAdmin) {
    return <ErrorBoundary><Suspense fallback={<div className="min-h-screen bg-apple-bg flex items-center justify-center font-sans text-apple-gray">Cargando Panel...</div>}><Admin products={products} setProducts={setProducts} storeConfig={storeConfig} setStoreConfig={setStoreConfig} /></Suspense></ErrorBoundary>;
  }

  return (
    <ConfigContext.Provider value={storeConfig}>
      <div className="min-h-screen bg-apple-bg selection:bg-apple-blue selection:text-white">
        <Header />
        <main>
          <Hero />
          <Catalog products={products} />
          <Reviews />
          <Trust />
        </main>
        <Footer />
        <PopupBanner />
      </div>
    </ConfigContext.Provider>
  );
}

