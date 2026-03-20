import React from 'react';
import { Heart, Twitter, Instagram, Github } from 'lucide-react';

interface FooterProps {
  onNavigateHome?: () => void;
  onShowAuth?: () => void;
  onShowUpload?: () => void;
  onShowAIExplorer?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateHome, onShowAuth, onShowUpload, onShowAIExplorer }) => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <h3 className="text-xl font-bold">yourPrompty</h3>
            </div>
            <p className="text-gray-400">
              The ultimate platform for sharing and discovering AI prompts. 
              Join our creative community today.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li 
                onClick={onNavigateHome}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Browse Prompts
              </li>
              <li 
                onClick={onShowAuth}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Create Account
              </li>
              <li 
                onClick={onShowUpload}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Upload Prompts
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">Premium Features</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li 
                onClick={onShowAIExplorer}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Explore AI Models
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">Help & Support</li>
              <li className="hover:text-white cursor-pointer transition-colors">About</li>
              <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Github className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for creators worldwide</span>
          </p>
          <p className="text-gray-400 mt-4 md:mt-0">
            © 2025 yourPrompty. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;