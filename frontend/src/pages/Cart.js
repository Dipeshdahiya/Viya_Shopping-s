import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, loading, updateCartItem, removeFromCart, getCartTotal, fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(cartItemId);
    } else {
      await updateCartItem(cartItemId, newQuantity);
    }
  };

  const shippingFee = getCartTotal() >= 999 ? 0 : 199;
  const totalAmount = getCartTotal() + shippingFee;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden py-20" style={{
        background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '200% 200%'
      }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold mb-4 text-white">Your cart is empty</h2>
          <p className="text-purple-200 mb-8">Start shopping to add items to your cart</p>
          <Link
            to="/products"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 inline-block"
          >
            Continue Shopping
          </Link>
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
        <h1 className="text-3xl font-bold mb-8 text-white">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="rounded-lg shadow-md p-6" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    src={item.product.image || 'https://via.placeholder.com/200'}
                    alt={item.product.name}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link to={`/products/${item.product.slug}`}>
                      <h3 className="text-xl font-semibold text-gray-800 hover:text-purple-600 mb-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4">{item.product.category?.name}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {item.product.discount_price ? (
                          <div>
                            <span className="text-xl font-bold text-purple-600">₹{item.product.discount_price}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">₹{item.product.price}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-purple-600">₹{item.product.price}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 border rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="text-lg font-semibold">
                        Total: ₹{item.total_price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg shadow-md p-6 sticky top-20" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
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
                {getCartTotal() < 999 && (
                  <p className="text-sm text-gray-500">
                    Add ₹{(999 - getCartTotal()).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-purple-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center text-purple-600 hover:text-purple-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;


