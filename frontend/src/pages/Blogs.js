import React from 'react';
import { Link } from 'react-router-dom';

const Blogs = () => {
  const blogs = [
    {
      id: 1,
      title: '10 Skincare Tips for Winter',
      excerpt: 'Discover the best skincare routine to keep your skin glowing during the cold months.',
      image: 'https://via.placeholder.com/400x250',
      date: 'January 15, 2025',
      category: 'Skincare'
    },
    {
      id: 2,
      title: 'Natural Ingredients for Healthy Hair',
      excerpt: 'Learn about the power of natural ingredients in maintaining beautiful, healthy hair.',
      image: 'https://via.placeholder.com/400x250',
      date: 'January 10, 2025',
      category: 'Haircare'
    },
    {
      id: 3,
      title: 'Body Care Essentials for Every Season',
      excerpt: 'Your complete guide to maintaining soft, smooth skin all year round.',
      image: 'https://via.placeholder.com/400x250',
      date: 'January 5, 2025',
      category: 'Bodycare'
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <h1 className="text-4xl font-bold text-white text-center mb-4">Veya Blogs & Newsletters</h1>
        <p className="text-purple-200 text-center mb-12">Expert beauty insights, tips & previews</p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="group">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <span className="text-xs text-purple-600 font-semibold">{blog.category}</span>
                  <h3 className="text-xl font-bold text-gray-800 mt-2 mb-2 group-hover:text-purple-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{blog.excerpt}</p>
                  <p className="text-xs text-gray-500">{blog.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 text-center mb-6">Get the latest beauty tips, product launches, and exclusive offers!</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blogs;



