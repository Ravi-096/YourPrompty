import React from 'react';
import { Search, User, Menu, ArrowLeft, Bell, Settings, LogOut, UserPlus, Bot, X ,Heart} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useState } from 'react';


interface HeaderProps {
  onBackToHome: () => void;
  showBackButton: boolean;
  user?: any;
  onShowAuth: () => void;
  onShowProfile: () => void;
  onShowAIExplorer: () => void;
  onShowUpload?: () => void;
  onLogout?: () => void;
  onViewCreator?: (creator: any) => void;
  onViewPrompt?: (promptId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onBackToHome, showBackButton, user, onShowAuth, onShowProfile, onShowAIExplorer, onShowUpload, onLogout, onViewCreator, onViewPrompt }) => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showMainMenu, setShowMainMenu] = React.useState(false);

  const [isMobile, setIsMobile] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any>({ prompts: [], users: [] });
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchType, setSearchType] = React.useState<'all' | 'prompts' | 'users'>('all');

  const [unreadCount,setUnreadCount] = React.useState(0);
const [showNotifications, setShowNotifications] = useState(false)
const [notifications, setNotifications] = useState<any[]>([])
React.useEffect(() => {
  if (!user) return;
  apiFetch('/api/notifications')
    .then(res => res.json())
    .then(data => {
      setUnreadCount(data.unreadCount ?? 0);
      setNotifications(data.notifications ?? []);
    })
    .catch((error) => {console.log(error)});
}, [user]);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await apiFetch('/api/notifications/read', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const getIcon = (type: string) => {
    if (type === 'like')   return <Heart className="w-4 h-4 text-red-500" />;
    if (type === 'follow') return <UserPlus className="w-4 h-4 text-purple-500" />;
    return <Bell className="w-4 h-4 text-gray-400" />;
  };
  
  const getMessage = (n: any) => {
    if (n.type === 'like')   return <span><b>{n.sender?.name}</b> liked your prompt <b>{n.prompt?.title}</b></span>;
    if (n.type === 'follow') return <span><b>{n.sender?.name}</b> started following you</span>;
    return <span>New notification</span>;
  };
  
  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Search prompts
      const promptsRes = await apiFetch(`/api/prompts?search=${encodeURIComponent(query)}`);
      const promptsData = await promptsRes.json();
      
      // Search users
      const usersRes = await apiFetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const usersData = await usersRes.json();

      setSearchResults({
        prompts: Array.isArray(promptsData) ? promptsData : [],
        users: Array.isArray(usersData) ? usersData : []
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ prompts: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePromptClick = (prompt: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (onViewPrompt) {
      onViewPrompt(prompt._id);
    }
    onBackToHome();
  };

  const handleUserClick = (user: any) => {

    setShowSearchResults(false);
    setSearchQuery('');
    if (onViewCreator) onViewCreator(user);
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm ${
      isMobile ? 'px-4' : ''}`}>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${isMobile ? 'h-16' : 'h-18'}`}>
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={onBackToHome}
                className={`${isMobile ? 'p-2' : 'p-3'} hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110 group`}
              >
                <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
            )}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={onBackToHome}>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 animate-pulse-glow`}>
                <span className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>Y</span>
              </div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                yourPrompty
              </h1>
            </div>
          </div>

          {!isMobile && (
            <div className="relative flex-1 mx-8 max-w-lg">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 z-10 w-5 h-5 text-gray-400 transition-colors duration-300 transform -translate-y-1/2 group-focus-within:text-purple-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  placeholder="Search prompts and users..."
                  className="py-3 pr-4 pl-12 w-full placeholder-gray-400 text-gray-700 rounded-2xl border-2 border-gray-200 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 hover:border-gray-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-4 top-1/2 text-gray-400 transition-colors transform -translate-y-1/2 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="overflow-y-auto absolute top-full z-50 mt-2 w-full max-h-96 rounded-2xl border border-gray-100 shadow-2xl backdrop-blur-xl bg-white/95 animate-fade-in-up">
                  {/* Filter Tabs */}
                  <div className="flex sticky top-0 gap-2 items-center p-3 border-b border-gray-100 backdrop-blur-xl bg-white/95">
                    <button
                      onClick={() => setSearchType('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        searchType === 'all'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSearchType('prompts')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        searchType === 'prompts'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Prompts ({searchResults.prompts.length})
                    </button>
                    <button
                      onClick={() => setSearchType('users')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        searchType === 'users'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Users ({searchResults.users.length})
                    </button>
                  </div>

                  {isSearching ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-purple-600 animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500">Searching...</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {/* Prompts Results */}
                      {(searchType === 'all' || searchType === 'prompts') && searchResults.prompts.length > 0 && (
                        <div className="mb-2">
                          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Prompts</h3>
                          {searchResults.prompts.slice(0, searchType === 'prompts' ? 10 : 3).map((prompt: any) => (
                            <button
                              key={prompt._id || prompt.id} 
                              onClick={() => handlePromptClick(prompt)}
                              className="w-full px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center gap-3"
                            >
                              <img
                                src={prompt.image  || `https://picsum.photos/seed/${prompt.id}/600/400`}
                                alt={prompt.title}
                                className="object-cover w-12 h-12 rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{prompt.title}</p>
                                <p className="text-xs text-gray-500 truncate">{prompt.content}</p>
                              </div>
                              <span className="text-xs text-gray-400">{prompt.category}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Users Results */}
                      {(searchType === 'all' || searchType === 'users') && searchResults.users.length > 0 && (
                        <div>
                          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Users</h3>
                          {searchResults.users.slice(0, searchType === 'users' ? 10 : 3).map((user: any) => (
                            <button
                              key={user._id || user.email}
                              onClick={() => handleUserClick(user)}
                              className="w-full px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center gap-3"
                            >
                              <img
                                src={user.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="object-cover w-10 h-10 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">@{user.userId}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}


                      {searchResults.prompts.length === 0 && searchResults.users.length === 0 && !isSearching && (
                        <div className="p-8 text-center">
                          <Search className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                          <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
            {/* Mobile Search Icon */}
            {isMobile && (
              <button className="p-2 rounded-full transition-all duration-300 hover:bg-gray-100 hover:scale-110">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}
          <div className="relative">
  {/* Bell Button */}
  <button
    onClick={handleOpenNotifications}
    className={`relative ${isMobile ? 'p-2' : 'p-3'} hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110 group`}
  >
    <Bell className="w-5 h-5 text-gray-600 transition-colors duration-300 group-hover:text-purple-600" />
    {unreadCount > 0 && (
      <div className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 text-xs text-white bg-red-500 rounded-full animate-pulse">
        {unreadCount}
      </div>
    )}
  </button>

  {/* Dropdown */}
  {showNotifications && (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />

      <div className="absolute right-0 z-50 mt-2 w-80 bg-white rounded-xl border shadow-lg animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center p-4 font-semibold border-b">
          <span>Notifications</span>
          <button onClick={() => setShowNotifications(false)}>
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-80">
          {notifications.length === 0 ? (
            // ── Empty state ───────────────────────────
            <div className="flex flex-col justify-center items-center px-4 py-10 text-center">
              <Bell className="mb-3 w-10 h-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No notifications yet</p>
              <p className="mt-1 text-xs text-gray-400">
                When someone likes or follows you, it'll show here
              </p>
            </div>
          ) : (
            notifications.map((n: any) => (
              <div
                key={n._id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                  !n.read ? 'bg-purple-50/50' : ''
                }`}
              >
                {/* Avatar */}
                <img
                  src={
                    n.sender?.profilePhoto ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(n.sender?.name || 'U')}`
                  }
                  alt={n.sender?.name}
                  className="object-cover flex-shrink-0 w-9 h-9 rounded-full"
                />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug text-gray-700">
                    {getMessage(n)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Icon + unread dot */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                  {!n.read && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )}
</div>
            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center p-2 space-x-2 rounded-full transition-all duration-300 hover:bg-gray-100 hover:scale-105 group`}
              >
                <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} bg-gradient-to-r from-purple-400 to-pink-400 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  {user ? (
                    <img src={user.avatar} alt={user.name} className="object-cover w-full h-full rounded-full" />
                  ) : (
                    <User className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className={`absolute right-0 top-full mt-2 ${isMobile ? 'w-56' : 'w-64'} bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 py-2 animate-fade-in-up`}>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Welcome!</p>
                        <p className="text-sm text-gray-500">Ready to create?</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    {user ? (
                      <>
                        <button 
                          onClick={() => {
                            onShowProfile();
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center px-4 py-3 space-x-3 w-full text-left transition-colors duration-200 hover:bg-gray-50 group"
                        >
                          <User className="w-4 h-4 text-gray-500 transition-colors duration-200 group-hover:text-purple-600" />
                          <span className="text-gray-700 group-hover:text-gray-900">My Profile</span>
                        </button>
                        <button className="flex items-center px-4 py-3 space-x-3 w-full text-left transition-colors duration-200 hover:bg-gray-50 group">
                          <Settings className="w-4 h-4 text-gray-500 transition-colors duration-200 group-hover:text-purple-600" />
                          <span className="text-gray-700 group-hover:text-gray-900">Settings</span>
                        </button>
                        <div className="my-2 border-t border-gray-100"></div>
                        <button 
                          onClick={() => { onLogout?.(); setShowProfileMenu(false); }}
                          className="flex items-center px-4 py-3 space-x-3 w-full text-left transition-colors duration-200 hover:bg-gray-50 group">
                          <LogOut className="w-4 h-4 text-gray-500 transition-colors duration-200 group-hover:text-red-600" />
                          <span className="text-gray-700 group-hover:text-gray-900">Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => {
                          onShowAuth();
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center px-4 py-3 space-x-3 w-full text-left transition-colors duration-200 hover:bg-gray-50 group"
                      >
                        <UserPlus className="w-4 h-4 text-gray-500 transition-colors duration-200 group-hover:text-purple-600" />
                        <span className="text-gray-700 group-hover:text-gray-900">Sign In / Sign Up</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowMainMenu(!showMainMenu)}
                className={`${isMobile ? 'p-2' : 'p-3'} hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110 group`}
              >
                <Menu className="w-5 h-5 text-gray-600 transition-colors duration-300 group-hover:text-purple-600" />
              </button>

              {/* Main Menu Dropdown */}
              {showMainMenu && (
                <div className={`absolute right-0 top-full py-2 mt-2 w-56 rounded-2xl border border-gray-100 shadow-2xl backdrop-blur-md bg-white/95 animate-fade-in-up`}>
                  <button 
                    onClick={onShowAIExplorer}
                    className="flex items-center px-4 py-3 space-x-3 w-full text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>Explore AI Models</span>
                  </button>
                  <button 
                    onClick={() => { onShowUpload?.(); setShowMainMenu(false); }}
                    className="px-4 py-3 w-full text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Upload Prompt
                  </button>
                  <button className="px-4 py-3 w-full text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900">
                    Browse Prompts
                  </button>
                  <div className="my-2 border-t border-gray-100"></div>
                  <button className="px-4 py-3 w-full text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900">
                    Help & Support
                  </button>
                  <button className="px-4 py-3 w-full text-left text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900">
                    About
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showProfileMenu || showMainMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowMainMenu(false);
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;