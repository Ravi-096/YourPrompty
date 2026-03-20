import React, { useState } from 'react';
import { Heart, Copy, Users, Check } from 'lucide-react';
import AIModelSelector from './AIModelSelector';
import { apiFetch, getAccessToken } from '../lib/api';

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    prompt: string;
    result: string;
    category: string;
    creator: {
      name: string;
      email: string;  
      userId: string;
      avatar: string;
      username: string;
      verified: boolean;
    };
    likes: number;
    liked?: boolean;
    uses: number;
  };
  onViewCreator: (creator: any) => void;
  index: number;
  isMobile?: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onViewCreator, index, isMobile = false }) => {
  const [isLiked, setIsLiked] = useState(!!prompt.liked);
  const [likesCount, setLikesCount] = useState<number>(prompt.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [copyScale, setCopyScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setIsCopied(true);
    setShowCelebration(true);
    setCopyScale(1.2);
    
    // Reset copy animation
    setTimeout(() => {
      setCopyScale(1);
    }, 200);
    

    setTimeout(() => {
      setIsCopied(false);
      setShowCelebration(false);
    }, 3000);
  };
  const handleLike = async () => {
    if (isLiking) return; // 

    const accessToken = getAccessToken();
    if (!accessToken) return;
  
    setIsLiking(true);
  
    try {
      const res = await apiFetch(`/api/prompts/${prompt.id}/like`, {
        method: 'POST',
      });
  
      if (!res.ok) throw new Error('Failed');
  
      const data = await res.json();
  

      if (typeof data.liked === 'boolean') setIsLiked(data.liked);
      if (typeof data.likes === 'number') setLikesCount(data.likes); 
    } catch {

      console.error('Like failed');
    } finally {
      setIsLiking(false);
    }
  };

  const handleModelSelect = (model: any) => {
    setSelectedModel(model.id);
  };

  // Dynamic height for Pinterest-style layout
  const heights = [320, 400, 360, 440, 380, 420];
  const imageHeight = isMobile ? 200 + (index % 3) * 50 : heights[index % heights.length];
  
  if (isMobile) {
    return (
      <div
        className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden group cursor-pointer transform hover:scale-[1.02] mb-2 animate-fade-in-up"
        style={{animationDelay: `${index * 0.05}s`}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden relative rounded-t-2xl">
          <img
            src={prompt.result}
            alt={prompt.title}
            className={`w-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ height: `${imageHeight}px` }}
            onLoad={() => setImageLoaded(true)}
          />
          
          {!imageLoaded && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"
              style={{ height: `${imageHeight}px` }}
            ></div>
          )}
          
          {/* Category badge on image */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-medium text-gray-800 rounded-full border ring-1 shadow-md backdrop-blur-xl bg-white/80 border-white/30 ring-black/5">
              {prompt.category}
            </span>
          </div>
          
          {/* Celebration Animation */}
          {showCelebration && (
            <>
              {/* Confetti Animation */}
              <div className="confetti">
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
                <div className="confetti-piece"></div>
              </div>
            </>
          )}
          
          {isCopied && (
            <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-green-500 rounded-full shadow-lg animate-bounce">
              Copied!
            </div>
          )}
        </div>
        
        {/* Content below image */}
        <div className="p-3">
          {/* Creator info */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <img
                src={prompt.creator.avatar}
                alt={prompt.creator.name}
                className="object-cover w-6 h-6 rounded-full"
                onClick={() => onViewCreator(prompt.creator)}
              />
              <span className="text-sm font-medium text-gray-700">{prompt.creator.username}</span>
              {prompt.creator.verified && (
                <span className="text-sm text-blue-500">✓</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
            <button
                onClick={handleLike}
                disabled={isLiking}
                className={`p-1.5 rounded-full transition-all duration-300
                 ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isLiked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}
                `}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="mb-2 text-sm font-semibold text-gray-900 line-clamp-2">{prompt.title}</h3>

          {/* Prompt text with copy button */}
          <div className="relative p-3 mb-3 bg-gray-50 rounded-lg">
            <p className="pr-8 text-xs text-gray-700 break-words line-clamp-3">
              <span className="font-medium text-purple-600">Prompt:</span> {prompt.prompt}
            </p>
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-300 ${
                isCopied
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 shadow-sm'
              }`}
              style={{ transform: `scale(${copyScale})` }}
            >
              {isCopied ? (
                <Check className="w-3 h-3 animate-bounce" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          
          {/* AI Model Selector */}
          <div className="mb-3">
            <AIModelSelector 
              onModelSelect={handleModelSelect}
              selectedModel={selectedModel}
              prompt={prompt.prompt}
              isLiked={isLiked}
            />
          </div>
          
          {/* Stats */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500' : ''}`} />
                <span>{likesCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Copy className="w-3 h-3" />
                <span>{prompt.uses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden group cursor-pointer transform hover:scale-[1.03] mb-6 break-inside-avoid animate-fade-in-up"
      style={{animationDelay: `${index * 0.1}s`}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden relative rounded-t-3xl">
        {/* Main Image */}
        <img
          src={prompt.result}
          alt={prompt.title}
          className={`w-full object-cover transition-all duration-1000 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ height: `${imageHeight}px` }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"
            style={{ height: `${imageHeight}px` }}
          ></div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-all duration-500 from-black/30 group-hover:opacity-100"></div>
        
        <div className="absolute top-4 left-4 transition-all duration-300 transform group-hover:scale-110">
          <span className="px-4 py-2 text-xs font-bold text-gray-800 rounded-full border ring-1 shadow-lg backdrop-blur-xl bg-white/80 border-white/30 ring-black/5">
            {prompt.category}
          </span>
        </div>
        
        {/* Celebration Animation */}
        {showCelebration && (
          <>
            {/* Confetti Animation */}
            <div className="confetti">
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
            </div>
          </>
        )}

        <div className={`absolute top-4 right-4 transform transition-all duration-500 ${isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-2'}`}>
        <button
           onClick={handleLike}
           disabled={isLiking}
           className={`p-3 rounded-full backdrop-blur-md transition-all duration-300
             ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
             ${isLiked ? 'text-white bg-red-500 shadow-lg' : 'text-gray-600 shadow-lg bg-white/95 hover:bg-white hover:text-red-500'}
           `}
          >
           <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 bg-gradient-to-b from-white to-gray-50/50">
        <div className="flex items-center mb-3 space-x-3">
          <img
            src={prompt.creator.avatar}
            alt={prompt.creator.name}
            className="object-cover w-8 h-8 rounded-full transition-all duration-300 cursor-pointer hover:ring-3 hover:ring-purple-500 hover:scale-110"
            onClick={() => {
              
              onViewCreator(prompt.creator);
            }}
          />
          <div className="flex-1">
            <p 
              className="text-sm font-bold text-gray-900 transition-colors cursor-pointer hover:text-purple-600"
              onClick={() =>
                 onViewCreator(prompt.creator)}
            >
              {prompt.creator.name}
              {prompt.creator.verified && (
                <span className="ml-2 text-base text-blue-500">✓</span>
              )}
            </p>
            <p className="text-xs font-medium text-gray-500">{prompt.creator.username}</p>
          </div>
        </div>

        <h3 className="mb-2 text-lg font-bold leading-tight text-gray-900">{prompt.title}</h3>
        
        <div className="relative p-3 mb-3 bg-gradient-to-r from-gray-50 rounded-xl border border-gray-100 transition-all duration-300 to-gray-100/50 hover:border-purple-200">
          <p className="text-sm font-medium leading-relaxed text-gray-700 line-clamp-3">
            <strong className="text-purple-600">Prompt:</strong> {prompt.prompt}
          </p>
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 p-2 rounded-lg transition-all duration-300 ${
              isCopied
                ? 'text-white border shadow-lg backdrop-blur-xl scale-110 bg-green-500/90 border-green-400/30'
                : 'text-gray-600 border ring-1 shadow-md backdrop-blur-xl bg-white/70 hover:bg-white/90 hover:text-purple-600 border-white/40 ring-black/5'
            }`} 
            style={{ 
              transform: `scale(${copyScale})` 
            }}
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 animate-bounce" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          {isCopied && (
            <div className="absolute right-2 -top-7 px-2 py-1 text-xs text-white rounded-lg border ring-1 shadow-lg backdrop-blur-xl animate-bounce bg-green-500/90 border-green-400/40 ring-white/20">
              ✨ Copied!
            </div>
          )}
        </div>

        {/* AI Model Selector */}
        <div className="mb-3">
          <AIModelSelector 
            onModelSelect={handleModelSelect}
            selectedModel={selectedModel}
            prompt={prompt.prompt}
            isLiked={isLiked}
          />
        </div>

        {/* Instagram-style like bar */}
        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
          <div className="flex items-center space-x-4">
          <button
          onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 transition-colors cursor-pointer
              ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}
             ${isLiked ? 'text-red-500' : ''}`}
          >
           <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current' : ''} ${!isLiking ? 'hover:scale-110' : ''}`} />
            <span>{likesCount.toLocaleString()}</span>
          </button>
            </div>
            <div className="flex items-center space-x-2 transition-colors cursor-pointer hover:text-blue-500">
              <Users className="w-4 h-4 transition-transform hover:scale-110" />
              <span>{prompt.uses.toLocaleString()} uses</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;