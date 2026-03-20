import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = [
    { id: 'all', name: 'All', emoji: '🎯' },
    { id: 'photography', name: 'Photography', emoji: '📸' },
    { id: 'casual', name: 'Casual', emoji: '😎' },
    { id: 'character', name: 'Character', emoji: '👤' },
    { id: 'product-review', name: 'Product Review', emoji: '⭐' },
    { id: 'landscape', name: 'Landscape', emoji: '🏔️' },
    { id: 'digital-art', name: 'Digital Art', emoji: '🎨' },
    { id: 'abstract', name: 'Abstract', emoji: '🌈' },
    { id: 'food', name: 'Food', emoji: '🍕' },
    { id: 'fashion', name: 'Fashion', emoji: '👗' },
    { id: 'architecture', name: 'Architecture', emoji: '🏛️' },
    { id: 'general', name: 'General', emoji: '📋' }
  ];

  return (
    <div className={`flex items-center ${isMobile ? 'justify-start overflow-x-auto' : 'justify-center'}`}>
      <div className={`flex ${isMobile ? 'gap-2 pb-2' : 'flex-wrap gap-3'} ${isMobile ? 'min-w-max' : ''}`}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-full font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg backdrop-blur-xl ring-2 ring-purple-400/30'
                : 'bg-white/80 backdrop-blur-xl text-gray-600 hover:bg-white/90 border border-white/30 shadow-md ring-1 ring-black/5 hover:ring-2 hover:ring-purple-300/50'
            }`}
          >
            <span className={isMobile ? 'text-sm' : ''}>{category.emoji}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;