import React, { useState, useEffect } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
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
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsLiked(!!prompt.liked);
    setLikesCount(prompt.likes || 0);
  }, [prompt.liked, prompt.likes]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
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

  const imageHeight = isMobile ? 200 : 280;
  
  if (isMobile) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <div className="relative">
          <img
            src={prompt.result}
            alt={prompt.title}
            className={`w-full object-cover rounded-t-xl ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ height: `${imageHeight}px` }}
            onLoad={() => setImageLoaded(true)}
          />
          
          {!imageLoaded && (
            <div 
              className="absolute inset-0 bg-gray-200 rounded-t-xl"
              style={{ height: `${imageHeight}px` }}
            ></div>
          )}
          
          <div className="absolute top-3 left-3">
            <span className="text-xs text-gray-500 font-medium">
              {prompt.category}
            </span>
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <img
                src={prompt.creator.avatar}
                alt={prompt.creator.name}
                className="object-cover w-6 h-6 rounded-full"
                onClick={() => onViewCreator(prompt.creator)}
              />
              <span className="text-sm font-medium text-gray-700">{prompt.creator.username}</span>
            </div>
            
            <button
                onClick={handleLike}
                disabled={isLiking}
                className={`p-1 rounded-full transition-colors duration-200 ${
                  isLiking ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              </button>
          </div>
          
          <h3 className="mb-2 text-sm font-semibold text-gray-900 line-clamp-2">{prompt.title}</h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {prompt.prompt}
          </p>
          
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
            
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              {isCopied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={prompt.result}
          alt={prompt.title}
          className={`w-full object-cover rounded-t-xl ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ height: `${imageHeight}px` }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div 
            className="absolute inset-0 bg-gray-200 rounded-t-xl"
            style={{ height: `${imageHeight}px` }}
          ></div>
        )}
        
        <div className="absolute top-3 left-3">
          <span className="text-xs text-gray-500 font-medium">
            {prompt.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onViewCreator(prompt.creator)}>
            <img
              src={prompt.creator.avatar}
              alt={prompt.creator.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div>
              <p className="text-sm text-gray-700 font-medium">{prompt.creator.name}</p>
              <p className="text-xs text-gray-400">@{prompt.creator.username}</p>
            </div>
          </div>
          
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`p-1 rounded-full transition-colors duration-200 ${
              isLiking ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{prompt.title}</h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {prompt.prompt}
        </p>

        {/* AI Model Selector */}
        {/* <div className="mb-3">
          <AIModelSelector 
            onModelSelect={handleModelSelect}
            selectedModel={selectedModel}
            prompt={prompt.prompt}
            isLiked={isLiked}
          />
        </div> */}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className={`w-3 h-3 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Copy className="w-3 h-3" />
              <span>{prompt.uses}</span>
            </div>
          </div>
          
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;