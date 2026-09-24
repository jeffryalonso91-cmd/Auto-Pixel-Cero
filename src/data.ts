export const CONFIG = {
  storeName: "Pixel Cero",
  whatsappNumber: "+506 60485912",
  email: "info@pixelcerocr.com",
  instagramUrl: "https://www.instagram.com/pixelcero_cr",
  facebookUrl: "https://www.facebook.com/share/1MEhurJQRq/?mibextid=wwXIfr",
  tiktokUrl: "https://www.tiktok.com/@pixel_cero_cr",
  businessHours: "Lun - Sáb, 9 AM - 7 PM",
  currencySymbol: "₡",
  logoUrl: "",
  faviconUrl: "",
  popupEnabled: false,
  popupImageUrl: "",
  heroImageUrl: "https://images.unsplash.com/photo-1603898037225-83606be13426?auto=format&fit=crop&q=80&w=1200",
};

export const normalizePrice = (price: number | string | undefined | null): number => {
  if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
    return 0;
  }
  const num = Math.round(Number(price));
  // Si el valor numérico es un monto legado en dólares (ej: 899, 799, 599...),
  // se convierte automáticamente a montos coherentes en colones costarricenses (aprox ₡515 por dólar redondeado a 5.000)
  if (num > 0 && num < 5000) {
    if (num === 899) return 460000;
    if (num === 799) return 410000;
    if (num === 649) return 335000;
    if (num === 599) return 310000;
    if (num === 549) return 285000;
    if (num === 249) return 130000;
    return Math.round((num * 515) / 5000) * 5000;
  }
  return num;
};

export const formatPrice = (price: number | string | undefined | null, symbol: string = "₡"): string => {
  if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
    return `${symbol}0`;
  }
  const num = normalizePrice(price);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${symbol}${formatted}`;
};

export type Product = {
  id: string;
  model: string;
  storage: string;
  condition: string;
  battery: string;
  price: number;
  images: string[];
  status?: 'Disponible' | 'Vendido';
  comments?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    model: "iPhone 14 Pro Max",
    storage: "256GB",
    condition: "Excelente",
    battery: "95%",
    price: 460000,
    images: ["https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "2",
    model: "iPhone 14 Pro",
    storage: "128GB",
    condition: "Muy Bueno",
    battery: "91%",
    price: 410000,
    images: ["https://images.unsplash.com/photo-1695048064971-d68a98f1ac51?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "3",
    model: "iPhone 14",
    storage: "128GB",
    condition: "Excelente",
    battery: "98%",
    price: 310000,
    images: ["https://images.unsplash.com/photo-1662993132644-884ec85c7f8a?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "4",
    model: "iPhone 13 Pro Max",
    storage: "512GB",
    condition: "Muy Bueno",
    battery: "88%",
    price: 335000,
    images: ["https://images.unsplash.com/photo-1632661674596-618d8b64d641?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "5",
    model: "iPhone 13 Pro",
    storage: "128GB",
    condition: "Bueno",
    battery: "85%",
    price: 285000,
    images: ["https://images.unsplash.com/photo-1632661674596-618d8b64d641?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "6",
    model: "iPhone 11",
    storage: "64GB",
    condition: "Bueno",
    battery: "82%",
    price: 130000,
    images: ["https://images.unsplash.com/photo-1574856344991-abc31b6caa8e?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  }
];
