import React from "react";

export const AuroraBackground = ({
  className = "",
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <div
      className={`relative flex flex-col transition-colors ${className}`}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -inset-[10px] opacity-40 will-change-transform [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,_50%_50%] filter blur-[10px] animate-aurora"
          style={{
            maskImage: showRadialGradient ? 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 90%)' : undefined,
            WebkitMaskImage: showRadialGradient ? 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 90%)' : undefined,
          }}
        />
      </div>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
