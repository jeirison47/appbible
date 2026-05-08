const keyframes = `
  @keyframes loadingLogoPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  @keyframes loadingSpinRing {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes loadingRingA {
    0%, 100% { opacity: 0.06; }
    50% { opacity: 0.18; }
  }
  @keyframes loadingRingB {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.24; }
  }
`;

interface LoadingScreenProps {
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingScreen({ fullScreen = true, text }: LoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center gap-6">
      <style>{keyframes}</style>

      {/* Logo + Rings */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Static decorative rings */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 208 208">
          <circle
            cx="104" cy="104" r="100"
            fill="none" stroke="rgb(var(--manah-gold))" strokeWidth="1"
            style={{ animation: 'loadingRingA 3s ease-in-out infinite' }}
          />
          <circle
            cx="104" cy="104" r="82"
            fill="none" stroke="rgb(var(--manah-gold))" strokeWidth="1"
            style={{ animation: 'loadingRingB 3s ease-in-out infinite 0.6s' }}
          />
        </svg>

        {/* Spinning arc */}
        <div
          className="absolute inset-0"
          style={{ animation: 'loadingSpinRing 3s linear infinite', transformOrigin: '50% 50%' }}
        >
          <svg className="w-full h-full" viewBox="0 0 208 208">
            <circle
              cx="104" cy="104" r="60"
              fill="none" stroke="rgb(var(--manah-gold))" strokeWidth="2.5"
              strokeDasharray="283 94" strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Logo */}
        <div
          className="relative z-10"
          style={{ animation: 'loadingLogoPulse 2.5s ease-in-out infinite' }}
        >
          <img src="/logo-color-manah.png" alt="Manah" className="w-16 h-16 object-contain dark:hidden" />
          <img src="/logo-header-manah.png" alt="Manah" className="w-16 h-16 object-contain hidden dark:block" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        {fullScreen && (
          <h1
            className="text-3xl font-bold text-manah-gold mb-1"
            style={{ fontFamily: 'Delius Swash Caps, cursive' }}
          >
            manah
          </h1>
        )}
        {text && (
          <p className="text-manah-gold text-sm font-bold">{text}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-manah-bg font-manrope flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 'calc(100vh - 10rem)' }}
    >
      {content}
    </div>
  );
}
