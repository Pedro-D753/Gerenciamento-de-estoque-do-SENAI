import React from 'react';

export const SenaiLogo = ({ className = 'h-9' }) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img 
        src="/Senai.png" 
        alt="SENAI" 
        className="h-full w-auto object-contain" 
      />
    </div>
  );
};
