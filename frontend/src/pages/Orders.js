import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/');
      const ordersData = Array.isArray(response.data.results) 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '200% 200%'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-white">My Orders</h1>

        {orders.length === 0 ? (
          <div className="rounded-lg shadow-md p-12 text-center" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg shadow-md p-6" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="space-y-3 mb-4">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Shipping Address</p>
                      <p className="text-gray-800">{order.shipping_address}</p>
                      {order.phone && (
                        <p className="text-sm text-gray-600 mt-1">Phone: {order.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-purple-600">₹{order.total_amount}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

