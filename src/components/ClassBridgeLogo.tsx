interface ClassBridgeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

export default function ClassBridgeLogo({
  className = '',
  size = 'md',
  variant = 'full'
}: ClassBridgeLogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl' }
  };

  const IconComponent = () => (
    <div className={`${sizes[size].icon} relative ${className}`}>
      {/* Bridge SVG Icon */}
      <svg viewBox="0 0 40 40" className="w-full h-full">
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Shadow/Depth */}
        <path
          d="M4 25 Q12 18, 20 20 Q28 22, 36 25 L36 28 Q28 25, 20 23 Q12 21, 4 28 Z"
          fill="url(#shadowGradient)"
          opacity="0.4"
        />

        {/* Main Bridge Arc */}
        <path
          d="M4 22 Q12 15, 20 17 Q28 19, 36 22 L36 25 Q28 22, 20 20 Q12 18, 4 25 Z"
          fill="url(#bridgeGradient)"
          className="drop-shadow-sm"
        />

        {/* Bridge Pillars */}
        <rect x="3" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
        <rect x="35" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
        <rect x="19" y="17" width="2" height="13" fill="url(#bridgeGradient)" rx="1" />

        {/* Connection Points (representing students/mentors) */}
        <circle cx="8" cy="23" r="1.5" fill="#fbbf24" className="animate-pulse" />
        <circle cx="20" cy="19" r="1.5" fill="#34d399" />
        <circle cx="32" cy="23" r="1.5" fill="#60a5fa" className="animate-pulse" />

        {/* Connecting Lines */}
        <path d="M8 23 Q14 20, 20 19" stroke="#e5e7eb" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M20 19 Q26 20, 32 23" stroke="#e5e7eb" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
    </div>
  );

  const TextComponent = () => (
    <span className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 bg-clip-text text-transparent ${sizes[size].text}`}>
      ClassBridge
    </span>
  );

  if (variant === 'icon') {
    return <IconComponent />;
  }

  if (variant === 'text') {
    return <TextComponent />;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <IconComponent />
      <TextComponent />
    </div>
  );
}