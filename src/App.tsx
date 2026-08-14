import ErrorBoundary from './components/ErrorBoundary';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext } from 'react';
import localforage from 'localforage';
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

  useEffect(() => {
    let productsSubscription: any;
    let configSubscription: any;
    let isMounted = true;

    import('./supabase').then(async ({ supabase }) => {
        if (!isMounted) return;

        // Subscriptions (Supabase Realtime)
        productsSubscription = supabase
          .channel('products_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
             // Fetch all on change for simplicity, like onSnapshot
             supabase.from('products').select('*').then(({ data }) => {
               if (data && isMounted) setProducts(data as Product[]);
             });
          })
          .subscribe();

        configSubscription = supabase
          .channel('config_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config' }, () => {
             supabase.from('store_config').select('*').in('id', ['store', 'hero']).then(({ data }) => {
               if (data && isMounted) {
                 const storeData = data.find((d: any) => d.id === 'store') || {};
                 const heroData = data.find((d: any) => d.id === 'hero') || {};
                 
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
        supabase.from('products').select('*').then(({ data }) => {
          if (data && isMounted) setProducts(data as Product[]);
          if (isMounted) setLoading(false);
        });

        supabase.from('store_config').select('*').in('id', ['store', 'hero']).then(({ data }) => {
          if (data && isMounted) {
             const storeData = data.find((d: any) => d.id === 'store') || {};
             const heroData = data.find((d: any) => d.id === 'hero') || {};
             
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
    });

    return () => {
      isMounted = false;
      import('./supabase').then(({ supabase }) => {
        if (productsSubscription) supabase.removeChannel(productsSubscription);
        if (configSubscription) supabase.removeChannel(configSubscription);
      });
    };
  }, []);

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
          <Catalog products={products} />
          <Trust />
        </main>
        <Footer />
        <PopupBanner />
      </div>
    </ConfigContext.Provider>
  );
}

