import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Checkout = () => {
  const { cartItems, getCartTotal, fetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    shipping_address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentData, setPaymentData] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchCart();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        full_name: `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim() || response.data.username,
        email: response.data.email || '',
      }));
    } catch (error) {
      // User not logged in
      setUser(null);
    }
  };

  const shippingFee = getCartTotal() >= 999 ? 0 : 199;
  const totalAmount = getCartTotal() + shippingFee;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.phone || !formData.shipping_address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate phone (should be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate pincode (should be 6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/orders/', formData);
      setOrder(response.data);

      // Create Razorpay payment
      const paymentResponse = await api.post(`/orders/${response.data.id}/create_payment/`);
      setPaymentData(paymentResponse.data);

      // Initialize Razorpay
      const orderId = response.data.id;
      const options = {
        key: paymentResponse.data.key,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        name: 'Veya',
        description: `Order ${response.data.order_number}`,
        order_id: paymentResponse.data.order_id,
        handler: async function (paymentResponse) {
          try {
            // Verify payment
            const verifyResponse = await api.post(`/orders/${orderId}/verify_payment/`, {
              payment_id: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            });
            
            if (verifyResponse.data.status === 'success') {
              alert('Payment successful! Your order has been placed. A confirmation email has been sent to your email address.');
              // Clear cart and redirect
              navigate('/orders');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.full_name || 'Customer',
          email: formData.email || 'customer@example.com',
          contact: formData.phone,
        },
        theme: {
          color: '#9333ea',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden py-20" style={{
        background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '200% 200%'
      }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Continue Shopping
          </button>
        </div>
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
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-white">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCreateOrder} className="rounded-lg shadow-md p-6 space-y-6" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Shipping Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  maxLength="10"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Enter your 10-digit phone number"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Complete Shipping Address *</label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Enter your complete address (House/Flat number, Street, Area)"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Enter your state"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    maxLength="6"
                    pattern="[0-9]{6}"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="Enter 6-digit pincode"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg shadow-md p-6 sticky top-20" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">₹{item.total_price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-purple-600">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

