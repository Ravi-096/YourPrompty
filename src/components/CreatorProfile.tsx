import React from 'react';
import { ArrowLeft, Users, Heart, Copy, MapPin, Calendar, Link } from 'lucide-react';

interface CreatorProfileProps {
  creator: {
    name: string;
    avatar: string;
    username: string;
    verified: boolean;
  };
  onBack: () => void;
}

const CreatorProfile: React.FC<CreatorProfileProps> = ({ creator, onBack }) => {
  const profileData = {
    ...creator,
    bio: "AI Artist & Creative Director. Passionate about pushing the boundaries of digital art through innovative prompts.",
    location: "San Francisco, CA",
    joinDate: "Joined March 2023",
    website: "sarah-creates.com",
    following: 432,
    followers: 12500,
    totalLikes: 12500,
    totalUses: 45600,
    prompts: [
      {
        id: 1,
        title: "Ethereal Forest Magic",
        prompt: "Enchanted forest with glowing mushrooms, fairy lights dancing between ancient trees, magical atmosphere, soft ethereal lighting, fantasy art style",
        result: "https://images.pexels.com/photos/1438248/pexels-photo-1438248.jpeg?auto=compress&cs=tinysrgb&w=400",
        likes: 892,
        uses: 2100
      },
      {
        id: 2,
        title: "Modern Architecture",
        prompt: "Minimalist concrete building with large glass windows, geometric shapes, natural lighting, architectural photography, clean lines",
        result: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400",
        likes: 654,
        uses: 1800
      },
      {
        id: 3,
        title: "Ocean Sunset Vibes",
        prompt: "Golden hour beach scene with gentle waves, warm orange and pink sky, peaceful atmosphere, cinematic composition, high resolution",
        result: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400",
        likes: 1203,
        uses: 3200
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-lg font-semibold text-gray-900">Creator</div>
          <div />
        </div>
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>
          <div className="relative px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              <div className="relative -mt-16 mb-4 sm:mb-0">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {profileData.verified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {profileData.bio}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{profileData.joinDate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Link className="w-4 h-4" />
                    <span className="text-purple-600 hover:underline cursor-pointer">
                      {profileData.website}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profileData.followers?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profileData.following.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profileData.totalLikes.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profileData.totalUses.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Uses</div>
                  </div>
                </div>

                <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Follow</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Prompts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileData.prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={prompt.result}
                    alt={prompt.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{prompt.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {prompt.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;