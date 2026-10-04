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

export type ProductStatus = 'Disponible' | 'Contra pedido' | 'Apartado' | 'Vendido' | 'stock' | 'order' | 'reserved' | 'sold';

export type Product = {
  id: string;
  model: string;
  storage: string;
  condition: string;
  battery: string;
  price: number;
  images: string[];
  status?: ProductStatus;
  comments?: string;
  createdAt?: string | number;
  color?: string;
  coverCutoutUrl?: string;
};

export interface NormalizedProduct extends Product {
  cleanModel: string;
  normalizedStatus: 'Disponible' | 'Contra pedido' | 'Apartado' | 'Vendido';
  statusCode: 'stock' | 'order' | 'reserved' | 'sold';
}

export const normalizeProduct = (p: Product): NormalizedProduct => {
  const rawModel = p.model || '';
  const contraPedidoRegex = /\*+\s*contra\s*pedido\s*\*+/i;
  const hasContraPedidoInName = contraPedidoRegex.test(rawModel);
  const cleanModel = rawModel.replace(contraPedidoRegex, '').replace(/\s+/g, ' ').trim();

  let statusCode: 'stock' | 'order' | 'reserved' | 'sold' = 'stock';
  let normalizedStatus: 'Disponible' | 'Contra pedido' | 'Apartado' | 'Vendido' = 'Disponible';

  const rawStatus = (p.status || '').toString().toLowerCase().trim();

  if (rawStatus === 'vendido' || rawStatus === 'sold') {
    statusCode = 'sold';
    normalizedStatus = 'Vendido';
  } else if (rawStatus === 'apartado' || rawStatus === 'reserved') {
    statusCode = 'reserved';
    normalizedStatus = 'Apartado';
  } else if (rawStatus === 'contra pedido' || rawStatus === 'order' || rawStatus === 'por_encargo' || hasContraPedidoInName) {
    statusCode = 'order';
    normalizedStatus = 'Contra pedido';
  } else {
    statusCode = 'stock';
    normalizedStatus = 'Disponible';
  }

  return {
    ...p,
    model: cleanModel || rawModel,
    cleanModel: cleanModel || rawModel,
    statusCode,
    normalizedStatus,
  };
};

export const getTimestamp = (p: Product): number => {
  if (p.createdAt) {
    const t = typeof p.createdAt === 'number' ? p.createdAt : Date.parse(String(p.createdAt));
    if (!isNaN(t) && t > 0) return t;
  }
  const numId = Number(p.id);
  if (!isNaN(numId) && numId > 100000000) return numId;
  if (!isNaN(numId)) return 100000000 - numId;
  return 0;
};

export const sortProducts = (products: Product[], prioritizeAvailable: boolean = true): Product[] => {
  const sorted = [...products].sort((a, b) => getTimestamp(b) - getTimestamp(a));
  if (!prioritizeAvailable) return sorted;

  const available = sorted.filter(p => p.status !== 'Vendido');
  const sold = sorted.filter(p => p.status === 'Vendido');
  return [...available, ...sold];
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    model: "iPhone 14 Pro Max",
    storage: "256GB",
    condition: "Excelente",
    battery: "95%",
    price: 460000,
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=600&hei=600&fmt=png-alpha",
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=1200"
    ],
    status: 'Disponible',
    createdAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "2",
    model: "iPhone 14 Pro",
    storage: "128GB",
    condition: "Muy Bueno",
    battery: "91%",
    price: 410000,
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-spaceblack?wid=600&hei=600&fmt=png-alpha",
      "https://images.unsplash.com/photo-1695048064971-d68a98f1ac51?auto=format&fit=crop&q=80&w=1200"
    ],
    status: 'Disponible',
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "3",
    model: "iPhone 14",
    storage: "128GB",
    condition: "Excelente",
    battery: "98%",
    price: 310000,
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-blue?wid=600&hei=600&fmt=png-alpha",
      "https://images.unsplash.com/photo-1662993132644-884ec85c7f8a?auto=format&fit=crop&q=80&w=1200"
    ],
    status: 'Disponible',
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "4",
    model: "iPhone 13 Pro Max",
    storage: "512GB",
    condition: "Muy Bueno",
    battery: "88%",
    price: 335000,
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pro-max-sierrablue-select?wid=600&hei=600&fmt=png-alpha",
      "https://images.unsplash.com/photo-1632661674596-618d8b64d641?auto=format&fit=crop&q=80&w=1200"
    ],
    status: 'Disponible',
    createdAt: "2026-03-10T10:00:00.000Z",
  },
  {
    id: "5",
    model: "iPhone 13 Pro",
    storage: "128GB",
    condition: "Bueno",
    battery: "85%",
    price: 285000,
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-midnight-select-2021?wid=600&hei=600&fmt=png-alpha",
      "https://images.unsplash.com/photo-1632661674596-618d8b64d641?auto=format&fit=crop&q=80&w=1200"
    ],
    status: 'Disponible',
    createdAt: "2026-03-05T10:00:00.000Z",
  },
  {
    id: "6",
    model: "iPhone 11",
    storage: "64GB",
    condition: "Bueno",
    battery: "82%",
    price: 130000,
    images: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-black-select-2019?wid=600&hei=600&fmt=png-alpha",
      "https://images.unsplash.com/photo-1574856344991-abc31b6caa8e?auto=format&fit=crop&q=80&w=1200"
    ],
    status: 'Disponible',
    createdAt: "2026-02-28T10:00:00.000Z",
  }
];
