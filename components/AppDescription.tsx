import React, { useEffect, useRef, useState } from 'react';
import { Route, Castle, MapPin, Cloud, Sparkles, Map, Shield } from 'lucide-react';
import metadata from '../metadata.json';

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
}

const features: FeatureItem[] = [
  {
    icon: Route,
    title: 'Smart Routes',
    description: 'AI-generated paths',
    bgColor: 'bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-300'
  },
  {
    icon: Castle,
    title: 'Rich Heritage',
    description: 'Maratha stories',
    bgColor: 'bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-800 dark:text-amber-300'
  },
  {
    icon: Map,
    title: 'Live Maps',
    description: 'Interactive views',
    bgColor: 'bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-800 dark:text-emerald-300'
  },
  {
    icon: Cloud,
    title: 'Weather Intel',
    description: 'Safety alerts',
    bgColor: 'bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    textColor: 'text-purple-800 dark:text-purple-300'
  },
  {
    icon: Sparkles,
    title: 'AI Inspiration',
    description: 'Discover gems',
    bgColor: 'bg-cyan-500/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    textColor: 'text-cyan-800 dark:text-cyan-300'
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Trek warnings & tips',
    bgColor: 'bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    textColor: 'text-indigo-800 dark:text-indigo-300'
  }
];

const AppDescription: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 3) % features.length);
      }, 3650); // Rotate the icons every 3.65 seconds
      
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  // Effect to handle hover
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);


  return (
    <div className="relative p-6 sm:p-8 rounded-3xl shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-300 overflow-hidden border border-blue-100/50 dark:border-slate-700/50 backdrop-blur-sm">
      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent dark:from-indigo-600/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-transparent dark:from-purple-600/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Your AI-Powered Fort Adventure Companion</h2>
          <p className="max-w-2xl mx-auto leading-relaxed text-sm sm:text-base text-slate-700 dark:text-slate-300">
            Discover Maharashtra's majestic forts with intelligent itinerary planning, real-time weather insights, interactive maps, and rich historical context. From beginner-friendly trails to challenging expeditions.
          </p>
        </div>
        
        {/* Multi-Browse Feature Carousel */}
        <div 
          className="relative flex overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Scrollable Container */}
          {features.slice(currentIndex, currentIndex + 3).map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={`${feature.title}-${index}`}
                className="flex-1 text-center p-4 transition-all duration-700 ease-in-out opacity-0 animation-fadein"
              >
                <div className={`inline-flex p-3 ${feature.bgColor} rounded-xl mb-3 transition-all duration-500 hover:shadow-lg`}>
                  <IconComponent className={`h-5 w-5 ${feature.iconColor} transition-colors duration-500`} />
                </div>
                <h3 className={`font-medium mb-1 text-sm ${feature.textColor} transition-colors duration-500`}>
                  {feature.title}
                </h3>
                <p className="text-xs opacity-80 transition-opacity duration-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppDescription;
