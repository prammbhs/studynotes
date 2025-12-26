import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;

    try {
      setLoading(true);
      setError('');
      await deleteAccount();
      logout();
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-12 space-y-3 animate-fadeIn">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white">👤 My Profile</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-xl animate-shake">
            <span className="text-red-700 dark:text-red-400 font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl animate-pulse">
            <span className="text-green-700 dark:text-green-400 font-semibold">{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                👤
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">{user?.name || 'User'}</h2>
                <p className="text-gray-600 dark:text-gray-400">{user?.email || 'No email'}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-bold text-gray-900 dark:text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-200 focus:shadow-lg"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 dark:text-white">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  title="Email cannot be changed"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-75 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-lg dark:shadow-xl transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h2 className="text-2xl font-black text-red-700 dark:text-red-400">Danger Zone</h2>
                <p className="text-red-600 dark:text-red-300 text-sm">Irreversible actions</p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Once you delete your account, there is no going back. Please be absolutely certain before proceeding.
            </p>
            
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl"
            >
              {loading ? 'Deleting...' : '🗑️ Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
