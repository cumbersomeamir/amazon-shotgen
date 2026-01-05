
import React from 'react';
import { ProductShot } from '../types';

interface ShotCardProps {
  shot: ProductShot;
  onRetry: () => void;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, onRetry }) => {
  const isGenerating = shot.status === 'generating';
  const isError = shot.status === 'error';
  const isCompleted = shot.status === 'completed';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
        {isGenerating && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-slate-700">Generating {shot.label}...</p>
            <p className="text-xs text-slate-500 mt-1">Creating high-res assets</p>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 z-10 bg-red-50 flex flex-col items-center justify-center p-6 text-center">
            <i className="fa-solid fa-triangle-exclamation text-red-400 text-3xl mb-3"></i>
            <p className="text-sm font-medium text-red-700">Failed to generate</p>
            <button 
              onClick={onRetry}
              className="mt-4 px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {isCompleted && shot.imageUrl ? (
          <img 
            src={shot.imageUrl} 
            alt={shot.label} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          !isGenerating && !isError && (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <i className="fa-solid fa-image text-4xl mb-2"></i>
              <p className="text-xs font-medium uppercase tracking-wider">Empty Slot</p>
            </div>
          )
        )}
        
        {isCompleted && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button 
              onClick={() => window.open(shot.imageUrl, '_blank')}
              className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-700 hover:text-orange-500 transition-colors"
              title="View full size"
            >
              <i className="fa-solid fa-expand text-sm"></i>
            </button>
            <a 
              href={shot.imageUrl} 
              download={`${shot.label}.png`}
              className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-700 hover:text-orange-500 transition-colors"
              title="Download image"
            >
              <i className="fa-solid fa-download text-sm"></i>
            </a>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-800 text-sm">{shot.label}</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-tighter">
            {shot.type}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {shot.description}
        </p>
      </div>
    </div>
  );
};

export default ShotCard;
