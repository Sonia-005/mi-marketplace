import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${id}`);
      setMessages(res.data);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  };

  useEffect(() => {
    Promise.all([
      api.get(`/orders/${id}`),
      api.get(`/messages/${id}`),
    ]).then(([oRes, mRes]) => {
      setOrder(oRes.data);
      setMessages(mRes.data);
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }).catch(() => setLoading(false));

    // Polling cada 5 segundos para simular tiempo real
    pollingRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollingRef.current);
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/messages', { orderId: id, text });
      setMessages((prev) => [...prev, res.data]);
      setText('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } finally {
      setSending(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { orderId: id, rating, comment });
      setReviewed(true);
      setShowReview(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar reseña');
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!order) return <div className="text-center py-20 text-gray-500">Orden no encontrada.</div>;

  const isClient = order.client?._id === user?.id || order.client?.id === user?.id;
  const isFreelancer = order.freelancer?._id === user?.id || order.freelancer?.id === user?.id;
  const other = isClient ? order.freelancer : order.client;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado de la orden */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-bold text-gray-900 text-xl">{order.service?.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isClient ? 'Freelancer' : 'Cliente'}: <span className="font-medium text-gray-700">{other?.name}</span>
            </p>
            {order.requirements && (
              <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg">
                <strong>Requisitos:</strong> {order.requirements}
              </p>
            )}
          </div>
          <div className="text-right">
            <StatusBadge status={order.status} />
            <p className="text-2xl font-bold text-gray-900 mt-1">${order.price}</p>
          </div>
        </div>

        {/* Botón de reseña para clientes cuando la orden está completada */}
        {isClient && order.status === 'completed' && !reviewed && (
          <button
            onClick={() => setShowReview(true)}
            className="mt-4 text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-medium px-4 py-2 rounded-xl transition-colors"
          >
            ★ Dejar reseña
          </button>
        )}
        {reviewed && (
          <p className="mt-4 text-sm text-green-600 font-medium">✓ Reseña enviada</p>
        )}
      </div>

      {/* Chat */}
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col" style={{ height: '60vh' }}>
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm font-medium text-gray-700">Chat con {other?.name}</p>
          <span className="text-xs text-gray-400 ml-auto">Actualiza cada 5s</span>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">
              Sin mensajes aún. ¡Inicia la conversación!
            </p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.sender?._id === user?.id || msg.sender?.id === user?.id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
                {!isOwn && (
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">
                    {msg.sender?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensaje */}
        <form onSubmit={sendMessage} className="border-t border-gray-100 p-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {sending ? '...' : 'Enviar'}
          </button>
        </form>
      </div>

      {/* Modal de reseña */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dejar reseña</h3>
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="¿Cómo fue tu experiencia?"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-xl transition-colors"
                >
                  Enviar reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
