import React from 'react';

export default function Marquee({ children, speed = 40, className = '', reverse = false, pauseOnHover = true }) {
  const content = React.Children.toArray(children);

  return (
    <div
      className={`relative flex overflow-hidden ${pauseOnHover ? 'group' : ''} ${className}`}
      style={{ maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)' }}
    >
      <div
        className={`flex shrink-0 gap-4 ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{
          animation: `marquee-scroll ${speed}s linear infinite ${reverse ? 'reverse' : ''}`,
        }}
      >
        {content}
        {content}
        {content}
      </div>
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
