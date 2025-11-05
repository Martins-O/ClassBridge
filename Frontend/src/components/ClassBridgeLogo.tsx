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
      {/* Modern Education Hub Icon */}
      <svg viewBox="0 0 40 40" className="w-full h-full">
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Central Hub Circle */}
        <circle cx="20" cy="20" r="6" fill="url(#centerGlow)" className="drop-shadow-md" />
        <circle cx="20" cy="20" r="4" fill="url(#primaryGradient)" />

        {/* Connected Nodes (Students/Mentors) */}
        <circle cx="8" cy="12" r="3" fill="url(#accentGradient)" opacity="0.9" />
        <circle cx="32" cy="12" r="3" fill="url(#accentGradient)" opacity="0.9" />
        <circle cx="8" cy="28" r="3" fill="url(#accentGradient)" opacity="0.9" />
        <circle cx="32" cy="28" r="3" fill="url(#accentGradient)" opacity="0.9" />

        {/* Connection Lines */}
        <path d="M11 14 L17 18" stroke="url(#primaryGradient)" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
        <path d="M29 14 L23 18" stroke="url(#primaryGradient)" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
        <path d="M11 26 L17 22" stroke="url(#primaryGradient)" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
        <path d="M29 26 L23 22" stroke="url(#primaryGradient)" strokeWidth="2" opacity="0.7" strokeLinecap="round" />

        {/* Knowledge Flow Particles */}
        <circle cx="14" cy="16" r="0.8" fill="#34d399" className="animate-pulse" />
        <circle cx="26" cy="16" r="0.8" fill="#f472b6" className="animate-pulse" style={{animationDelay: '0.5s'}} />
        <circle cx="14" cy="24" r="0.8" fill="#60a5fa" className="animate-pulse" style={{animationDelay: '1s'}} />
        <circle cx="26" cy="24" r="0.8" fill="#fbbf24" className="animate-pulse" style={{animationDelay: '1.5s'}} />
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