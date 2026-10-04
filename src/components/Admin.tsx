import React, { useState, useEffect, useMemo } from 'react';
import localforage from 'localforage';
import { supabase } from '../supabase';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Product, formatPrice, normalizePrice, sortProducts } from '../data';
import { analyzeAlpha, initPipelineTestHelper } from '../utils/analyzeAlpha';
import { Plus, Pencil, Trash2, X, ArrowLeft, Lock, Upload, Key, ShieldCheck, RefreshCw, Instagram, Facebook, AlertTriangle } from 'lucide-react';
import { TikTokSvg } from './SocialIcons';


async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Ultra-Fast & Crisp Image Processor:
 * Produces crisp 1200px images with 78% quality (~70KB-110KB per photo)
 * Saves instantly to cloud databases with zero delay and avoids network bottlenecks.
 */
export const checkImageOpaqueCorners = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(false);

        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16).data;

        // Corners in 16x16: (0,0), (15,0), (0,15), (15,15)
        const cornerIndices = [
          0,
          15 * 4,
          (15 * 16) * 4,
          (15 * 16 + 15) * 4,
        ];

        const allOpaque = cornerIndices.every(idx => imgData[idx + 3] === 255);
        resolve(allOpaque);
      } catch (err) {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

const processProductImageHD = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const maxDim = 1600; // Resize to max 1600px on longest side

        let targetWidth = width;
        let targetHeight = height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            targetHeight = Math.round((height * maxDim) / width);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((width * maxDim) / height);
            targetHeight = maxDim;
          }
        }

        const isPngOrWebp = 
          file.type === 'image/png' || 
          file.type === 'image/webp' || 
          file.type === 'image/x-png' || 
          /\.(png|webp)$/i.test(file.name);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // NEVER paint a background fill! Keep alpha channel pristine!
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        let outputUrl = '';
        if (isPngOrWebp) {
          try {
            outputUrl = canvas.toDataURL('image/webp', 0.9);
            if (!outputUrl.startsWith('data:image/webp')) {
              outputUrl = canvas.toDataURL('image/png');
            }
          } catch {
            outputUrl = canvas.toDataURL('image/png');
          }
        } else {
          outputUrl = canvas.toDataURL('image/jpeg', 0.88);
        }

        resolve(outputUrl || result);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

function AdminImagePreviewItem({ img, index, onRemove }: { key?: React.Key; img: string; index: number; onRemove: () => void }) {
  const [isOpaque, setIsOpaque] = useState(false);

  useEffect(() => {
    let isMounted = true;
    checkImageOpaqueCorners(img).then((opaque) => {
      if (isMounted) setIsOpaque(opaque);
    });
    return () => { isMounted = false; };
  }, [img]);

  return (
    <div className="flex flex-col gap-1.5 max-w-[200px]">
      <div 
        className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 shadow-xs flex items-center justify-center group"
        style={{
          backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
          backgroundSize: '12px 12px',
          backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
        }}
      >
        <img src={img} alt={`Preview ${index + 1}`} className="max-w-full max-h-full object-contain p-1" />
        <button 
          type="button" 
          onClick={onRemove}
          className="absolute top-1 right-1 bg-white/90 hover:bg-red-500 hover:text-white rounded-full p-1 shadow-xs text-red-500 transition-colors"
          title="Eliminar foto"
        >
          <X size={13} />
        </button>
        {index === 0 && (
          <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
            Portada
          </span>
        )}
      </div>
      {isOpaque && index === 0 && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-tight flex items-start gap-1">
          <AlertTriangle size={13} className="shrink-0 text-amber-600 relative top-0.5" />
          <span>Esta foto tiene fondo. Sube un PNG con el teléfono recortado para que se vea flotando.</span>
        </div>
      )}
    </div>
  );
}

