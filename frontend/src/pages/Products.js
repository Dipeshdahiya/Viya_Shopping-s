import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    skin_type: '',
    trending: false,
    bestseller: false,
  });
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setFilters({ ...filters, category });
    if (search) setFilters({ ...filters, search });
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      const categoriesData = Array.isArray(response.data.results) 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.skin_type) params.append('skin_type', filters.skin_type);
      if (filters.trending) params.append('trending', 'true');
      if (filters.bestseller) params.append('bestseller', 'true');

      const response = await api.get(`/products/?${params.toString()}`);
      const productsData = Array.isArray(response.data.results) 
        ? response.data.results 
        : (Array.isArray(response.data) ? response.data : []);
      setProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (error) {
      alert('Please login to add items to cart');
    }
  };

  const ProductCard = ({ product }) => (
    <Link to={`/products/${product.slug}`} className="group">
      <div className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="relative">
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          {product.is_trending && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              TRENDING 🔥
            </span>
          )}
          {product.is_bestseller && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded">
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
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center mb-2">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600 ml-1">
              {product.rating} ({product.review_count} reviews)
            </span>
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
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 p-6 rounded-lg shadow-md h-fit sticky top-20" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 className="text-xl font-bold mb-4">Filters</h2>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={filters.category === ''}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="mr-2"
                  />
                  All Categories
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={cat.slug}
                      checked={filters.category === cat.slug}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="mr-2"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Skin Type */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Skin Type</h3>
              <select
                value={filters.skin_type}
                onChange={(e) => setFilters({ ...filters, skin_type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All Skin Types</option>
                <option value="all">All Skin Types</option>
                <option value="oily">Oily</option>
                <option value="dry">Dry</option>
                <option value="combination">Combination</option>
                <option value="sensitive">Sensitive</option>
              </select>
            </div>

            {/* Special Filters */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Special</h3>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={filters.trending}
                  onChange={(e) => setFilters({ ...filters, trending: e.target.checked })}
                  className="mr-2"
                />
                Trending
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.bestseller}
                  onChange={(e) => setFilters({ ...filters, bestseller: e.target.checked })}
                  className="mr-2"
                />
                Bestseller
              </label>
            </div>

            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Products</h1>
              <p className="text-gray-600">{products.length} products found</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;

