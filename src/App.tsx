import ErrorBoundary from './components/ErrorBoundary';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext } from 'react';
import localforage from 'localforage';
import { supabase } from './supabase';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Trust from './components/Trust';
import Footer from './components/Footer';
import Admin from './components/Admin';
import PopupBanner from './components/PopupBanner';
import { PRODUCTS, Product, CONFIG } from './data';

export const ConfigContext = createContext(CONFIG);

export default function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [storeConfig, setStoreConfig] = useState(CONFIG);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let productsSubscription: any;
    let configSubscription: any;
    let isMounted = true;

    
        if (!isMounted) return;

        // Subscriptions (Supabase Realtime)
        productsSubscription = supabase
          .channel('products_changes_' + Math.random().toString(36).substring(7))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
             // Fetch all on change for simplicity, like onSnapshot
             supabase.from('products').select('*').then(({ data }) => {
               if (data && isMounted) setProducts(data as Product[]);
             });
          })
          .subscribe();

        configSubscription = supabase
          .channel('config_changes_' + Math.random().toString(36).substring(7))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, () => {
             supabase.from('store_config').select('*').in('id', ['store', 'hero', 'favicon']).then(({ data }) => {
               if (data && isMounted) {
                 const storeData = data.find((d: any) => d.id === 'store') || {};
                 const heroData = data.find((d: any) => d.id === 'hero') || {};
                 const faviconData = data.find((d: any) => d.id === 'favicon') || {};
                 
                 setStoreConfig(prev => ({
                   ...prev,
                   storeName: storeData.store_name ?? prev.storeName,
                   whatsappNumber: storeData.whatsapp_number ?? prev.whatsappNumber,
                   email: storeData.email ?? prev.email,
                   instagramUrl: storeData.instagram_url ?? prev.instagramUrl,
                   businessHours: storeData.business_hours ?? prev.businessHours,
                   currencySymbol: storeData.currency_symbol ?? prev.currencySymbol,
                   logoUrl: storeData.logo_url ?? prev.logoUrl,
                   
                   popupEnabled: storeData.popup_enabled ?? prev.popupEnabled,
                   popupImageUrl: storeData.popup_image_url ?? prev.popupImageUrl,
                   heroImageUrl: heroData.popup_image_url ?? prev.heroImageUrl
                 }));
               }
             });
          })
          .subscribe();

        // Initial fetch
        supabase.from('products').select('*').then(({ data, error }) => {
          if (error) {
            console.warn('Network issue fetching from Supabase:', error);
            if (isMounted) {
              setFetchError('No se pudo conectar a la base de datos. Verifica tu conexión a internet o desactiva tu bloqueador de anuncios (adblocker).');
              setProducts([]);
            }
          } else if (data && isMounted) {
            setProducts(data as Product[]);
          }
          if (isMounted) setLoading(false);
        });

        supabase.from('store_config').select('*').in('id', ['store', 'hero', 'favicon']).then(({ data }) => {
          if (data && isMounted) {
             const storeData = data.find((d: any) => d.id === 'store') || {};
             const heroData = data.find((d: any) => d.id === 'hero') || {};
                 const faviconData = data.find((d: any) => d.id === 'favicon') || {};
             
             setStoreConfig(prev => ({
               ...prev,
               storeName: storeData.store_name ?? prev.storeName,
               whatsappNumber: storeData.whatsapp_number ?? prev.whatsappNumber,
               email: storeData.email ?? prev.email,
               instagramUrl: storeData.instagram_url ?? prev.instagramUrl,
               businessHours: storeData.business_hours ?? prev.businessHours,
               currencySymbol: storeData.currency_symbol ?? prev.currencySymbol,
               logoUrl: storeData.logo_url ?? prev.logoUrl,
                   
               popupEnabled: storeData.popup_enabled ?? prev.popupEnabled,
               popupImageUrl: storeData.popup_image_url ?? prev.popupImageUrl,
               heroImageUrl: heroData.popup_image_url ?? prev.heroImageUrl
             }));
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

  if (loading) {
    return <div className="min-h-screen bg-apple-bg flex items-center justify-center font-sans text-apple-gray">Cargando...</div>;
  }

  if (isAdmin) {
    return <ErrorBoundary><Admin products={products} setProducts={setProducts} storeConfig={storeConfig} setStoreConfig={setStoreConfig} /></ErrorBoundary>;
  }

  return (
    <ConfigContext.Provider value={storeConfig}>
      <div className="min-h-screen bg-apple-bg selection:bg-apple-blue selection:text-white">
        <Header />
        <main>
          <Hero />
          {fetchError ? (
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex flex-col items-center justify-center text-center border border-red-100 gap-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">{fetchError}</span>
              </div>
            </div>
          ) : (
            <Catalog products={products} />
          )}
          <Trust />
        </main>
        <Footer />
        <PopupBanner />
      </div>
    </ConfigContext.Provider>
  );
}

