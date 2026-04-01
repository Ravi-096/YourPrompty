import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Upload, Check, X, ArrowLeft } from 'lucide-react';
import { apiFetch, getAccessToken } from '../lib/api';

interface UploadPromptPageProps {
  onCancel: () => void;
  onCreated: (prompt: any) => void;
}

const ALLOWED_CATEGORIES = [
  { name: 'Photography', emoji: '📷' },
  { name: 'Casual', emoji: '😎' },
  { name: 'Character', emoji: '👤' },
  { name: 'Product Review', emoji: '⭐' },
  { name: 'Landscape', emoji: '🏔️' },
  { name: 'Digital Art', emoji: '🎨' },
  { name: 'Abstract', emoji: '🌈' },
  { name: 'Food', emoji: '🍕' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Architecture', emoji: '🏛️' },
  { name: 'General', emoji: '📋' }
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
    <div className="min-h-screen bg-white py-8">
      <div className="px-4 mx-auto max-w-xl sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <button
            onClick={onCancel}
            className="p-2 mr-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Prompt</h1>
            <p className="mt-1 text-gray-600">Share your creative AI prompts with the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-900">Prompt Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors duration-200"
              placeholder="Enter a catchy title..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-3 text-lg font-semibold text-gray-900">Select Category</label>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    category === cat.name
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Content */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-900">Prompt Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors duration-200 resize-none"
              placeholder="Write your detailed prompt here... Be creative and specific!"
            />
            <p className="mt-1 text-xs text-gray-500">{content.length} characters</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-900">Sample Image</label>
            {!preview ? (
              <label className="flex flex-col justify-center items-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors duration-200">
                <div className="flex flex-col justify-center items-center py-8">
                  <Upload className="mb-3 w-8 h-8 text-gray-400" />
                  <p className="mb-1 text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
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
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  className="object-cover w-full h-48 rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Agreement */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 w-4 h-4 text-gray-900 border border-gray-200 rounded focus:ring-gray-400"
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">I confirm that:</span> I have the proper consent to upload this content, and it does not contain any illegal, harmful, or inappropriate material. I agree to follow community guidelines and understand uploads may be moderated.
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !agree}
            className="w-full py-3 text-white bg-gray-900 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 animate-spin border-white/30 border-t-white"></div>
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Publish Prompt</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPromptPage;
