import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Logo = ({ iconOnly = false, className = '', onClick }) => {
  const content = (
    <div className={`flex items-center gap-3 no-underline group flex-shrink-0 ${className}`}>
      {/* Render the original logo.png image */}
      <img 
        src="/logo.png" 
        alt="ATS Resify Logo" 
        className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105" 
      />
      {!iconOnly && (
        <span className="text-lg font-bold tracking-tight text-[#0F1115]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ATS <span className="text-[#14B8A6] font-extrabold">Resify</span>
        </span>
      )}
    </div>
  );

  return (
    <RouterLink to="/" onClick={onClick} className="no-underline">
      {content}
    </RouterLink>
  );
};

export default Logo;
