import React from 'react';

export function ReactLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23 23 20.4" width="100%" height="100%">
      <defs>
        <linearGradient id="reactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor=" hsl(32 100% 37%)" />
          <stop offset="100%" stopColor="hsl(33 74% 62%)" />
        </linearGradient>
      </defs>
      <circle cx="0" cy="0" r="2.05" fill="url(#reactGrad)" />
      <g stroke="url(#reactGrad)" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}
