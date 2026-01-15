import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me/');
      setUser(response.data);
      setFormData({
        email: response.data.email || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.patch('/users/me/', formData);
      setUser(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    });
    setEditing(false);
    setError('');
    setSuccess('');
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

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '200% 200%'
      }}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{
      background: 'linear-gradient(180deg, #581C87 0%, #6B21A8 25%, #7E22CE 50%, #6B21A8 75%, #581C87 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(126, 34, 206, 0.4) 0%, transparent 50%)',
      animation: 'gradientShift 15s ease infinite',
      backgroundSize: '200% 200%'
    }}>
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="rounded-lg shadow-md p-8" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account information</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Username (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                    {user.email || 'Not provided'}
                  </div>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                    {user.first_name || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                    {user.last_name || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Account Created Date (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600">
                  {formatDate(user.date_joined)}
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Additional Info Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-lg font-semibold text-gray-800">{user.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/orders')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={() => navigate('/products')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

