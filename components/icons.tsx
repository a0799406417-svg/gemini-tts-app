
import React from 'react';

type IconProps = {
  className?: string;
};

export const MagicWandIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18L12 22M12 2L12 6M6 12H2M22 12H18M4.929 4.929L7.05 7.05M16.95 16.95L19.071 19.071M4.929 19.071L7.05 16.95M16.95 7.05L19.071 4.929M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const StopIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h12v12H6z" />
  </svg>
);
