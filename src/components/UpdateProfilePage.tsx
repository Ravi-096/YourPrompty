import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Settings, Camera, Save } from 'lucide-react';
import { apiFetch, getAccessToken } from '../lib/api';

interface UpdateProfilePageProps {
  user: any;
  onBack: () => void;
}

const UpdateProfilePage: React.FC<UpdateProfilePageProps> = ({ user, onBack }) => {
  const baseUrl = 'http://localhost:4000';
  const [profileData, setProfileData] = useState<any>({
    name: user?.name || '',
    email: user?.email || '',
    userId: user?.userId || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const accessToken = getAccessToken();
        if (!accessToken) return;
        const meRes = await apiFetch(`/api/auth/me`);
        if (!meRes.ok) {
          const msg = await meRes.json().catch(() => ({}));
          throw new Error(msg?.error || msg?.message || 'Failed to load current user');
        }
        const me = await meRes.json();
        const avatar = me?.user?.profilePhoto
          ? (String(me.user.profilePhoto).startsWith('http') ? me.user.profilePhoto : `${baseUrl}${me.user.profilePhoto}`)
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(me?.user?.name || 'U')}`;
        setProfileData({
          name: me.user.name,
          email: me.user.email,
          userId: me.user.userId,
          bio: me.user.bio || '',
          avatar
        });
      } catch (e: any) {
        setError(e?.message || 'Something went wrong');
      }
    };
    load();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (profileData.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }

    // Username validation
    if (!profileData.userId.trim()) {
      errors.userId = 'Username is required';
    } else if (profileData.userId.trim().length < 3) {
      errors.userId = 'Username must be at least 3 characters';
    } else if (profileData.userId.trim().length > 30) {
      errors.userId = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.userId.trim())) {
      errors.userId = 'Username can only contain letters, numbers, and underscores';
    }

    // Bio validation
    if (profileData.bio && profileData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    // Photo validation
    if (newPhoto) {
      if (!newPhoto.type.startsWith('image/')) {
        errors.photo = 'Please select a valid image file';
      } else if (newPhoto.size > 5 * 1024 * 1024) { // 5MB
        errors.photo = 'Image size must be less than 5MB';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setError(null);

    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      // Update profile fields
      const profileRes = await apiFetch(`/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          userId: profileData.userId,
          bio: profileData.bio
        })
      });
      if (!profileRes.ok) {
        const msg = await profileRes.json().catch(() => ({}));
        throw new Error(msg?.error || msg?.message || 'Failed to update profile');
      }

      // Update avatar if new photo selected
      if (newPhoto) {
        const form = new FormData();
        form.append('photo', newPhoto);
        const avatarRes = await apiFetch(`/api/users/me/avatar`, { method: 'PATCH', body: form });
        if (!avatarRes.ok) {
          const msg = await avatarRes.json().catch(() => ({}));
          throw new Error(msg?.error || msg?.message || 'Failed to update avatar');
        }
        const out = await avatarRes.json();
        const avatar = out?.profilePhoto
          ? (String(out.profilePhoto).startsWith('http') ? out.profilePhoto : `${baseUrl}${out.profilePhoto}`)
          : profileData.avatar;
        setProfileData((prev: any) => ({ ...prev, avatar }));
      }

      setNewPhoto(null);
      onBack(); // Redirect to profile page after successful update
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors((prev: any) => ({ ...prev, photo: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev: any) => ({ ...prev, photo: 'Image size must be less than 5MB' }));
        return;
      }

      // Clear any previous photo validation error
      setValidationErrors((prev: any) => ({ ...prev, photo: '' }));

      setNewPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfileData((prev: any) => ({ ...prev, avatar: e.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <User className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Please Sign In</h2>
          <p className="text-gray-600">You need to be logged in to update your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <button
            onClick={onBack}
            className="p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white/80 hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Update Profile</h1>
          <div></div>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden mb-8 bg-white rounded-3xl shadow-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="relative px-8 py-8">
            {/* Avatar */}
            <div className="relative mb-6 text-center">
              <div className="inline-block relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="object-cover w-32 h-32 mx-auto rounded-full border-4 border-white shadow-xl"
                />
                <label className="flex absolute right-2 bottom-2 justify-center items-center w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg transition-all duration-300 cursor-pointer hover:scale-110">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              {validationErrors.photo && (
                <p className="mt-2 text-sm text-red-600 text-center">{validationErrors.photo}</p>
              )}
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`px-4 py-3 w-full rounded-xl border-2 transition-all duration-300 focus:ring-4 ${
                    validationErrors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Username</label>
                <input
                  type="text"
                  value={profileData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  className={`px-4 py-3 w-full rounded-xl border-2 transition-all duration-300 focus:ring-4 ${
                    validationErrors.userId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                {validationErrors.userId && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.userId}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className={`px-4 py-3 w-full rounded-xl border-2 transition-all duration-300 focus:ring-4 ${
                    validationErrors.bio
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                  placeholder="Tell us about yourself..."
                />
                {validationErrors.bio && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.bio}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{profileData.bio?.length || 0}/500 characters</p>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="px-4 py-3 w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500"
                  required/>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center w-full py-3 space-x-2 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default UpdateProfilePage;