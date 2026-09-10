import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Product } from '../data';
import { Plus, Pencil, Trash2, X, ArrowLeft, Lock, Upload, Key, ShieldCheck, RefreshCw, Instagram, Facebook } from 'lucide-react';
import { TikTokSvg } from './SocialIcons';
import imageCompression from 'browser-image-compression';


async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const processProductImageUltraHD = async (file: File): Promise<string> => {
  try {
    // If the file is already a lightweight image under 1.8MB, check if dimensions are within 2560px
    if (file.size <= 1.8 * 1024 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const fitsDimensions = await new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width <= 2560 && img.height <= 2560);
        img.onerror = () => resolve(false);
        img.src = dataUrl;
      });
      if (fitsDimensions) {
        return dataUrl;
      }
    }

    // High fidelity compression preserving maximum sharpness, details, and 2.5K resolution
    const options = {
      maxSizeMB: 2.5,
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.95
    };
    const compressedFile = await imageCompression(file, options);
    return await imageCompression.getDataUrlFromFile(compressedFile);
  } catch (err) {
    console.warn('Canvas fallback Ultra HD:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const maxDim = 2560;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }
};

const processImageFile = async (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return processProductImageUltraHD(file);
};

export default function Admin({
  products,
  setProducts,
  storeConfig,
  setStoreConfig
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
  storeConfig: any;
  setStoreConfig: (c: any) => void;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  const [editing, setEditing] = useState<Product | null>(null);
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [saveProductError, setSaveProductError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'config' | 'users' | 'reviews'>('inventory');
  const [reviews, setReviews] = useState<any[]>([]);
  const [deleteReviewConfirm, setDeleteReviewConfirm] = useState<any | null>(null);
  const [reviewActionLoading, setReviewActionLoading] = useState<string | null>(null);

  const [adminUsers, setAdminUsers] = useState<{ username: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserError, setNewUserError] = useState('');
  const [newUserSuccess, setNewUserSuccess] = useState('');
  const [newUserLoading, setNewUserLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordError, setEditPasswordError] = useState('');
  const [editPasswordSuccess, setEditPasswordSuccess] = useState('');
  const [editPasswordLoading, setEditPasswordLoading] = useState(false);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const [deleteUserError, setDeleteUserError] = useState('');
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  
  const [configEditing, setConfigEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState(storeConfig || {});
  const [configSaveMessage, setConfigSaveMessage] = useState('');
  const [configSaving, setConfigSaving] = useState(false);
  
        const fetchAdminUsers = async () => {};

  
  const fetchReviewsAdmin = async () => {
    const { data } = await supabase.from('store_config').select('store_name').eq('id', 'reviews_data').single();
    if (data && data.store_name) {
      try {
        setReviews(JSON.parse(data.store_name));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleReviewStatus = async (review: any) => {
    setReviewActionLoading(review.id);
    const newStatus = review.status === 'hidden' ? 'published' : 'hidden';
    const updatedReviews = reviews.map(r => r.id === review.id ? { ...r, status: newStatus } : r);
    setReviews(updatedReviews);
    try {
      const { error } = await supabase.from('store_config').upsert({ id: 'reviews_data', store_name: JSON.stringify(updatedReviews) });
      if (error) {
        console.error('Error toggling review status:', error);
        fetchReviewsAdmin();
      }
    } catch (e) {
      console.error(e);
      fetchReviewsAdmin();
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleConfirmDeleteReview = async () => {
    if (!deleteReviewConfirm) return;
    const idToDelete = deleteReviewConfirm.id;
    setDeleteReviewConfirm(null);
    setReviewActionLoading(idToDelete);
    const updatedReviews = reviews.filter(r => r.id !== idToDelete);
    setReviews(updatedReviews);
    try {
      const { error } = await supabase.from('store_config').upsert({ id: 'reviews_data', store_name: JSON.stringify(updatedReviews) });
      if (error) {
        console.error('Error deleting review:', error);
        fetchReviewsAdmin();
      }
    } catch (e) {
      console.error(e);
      fetchReviewsAdmin();
    } finally {
      setReviewActionLoading(null);
    }
  };

  

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReviewsAdmin();
      const sub = supabase
        .channel('admin_reviews_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config', filter: 'id=eq.reviews_data' }, () => {
           fetchReviewsAdmin();
        })
        .subscribe();
      return () => { supabase.removeChannel(sub); };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (storeConfig) {
      setTempConfig(storeConfig);
    }
  }, [storeConfig]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const email = username.includes('@') ? username.trim() : `${username.trim()}@pixelcero.com`;
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        setError('Credenciales incorrectas o correo no confirmado.');
        return;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError('');
    setNewUserSuccess('');
    
    if (newUserPassword.length < 6) {
      setNewUserError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    const targetUsername = newUsername.trim().toLowerCase();
    if (!targetUsername) {
      setNewUserError('Ingresa un nombre de usuario válido.');
      return;
    }

    setNewUserLoading(true);
    try {
      const { data: userSnap } = await supabase
        .from('admin_users')
        .select('username')
        .eq('username', targetUsername)
        .maybeSingle();
      
      if (userSnap) {
        setNewUserError(`El usuario '${targetUsername}' ya existe.`);
        setNewUserLoading(false);
        return;
      }
      
      const passwordHash = await hashPassword(newUserPassword);
      const { error: insertErr } = await supabase.from('admin_users').insert({
        username: targetUsername,
        password_hash: passwordHash
      });

      if (insertErr) {
        setNewUserError('Error al crear usuario: ' + insertErr.message);
        setNewUserLoading(false);
        return;
      }
      
      setNewUserSuccess(`Usuario '${targetUsername}' creado exitosamente.`);
      setNewUsername('');
      setNewUserPassword('');
      await fetchAdminUsers();
    } catch (err: any) {
      console.error(err);
      setNewUserError('Error al crear usuario.');
    } finally {
      setNewUserLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditPasswordError('');
    setEditPasswordSuccess('');

    if (editPassword.length < 6) {
      setEditPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setEditPasswordLoading(true);
    try {
      const passwordHash = await hashPassword(editPassword);
      const { error: updateErr } = await supabase
        .from('admin_users')
        .update({ password_hash: passwordHash })
        .eq('username', editingUser);

      if (updateErr) {
        setEditPasswordError('Error al actualizar contraseña: ' + updateErr.message);
        setEditPasswordLoading(false);
        return;
      }

      setEditPasswordSuccess(`Contraseña de '${editingUser}' actualizada correctamente.`);
      setTimeout(() => {
        setEditingUser(null);
        setEditPassword('');
        setEditPasswordSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setEditPasswordError('Error al actualizar la contraseña.');
    } finally {
      setEditPasswordLoading(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteUserConfirm) return;
    setDeleteUserError('');
    const currentUser = sessionStorage.getItem('admin_user');
    
    if (deleteUserConfirm === currentUser) {
      setDeleteUserError('No puedes eliminar el usuario con el que tienes sesión iniciada actualmente.');
      return;
    }

    if (adminUsers.length <= 1) {
      setDeleteUserError('No se puede eliminar el único usuario administrador restante.');
      return;
    }

    setDeleteUserLoading(true);
    try {
      const { error: delErr } = await supabase
        .from('admin_users')
        .delete()
        .eq('username', deleteUserConfirm);

      if (delErr) {
        setDeleteUserError('Error al eliminar usuario: ' + delErr.message);
        setDeleteUserLoading(false);
        return;
      }

      setDeleteUserConfirm(null);
      await fetchAdminUsers();
    } catch (err: any) {
      console.error(err);
      setDeleteUserError('Error al eliminar usuario.');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveProductError(null);
    setSavingProduct(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      let finalImages = editingImages;
      if (finalImages.length === 0 && editing?.images && editing.images.length > 0) {
        finalImages = editing.images;
      }
      if (finalImages.length === 0) {
        const urlFallback = formData.get('imageUrl') as string;
        if (urlFallback && urlFallback.trim()) {
          finalImages = [urlFallback.trim()];
        }
      }

      const product: Product = {
        id: editing?.id || Date.now().toString(),
        model: (formData.get('model') as string)?.trim() || 'iPhone',
        storage: (formData.get('storage') as string)?.trim() || '128GB',
        condition: (formData.get('condition') as string)?.trim() || 'Excelente',
        battery: (formData.get('battery') as string)?.trim() || '100%',
        price: Number(formData.get('price')) || 0,
        status: (formData.get('status') as 'Disponible' | 'Vendido') || 'Disponible',
        images: finalImages,
      };

      const { error } = await supabase.from('products').upsert(product);
      if (error) {
        console.error('Error saving product:', error);
        setSaveProductError('Error al guardar en la base de datos: ' + error.message);
        setSavingProduct(false);
        return;
      }

      const updatedProducts = isNew 
        ? [...products, product] 
        : products.map(p => p.id === product.id ? product : p);

      setProducts(updatedProducts);
      try {
        localStorage.setItem('pixelcero_products_cache', JSON.stringify(updatedProducts));
      } catch (cacheErr) {
        console.warn('Cache write notice:', cacheErr);
      }

      setEditing(null);
      setIsNew(false);
      setEditingImages([]);
    } catch (err: any) {
      console.error('Error in handleSave:', err);
      setSaveProductError('Ocurrió un error inesperado al guardar el artículo.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      const idToDelete = deleteConfirm;
      try {
        const { error } = await supabase.from('products').delete().eq('id', idToDelete);
        if (error) {
          alert('Error al eliminar en la base de datos: ' + error.message);
          return;
        }
        const updatedProducts = products.filter(p => p.id !== idToDelete);
        setProducts(updatedProducts);
        try {
          localStorage.setItem('pixelcero_products_cache', JSON.stringify(updatedProducts));
        } catch (e) {}
      } catch (err) {
        console.error('Delete error:', err);
      }
      setDeleteConfirm(null);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-apple-bg flex items-center justify-center p-6 font-sans">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-apple-bg rounded-full flex items-center justify-center text-apple-text">
              <Lock size={28} strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-center tracking-tight mb-2">Acceso Restringido</h1>
          <p className="text-apple-gray text-center mb-8 text-sm">Ingresa tu usuario y contraseña para acceder al panel de administración.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Usuario" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400"
                style={{ fontFamily: 'caption' }}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-apple-text text-white rounded-full font-medium hover:bg-black transition-colors mt-2"
            >
              Iniciar Sesión
            </button>
            <div className="text-center mt-6">
              <a href="/" className="text-apple-gray hover:text-apple-text text-sm transition-colors inline-flex items-center gap-2">
                <ArrowLeft size={14} /> Volver a la tienda
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-bg p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-6 mb-10">
          <div>
            <a href="#" className="inline-flex items-center gap-2 text-apple-gray hover:text-apple-text transition-colors text-sm font-medium mb-4">
              <ArrowLeft size={16} /> Volver a la Tienda
            </a>
            <h1 className="text-3xl md:text-4xl font-semibold text-apple-text tracking-tight">Administración</h1>
            <p className="text-apple-gray mt-2">Gestiona el inventario y la configuración de tu tienda.</p>
          </div>

          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-gray hover:text-apple-text'}`}
            >
              Inventario
            </button>
            <button
              onClick={() => { setActiveTab('config'); setTempConfig(storeConfig || {}); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-gray hover:text-apple-text'}`}
            >
              Ajustes de Tienda
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-gray hover:text-apple-text'}`}
            >
              Usuarios
            </button>
                      <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'reviews' ? 'bg-white shadow-sm text-apple-text' : 'text-apple-gray hover:text-apple-text'}`}
            >
              Reseñas
            </button>
          </div>
        </div>

        {activeTab === 'inventory' && (
          <>
            <div className="flex flex-wrap gap-4 mb-6 justify-end">
              <button
                onClick={() => { setEditing({} as Product); setEditingImages([]); setSaveProductError(null); setIsNew(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-apple-blue text-white rounded-full hover:bg-apple-blue-hover transition-colors font-medium shadow-sm"
              >
                <Plus size={18} />
                Nuevo Artículo
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-apple-gray text-sm tracking-tight bg-gray-50/50">
                  <th className="px-6 py-4 font-medium">Producto</th>
                  <th className="px-6 py-4 font-medium">Capacidad</th>
                  <th className="px-6 py-4 font-medium">Precio</th>
                  <th className="px-6 py-4 font-medium">Batería</th>
                  <th className="px-6 py-4 font-medium">Condición</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="px-6 py-12 text-center text-apple-gray">
                       No hay artículos en el inventario. Haz clic en "Nuevo Artículo" para empezar.
                     </td>
                   </tr>
                ) : null}
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-apple-text flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-apple-bg overflow-hidden flex-shrink-0">
                        <img src={(p.images && p.images.length > 0) ? p.images[0] : (p as any).imageUrl} alt={p.model} className="w-full h-full object-cover" />
                      </div>
                      {p.model}
                    </td>
                    <td className="px-6 py-4 text-apple-gray">{p.storage}</td>
                    <td className="px-6 py-4 font-medium text-apple-text">${p.price}</td>
                    <td className="px-6 py-4 text-apple-gray">{p.battery}</td>
                    <td className="px-6 py-4 text-apple-gray">{p.condition}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'Vendido' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {p.status || 'Disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2 items-center h-[81px]">
                      <button
                        onClick={() => { setEditing(p); setEditingImages(Array.isArray(p.images) ? [...p.images] : ((p as any).imageUrl ? [(p as any).imageUrl] : [])); setSaveProductError(null); setIsNew(false); }}
                        className="p-2.5 text-apple-gray hover:text-apple-blue hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 text-apple-gray hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-apple-gray hover:text-apple-text hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-semibold mb-6 tracking-tight">
                {isNew ? 'Nuevo Artículo' : 'Editar Artículo'}
              </h2>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Modelo</label>
                  <input required name="model" defaultValue={editing.model} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: iPhone 13 Pro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Precio ($)</label>
                    <input required type="number" name="price" defaultValue={editing.price} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Capacidad</label>
                    <input required name="storage" defaultValue={editing.storage} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: 256GB" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Condición</label>
                    <input required name="condition" defaultValue={editing.condition} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: Excelente" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Batería (%)</label>
                    <input required name="battery" defaultValue={editing.battery} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: 100%" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Estado</label>
                  <select name="status" defaultValue={editing.status || 'Disponible'} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all">
                    <option value="Disponible">Disponible</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Fotos del Artículo</label>
                  
                  {editingImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {editingImages.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setEditingImages(editingImages.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-red-500 hover:bg-red-50"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <label className={`w-full p-4 bg-apple-bg hover:bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer transition-all flex flex-col items-center justify-center text-apple-gray text-sm ${uploadingImages ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingImages ? (
                        <div className="flex items-center gap-2 text-apple-blue font-medium py-2">
                          <div className="w-4 h-4 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                          <span>Cargando fotos en Ultra HD 2.5K...</span>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium mb-1 text-apple-text">Subir fotos en Alta Calidad (Ultra HD)</span>
                          <span className="text-xs text-apple-gray">Formatos: JPG, PNG, WEBP &middot; Máxima nitidez (hasta 2.5K con 95% de calidad) para zoom de detalles</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImages}
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          setUploadingImages(true);
                          const files = Array.from(e.target.files) as File[];
                          try {
                            const newImages = await Promise.all(
                              files.map(file => processProductImageUltraHD(file))
                            );
                            const validImages = newImages.filter(Boolean);
                            setEditingImages(prev => [...prev, ...validImages]);
                          } catch (error) {
                            console.error('Error processing high quality image', error);
                          } finally {
                            setUploadingImages(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        id="urlInput"
                        className="flex-1 p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" 
                        placeholder="O pega una URL (https://...)" 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('urlInput') as HTMLInputElement;
                          if (input.value) {
                            setEditingImages(prev => [...prev, input.value]);
                            input.value = '';
                          }
                        }}
                        className="p-4 bg-apple-blue text-white rounded-2xl hover:bg-apple-blue-hover transition-colors font-medium whitespace-nowrap"
                      >
                        Añadir URL
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  {saveProductError && (
                    <div className="p-3.5 mb-3 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-200">
                      {saveProductError}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={savingProduct || uploadingImages}
                    className={`w-full py-4 bg-apple-text text-white rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm ${
                      savingProduct || uploadingImages ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {savingProduct ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando en la base de datos...</span>
                      </>
                    ) : isNew ? 'Crear Artículo' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
              <h3 className="text-xl font-semibold mb-4 text-apple-text">¿Eliminar artículo?</h3>
              <p className="text-apple-gray mb-8">Esta acción no se puede deshacer.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-apple-text rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
        </>
        )}

        {activeTab === 'config' && (
          <div className="bg-white rounded-3xl p-8 max-w-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6">Ajustes Generales</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={tempConfig?.storeName || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), storeName: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Número de WhatsApp (ej: +1234567890)</label>
                <input
                  type="text"
                  value={tempConfig?.whatsappNumber || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), whatsappNumber: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={tempConfig?.email || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), email: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-apple-text mb-2 ml-1">
                  <Instagram size={16} className="text-pink-600" />
                  <span>Enlace de Instagram</span>
                </label>
                <input
                  type="text"
                  placeholder="https://instagram.com/pixelcero"
                  value={tempConfig?.instagramUrl || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), instagramUrl: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-apple-text mb-2 ml-1">
                  <Facebook size={16} className="text-blue-600" />
                  <span>Enlace de Facebook</span>
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/pixelcero"
                  value={tempConfig?.facebookUrl || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), facebookUrl: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-apple-text mb-2 ml-1">
                  <TikTokSvg size={16} />
                  <span>Enlace de TikTok</span>
                </label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@pixelcero"
                  value={tempConfig?.tiktokUrl || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), tiktokUrl: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Logo de la Tienda (Opcional)</label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="w-full p-4 bg-apple-bg hover:bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer transition-all flex flex-col items-center justify-center text-apple-gray text-sm">
                      <span className="font-medium">Subir Logo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={async (e) => {
                          if (!e.target.files || !e.target.files[0]) return;
                          const file = e.target.files[0];
                          const base64 = await processImageFile(file, 200, 200);
                          setTempConfig({...(tempConfig || {}), logoUrl: base64});
                        }}
                      />
                    </label>
                  </div>
                  {tempConfig?.logoUrl && (
                    <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                      <img src={tempConfig?.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {tempConfig?.logoUrl && (
                    <button 
                      type="button" 
                      onClick={() => setTempConfig({...(tempConfig || {}), logoUrl: ''})}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Imagen de Portada (Hero)</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="cursor-pointer flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-apple-blue hover:bg-apple-bg transition-colors">
                      <div className="flex flex-col items-center text-apple-gray">
                        <Upload size={24} className="mb-2" />
                        <span className="text-sm font-medium">Subir imagen HD</span>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          const file = e.target.files[0];
                          const base64 = await processImageFile(file, 1920, 1080);
                          setTempConfig({...(tempConfig || {}), heroImageUrl: base64});
                        }}
                      />
                    </label>
                  </div>
                  {tempConfig?.heroImageUrl && (
                    <div className="w-32 h-20 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-white relative">
                      <img src={tempConfig?.heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="popupEnabled"
                    checked={tempConfig?.popupEnabled || false}
                    onChange={(e) => setTempConfig({...(tempConfig || {}), popupEnabled: e.target.checked})}
                    className="w-5 h-5 rounded text-apple-blue focus:ring-apple-blue"
                  />
                  <label htmlFor="popupEnabled" className="text-sm font-medium text-apple-text select-none">Habilitar Banner Emergente de Inicio (HD)</label>
                </div>
                
                {tempConfig?.popupEnabled && (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="w-full p-4 bg-apple-bg hover:bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer transition-all flex flex-col items-center justify-center text-apple-gray text-sm">
                          <span className="font-medium">Subir Imagen del Banner (Alta resolución recomendada)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={async (e) => {
                              if (!e.target.files || !e.target.files[0]) return;
                              const file = e.target.files[0];
                              const base64 = await processImageFile(file, 1920, 1080);
                              setTempConfig({...(tempConfig || {}), popupImageUrl: base64});
                            }}
                          />
                        </label>
                      </div>
                      {tempConfig?.popupImageUrl && (
                        <div className="w-32 h-20 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-white relative">
                          <img src={tempConfig?.popupImageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Horario de Atención</label>
                <input
                  type="text"
                  value={tempConfig?.businessHours || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), businessHours: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
                <button
                  disabled={configSaving}
                  onClick={async () => {
                    setConfigSaving(true);
                    setConfigSaveMessage('');
                    setStoreConfig(tempConfig);
                    try {
                      const { supabase } = await import('../supabase');
                      const { error } = await supabase.from('store_config').upsert({ 
                        id: 'store', 
                        store_name: tempConfig?.storeName,
                        whatsapp_number: tempConfig?.whatsappNumber,
                        email: tempConfig?.email,
                        instagram_url: tempConfig?.instagramUrl,
                        business_hours: tempConfig?.businessHours,
                        currency_symbol: tempConfig?.currencySymbol,
                        logo_url: tempConfig?.logoUrl,
                        
                        popup_enabled: tempConfig?.popupEnabled,
                        popup_image_url: tempConfig?.popupImageUrl
                      });
                      if (error) console.error('Error saving store config:', error);

                      const { error: socialsError } = await supabase.from('store_config').upsert({
                        id: 'socials',
                        store_name: JSON.stringify({
                          facebookUrl: tempConfig?.facebookUrl || '',
                          tiktokUrl: tempConfig?.tiktokUrl || ''
                        })
                      });
                      if (socialsError) console.error('Error saving socials:', socialsError);
                      
                      const { error: heroError } = await supabase.from('store_config').upsert({
                        id: 'hero',
                        popup_image_url: tempConfig?.heroImageUrl
                      });
                      if (heroError) console.error(heroError);
                      const { error: faviconError } = await supabase.from('store_config').upsert({
                        id: 'favicon',
                        logo_url: tempConfig?.faviconUrl
                      });
                      if (faviconError) console.error(faviconError);

                      setConfigSaveMessage('¡Ajustes y redes guardados correctamente!');
                      setTimeout(() => setConfigSaveMessage(''), 4000);
                    } catch (err) {
                      console.error('Save settings error:', err);
                      setConfigSaveMessage('Error al guardar ajustes.');
                    } finally {
                      setConfigSaving(false);
                    }
                  }}
                  className="px-8 py-4 bg-apple-blue text-white rounded-full font-medium hover:bg-apple-blue-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {configSaving ? 'Guardando...' : 'Guardar Ajustes'}
                </button>
                <button
                  onClick={() => {
                    setTempConfig(storeConfig);
                    setConfigSaveMessage('');
                  }}
                  className="px-8 py-4 bg-gray-100 text-apple-text rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Descartar Cambios
                </button>

                {configSaveMessage && (
                  <span className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-full animate-fade-in">
                    {configSaveMessage}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Mantenimiento de Reseñas</h2>
                <p className="text-apple-gray text-sm mt-1">Gestiona los testimonios de los clientes. Puedes ocultarlos o eliminarlos permanentemente.</p>
              </div>
              <span className="text-sm font-medium px-4 py-1.5 bg-gray-100 rounded-full text-apple-gray self-start md:self-auto">
                {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-16 text-apple-gray border-2 border-dashed border-gray-200 rounded-2xl">
                No hay reseñas registradas todavía.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(review => {
                  const isHidden = review.status === 'hidden';
                  const isProcessing = reviewActionLoading === review.id;

                  return (
                    <div 
                      key={review.id} 
                      className={`border rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 transition-all ${
                        isHidden ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-apple-bg/50 border-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="font-semibold text-lg text-apple-text">{review.author}</span>
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 24 24">
                                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                              </svg>
                            ))}
                          </div>
                          {isHidden ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              Oculta en la tienda
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              Visible en la tienda
                            </span>
                          )}
                        </div>
                        <p className="text-apple-text text-base mb-3 italic">"{review.content}"</p>
                        <div className="text-xs text-apple-gray flex items-center gap-2">
                          <span>Fecha: {review.createdAt ? new Date(review.createdAt).toLocaleString('es-ES') : 'Recientemente'}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col lg:flex-row gap-2 items-center self-end md:self-center">
                        <button 
                          disabled={isProcessing}
                          onClick={() => handleToggleReviewStatus(review)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                            isHidden 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          } disabled:opacity-50`}
                        >
                          {isHidden ? 'Mostrar' : 'Ocultar'}
                        </button>
                        <button 
                          disabled={isProcessing}
                          onClick={() => setDeleteReviewConfirm(review)}
                          className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {deleteReviewConfirm && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                  <h3 className="text-xl font-semibold mb-2 text-apple-text">¿Eliminar reseña?</h3>
                  <p className="text-apple-gray text-sm mb-6">
                    Esta acción eliminará de forma permanente la reseña de <span className="font-semibold text-apple-text">"{deleteReviewConfirm.author}"</span>.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDeleteReviewConfirm(null)}
                      className="flex-1 py-3 px-4 bg-gray-100 text-apple-text rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmDeleteReview}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

{activeTab === 'users' && (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center py-16">
    <ShieldCheck size={48} className="mx-auto text-green-500 mb-4" />
    <h2 className="text-2xl font-semibold mb-2">Seguridad Mejorada Activada</h2>
    <p className="text-apple-gray max-w-lg mx-auto mb-6">
      Por motivos de seguridad (vulnerabilidad de exposición de hashes), la gestión de usuarios ha sido migrada a <strong>Supabase Auth</strong>.
      Ya no es posible crear o eliminar administradores desde este panel público.
    </p>
    <p className="text-sm text-apple-gray">
      Para añadir o eliminar usuarios, por favor ingresa a tu panel de Supabase: <br/>
      <span className="font-semibold text-apple-text">Authentication &gt; Users</span>
    </p>
  </div>
)}
      </div>
    </div>
  );
}
