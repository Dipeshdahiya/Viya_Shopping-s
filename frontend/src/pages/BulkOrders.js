import React, { useState } from 'react';

const BulkOrders = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    quantity: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your interest! We will contact you soon.');
    setFormData({ name: '', email: '', phone: '', company: '', quantity: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <h1 className="text-4xl font-bold text-white text-center mb-4">Bulk Orders</h1>
        <p className="text-purple-200 text-center mb-12">Special pricing for bulk purchases</p>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Bulk Orders?</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">💰</span>
                  <span>Special discounted pricing for bulk purchases</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">🚚</span>
                  <span>Free shipping on bulk orders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">🎁</span>
                  <span>Custom packaging options available</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">📞</span>
                  <span>Dedicated account manager for support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">⚡</span>
                  <span>Priority processing and faster delivery</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Minimum Order Quantity</h2>
              <p className="text-gray-700 mb-4">Bulk orders require a minimum quantity of 50 units per product.</p>
              <div className="space-y-2 text-gray-700">
                <p><strong>50-100 units:</strong> 10% discount</p>
                <p><strong>101-500 units:</strong> 15% discount</p>
                <p><strong>500+ units:</strong> Custom pricing (contact us)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request a Quote</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company Name (Optional)"
                  value={formData.company}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <input
                type="text"
                name="quantity"
                placeholder="Estimated Quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                name="message"
                placeholder="Additional Details or Requirements"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Request Quote
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrders;



