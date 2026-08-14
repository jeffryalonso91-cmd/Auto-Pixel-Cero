import React, { useState, useEffect } from 'react';
import { Product } from '../data';
import { Plus, Pencil, Trash2, X, ArrowLeft, Lock, Upload } from 'lucide-react';

async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const processImageFile = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'config' | 'users'>('inventory');
  const [configEditing, setConfigEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState(storeConfig);

  // User management state
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserError, setNewUserError] = useState('');
  const [newUserSuccess, setNewUserSuccess] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = sessionStorage.getItem('admin_auth') === 'true';
      setIsAuthenticated(isAuth);
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedUsername = username.trim();
    
    try {
      const { supabase } = await import('../supabase');
      
      const hashedInput = await hashPassword(password);
      
      const { data, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', trimmedUsername)
        .single();
        
      if (data && data.password_hash === hashedInput) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('admin_user', trimmedUsername);
        return;
      } else if (data) {
        setError('Contraseña incorrecta.');
        return;
      }

      setError('Credenciales incorrectas o usuario no existe.');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión.');
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_user');
    setIsAuthenticated(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError('');
    setNewUserSuccess('');
    
    if (newUserPassword.length < 6) {
      setNewUserError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      const { supabase } = await import('../supabase');
      
      const targetUsername = newUsername.trim();
      const { data: userSnap } = await supabase.from('admin_users').select('*').eq('username', targetUsername).single();
      
      if (userSnap || targetUsername === 'jeffryalonso') {
        setNewUserError('El usuario ya existe.');
        return;
      }
      
      const passwordHash = await hashPassword(newUserPassword);
      await supabase.from('admin_users').insert({
        username: targetUsername,
        password_hash: passwordHash
      });
      
      setNewUserSuccess(`Usuario '${targetUsername}' creado exitosamente.`);
      setNewUsername('');
      setNewUserPassword('');
    } catch (err: any) {
      console.error(err);
      setNewUserError('Error al crear usuario.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      const { supabase } = await import('../supabase');
      
      const currentUser = sessionStorage.getItem('admin_user');
      if (!currentUser || currentUser === 'jeffryalonso') {
        setPasswordError('No se puede cambiar la contraseña del administrador por defecto.');
        return;
      }
      
      const { data: userSnap } = await supabase.from('admin_users').select('*').eq('username', currentUser).single();
      
      const passwordHash = await hashPassword(newPassword);
      
      if (userSnap) {
        await supabase.from('admin_users').update({ password_hash: passwordHash }).eq('username', currentUser);
      } else {
        setPasswordError('Usuario no encontrado en la base de datos.');
        return;
      }
      
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setNewPassword('');
    } catch (err: any) {
      console.error(err);
      setPasswordError('Error al actualizar la contraseña.');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const product: Product = {
      id: editing?.id || Date.now().toString(),
      model: formData.get('model') as string,
      storage: formData.get('storage') as string,
      condition: formData.get('condition') as string,
      battery: formData.get('battery') as string,
      price: Number(formData.get('price')),
      status: (formData.get('status') as 'Disponible' | 'Vendido') || 'Disponible',
      images: editingImages.length > 0 ? editingImages : [formData.get('imageUrl') as string].filter(Boolean),
    };

    if (isNew) {
      setProducts([...products, product]);
    } else {
      setProducts(products.map(p => p.id === product.id ? product : p));
    }
    
    // Write to Firestore
    import('../supabase').then(async ({ supabase }) => {
      const { error } = await supabase.from('products').upsert(product);
      if (error) console.error(error);
    });

    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setProducts(products.filter(p => p.id !== deleteConfirm));
      
      // Delete from Firestore
      const idToDelete = deleteConfirm;
      import('../supabase').then(async ({ supabase }) => {
        const { error } = await supabase.from('products').delete().eq('id', idToDelete);
        if (error) console.error(error);
      });
      
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
          </div>
        </div>

        {activeTab === 'inventory' && (
          <>
            <div className="flex flex-wrap gap-4 mb-6 justify-end">
              <button
                onClick={() => { setEditing({} as Product); setEditingImages([]); setIsNew(true); }}
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
                        onClick={() => { setEditing(p); setEditingImages(p.images || [(p as any).imageUrl]); setIsNew(false); }}
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
                    <label className="w-full p-4 bg-apple-bg hover:bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer transition-all flex flex-col items-center justify-center text-apple-gray text-sm">
                      <span className="font-medium mb-1">Subir fotos desde tu dispositivo</span>
                      <span>Formatos soportados: JPG, PNG, WEBP</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden"
                        onChange={async (e) => {
                          if (!e.target.files) return;
                          const files = Array.from(e.target.files) as File[];
                          const newImages = await Promise.all(files.map(file => {
                            return new Promise<string>((resolve) => {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 800;
                                  const MAX_HEIGHT = 800;
                                  let width = img.width;
                                  let height = img.height;

                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height *= MAX_WIDTH / width;
                                      width = MAX_WIDTH;
                                    }
                                  } else {
                                    if (height > MAX_HEIGHT) {
                                      width *= MAX_HEIGHT / height;
                                      height = MAX_HEIGHT;
                                    }
                                  }

                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  resolve(canvas.toDataURL('image/jpeg', 0.7));
                                };
                                img.src = e.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            });
                          }));
                          setEditingImages(prev => [...prev, ...newImages]);
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
                  <button type="submit" className="w-full py-4 bg-apple-text text-white rounded-full font-medium hover:bg-black transition-colors">
                    {isNew ? 'Crear Artículo' : 'Guardar Cambios'}
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
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Enlace de Instagram</label>
                <input
                  type="text"
                  value={tempConfig?.instagramUrl || ""}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), instagramUrl: e.target.value})}
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
              
              <div className="pt-4 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => {
                    setStoreConfig(tempConfig);
                    import('../supabase').then(async ({ supabase }) => {
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
                      if (error) console.error(error);
                      
                      const { error: heroError } = await supabase.from('store_config').upsert({
                        id: 'hero',
                        popup_image_url: tempConfig?.heroImageUrl
                      });
                      if (heroError) console.error(heroError);
                    });
                  }}
                  className="px-8 py-4 bg-apple-blue text-white rounded-full font-medium hover:bg-apple-blue-hover transition-colors"
                >
                  Guardar Ajustes
                </button>
                <button
                  onClick={() => setTempConfig(storeConfig)}
                  className="px-8 py-4 bg-gray-100 text-apple-text rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Descartar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6">Cambiar Contraseña</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                    style={{ fontFamily: 'caption' }}
                    required
                  />
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}
                <button
                  type="submit"
                  className="px-8 py-4 bg-apple-text text-white rounded-full font-medium hover:bg-black transition-colors w-full"
                >
                  Actualizar Contraseña
                </button>
              </form>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6">Añadir Nuevo Usuario</h2>
              <p className="text-apple-gray text-sm mb-6">Crea una nueva cuenta de administrador para esta tienda.</p>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Usuario</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Contraseña</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                    style={{ fontFamily: 'caption' }}
                    required
                  />
                </div>
                {newUserError && <p className="text-red-500 text-sm">{newUserError}</p>}
                {newUserSuccess && <p className="text-green-500 text-sm">{newUserSuccess}</p>}
                <button
                  type="submit"
                  className="px-8 py-4 bg-apple-blue text-white rounded-full font-medium hover:bg-apple-blue-hover transition-colors w-full"
                >
                  Crear Usuario
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
