import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Star, MessageCircle, User, Calendar } from 'lucide-react';

export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
  status: 'published' | 'hidden';
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = async () => {
    const { data } = await supabase.from('store_config').select('store_name').eq('id', 'reviews_data').single();
    if (data && data.store_name) {
      try {
        const parsed = JSON.parse(data.store_name);
        setReviews(parsed);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    
    // Subscribe to changes
    const sub = supabase
      .channel('reviews_changes_' + Math.random().toString(36).substring(7))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_config', filter: 'id=eq.reviews_data' }, () => {
         fetchReviews();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.content.trim()) return;
    setSubmitting(true);
    try {
      const reviewObj: Review = {
        id: Math.random().toString(36).substring(2, 11),
        author: newReview.author,
        rating: newReview.rating,
        content: newReview.content,
        createdAt: new Date().toISOString(),
        status: 'published'
      };
      
      const updatedReviews = [reviewObj, ...reviews];
      setReviews(updatedReviews);
      await supabase.from('store_config').upsert({ id: 'reviews_data', store_name: JSON.stringify(updatedReviews) });
      
      setSubmitted(true);
      setNewReview({ author: '', rating: 5, content: '' });
      setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
    } catch (error) {
      console.error("Error adding review: ", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} className={i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
    ));
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Recientemente';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const visibleReviews = reviews.filter(r => r.status !== 'hidden');

  if (loading) return null;

  return (
    <section className="py-24 bg-white" id="reviews">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-semibold text-apple-text tracking-tight mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-apple-gray text-lg max-w-2xl">Personas reales, experiencias reales con nuestros equipos.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="mt-6 md:mt-0 px-6 py-3 bg-apple-blue text-white rounded-full font-medium hover:bg-apple-blue-hover transition-colors shadow-sm"
          >
            {showForm ? 'Cancelar' : 'Dejar una reseña'}
          </button>
        </div>

        {showForm && (
          <div className="mb-12 bg-apple-bg p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Escribe tu reseña</h3>
            {submitted ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
                <MessageCircle size={20} />
                <span className="font-medium">¡Gracias por tu reseña! Ha sido publicada.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2">Tu Nombre</label>
                  <input 
                    required
                    type="text" 
                    value={newReview.author}
                    onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                    className="w-full p-4 bg-white rounded-2xl border border-gray-200 focus:border-apple-blue outline-none transition-all"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2">Calificación</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="p-2"
                      >
                        <Star size={24} className={newReview.rating >= star ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-apple-text mb-2">Comentario</label>
                  <textarea 
                    required
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    className="w-full p-4 bg-white rounded-2xl border border-gray-200 focus:border-apple-blue outline-none transition-all min-h-[120px] resize-none"
                    placeholder="Cuéntanos tu experiencia con el equipo..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="mt-2 w-full py-4 bg-apple-blue text-white rounded-2xl font-medium hover:bg-apple-blue-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Publicar Reseña'}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleReviews.length === 0 ? (
            <p className="text-apple-gray col-span-full">Aún no hay reseñas.</p>
          ) : (
            visibleReviews.map((review) => (
              <div key={review.id} className="bg-apple-bg p-8 rounded-3xl border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {renderStars(review.rating)}
                </div>
                <p className="text-apple-text text-lg mb-6 flex-grow">"{review.content}"</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                    <span className="font-medium text-apple-text">{review.author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-apple-gray">
                    <Calendar size={14} />
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
