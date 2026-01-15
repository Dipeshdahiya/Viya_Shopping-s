import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { getCartCount, fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we just logged out - if so, clear the flag and skip user fetch
    const justLoggedOut = sessionStorage.getItem('just_logged_out');
    
    if (justLoggedOut === 'true') {
      sessionStorage.removeItem('just_logged_out');
      setUser(null);
      return; // Don't fetch user if we just logged out
    }
    
    // Add a small delay to prevent auto-login immediately after logout
    const timer = setTimeout(() => {
      const checkAndFetchUser = async () => {
        try {
          // Try to fetch user - if session is invalid, it will return 401
          const response = await api.get('/users/me/');
          setUser(response.data);
        } catch (error) {
          // If 401, user is not logged in - this is expected after logout
          if (error.response?.status === 401) {
            setUser(null);
          } else {
            // For other errors, also set user to null
            setUser(null);
          }
        }
      };
      
      checkAndFetchUser();
    }, 500); // 500ms delay to ensure logout completes
    
    return () => clearTimeout(timer);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
    } catch (error) {
      // If 401, user is not logged in - this is expected
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        setUser(null);
      }
    }
  };

  const handleLogout = async (e) => {
    try {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    
      setIsUserMenuOpen(false);
      // Clear user state immediately
      setUser(null);
    
      try {
        // Call logout API
        const logoutResponse = await api.post('/auth/logout/');
      } catch (error) {
        // Even if logout API fails, continue with logout
        console.error('Logout API error:', error);
      }
    
    // Clear all cookies manually with all possible paths
    const cookiesToDelete = ['sessionid', 'csrftoken'];
    const paths = ['/', '/api'];
    
    cookiesToDelete.forEach(cookieName => {
      paths.forEach(path => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=localhost;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=.localhost;`;
      });
      // Also try without path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });
    
    // Clear all cookies using the old method too
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.split("=")[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api;`;
    });
    
    // Store logout flag in sessionStorage BEFORE clearing (to prevent auto-fetch after redirect)
    sessionStorage.setItem('just_logged_out', 'true');
    
    // Clear localStorage (but keep sessionStorage for the flag)
    localStorage.clear();
    
      // Wait a bit before redirect to ensure cookies are cleared
      setTimeout(() => {
        // Force a full page reload to clear all state
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, try to redirect
      window.location.href = '/';
    }
  };

  const navCategories = [
    { name: 'skin', slug: 'skin' },
    { name: 'body', slug: 'body' },
    { name: 'hair', slug: 'hair' },
    { name: 'fragrances', slug: 'fragrances' },
    { name: 'gifting', slug: 'gifting' },
    { name: 'makeup', slug: 'makeup' },
    { name: 'blogs & newsletters', slug: 'blogs' },
    { name: 'get to know us', slug: 'about' },
    { name: 'help', slug: 'help' },
    { name: 'careers', slug: 'careers' },
    { name: 'bulk orders', slug: 'bulk' },
  ];

  return (
    <header className="sticky top-0 z-50"
    style={{
      background: 'linear-gradient(135deg,rgba(89, 28, 135, 0.6) 0%, #6B21A8 50%,rgba(126, 34, 206, 0.56) 100%)'
      
    }}>
      {/* Top Yellow Banner */}
      <div className="bg-yellow-400 text-gray-900 text-center  text-sm font-medium">
        ✨ Mega drop: B2G2 FREE + free full-size winter moisturizer ✨
      </div>

      {/* Purple Header Bar */}
      <div className="text-white" >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            {/* Logo */}
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-bold text-white">Veya</span>
              <span className="text-xs italic text-purple-200">we have chemistry™</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-transparent px-4 py-2 pl-10 pr-4  text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/products?search=${e.target.value}`);
                    }
                  }}
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Download App */}
              <button className="hidden md:flex items-center space-x-1 text-white hover:text-purple-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-white hover:text-purple-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b text-gray-700 font-medium">
                        {user.username}
                      </div>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/orders" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        type="button"
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-white hover:text-purple-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative text-white hover:text-purple-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purple Navigation Bar */}
      <div className="border-t border-purple-800 " style={{
        background: 'linear-gradient(135deg, #581C87 0%, #6B21A8 50%, #7E22CE 100%)',
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)'
      }}>
        <div className="container mx-auto px-4 flex justify-center items-center">
          <nav className="hidden md:flex items-center space-x-6 py-3 overflow-x-auto">
            {navCategories.map((cat) => {
              let linkTo = `/products?category=${cat.slug}`;
              // Map category slugs to proper category filters
              const categoryMap = {
                'skin': 'skin',
                'body': 'body',
                'hair': 'hair',
                'fragrances': 'fragrances',
                'gifting': 'gifting',
                'makeup': 'makeup',
              };
              
              if (categoryMap[cat.slug]) {
                linkTo = `/products?category=${categoryMap[cat.slug]}`;
              } else if (cat.slug === 'blogs') linkTo = '/blogs';
              else if (cat.slug === 'about') linkTo = '/about';
              else if (cat.slug === 'help') linkTo = '/help';
              else if (cat.slug === 'careers') linkTo = '/careers';
              else if (cat.slug === 'bulk') linkTo = '/bulk-orders';
              
              return (
                <Link
                  key={cat.slug}
                  to={linkTo}
                  className="flex items-center space-x-1 text-white hover:text-yellow-300 text-sm font-medium whitespace-nowrap transition-colors hover:scale-105 transform"
                  onClick={() => {
                    // Close mobile menu if open
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="capitalize">{cat.name}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-purple-800" style={{
          background: 'linear-gradient(135deg, #581C87 0%, #6B21A8 50%, #7E22CE 100%)',
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }}>
          <div className="px-4 py-2 space-y-2">
            {navCategories.map((cat) => {
              let linkTo = `/products?category=${cat.slug}`;
              // Map category slugs to proper category filters
              const categoryMap = {
                'skin': 'skin',
                'body': 'body',
                'hair': 'hair',
                'fragrances': 'fragrances',
                'gifting': 'gifting',
                'makeup': 'makeup',
              };
              
              if (categoryMap[cat.slug]) {
                linkTo = `/products?category=${categoryMap[cat.slug]}`;
              } else if (cat.slug === 'blogs') linkTo = '/blogs';
              else if (cat.slug === 'about') linkTo = '/about';
              else if (cat.slug === 'help') linkTo = '/help';
              else if (cat.slug === 'careers') linkTo = '/careers';
              else if (cat.slug === 'bulk') linkTo = '/bulk-orders';
              
              return (
                <Link
                  key={cat.slug}
                  to={linkTo}
                  className="block py-2 text-white hover:text-yellow-300 capitalize transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              );
            })}
            <div className="pt-2">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 pr-4 bg-white text-gray-900 rounded-lg focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/products?search=${e.target.value}`);
                    setIsMenuOpen(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

