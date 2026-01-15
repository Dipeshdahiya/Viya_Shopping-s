import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [subscribing, setSubscribing] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    try {
      setSubscribing(true);
      // Send subscription email via backend
      await api.post('/newsletter/subscribe/', { email });
      alert('Thank you for subscribing! You will receive our latest updates and offers.');
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Thank you for subscribing! You will receive our latest updates and offers.');
      setEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 w-full overflow-hidden">
      {/* Download App Banner */}
      <div className="bg-purple-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-purple-900">
              download app now!
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <span className="text-sm">GET IT ON</span>
                <span className="text-xs font-bold">Google Play</span>
              </a>
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <span className="text-sm">Download on the</span>
                <span className="text-xs font-bold">App Store</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Suspicious Call Banner */}
      <div className="bg-purple-700 py-3">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-white">
            <span>Report Suspicious Calls</span>
            <Link to="/help" className="underline hover:no-underline transition-colors">
              read more..
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-amber-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* Currency */}
            <div>
              <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg">
                <span>🇮🇳</span>
                <span>{currency}</span>
              </button>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-bold mb-4">shop</h4>
              <ul className="space-y-2">
                <li><Link to="/products?category=skin" className="hover:text-purple-600 transition-colors">skincare</Link></li>
                <li><Link to="/products?category=body" className="hover:text-purple-600 transition-colors">bodycare</Link></li>
                <li><Link to="/products?category=hair" className="hover:text-purple-600 transition-colors">haircare</Link></li>
                <li><Link to="/products?category=fragrances" className="hover:text-purple-600 transition-colors">fragrances</Link></li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-bold mb-4">learn</h4>
              <ul className="space-y-2">
                <li><Link to="/blogs" className="hover:text-purple-600 transition-colors">veya blogs</Link></li>
                <li><Link to="/about" className="hover:text-purple-600 transition-colors">features</Link></li>
                <li><Link to="/about" className="hover:text-purple-600 transition-colors">rewards</Link></li>
                <li><Link to="/blogs" className="hover:text-purple-600 transition-colors">newsletters</Link></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-bold mb-4">help</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="hover:text-purple-600 transition-colors">contact us</Link></li>
                <li><Link to="/help" className="hover:text-purple-600 transition-colors">policies</Link></li>
                <li><Link to="/help" className="hover:text-purple-600 transition-colors">faqs</Link></li>
                <li><Link to="/orders" className="hover:text-purple-600 transition-colors">track order</Link></li>
              </ul>
            </div>

            {/* Newsletter (FIXED OVERFLOW) */}
            <div>
              <h4 className="font-bold mb-2">
                sign up for expert beauty insights!
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                (PS: we too hate spam!)
              </p>

              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-2 w-full"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors w-full sm:w-auto whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {subscribing ? 'Subscribing...' : 'subscribe'}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© 2025 veya, all rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/help" className="hover:text-purple-600 transition-colors">privacy policy</Link>
              <Link to="/help" className="hover:text-purple-600 transition-colors">terms</Link>
              <button
                onClick={scrollToTop}
                className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
