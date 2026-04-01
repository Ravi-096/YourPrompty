import React, { useState } from 'react';
import { ArrowLeft, Upload, User, Mail, MapPin, Link, Camera, Sparkles, Check } from 'lucide-react';

interface CreateProfileProps {
  onBack: () => void;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar: null as File | null
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle profile creation
    console.log('Profile created:', formData);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/80 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
          <div className="w-12"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-500 ${
                  step <= currentStep
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? (
                  <Check className="w-6 h-6 animate-bounce" />
                ) : (
                  step
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin-slow" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to yourPrompty!</h2>
                <p className="text-gray-600 text-lg">Let's start with the basics</p>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg group-hover:border-gray-300"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg group-hover:border-gray-300"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Your Photo</h2>
                <p className="text-gray-600 text-lg">Help others recognize you</p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl hover:scale-110 transition-all duration-300">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-purple-600" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg">
                    <Upload className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-6 w-full">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg group-hover:border-gray-300 resize-none"
                      placeholder="Tell us about yourself and your creative journey..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost Done!</h2>
                <p className="text-gray-600 text-lg">Add some final details</p>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg group-hover:border-gray-300"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website (Optional)</label>
                  <div className="relative">
                    <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-lg group-hover:border-gray-300"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105"
              >
                Previous
              </button>
            )}
            
            <div className="flex-1"></div>
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && (!formData.name || !formData.email)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Create Profile</span>
                <Sparkles className="w-5 h-5 animate-spin" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;