import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${slug}/`);
      setProduct(response.data);
      
      // Fetch similar products from the same category
      if (response.data.category) {
        try {
          const similarResponse = await api.get(`/products/?category=${response.data.category.slug}&page_size=4`);
          const allProducts = Array.isArray(similarResponse.data.results) 
            ? similarResponse.data.results 
            : (Array.isArray(similarResponse.data) ? similarResponse.data : []);
          // Filter out the current product
          const filtered = allProducts.filter(p => p.slug !== slug).slice(0, 4);
          setSimilarProducts(filtered);
        } catch (err) {
          console.error('Error fetching similar products:', err);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      alert('Product added to cart!');
    } catch (error) {
      alert('Please login to add items to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      // Add product to cart first
      await addToCart(product.id, quantity);
      // Navigate to checkout
      window.location.href = '/checkout';
    } catch (error) {
      alert('Please login to proceed with purchase');
    }
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

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center relative z-10" style={{
        background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '200% 200%',
        minHeight: '100vh'
      }}>
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/products" className="text-purple-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-12" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            padding: '1rem'
          }}>
            <img
              src={product.image || 'https://via.placeholder.com/500'}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="rounded-lg p-6" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center mb-4">
            <span className="text-yellow-400 text-xl">★</span>
            <span className="text-lg ml-2">
              {product.rating || '4.3'} ({product.review_count || '0'} reviews)
            </span>
          </div>
          <div className="mb-6">
            {product.discount_price ? (
              <div>
                <span className="text-3xl font-bold text-purple-600">₹{product.discount_price}</span>
                <span className="text-xl text-gray-500 line-through ml-3">₹{product.price}</span>
                <span className="ml-3 text-green-600 font-semibold">
                  {product.discount_percentage}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-purple-600">₹{product.price}</span>
            )}
          </div>
          <p className="text-gray-700 mb-6">{product.description || 'No description available.'}</p>
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Quantity:</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-4"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Buy Now
          </button>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {similarProducts.map((similarProduct) => (
                <Link key={similarProduct.id} to={`/products/${similarProduct.slug}`} className="group">
                  <div className="rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div className="relative">
                      <img
                        src={similarProduct.image || 'https://via.placeholder.com/300'}
                        alt={similarProduct.name}
                        className="w-full h-48 object-contain bg-gradient-to-br from-purple-50 to-pink-50"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm group-hover:text-purple-600 transition-colors">
                        {similarProduct.name}
                      </h3>
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400">★</span>
                        <span className="text-xs text-gray-600 ml-1">
                          {similarProduct.rating || '4.3'} ({similarProduct.review_count || '0'} reviews)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {similarProduct.discount_price ? (
                          <div>
                            <span className="text-lg font-bold text-purple-600">₹{similarProduct.discount_price}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">₹{similarProduct.price}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-purple-600">₹{similarProduct.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/products"
                className="inline-block bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors shadow-lg"
              >
                View More Products &gt;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
