import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Heart, Copy, Sparkles, Crown, Plus } from 'lucide-react';
import { apiFetch, getAccessToken } from '../lib/api';

interface UserProfileProps {
  user: any;
  onBack: () => void;
  onShowUpload?: () => void;
  onDeletePrompt?: (promptId: string) => void;
  onShowUpdateProfile?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onBack, onShowUpload,onDeletePrompt, onShowUpdateProfile   }) => {
  const baseUrl = 'http://localhost:4000';
  const [profileData, setProfileData] = useState<any>({
    name: user?.name || '',
    email: user?.email || '',
    userId: user?.userId || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [stats, setStats] = useState({ prompts: 0, followers: 0, following: 0, totalLikes: 0 });
  const [prompts, setPrompts] = useState<Array<any>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const accessToken = getAccessToken();
        if (!accessToken) return;
        // Option A: use existing backend endpoints (no /api/users/me/profile).
        // 1) Resolve current user from auth
        const meRes = await apiFetch(`/api/auth/me`);
        if (!meRes.ok) {
          const msg = await meRes.json().catch(() => ({}));
          throw new Error(msg?.error || msg?.message || 'Failed to load current user');
        }
        const me = await meRes.json();
        const email: string | undefined = me?.user?.email;
        if (!email) throw new Error('Failed to resolve current user email');

        // 2) Load public profile by email (includes prompts array)
        const res = await apiFetch(`/api/users/${encodeURIComponent(email)}/profile`);
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg?.error || msg?.message || 'Failed to load profile');
        }
        const data = await res.json();

        const avatar = data?.user?.profilePhoto
          ? (String(data.user.profilePhoto).startsWith('http') ? data.user.profilePhoto : `${baseUrl}${data.user.profilePhoto}`)
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data?.user?.name || 'U')}`;
        setProfileData({
          name: data.user.name,
          email: data.user.email,
          userId: data.user.userId,
          bio: data.user.bio || '',
          avatar
        });

        const backendPrompts: any[] = Array.isArray(data?.prompts) ? data.prompts : [];
        const totalLikes = backendPrompts.reduce((sum, p) => sum + (Array.isArray(p?.likes) ? p.likes.length : 0), 0);
        setStats({
          prompts: backendPrompts.length,
          followers: data?.user?.followersCount ?? (Array.isArray(data?.user?.followers) ? data.user.followers.length : 0),
          following: data?.user?.followingCount ?? (Array.isArray(data?.user?.following) ? data.user.following.length : 0),
          totalLikes,
        });

        const mapped = backendPrompts.map((p: any) => {
          const img = p?.image
            ? (String(p.image).startsWith('http') ? p.image : `${baseUrl}${p.image}`)
            : `https://picsum.photos/seed/${p?._id || 'prompt'}/600/400`;
          return {
            id: p._id,
            title: p.title,
            prompt: p.content,
            result: img,
            likes: Array.isArray(p?.likes) ? p.likes.length : 0,
            uses: 0,
            category: p.category
          };
        });
        setPrompts(mapped);
      } catch (e: any) {
        setError(e?.message || 'Something went wrong');
      }
    };
    load();
  }, []);

  const handleDeletePrompt = async (promptId: string) => {
    if (!promptId) return;
    if (!confirm('Are you sure you want to delete this prompt?')) return;
  
    try {
      const res = await apiFetch(`/api/prompts/${encodeURIComponent(promptId)}`, {
        method: 'DELETE',   // ✅ API called ONCE here only
      });
  
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.error || msg?.message || 'Failed to delete prompt');
      }
  
      // ✅ Remove from profile page
      setPrompts(prev => prev.filter(p => String(p.id) !== String(promptId)));
  
      // ✅ Remove from home feed (no API call)
      onDeletePrompt?.(promptId);
  
      // ✅ Update stats
      setStats(prev => ({ ...prev, prompts: Math.max(0, prev.prompts - 1) }));
  
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <User className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Please Sign In</h2>
          <p className="text-gray-600">You need to be logged in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <button
            onClick={onBack}
            className="p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:bg-white/80 hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={onShowUpdateProfile}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Update Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden mb-8 bg-white rounded-3xl shadow-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {/* Cover */}
          <div className="relative h-40 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-20 mb-6">
              <div className="inline-block relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="object-cover w-32 h-32 rounded-full border-4 border-white shadow-xl"
                />
              </div>
              {user.verified && (
                <div className="flex absolute bottom-2 left-24 justify-center items-center w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <>
                  <div>
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">{profileData.name}</h2>
                    <p className="text-lg leading-relaxed text-gray-600">@{profileData.userId}</p>
                    {profileData.bio && (
                      <p className="mt-2 text-gray-700">{profileData.bio}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-5 h-5" />
                      <span>{profileData.email}</span>
                    </div>
                  </div>
                </>
              </div>

              {/* Stats */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
                <h3 className="flex items-center mb-6 space-x-2 text-xl font-bold text-gray-900">
                  <Crown className="w-6 h-6 text-purple-600" />
                  <span>Your Stats</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 text-center bg-white rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{stats.prompts}</div>
                    <div className="text-sm text-gray-500">Prompts</div>
                  </div>
                  <div className="p-4 text-center bg-white rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-pink-600">{stats.followers.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="p-4 text-center bg-white rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{stats.following}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                  <div className="p-4 text-center bg-white rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{stats.totalLikes.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Likes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Prompts */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>My Prompts</span>
              <span className="text-lg font-normal text-gray-500">({prompts.length})</span>
            </h2>
            {onShowUpload && (
              <button
                onClick={onShowUpload}
                className="flex items-center px-6 py-3 space-x-2 font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-xl transition-all duration-300 group hover:shadow-2xl hover:scale-105"
              >
                <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                <span>Upload Prompt</span>
              </button>
            )}
          </div>
          
          {prompts.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center bg-white rounded-2xl shadow-lg">
              <div className="flex justify-center items-center mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                <Sparkles className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">No Prompts Yet</h3>
              <p className="mx-auto mb-6 max-w-md text-gray-600">
                Start your creative journey by uploading your first AI prompt! Share your ideas and inspire the community.
              </p>
            </div>
          ) : (
            /* Prompts Grid */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="overflow-hidden bg-white rounded-2xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl group hover:scale-105"
              >
                <div className="overflow-hidden relative">
                  <img
                    src={prompt.result}
                    alt={prompt.title}
                    className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 text-xs font-bold text-gray-800 rounded-full backdrop-blur-sm bg-white/90">
                      {prompt.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="mb-2 font-bold text-gray-900">{prompt.title}</h3>
                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                    {prompt.prompt}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{prompt.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Copy className="w-3 h-3" />
                        <span>{prompt.uses}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeletePrompt(String(prompt.id))} className="px-3 py-1 text-red-600 rounded-lg border hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;