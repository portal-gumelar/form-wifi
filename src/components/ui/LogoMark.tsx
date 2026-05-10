import React from "react";

export const LogoMark: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" 
      alt="Logo" 
      className={className || "w-10 h-10 object-contain"} 
    />
  );
};
