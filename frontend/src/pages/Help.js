import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  const [activeTab, setActiveTab] = useState('faqs');

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and visiting the Orders page. You will receive tracking information via email once your order ships.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy. Products must be unopened and in original packaging. Please contact our support team to initiate a return.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for an additional fee.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we ship within India. International shipping will be available soon.'
    },
    {
      question: 'Are your products cruelty-free?',
      answer: 'Yes! All Veya products are 100% cruelty-free and never tested on animals.'
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
        <h1 className="text-4xl font-bold text-white text-center mb-4">Help Center</h1>
        <p className="text-purple-200 text-center mb-12">We're here to help you!</p>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'faqs' ? 'bg-yellow-400 text-gray-900' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'contact' ? 'bg-yellow-400 text-gray-900' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'policies' ? 'bg-yellow-400 text-gray-900' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Policies
            </button>
          </div>

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="bg-white rounded-lg shadow-xl p-8 space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="font-bold text-gray-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Phone</h3>
                  <p className="text-gray-700">+91-750-649-6604</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                  <p className="text-gray-700">hello@veyagoodness.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Business Hours</h3>
                  <p className="text-gray-700">Monday - Saturday: 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Return Policy</h3>
                <p className="text-gray-600">30-day return policy on unopened products in original packaging.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Shipping Policy</h3>
                <p className="text-gray-600">Free shipping on orders above ₹999. Standard delivery: 5-7 business days.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Privacy Policy</h3>
                <p className="text-gray-600">We respect your privacy. Your personal information is secure and never shared with third parties.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Terms of Service</h3>
                <p className="text-gray-600">By using our website, you agree to our terms of service. Please read our full terms for details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;



