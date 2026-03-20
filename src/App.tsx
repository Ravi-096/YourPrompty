import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PromptFeed from './components/PromptFeed';
import CreatorProfile from './components/CreatorProfile';
import CreateProfile from './components/CreateProfile';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import AuthModal from './components/AuthModal';
import AIModelExplorer from './components/AIModelExplorer';
import UploadPromptModal from './components/UploadPromptModal';
import UploadPromptPage from './components/UploadPromptPage';
import PublicProfilePage from './components/PublicProfilePage';
import { apiFetch, clearTokens, getAccessToken } from './lib/api';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'create-profile' | 'user-profile' | 'upload' | 'public-profile'>('home');
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAIExplorer, setShowAIExplorer] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [authStartInSignup, setAuthStartInSignup] = useState(false);
  const [feedItems, setFeedItems] = useState<any[] | null>(null);
  const [highlightPromptId, setHighlightPromptId] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;
    apiFetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) throw new Error('Session invalid');
        const data = await res.json();
        const u = data?.user || data;
        const avatar = u?.profilePhoto
          ? (String(u.profilePhoto).startsWith('/') ? `http://localhost:4000${u.profilePhoto}` : u.profilePhoto)
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u?.name || 'U')}`;
        setUser({ ...u, avatar });
      })
      .catch(() => {
        clearTokens();
      });
  }, []);

  // Load prompts from backend
  const loadPrompts = () => {
    apiFetch('/api/prompts')
      .then(res => {

        return res.json();
      })
      .then((rows) => {
        const mapped = (rows || []).map((p: any) => ({
          id:       p._id,        
         _id:      p._id, 
          title: p.title,
          prompt: p.content,
          result: p.image || `https://picsum.photos/seed/${p._id}/800/600`,
          category: p.category || 'General',
          creator: {
            name:     p.creator?.name   || 'Creator',
            email:    p.creator?.email  || '',   // ← is this here?
            userId:   p.creator?.userId || '',
            avatar:   p.creator?.profilePhoto
              ? (String(p.creator.profilePhoto).startsWith('http')
                  ? p.creator.profilePhoto
                  : `http://localhost:4000${p.creator.profilePhoto}`)
              : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.creator?.name || 'U')}`,
            username: `@${p.creator?.userId || (p.creator?.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
            verified: false,
          },
          likes: p.likes?.length ?? 0,
          uses:  0,
          liked: false,
        }));
        setFeedItems(mapped);

      })
      .catch((error) => {
        console.error('Error loading prompts:', error);
        setFeedItems([]);
      });
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleViewCreator = (creator: any) => {
     setSelectedCreator(creator);
    setCurrentView('public-profile');
  };
  

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCreator(null);
  };
  {currentView === 'public-profile' && (
    <>
        <PublicProfilePage 
        email={selectedCreator?.email} 
        onBack={handleBackToHome} 
      />
    </>
  )}
  const handleCreateProfile = () => {
    setAuthStartInSignup(true);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    const avatar = userData?.profilePhoto
      ? (String(userData.profilePhoto).startsWith('/') ? `http://localhost:4000${userData.profilePhoto}` : userData.profilePhoto)
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData?.name || 'U')}`;
    setUser({ ...userData, avatar });
    setShowAuthModal(false);
    loadPrompts();
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setCurrentView('home');
    loadPrompts();
  };

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  const handleShowAIExplorer = () => {
    setShowAIExplorer(true);
  };

  const handleShowUploadPage = () => {
    setCurrentView('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header 
        onBackToHome={handleBackToHome} 
        showBackButton={currentView === 'profile'} 
        user={user}
        onShowAuth={handleShowAuth}
        onShowProfile={() => setCurrentView('user-profile')}
        onShowAIExplorer={handleShowAIExplorer}
        onShowUpload={handleShowUploadPage}
        onLogout={handleLogout}
        onViewCreator={handleViewCreator}
        onViewPrompt={(promptId) => {
          // Navigate to home and highlight the prompt
          setHighlightPromptId(String(promptId));
          setCurrentView('home');
          setTimeout(() => {
            const promptElement = document.getElementById(`prompt-${promptId}`);
            if (promptElement) {
              promptElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }}
      />
      
      {currentView === 'home' ? (
        <>
          {!user && (
            <Hero onCreateProfile={handleCreateProfile} onShowAIExplorer={handleShowAIExplorer} />
          )}
          {user && (
            <div className="px-4 mx-auto mt-8 max-w-7xl sm:px-6 lg:px-8">
              <div className="flex justify-end">
                <button
                  onClick={handleShowUploadPage}
                  className="px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow hover:shadow-lg"
                >
                  Upload Prompt
                </button>
              </div>
            </div>
          )}
          <PromptFeed 
            onViewCreator={handleViewCreator} 
            items={feedItems ?? undefined}
            highlightPromptId={highlightPromptId}
            onPromptVisible={() => setHighlightPromptId(null)}
          />
        </>
      ) : currentView === 'profile' ? (
        <CreatorProfile creator={selectedCreator} onBack={handleBackToHome} />
      ) : currentView === 'create-profile' ? (
        <CreateProfile onBack={handleBackToHome} />
      ) : currentView === 'upload' ? (
        <UploadPromptPage 
          onCancel={handleBackToHome}
          onCreated={() => { setCurrentView('home'); loadPrompts(); }}
        />
      ) : currentView === 'public-profile' ? (
        <PublicProfilePage email={selectedCreator?.email} onBack={handleBackToHome} />
         ) : (
        <UserProfile 
            user={user} 
            onBack={handleBackToHome} 
            onShowUpload={handleShowUploadPage}
            onDeletePrompt={(promptId: string) => {

              setFeedItems(prev => prev?.filter(p => 
                String(p.id) !== String(promptId)
              ) ?? []);
            }}
          />
      )}
      
      <Footer 
        onNavigateHome={handleBackToHome}
        onShowAuth={handleShowAuth}
        onShowUpload={handleShowUploadPage}
        onShowAIExplorer={handleShowAIExplorer}
      />
      <Chatbot 
        user={user}
        onTriggerAction={(actionType, actionData) => {
          console.log('Chatbot action:', actionType, actionData);
          // Handle different action types
          switch(actionType) {
            case 'OPEN_UPLOAD':
              handleShowUploadPage();
              break;
            case 'SHOW_AUTH':
              setAuthStartInSignup(actionData?.mode === 'signup');
              handleShowAuth();
              break;
            case 'FILTER_CATEGORY':
              // Category filter will be handled by the feed
              handleBackToHome();
              break;
            default:
              break;
          }
        }}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} startInSignup={authStartInSignup} />
      <UploadPromptModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onCreated={() => { setShowUploadModal(false); loadPrompts(); }}
      />
      {showAIExplorer && (
        <AIModelExplorer onClose={() => setShowAIExplorer(false)} />
      )}
    </div>
  );
}

export default App;