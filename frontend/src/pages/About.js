import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <h1 className="text-4xl font-bold text-white text-center mb-4">Get To Know Us</h1>
        <p className="text-purple-200 text-center mb-12">we have chemistry™</p>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">
              Veya is a beauty brand that believes in the power of natural ingredients and science-backed formulations. 
              We create products that are effective, safe, and environmentally conscious. Our mission is to make premium 
              beauty accessible to everyone while maintaining the highest standards of quality and ethics.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Values</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✨</span>
                <span><strong>100% Natural:</strong> We use only natural, safe ingredients in our formulations.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">🌱</span>
                <span><strong>Sustainability:</strong> We're committed to eco-friendly practices and packaging.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">🔬</span>
                <span><strong>Science-Backed:</strong> All our products are dermatologically tested and proven effective.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">💝</span>
                <span><strong>Customer First:</strong> Your satisfaction and well-being are our top priorities.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Veya?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Premium Quality</h3>
                <p className="text-gray-600 text-sm">We source the finest ingredients from around the world.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Affordable Prices</h3>
                <p className="text-gray-600 text-sm">Making luxury beauty accessible to everyone.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Expert Formulations</h3>
                <p className="text-gray-600 text-sm">Developed by skincare and beauty experts.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Cruelty-Free</h3>
                <p className="text-gray-600 text-sm">We never test on animals, ever.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;



