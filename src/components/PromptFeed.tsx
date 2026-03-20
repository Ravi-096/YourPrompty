import React, { useState } from 'react';
import PromptCard from './PromptCard';
import CategoryFilter from './CategoryFilter';

interface PromptFeedProps {
  onViewCreator: (creator: any) => void;
  items?: Array<any>;
  highlightPromptId?: string | null;
  onPromptVisible?: () => void;
}

const PromptFeed: React.FC<PromptFeedProps> = ({ onViewCreator, items, highlightPromptId, onPromptVisible }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  React.useEffect(() => {
    if (highlightPromptId && onPromptVisible) {
      const timer = setTimeout(() => {
        onPromptVisible();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightPromptId, onPromptVisible]);

  
  const prompts = items ?? [];

  const filtered = React.useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return prompts;
    const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, '-');
    const sel = norm(selectedCategory);
    return prompts.filter(p => norm(String(p.category || '')) === sel);
  }, [prompts, selectedCategory]);



if (!items || items.length === 0) {
  return (
    <div className="flex flex-col justify-center items-center px-4 py-24 text-center">
      <div className="flex justify-center items-center mb-4 w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
        <span className="text-3xl">🎨</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800">
        No prompts yet
      </h3>
      <p className="max-w-xs text-sm text-gray-500">
        Be the first to share a creative prompt with the community!
      </p>
    </div>
  );
}
  // Show loading state if items is null (still fetching)
  

  return (
    <section className="px-4 py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center animate-fade-in-up">
          <h2 className="mb-6 text-5xl font-bold text-gray-900">
            Play with Prompt's
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Discover the most popular prompts from our creative community
          </p>
        </div>

        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Mobile Pinterest-style Grid */}
        <div className={`mt-16 ${
          isMobile 
            ? 'grid grid-cols-2 gap-2 px-2' 
            : 'gap-6 space-y-6 columns-1 md:columns-2 lg:columns-3 xl:columns-4'
        }`}>
       {filtered.map((prompt, index) => (
  <div
    key={prompt.id || prompt._id}           
    id={`prompt-${prompt.id || prompt._id}`} 
    className={`${String(highlightPromptId) === String(prompt.id || prompt._id) ? 'ring-4 ring-purple-500 ring-opacity-50 rounded-2xl animate-pulse' : ''}`}
  >
    <PromptCard
      prompt={prompt}
      onViewCreator={(creator) => {

        onViewCreator(creator);
      }}
      index={index}
      isMobile={isMobile}
    />
  </div>
))}
        </div>
      </div>
    </section>
  );
};

export default PromptFeed;