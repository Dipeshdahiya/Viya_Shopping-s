import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import heroImg from '../assets/image(7).png';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [b2g2Products, setB2g2Products] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('bestsellers');
  const [b2g2Filter, setB2g2Filter] = useState('winter care');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 11, seconds: 32 });
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const scrollContainerRef = useRef(null);

  // Auto-rotate season's grand gift carousel every 5 seconds
  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(carouselInterval);
  }, []);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendingRes, bestsellerRes, b2g2Res, newRes, categoriesRes] = await Promise.all([
        api.get('/products/?trending=true&page_size=8'),
        api.get('/products/?bestseller=true&page_size=8'),
        api.get('/products/?page_size=12'),
        api.get('/products/?page_size=12'),
        api.get('/categories/'),
      ]);

      setTrendingProducts(Array.isArray(trendingRes.data.results) ? trendingRes.data.results : (Array.isArray(trendingRes.data) ? trendingRes.data : []));
      setBestsellers(Array.isArray(bestsellerRes.data.results) ? bestsellerRes.data.results : (Array.isArray(bestsellerRes.data) ? bestsellerRes.data : []));
      const allProducts = Array.isArray(b2g2Res.data.results) ? b2g2Res.data.results : (Array.isArray(b2g2Res.data) ? b2g2Res.data : []);
      // Initial B2G2 products will be set by the filter effect
      const newProductsData = Array.isArray(newRes.data.results) ? newRes.data.results : (Array.isArray(newRes.data) ? newRes.data : []);
      setNewProducts(newProductsData.slice(0, 4)); // Get 4 products for New on the shelves
      const categoriesData = Array.isArray(categoriesRes.data.results) ? categoriesRes.data.results : (Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setCategories(categoriesData);

      // Set initial B2G2 products if categories are loaded
      if (categoriesData.length > 0) {
        setB2g2Products(allProducts.slice(0, 4));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter products based on active filter
    let products = [];
    switch (activeFilter) {
      case 'bestsellers':
        products = bestsellers;
        break;
      case 'skincare':
        products = trendingProducts.filter(p => p.category?.slug === 'skin' || p.category?.name?.toLowerCase().includes('skin'));
        break;
      case 'bodycare':
        products = trendingProducts.filter(p => p.category?.slug === 'body' || p.category?.name?.toLowerCase().includes('body'));
        break;
      case 'haircare':
        products = trendingProducts.filter(p => p.category?.slug === 'hair' || p.category?.name?.toLowerCase().includes('hair'));
        break;
      case 'combos':
        products = trendingProducts.filter(p => p.category?.slug === 'gifting' || p.category?.name?.toLowerCase().includes('gift'));
        break;
      default:
        products = bestsellers;
    }
    setFilteredProducts(products);
  }, [activeFilter, bestsellers, trendingProducts]);

  // Filter B2G2 products based on filter
  useEffect(() => {
    const filterB2G2Products = async () => {
      try {
        let apiUrl = '/products/?page_size=20';

        // Map filter names to category slugs
        const categorySlugMap = {
          'haircare': 'haircare',
          'fragrances': 'fragrances',
          'bodycare': 'bodycare',
        };

        // Try to match filter with category slugs first
        let categoryMatch = categories.find(cat => {
          const filterLower = b2g2Filter.toLowerCase();
          const catNameLower = cat.name?.toLowerCase() || '';
          const catSlugLower = cat.slug?.toLowerCase() || '';
          return catNameLower.includes(filterLower) ||
            catSlugLower.includes(filterLower.replace(' ', '-')) ||
            filterLower.includes(catNameLower) ||
            filterLower.includes(catSlugLower);
        });

        // If no match, try the slug map
        if (!categoryMatch && categorySlugMap[b2g2Filter]) {
          categoryMatch = categories.find(cat => cat.slug === categorySlugMap[b2g2Filter]);
        }

        if (categoryMatch) {
          apiUrl = `/products/?category=${categoryMatch.slug}&page_size=20`;
        } else if (b2g2Filter === 'new launches') {
          apiUrl = '/products/?page_size=20&ordering=-created_at';
        }

        const response = await api.get(apiUrl);
        const allProducts = Array.isArray(response.data.results)
          ? response.data.results
          : (Array.isArray(response.data) ? response.data : []);

        // Filter products based on filter name if needed
        let filtered = allProducts;
        if (b2g2Filter === 'winter care') {
          // Filter by winter-related keywords
          filtered = allProducts.filter(p =>
            p.name?.toLowerCase().includes('winter') ||
            p.description?.toLowerCase().includes('winter') ||
            (p.tags && Array.isArray(p.tags) && p.tags.some(tag => tag.toLowerCase().includes('winter')))
          );
          // If no winter products, show all
          if (filtered.length === 0) filtered = allProducts;
        } else if (b2g2Filter === 'dry skin') {
          filtered = allProducts.filter(p =>
            p.name?.toLowerCase().includes('dry') ||
            p.description?.toLowerCase().includes('dry') ||
            p.name?.toLowerCase().includes('moisturiz') ||
            p.description?.toLowerCase().includes('moisturiz')
          );
          if (filtered.length === 0) filtered = allProducts;
        } else if (b2g2Filter === 'oily skin') {
          filtered = allProducts.filter(p =>
            p.name?.toLowerCase().includes('oil') ||
            p.description?.toLowerCase().includes('oil') ||
            p.name?.toLowerCase().includes('matte') ||
            p.description?.toLowerCase().includes('matte')
          );
          if (filtered.length === 0) filtered = allProducts;
        } else if (b2g2Filter === 'acne prone') {
          filtered = allProducts.filter(p =>
            p.name?.toLowerCase().includes('acne') ||
            p.description?.toLowerCase().includes('acne') ||
            p.name?.toLowerCase().includes('blemish') ||
            p.description?.toLowerCase().includes('blemish') ||
            p.name?.toLowerCase().includes('clear') ||
            p.description?.toLowerCase().includes('clear')
          );
          if (filtered.length === 0) filtered = allProducts;
        }

        setB2g2Products(filtered.slice(0, 4));
      } catch (error) {
        console.error('Error filtering B2G2 products:', error);
        // Fallback to showing all products if filter fails
        try {
          const fallbackResponse = await api.get('/products/?page_size=20');
          const fallbackProducts = Array.isArray(fallbackResponse.data.results)
            ? fallbackResponse.data.results
            : (Array.isArray(fallbackResponse.data) ? fallbackResponse.data : []);
          setB2g2Products(fallbackProducts.slice(0, 4));
        } catch (fallbackError) {
          console.error('Error fetching fallback products:', fallbackError);
        }
      }
    };

    if (categories.length > 0 || b2g2Filter) {
      filterB2G2Products();
    }
  }, [b2g2Filter, categories]);

  // Handle scroll tracking for scroll indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const progress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [filteredProducts]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (productId, e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (error) {
      alert('Please login to add items to cart');
    }
  };

  const handleAddAllToCart = async () => {
    try {
      for (const product of b2g2Products) {
        await addToCart(product.id, 1);
      }
      alert('All products added to cart!');
    } catch (error) {
      alert('Please login to add items to cart');
    }
  };

  const ProductCard = ({ product, isCarousel = false, index = 0 }) => {
    // Calculate card width based on content length and index for variety
    const nameLength = product.name?.length || 0;
    const baseWidth = 280; // Base width in pixels
    const widthVariation = nameLength > 40 ? 60 : nameLength > 30 ? 40 : 0;
    const indexVariation = (index % 3 === 0) ? 20 : (index % 3 === 1) ? -10 : 0;
    const cardWidth = baseWidth + widthVariation + indexVariation;

    return (
      <Link to={`/products/${product.slug}`} className={`group ${isCarousel ? 'flex-shrink-0' : ''}`} style={isCarousel ? { width: `${cardWidth}px` } : {}}>
        <div className={`rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all ${isCarousel ? '' : ''}`} style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          width: isCarousel ? '100%' : 'auto'
        }}>
          <div className="relative">
            <img
              src={product.image || 'https://via.placeholder.com/300'}
              alt={product.name}
              className={`${isCarousel ? 'w-full h-64' : 'w-full h-64'} object-cover`}
            />
            {product.is_trending && (
              <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center gap-1">
                <span>🔥</span> TRENDING
              </span>
            )}
            {product.is_bestseller && (
              <span className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 text-xs font-bold rounded">
                BESTSELLER
              </span>
            )}
            {product.discount_percentage > 0 && (
              <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
                {product.discount_percentage}% OFF
              </span>
            )}
          </div>
          <div className="p-4">
            {/* Buy 2 Get 2 Free Banner */}
            <div className="bg-yellow-400 text-gray-900 text-center py-1 mb-2 text-xs font-bold rounded">
              buy 2 get 2 free
            </div>

            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
            <div className="flex items-center mb-2">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 ml-1">
                {product.rating || '4.3'} ({product.review_count || '376'} reviews)
              </span>
              <span className="ml-2 text-blue-500">✓</span>
            </div>

            {/* Size Options */}
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:border-purple-600 hover:text-purple-600">
                50 g
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:border-purple-600 hover:text-purple-600">
                400ml
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {product.discount_price ? (
                  <div>
                    <span className="text-lg font-bold text-purple-600">₹{product.discount_price}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">₹{product.price}</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-purple-600">₹{product.price}</span>
                )}
              </div>
              <button
                onClick={(e) => handleAddToCart(product.id, e)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                add to cart
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Category icons data
  const categoryIcons = [
    { name: 'new drops', slug: 'new', icon: '🆕', color: 'bg-purple-100' },
    { name: 'skincare', slug: 'skin', icon: '🧴', color: 'bg-blue-100' },
    { name: 'bodycare', slug: 'body', icon: '🧴', color: 'bg-yellow-100' },
    { name: 'fragrance', slug: 'fragrances', icon: '💎', color: 'bg-amber-100' },
    { name: 'haircare', slug: 'hair', icon: '🧴', color: 'bg-blue-100' },
    { name: 'combos', slug: 'gifting', icon: '🎁', color: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(107, 33, 168, 0.3) 0%, transparent 70%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      {/* Global Sparkle/Confetti Effect - Whole Website */}


      <div className="relative z-10">



        {/* Main Promotion Section - Season Finale Sale */}
        <section className="relative  overflow-hidden">
          <div className=" inset-0 overflow-hidden pointer-events-none z-[-1]" style={{ zIndex: 1 }}>
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
                    animation: `twinkle ${1.5 + Math.random() * 100}s ease-in-out infinite alternate, float ${3 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s, ${Math.random() * 3}s`,
                    willChange: 'transform, opacity'
                  }}
                >
                  ✨
                </span>
              </div>
            ))}
          </div>
          <div className="py-6 container mx-auto px-4">
            <div className="flex justify-center items-center gap-4 overflow-x-auto">
              {categoryIcons.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center space-y-2 min-w-[80px] group"
                >
                  <div className={`w-16 h-16 rounded-full border-4 border-yellow-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg`} style={{
                    background: `linear-gradient(135deg, ${cat.color === 'bg-purple-100' ? '#faf5ff' : cat.color === 'bg-blue-100' ? '#dbeafe' : cat.color === 'bg-yellow-100' ? '#fef3c7' : cat.color === 'bg-amber-100' ? '#fef3c7' : '#faf5ff'} 0%, rgba(255,255,255,0.9) 100%)`
                  }}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium text-white capitalize">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="container mx-auto px-40 relative z-10">
            <div className="grid md:grid-cols-3  items-center">
              {/* Left: Disco Ball with Sale Text */}
              <div className="text-center md:text-left">
                <div className="inline-block rounded-full  transform  hover:rotate-0 transition-transform duration-500">
                  <img src={heroImg} alt="Veya" className="w-full h-80 object-contain" />
                </div>
              </div>

              {/* Center: Product Display */}
              <div className="flex flex-wrap justify-center gap-4">
                {trendingProducts.slice(0, 5).map((product, idx) => (
                  <div
                    key={product.id}
                    className="rounded-lg p-3 shadow-xl transition-shadow"
                    style={{
                      animationDelay: `${idx * 0.1}s`,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <img
                      src={product.image || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      className="w-20 h-20 md:w-24 md:h-24 object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Right: Buy Get 2 Free Banner */}
              <div className="text-center md:text-right">
                <div className="inline-block bg-purple-800 border-4 border-yellow-400 rounded-lg p-4 shadow-2xl">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    BUY GET 2 FREE
                  </h3>
                  <p className="text-yellow-300 font-semibold text-xs md:text-sm">
                    + extra gifts on all orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Icon - Fixed Position */}
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl z-50 transition-transform hover:scale-110"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </a>
        </section>

        {/* Flash Sale Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Flash Sale Banner */}
            <div className="relative mb-8 rounded-lg overflow-hidden border-4 border-yellow-400" style={{
              background: 'linear-gradient(135deg, #581C87 0%, #6B21A8 50%, #7E22CE 100%)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">FLASH SALE</h2>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-white">{String(countdown.hours).padStart(2, '0')}</span>
                      <span className="text-2xl md:text-3xl font-bold text-yellow-400">:</span>
                      <span className="text-2xl md:text-3xl font-bold text-white">{String(countdown.minutes).padStart(2, '0')}</span>
                      <span className="text-2xl md:text-3xl font-bold text-yellow-400">:</span>
                      <span className="text-2xl md:text-3xl font-bold text-white">{String(countdown.seconds).padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs md:text-sm text-yellow-300">
                      <span>Hours</span>
                      <span>Minutes</span>
                      <span>Seconds</span>
                    </div>
                    <p className="text-sm text-yellow-300 mt-2">FREE travel-size perfume on all orders.</p>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Link
                    to="/products"
                    className="inline-block bg-purple-700 border-2 border-yellow-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                  >
                    shop now &gt;
                  </Link>
                </div>
              </div>
            </div>

            {/* Toast-Worthy Deals Banner */}
            <div className="relative mb-8 w-full flex justify-center items-center">
              <div className="relative inline-block mx-auto" style={{
                background: 'linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)',
                border: '3px solid #FCD34D',
                borderRadius: '8px',
                padding: '12px 24px'
              }}>
                <div className="absolute -top-2 -left-2 text-yellow-400 text-2xl">✨</div>
                <div className="absolute -top-2 -right-2 text-yellow-400 text-2xl">✨</div>
                <h3 className="text-xl md:text-2xl font-bold text-yellow-400 text-center">toast-worthy deals</h3>
              </div>
            </div>

            {/* Promotional Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Buy 2 Get 2 Free Card */}
              <div className="relative rounded-lg overflow-hidden border-4 border-purple-600" style={{
                background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(255, 192, 203, 0.4) 100%)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}>
                {/* Expired Tag */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  EXPIRED
                </div>

                <div className="p-6 md:p-8 relative">
                  <div className="grid md:grid-cols-2 gap-4 items-center">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">BUY 2 GET 2 FREE</h3>
                      <p className="text-lg text-white mb-4">+ free full-size moisturizer</p>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-4xl md:text-5xl">🧴</span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-purple-700 border-2 border-yellow-400 rounded-full px-3 py-1 text-xs font-bold text-yellow-400">
                          free gift of the hour
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Link
                      to="/products"
                      className="inline-block bg-purple-700 border-2 border-yellow-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                    >
                      shop now &gt;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Buy 3 Get 3 Free Card */}
              <div className="relative rounded-lg overflow-hidden border-4 border-purple-600" style={{
                background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(176, 224, 230, 0.4) 100%)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}>
                {/* Expired Tag */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  EXPIRED
                </div>

                <div className="p-6 md:p-8 relative">
                  <div className="grid md:grid-cols-2 gap-4 items-center">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">BUY 3 GET 3 FREE</h3>
                      <p className="text-lg text-white mb-4">+ free lilac pouch</p>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-purple-200 rounded-lg flex items-center justify-center shadow-lg">
                          <span className="text-4xl md:text-5xl">🎁</span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-purple-700 border-2 border-yellow-400 rounded-full px-3 py-1 text-xs font-bold text-yellow-400">
                          free gift of the hour
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Link
                      to="/products"
                      className="inline-block bg-purple-700 border-2 border-yellow-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                    >
                      shop now &gt;
                    </Link>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </section>

        {/* Scrollable Product Section with Filter Buttons */}
        <section className="py-10 relative overflow-hidden">
          <div className="container mx-auto px-8 md:px-12 relative z-10 max-w-7xl">
            {/* The Best of Plums Banner */}
            <div className="relative mb-8 w-full flex justify-center items-center">
              <div className="relative inline-block mx-auto" style={{
                background: 'linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)',
                border: '3px solid #FCD34D',
                borderRadius: '8px',
                padding: '12px 24px'
              }}>
                <div className="absolute -top-2 -left-2 text-yellow-400 text-2xl">✨</div>
                <div className="absolute -top-2 -right-2 text-yellow-400 text-2xl">✨</div>
                <h3 className="text-xl md:text-2xl font-bold text-yellow-400 text-center">the best of veya</h3>
              </div>
            </div>
            {/* Filter Buttons - Centered */}
            <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-2">
              {['bestsellers', 'skincare', 'bodycare', 'haircare', 'combos'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs whitespace-nowrap transition-all transform hover:scale-105 ${activeFilter === filter
                      ? 'bg-yellow-400 text-gray-900 shadow-lg'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Scrollable Product Cards - Centered */}
            <div className="relative flex flex-col items-center">
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide max-w-6xl w-full"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} isCarousel={true} index={index} />
                  ))
                ) : (
                  <div className="text-center text-white py-12 w-full">
                    No products found in this category
                  </div>
                )}
              </div>

              {/* Dynamic Scroll Indicator - Above View All Button */}
              <div className="w-full max-w-6xl mt-4 mb-2">
                <div className="relative h-1 bg-purple-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
              </div>

              {/* View All Button - At Bottom */}
              <div className="text-center mt-4">
                <Link
                  to="/products"
                  className="inline-block bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition-colors shadow-lg text-sm"
                >
                  view all &gt;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Season's Grand Gift Promotional Banner */}
        <section className="py-8">
          <div className="container mx-50 px-4  flex flex-col align-center justify-center items-center">
            {/* Header Banner */}
            <div className="relative mb-6 ">
              <div className="relative inline-block mx-auto border-4 border-yellow-400 rounded-lg overflow-hidden" style={{
                background: 'linear-gradient(135deg, #581C87 0%, #6B21A8 50%, #7E22CE 100%)',
                padding: '12px 24px'
              }}>
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-2xl">✨</div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-2xl">✨</div>
                <h2 className="text-xl md:text-2xl font-bold text-white text-center">the season's grand gift</h2>
              </div>
            </div>

            {/* Main Promotional Banner Carousel */}
            <div
              className="relative  rounded-lg overflow-hidden border-4 border-purple-400 max-w-5xl pl-12 origin-top"
              style={{
                background: 'linear-gradient(135deg, #581C87 0%, #6B21A8 50%, #7E22CE 100%)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="relative overflow-hidden">
                {/* Carousel Slides */}
                <div className="flex transition-transform duration-500 ease-in-out" style={{
                  transform: `translateX(-${currentPromoSlide * 100}%)`
                }}>
                  {/* Slide 1: Jewellery Box */}
                  <div className="min-w-full grid md:grid-cols-2 gap-6 p-6 md:p-8 items-center">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">FREE jewellery box*</h3>
                      <p className="text-xl text-yellow-300 mb-2">above ₹1999</p>
                      <p className="text-lg text-purple-200 mb-4">store your bling in style.</p>
                      <Link
                        to="/products"
                        className="inline-block bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                      >
                        choose this &gt;
                      </Link>
                      <p className="text-xs text-purple-300 mt-4">*color may vary</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-48 h-48 md:w-64 md:h-64 bg-purple-200 rounded-lg flex items-center justify-center shadow-xl">
                        <span className="text-6xl md:text-8xl">💎</span>
                      </div>
                    </div>
                  </div>

                  {/* Slide 2: Free Shipping */}
                  <div className="min-w-full grid md:grid-cols-2 gap-6 p-6 md:p-8 items-center">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">FREE Shipping*</h3>
                      <p className="text-xl text-yellow-300 mb-2">above ₹999</p>
                      <p className="text-lg text-purple-200 mb-4">get your favorite products delivered free.</p>
                      <Link
                        to="/products"
                        className="inline-block bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                      >
                        shop now &gt;
                      </Link>
                      <p className="text-xs text-purple-300 mt-4">*valid on orders above ₹999</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-48 h-48 md:w-64 md:h-64 bg-purple-200 rounded-lg flex items-center justify-center shadow-xl">
                        <span className="text-6xl md:text-8xl">🚚</span>
                      </div>
                    </div>
                  </div>

                  {/* Slide 3: Extra Discount */}
                  <div className="min-w-full grid md:grid-cols-2 gap-6 p-6 md:p-8 items-center">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Extra 15% OFF*</h3>
                      <p className="text-xl text-yellow-300 mb-2">on all products</p>
                      <p className="text-lg text-purple-200 mb-4">use code: SEASON15 at checkout.</p>
                      <Link
                        to="/products"
                        className="inline-block bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                      >
                        shop now &gt;
                      </Link>
                      <p className="text-xs text-purple-300 mt-4">*valid till stock lasts</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-48 h-48 md:w-64 md:h-64 bg-purple-200 rounded-lg flex items-center justify-center shadow-xl">
                        <span className="text-6xl md:text-8xl">🎁</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Indicators */}
              
            </div>
            <div className="flex pt-4 justify-center gap-2 pb-4">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPromoSlide(index)}
                    className={`h-2 rounded-full transition-all ${currentPromoSlide === index ? 'bg-yellow-400 w-8' : 'bg-purple-600 w-2'
                      }`}
                  />
                ))}
              </div>
          </div>
        </section>

        {/* New on the Shelves Section */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            {/* Header Banner */}
            <div className="relative mb-8 w-full flex justify-center items-center">
              <div className="relative inline-block mx-auto border-4 border-yellow-400 rounded-lg overflow-hidden" style={{
                background: 'linear-gradient(135deg, #581C87 0%, #6B21A8 50%, #7E22CE 100%)',
                padding: '12px 24px'
              }}>
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-2xl">✨</div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-2xl">✨</div>
                <h2 className="text-xl md:text-2xl font-bold text-white text-center">new on the shelves</h2>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {newProducts.map((product, index) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="group">
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div className="relative">
                      <img
                        src={product.image || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-64 object-contain bg-gradient-to-br from-purple-50 to-pink-50"
                      />
                      <span className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 text-xs font-bold rounded">
                        new launch!
                      </span>
                    </div>
                    <div className="p-4">
                      {/* Buy 2 Get 2 Free Banner */}
                      <div className="bg-yellow-400 text-gray-900 text-center py-1 mb-2 text-xs font-bold rounded">
                        buy 2 get 2 free
                      </div>

                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating || '4.3'} ({product.review_count || '38'} reviews)
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {product.description || 'Premium quality product'}
                      </p>

                      {/* Size Options */}
                      <div className="flex gap-2 mb-3">
                        <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
                          50 g
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">₹{product.price || '499'}</span>
                        <button
                          onClick={(e) => handleAddToCart(product.id, e)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link
                to="/products"
                className="inline-block bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors shadow-lg"
              >
                view all &gt;
              </Link>
            </div>
          </div>
        </section>

        {/* B2G2 Picks: Grab & Go Section */}
        <section className="py-10 relative">
          <div className="container mx-auto px-4">
            {/* B2G2 Picks Banner */}
            <div className="relative mb-8 align-center justify-center w-full flex justify-center items-center">
              <div className="relative inline-block mx-auto border-4 border-yellow-400 rounded-lg overflow-hidden" style={{
                background: 'linear-gradient(135deg, #581C87 0%, #6B21A8 50%, #7E22CE 100%)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                padding: '16px 32px'
              }}>
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-3xl">✨</div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 text-3xl">✨</div>
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">B2G2 picks: grab & go</h2>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['winter care', 'new launches', 'dry skin', 'oily skin', 'haircare', 'fragrances', 'bodycare', 'acne prone'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setB2g2Filter(filter)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 ${b2g2Filter === filter
                      ? 'bg-yellow-400 text-gray-900 shadow-lg'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Product Grid - 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto relative">
              {b2g2Products.map((product, index) => (
                <div key={product.id} className="relative">
                  <Link to={`/products/${product.slug}`} className="block">
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div className="grid grid-cols-2 gap-4 p-4">
                        {/* Product Image */}
                        <div className="relative">
                          <img
                            src={product.image || 'https://via.placeholder.com/200'}
                            alt={product.name}
                            className="w-full h-48 object-contain rounded-lg"
                          />
                          {product.is_trending && (
                            <span className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 text-xs font-bold rounded flex items-center gap-1">
                              <span>☀️</span> trending
                            </span>
                          )}
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
                              new launch!
                            </span>
                          )}
                          <span className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
                            FREE
                          </span>
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-col justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="text-yellow-400 text-lg">★</span>
                              <span className="text-sm text-gray-700 ml-1">
                                {product.rating || '4.0'} ({product.review_count || '27'} reviews)
                              </span>
                              <span className="ml-2 text-blue-500">✓</span>
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {product.description || 'Premium quality product'}
                            </p>
                            {product.price && (
                              <p className="text-lg font-bold text-purple-600">₹ {product.price}</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product.id, e);
                            }}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium mt-2"
                          >
                            add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

              {/* Central Add to Cart Button - Overlapping */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
                <button
                  onClick={handleAddAllToCart}
                  className="w-24 h-24 bg-purple-700 border-4 border-yellow-400 rounded-full text-white font-bold text-sm hover:bg-purple-800 transition-all transform hover:scale-110 shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)'
                  }}
                >
                  add to cart
                </button>
              </div>
            </div>
          </div>
        </section>


      </div>
    </div>
  );
};

export default Home;
