import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', formData);
      if (response.data) {
        // Clear any old data
        localStorage.clear();
        sessionStorage.clear();
        // Redirect and reload
        navigate('/');
        // Small delay to ensure session is set
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      {/* Global Sparkle Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ zIndex: 1 }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `sparkle ${4 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          >
            <span 
              className="text-yellow-300 text-xl md:text-2xl" 
              style={{
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 0, 0.9))',
                animation: `twinkle ${1.5 + Math.random() * 1}s ease-in-out infinite alternate, float ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s, ${Math.random() * 3}s`,
                willChange: 'transform, opacity'
              }}
            >
              ✨
            </span>
          </div>
        ))}
      </div>

      <div className="max-w-lg w-full space-y-8 relative z-10" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
        backdropFilter: 'blur(15px)',
        padding: '3rem 2.5rem',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">Veya</h1>
            <p className="text-sm italic text-purple-400">we have chemistry™</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Sign in to your account to continue shopping
          </p>
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base transition-all"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base transition-all"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;