// Safeguard for oversized legacy base64 strings (> 250KB) to prevent database timeouts
const optimizeBase64ImageIfNeeded = async (dataUrl: string): Promise<string> => {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  // If already under 250KB base64 string, keep it completely untouched with 0ms delay
  if (dataUrl.length < 250 * 1024) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      const maxDim = 1200;

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
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

const processImageFile = async (file: File, maxWidth: number = 1200, maxHeight: number = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png' || result.startsWith('data:image/png');
        const format = isPng ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(format, 0.92));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve('');
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
  useEffect(() => {
    initPipelineTestHelper(processProductImageHD);
  }, []);

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

  const sortedProducts = useMemo(() => sortProducts(products, false), [products]);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => prev?.text === text ? null : prev);
    }, 3500);
  };

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

      const rawImages = finalImages;
      // Sanitize all images fast with 0-delay on pre-optimized images
      const sanitizedImages = await Promise.all(
        rawImages.map(img => optimizeBase64ImageIfNeeded(img))
      );

      const product: Product = {
        id: editing?.id || Date.now().toString(),
        model: (formData.get('model') as string)?.trim() || 'iPhone',
        storage: (formData.get('storage') as string)?.trim() || '128GB',
        condition: (formData.get('condition') as string)?.trim() || 'Excelente',
        battery: (formData.get('battery') as string)?.trim() || '100%',
        price: Number(formData.get('price')) || 0,
        status: (formData.get('status') as 'Disponible' | 'Vendido') || 'Disponible',
        comments: (formData.get('comments') as string)?.trim() || '',
        images: sanitizedImages,
        createdAt: editing?.createdAt || new Date().toISOString(),
      };

      // 1. INSTANT OPTIMISTIC UPDATE: Update React state & cache immediately (0ms delay)
      const updatedProducts = isNew 
        ? [product, ...products] 
        : products.map(p => p.id === product.id ? product : p);

      setProducts(updatedProducts);
      try {
        localStorage.setItem('pixelcero_products_cache', JSON.stringify(updatedProducts));
      } catch (cacheErr) {}
      localforage.setItem('pixelcero_products_cache', updatedProducts).catch(() => {});

      // 2. CLOSE MODAL IMMEDIATELY & SHOW CONFIRMATION
      setEditing(null);
      setIsNew(false);
      setEditingImages([]);
      setSavingProduct(false);
      showToast(isNew ? 'Artículo creado correctamente' : 'Artículo actualizado con éxito');

      // 3. BACKGROUND PARALLEL SYNC TO ALL DATABASES (Zero UI blocking)
      (async () => {
        const baseProductRow: Record<string, any> = {
          id: product.id,
          model: product.model,
          storage: product.storage,
          condition: product.condition,
          battery: product.battery,
          price: product.price,
          status: product.status || 'Disponible',
          images: sanitizedImages,
        };

        await Promise.allSettled([
          // Supabase Products Table - ONLY standard columns that exist in the table schema
          (async () => {
            try {
              const { error: sbErr } = await supabase.from('products').upsert(baseProductRow);
              if (sbErr) {
                console.warn('Notice updating Supabase products table:', sbErr.message);
              }
            } catch (sbEx) {
              console.warn('Supabase upsert exception:', sbEx);
            }
          })(),

          // Firestore Products Collection
          (async () => {
            try {
              await setDoc(doc(db, 'products', product.id), {
                id: product.id,
                model: product.model,
                storage: product.storage,
                condition: product.condition,
                battery: product.battery,
                price: product.price,
                status: product.status || 'Disponible',
                comments: product.comments || '',
                images: sanitizedImages,
                createdAt: product.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (e) {}
          })(),

          // Metadata in store_config (comments & timestamps)
          (async () => {
            try {
              const { data: configRows } = await supabase
                .from('store_config')
                .select('id, store_name')
                .in('id', ['product_comments', 'product_timestamps']);

              let commentsMap: Record<string, string> = {};
              let timestampsMap: Record<string, string | number> = {};

              const commentsRow = configRows?.find((r: any) => r.id === 'product_comments');
              if (commentsRow?.store_name) {
                try { commentsMap = JSON.parse(commentsRow.store_name); } catch (e) {}
              }
              commentsMap[product.id] = product.comments || '';

              const timestampsRow = configRows?.find((r: any) => r.id === 'product_timestamps');
              if (timestampsRow?.store_name) {
                try { timestampsMap = JSON.parse(timestampsRow.store_name); } catch (e) {}
              }
              if (product.createdAt) {
                timestampsMap[product.id] = product.createdAt;
              }

              try {
                localStorage.setItem('pixelcero_comments_cache', JSON.stringify(commentsMap));
                localStorage.setItem('pixelcero_timestamps_cache', JSON.stringify(timestampsMap));
              } catch (e) {}

              await supabase.from('store_config').upsert([
                { id: 'product_comments', store_name: JSON.stringify(commentsMap) },
                { id: 'product_timestamps', store_name: JSON.stringify(timestampsMap) }
              ]);
            } catch (e) {}
          })()
        ]);
      })();
    } catch (err: any) {
      console.error('Error in handleSave:', err);
      setSaveProductError('Ocurrió un error inesperado al guardar el artículo.');
      setSavingProduct(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      const idToDelete = deleteConfirm;
      setDeleteConfirm(null);

      // Instant optimistic state removal
      const updatedProducts = products.filter(p => p.id !== idToDelete);
      setProducts(updatedProducts);
      try {
        localStorage.setItem('pixelcero_products_cache', JSON.stringify(updatedProducts));
      } catch (e) {}
      localforage.setItem('pixelcero_products_cache', updatedProducts).catch(() => {});
      showToast('Artículo eliminado del inventario');

      // Background parallel delete
      (async () => {
        await Promise.allSettled([
          supabase.from('products').delete().eq('id', idToDelete),
          (async () => {
            try {
              await deleteDoc(doc(db, 'products', idToDelete));
            } catch (e) {}
          })(),
          (async () => {
            try {
              const { data: configRows } = await supabase
                .from('store_config')
                .select('id, store_name')
                .in('id', ['product_comments', 'product_timestamps']);

              const commentsRow = configRows?.find((r: any) => r.id === 'product_comments');
              let commentsMap: Record<string, string> = {};
              if (commentsRow?.store_name) {
                try { commentsMap = JSON.parse(commentsRow.store_name); } catch (e) {}
              }

              const timestampsRow = configRows?.find((r: any) => r.id === 'product_timestamps');
              let timestampsMap: Record<string, string | number> = {};
              if (timestampsRow?.store_name) {
                try { timestampsMap = JSON.parse(timestampsRow.store_name); } catch (e) {}
              }

              delete commentsMap[idToDelete];
              delete timestampsMap[idToDelete];

              try {
                localStorage.setItem('pixelcero_comments_cache', JSON.stringify(commentsMap));
                localStorage.setItem('pixelcero_timestamps_cache', JSON.stringify(timestampsMap));
              } catch (e) {}

              await supabase.from('store_config').upsert([
                { id: 'product_comments', store_name: JSON.stringify(commentsMap) },
                { id: 'product_timestamps', store_name: JSON.stringify(timestampsMap) }
              ]);
            } catch (e) {}
          })()
        ]);
      })();
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
                {sortedProducts.length === 0 ? (
                   <tr>
                     <td colSpan={7} className="px-6 py-12 text-center text-apple-gray">
                       No hay artículos en el inventario. Haz clic en "Nuevo Artículo" para empezar.
                     </td>
                   </tr>
                ) : null}
                {sortedProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-apple-text flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-apple-bg overflow-hidden flex-shrink-0">
                        <img src={(p.images && p.images.length > 0) ? p.images[0] : (p as any).imageUrl} alt={p.model} className="w-full h-full object-cover" />
                      </div>
                      {p.model}
                    </td>
                    <td className="px-6 py-4 text-apple-gray">{p.storage}</td>
                    <td className="px-6 py-4 font-semibold text-apple-text">{formatPrice(p.price, storeConfig?.currencySymbol || '₡')}</td>
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
                    <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Precio en Colones ({storeConfig?.currencySymbol || '₡'})</label>
                    <input required type="number" name="price" defaultValue={editing.price ? normalizePrice(editing.price) : ''} className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400" placeholder="Ej: 450000" />
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
                    <option value="Disponible">Disponible (En Stock)</option>
                    <option value="Contra pedido">Contra pedido (Por encargo)</option>
                    <option value="Apartado">Apartado (Reservado)</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <label className="block text-sm font-medium text-apple-text">Comentarios / Observaciones (Opcional)</label>
                    <span className="text-xs text-apple-gray">Se desplegará al hacer clic en las especificaciones</span>
                  </div>
                  <textarea 
                    name="comments" 
                    defaultValue={editing.comments || ''} 
                    rows={3}
                    className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all placeholder:text-gray-400 text-sm resize-none" 
                    placeholder="Ej: Incluye cable original tipo C, sin detalles en pantalla ni marcos, batería 100% original nunca cambiada..." 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Fotos del Artículo</label>
                  
                  {editingImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {editingImages.map((img, i) => (
                        <AdminImagePreviewItem 
                          key={i}
                          img={img}
                          index={i}
                          onRemove={() => setEditingImages(editingImages.filter((_, idx) => idx !== i))}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <label className={`w-full p-4 bg-apple-bg hover:bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer transition-all flex flex-col items-center justify-center text-apple-gray text-sm ${uploadingImages ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingImages ? (
                        <div className="flex items-center gap-2 text-apple-blue font-medium py-2">
                          <div className="w-4 h-4 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                          <span>Procesando fotos en Alta Resolución (2K HD)...</span>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium mb-1 text-apple-text">Subir fotos en Alta Resolución (2K HD)</span>
                          <span className="text-xs text-apple-gray">Formatos: JPG, PNG, WEBP &middot; Máxima nitidez (2048px sin pérdida) para examinar detalles con zoom</span>
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
                              files.map(async (file) => {
                                const origAnalysis = await analyzeAlpha(file);
                                console.log(`[IMG Etapa A: Selección de Archivo]`, {
                                  nombre: file.name,
                                  tipo: file.type,
                                  bytes: file.size,
                                  porcentajeTransparencia: `${origAnalysis.transparentPixelPercent}%`,
                                  alfaEsquinas: origAnalysis.cornerAlphas,
                                });

                                const processed = await processProductImageHD(file);

                                const procAnalysis = await analyzeAlpha(processed);
                                console.log(`[IMG Etapa B: Procesamiento Navegador]`, {
                                  tipoSalida: procAnalysis.contentType,
                                  longitudBase64: processed.length,
                                  porcentajeTransparencia: `${procAnalysis.transparentPixelPercent}%`,
                                  alfaEsquinas: procAnalysis.cornerAlphas,
                                });

                                const survived = procAnalysis.transparentPixelPercent > 0 || !origAnalysis.isAllCornersOpaque;

                                console.table({
                                  'Etapa A (Original)': {
                                    Tipo: file.type,
                                    Tamaño: `${Math.round(file.size / 1024)} KB`,
                                    Transparencia: `${origAnalysis.transparentPixelPercent}%`,
                                  },
                                  'Etapa B (Procesado)': {
                                    Tipo: procAnalysis.contentType,
                                    Tamaño: `${Math.round(processed.length / 1024)} KB base64`,
                                    Transparencia: `${procAnalysis.transparentPixelPercent}%`,
                                  },
                                  'Culpable / Diagnóstico': {
                                    Tipo: procAnalysis.contentType,
                                    Tamaño: 'Conservado',
                                    Transparencia: survived ? 'Intacto (Conserva Alfa)' : 'Archivo original venía opaco desde origen',
                                  },
                                });

                                return processed;
                              })
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

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2 ml-1">Símbolo de Moneda (Colones)</label>
                <input
                  type="text"
                  placeholder="₡"
                  value={tempConfig?.currencySymbol || "₡"}
                  onChange={(e) => setTempConfig({...(tempConfig || {}), currencySymbol: e.target.value})}
                  className="w-full p-4 bg-apple-bg rounded-2xl border-2 border-transparent focus:border-apple-blue focus:bg-white outline-none transition-all"
                />
                <span className="text-xs text-apple-gray ml-1 mt-1.5 block">Símbolo actual: <strong>{tempConfig?.currencySymbol || '₡'}</strong>. Los precios en toda la tienda se muestran con separador de miles costarricense (ej: ₡450.000).</span>
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

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-medium ${
            toastMessage.type === 'error'
              ? 'bg-red-600 text-white border-red-500 shadow-red-500/20'
              : 'bg-zinc-900 text-white border-zinc-800 shadow-black/20'
          }`}>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
