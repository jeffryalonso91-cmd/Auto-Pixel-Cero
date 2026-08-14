export const CONFIG = {
  storeName: "Pixel Cero",
  whatsappNumber: "+1234567890", // Example format, replace with actual number
  email: "hola@pixelcero.example.com",
  instagramUrl: "https://instagram.com/pixelcero",
  businessHours: "Lun - Vie, 9 AM - 6 PM",
  currencySymbol: "$",
  logoUrl: "",
  popupEnabled: false,
  popupImageUrl: "",
  heroImageUrl: "https://images.unsplash.com/photo-1603898037225-83606be13426?auto=format&fit=crop&q=80&w=1200",
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
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    model: "iPhone 14 Pro Max",
    storage: "256GB",
    condition: "Excelente",
    battery: "95%",
    price: 899,
    images: ["https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "2",
    model: "iPhone 14 Pro",
    storage: "128GB",
    condition: "Muy Bueno",
    battery: "91%",
    price: 799,
    images: ["https://images.unsplash.com/photo-1695048064971-d68a98f1ac51?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "3",
    model: "iPhone 14",
    storage: "128GB",
    condition: "Excelente",
    battery: "98%",
    price: 599,
    images: ["https://images.unsplash.com/photo-1662993132644-884ec85c7f8a?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "4",
    model: "iPhone 13 Pro Max",
    storage: "512GB",
    condition: "Muy Bueno",
    battery: "88%",
    price: 649,
    images: ["https://images.unsplash.com/photo-1632661674596-618d8b64d641?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "5",
    model: "iPhone 13 Pro",
    storage: "128GB",
    condition: "Bueno",
    battery: "85%",
    price: 549,
    images: ["https://images.unsplash.com/photo-1632661674596-618d8b64d641?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  },
  {
    id: "6",
    model: "iPhone 11",
    storage: "64GB",
    condition: "Bueno",
    battery: "82%",
    price: 249,
    images: ["https://images.unsplash.com/photo-1574856344991-abc31b6caa8e?auto=format&fit=crop&q=80&w=1200"],
    status: 'Disponible',
  }
];
