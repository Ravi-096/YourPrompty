import React, { useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch, getAccessToken } from '../lib/api';

interface UploadPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (prompt: any) => void;
}

const UploadPromptModal: React.FC<UploadPromptModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError('Please fill title and content');
      return;
    }
    setLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('You must be logged in');
      if (!file) throw new Error('Please select an image');
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
      onClose();
      setTitle('');
      setContent('');
      setCategory('General');
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Upload Prompt</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="A short title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              {['Photography','Casual','Character','Product Review','Landscape','Digital Art','Abstract','Food','Fashion','Architecture','General'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prompt Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="Write your prompt here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sample Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
              className="w-full"
            />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="preview" className="max-h-48 rounded" />
              </div>
            )}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50">
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPromptModal;
