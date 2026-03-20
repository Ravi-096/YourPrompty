import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Upload, Check, X, ArrowLeft } from 'lucide-react';
import { apiFetch, getAccessToken } from '../lib/api';

interface UploadPromptPageProps {
  onCancel: () => void;
  onCreated: (prompt: any) => void;
}

const ALLOWED_CATEGORIES = [
  { name: 'Photography', emoji: '📷', color: 'from-blue-500 to-cyan-500' },
  { name: 'Casual', emoji: '😎', color: 'from-orange-500 to-yellow-500' },
  { name: 'Character', emoji: '👤', color: 'from-purple-500 to-pink-500' },
  { name: 'Product Review', emoji: '⭐', color: 'from-yellow-500 to-orange-500' },
  { name: 'Landscape', emoji: '🏔️', color: 'from-green-500 to-teal-500' },
  { name: 'Digital Art', emoji: '🎨', color: 'from-pink-500 to-rose-500' },
  { name: 'Abstract', emoji: '🌈', color: 'from-indigo-500 to-purple-500' },
  { name: 'Food', emoji: '🍕', color: 'from-red-500 to-orange-500' },
  { name: 'Fashion', emoji: '👗', color: 'from-fuchsia-500 to-pink-500' },
  { name: 'Architecture', emoji: '🏛️', color: 'from-gray-500 to-slate-500' },
  { name: 'General', emoji: '📋', color: 'from-blue-500 to-indigo-500' }
];

const UploadPromptPage: React.FC<UploadPromptPageProps> = ({ onCancel, onCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('Please fill title and content');
      return;
    }
    if (!file) {
      setError('Please select an image');
      return;
    }
    if (!agree) {
      setError('You must agree to the disclaimer before uploading');
      return;
    }
    setLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('You must be logged in');
      const form = new FormData();
      form.append('title', title);
      form.append('content', content);
      form.append('category', category);
      form.append('image', file);
      const res = await apiFetch('/api/prompts', {
        method: 'POST',
        body: form
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || 'Failed to create prompt');
      }
      const data = await res.json();
      onCreated(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6 animate-fade-in-up">
          <button
            onClick={onCancel}
            className="p-2 mr-4 rounded-full transition-all duration-300 hover:bg-white hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="flex items-center space-x-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span>Create New Prompt</span>
            </h1>
            <p className="mt-1 text-gray-600">Share your creative AI prompts with the community</p>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-2xl animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div className="group">
              <label className="flex items-center mb-2 space-x-2 text-sm font-semibold text-gray-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Prompt Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300"
                placeholder="Enter a catchy title..."
              />
            </div>

            {/* Category Bubbles */}
            <div className="group">
              <label className="block mb-3 text-sm font-semibold text-gray-700">Select Category</label>
              <div className="flex flex-wrap gap-3">
                {ALLOWED_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`group relative px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                      category === cat.name
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-xl scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-sm">{cat.name}</span>
                    </span>
                    {category === cat.name && (
                      <div className="flex absolute -top-1 -right-1 justify-center items-center w-6 h-6 bg-white rounded-full shadow-lg animate-bounce">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Content */}
            <div className="group">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Prompt Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 transition-all duration-300 resize-none focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-gray-300"
                placeholder="Write your detailed prompt here... Be creative and specific!"
              />
              <p className="mt-2 text-xs text-gray-500">{content.length} characters</p>
            </div>

            {/* Image Upload Section */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 border-dashed">
              <label className="flex items-center mb-3 space-x-2 text-sm font-semibold text-gray-700">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <span>Sample Image</span>
              </label>
              
              {!preview ? (
                <label className="flex flex-col justify-center items-center w-full h-64 rounded-xl transition-all duration-300 cursor-pointer hover:bg-purple-100/50 group">
                  <div className="flex flex-col justify-center items-center pt-5 pb-6">
                    <Upload className="mb-4 w-12 h-12 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setFile(f);
                      setPreview(f ? URL.createObjectURL(f) : null);
                    }}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative group">
                  <img 
                    src={preview} 
                    alt="preview" 
                    className="object-cover w-full h-96 rounded-xl border-4 border-white shadow-lg" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-4 right-4 p-2 text-white bg-red-500 rounded-full shadow-lg transition-all duration-300 hover:bg-red-600 hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-4 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm bg-white/90">
                    <p className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Image uploaded</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Agreement Checkbox */}
            <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-start space-x-3">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 rounded border-2 border-gray-300 cursor-pointer focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="agree" className="text-sm text-gray-700 cursor-pointer">
                  <span className="font-semibold text-gray-900">I confirm that:</span> I have the proper consent to upload this content, and it does not contain any illegal, harmful, or inappropriate material. I agree to follow community guidelines and understand uploads may be moderated.
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200 animate-shake">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 space-x-4">
              <button 
                type="button" 
                onClick={onCancel} 
                className="px-6 py-3 font-semibold rounded-xl border-2 border-gray-300 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-105"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !agree} 
                className="flex items-center px-8 py-3 space-x-2 font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 animate-spin border-white/30 border-t-white"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Publish Prompt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPromptPage;
