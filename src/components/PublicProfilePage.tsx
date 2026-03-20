import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, Copy } from 'lucide-react';
import { apiFetch, getAccessToken } from '../lib/api';

interface PublicProfilePageProps {
  email: string;
  onBack: () => void;
}

const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ email, onBack }) => {
  const baseUrl = 'http://localhost:4000';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    user: any;
    prompts: any[];
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isSelf, setIsSelf] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get current user for self-check
        const accessToken = getAccessToken();
        let currentEmail: string | null = null;
        if (accessToken) {
          try {
            const meRes = await apiFetch(`/api/auth/me`);
            if (meRes.ok) {
              const me = await meRes.json();
              currentEmail = me?.user?.email || me?.email || null;
            }
          } catch {}
        }
        setIsSelf(!!currentEmail && currentEmail === email);

        const res = await apiFetch(`/api/users/${encodeURIComponent(email)}/profile`);
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg?.message || 'Failed to load profile');
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [email]);

  const handleFollowToggle = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('Please sign in to follow users');
      return;
    }
    try {
      setError(null);
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/users/${encodeURIComponent(email)}/follow`, {
        method,
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.message || 'Action failed');
      }
      setIsFollowing(!isFollowing);
      // Optimistically update counters
      setProfile((prev) => {
        if (!prev) return prev;
        const current = prev.user?.followersCount ?? (Array.isArray(prev.user?.followers) ? prev.user.followers.length : 0);
        return {
          ...prev,
          user: {
            ...prev.user,
            followersCount: current + (isFollowing ? -1 : 1),
          },
        };
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    }
  };

  const avatarUrl = useMemo(() => {
    const p = profile?.user;
    if (p?.profilePhoto) {
      const url = String(p.profilePhoto);
      return url.startsWith('http') ? url : `${baseUrl}${url}`;
    }
    const name = p?.name || 'U';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  }, [profile?.user?.name, profile?.user?.profilePhoto]);

  const stats = useMemo(() => {
    const u = profile?.user;
    const prompts = Array.isArray(profile?.prompts) ? profile!.prompts : [];
    const promptsCount = prompts.length;
    const followers =
      u?.followersCount ?? (Array.isArray(u?.followers) ? u.followers.length : 0);
    const following =
      u?.followingCount ?? (Array.isArray(u?.following) ? u.following.length : 0);
    const totalLikes = prompts.reduce(
      (sum, p) => sum + (Array.isArray(p?.likes) ? p.likes.length : 0),
      0
    );
    return { promptsCount, followers, following, totalLikes };
  }, [profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-gray-500 animate-pulse">Loading profile…</div>
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="mb-2 font-semibold text-red-600">{error || 'Profile not found'}</div>
          <button onClick={onBack} className="px-4 py-2 rounded-lg border">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
          <div />
        </div>

        <div className="p-6 mb-8 bg-white rounded-2xl border shadow">
          <div className="flex gap-6 items-start">
            <img src={avatarUrl} alt={profile.user.name} className="w-24 h-24 rounded-full border" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.user.name}</h2>
              <div className="text-sm text-gray-600">{profile.user.email}</div>
              <div className="flex gap-6 items-center mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.promptsCount}</div>
                  <div className="text-xs text-gray-500">Prompts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.followers}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.following}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.totalLikes}</div>
                  <div className="text-xs text-gray-500">Total Likes</div>
                </div>
              </div>
            </div>
            {!isSelf && (
              <button onClick={handleFollowToggle} className={`px-4 py-2 rounded-xl ${isFollowing ? 'text-gray-900 bg-gray-200' : 'text-white bg-gradient-to-r from-purple-600 to-pink-600'} shadow`}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <h3 className="mb-4 text-xl font-semibold">Prompts</h3>
        {(profile.prompts?.length ?? 0) === 0 ? (
          <div className="text-gray-500">No prompts yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profile.prompts.map((p: any) => {
              const img = p?.image
                ? (String(p.image).startsWith('http') ? p.image : `${baseUrl}${p.image}`)
                : null;
              const likeCount = Array.isArray(p?.likes) ? p.likes.length : 0;
              return (
              <div key={p?._id} className="overflow-hidden bg-white rounded-xl shadow">
                {img ? (
                  <img src={img} alt={p.title} className="object-cover w-full h-48" />
                ) : (
                  <div className="w-full h-48 bg-gray-100" />
                )}
                <div className="p-4">
                  <div className="text-sm font-medium text-purple-600">{p.category}</div>
                  <div className="font-semibold text-gray-900">{p.title}</div>
                  <div className="mt-1 text-xs text-gray-600 line-clamp-2">{p.content}</div>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <div className="flex gap-2 items-center">
                      <Heart className="w-3 h-3" />
                      <span>{likeCount}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Copy className="w-3 h-3" />
                      <span>0</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default PublicProfilePage;
