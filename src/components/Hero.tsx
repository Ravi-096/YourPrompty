import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onCreateProfile: () => void;
  onShowAIExplorer: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCreateProfile, onShowAIExplorer }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-bold text-gray-900 mb-6 leading-tight`}>
          Discover and Reuse Powerful AI Prompts
        </h1>
        
        <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-500 font-normal mb-12 max-w-2xl mx-auto`}>
          Join thousands of creators sharing their best AI prompts. Find inspiration and build your creative community.
        </p>
        
        <button 
          onClick={onCreateProfile}
          className="bg-gray-900 text-white rounded-lg px-6 py-3 hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto"
        >
          <span>Start Creating</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default Hero;