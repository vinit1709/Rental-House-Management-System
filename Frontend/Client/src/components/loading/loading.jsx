import React from 'react';

const Loading = ({ className = "h-6", fullScreen = false }) => {
  
  // Internal Reusable Component
  // We pass 'barWidth' so it looks good small (button) or big (fullscreen)
  const Skyline = ({ heightClass, barWidth, colorClass = "text-current" }) => (
    <div className={`flex items-end ${heightClass} ${colorClass}`}>
      {/* Bar 1 */}
      <div className={`${barWidth} bg-current rounded-sm animate-[skyline_1s_ease-in-out_infinite] opacity-60 mx-[1px]`}></div>
      {/* Bar 2 */}
      <div className={`${barWidth} bg-current rounded-sm animate-[skyline_1s_ease-in-out_0.1s_infinite] opacity-80 mx-[1px]`}></div>
      {/* Bar 3 (Center) */}
      <div className={`${barWidth} bg-current rounded-sm animate-[skyline_1s_ease-in-out_0.2s_infinite] mx-[1px]`}></div>
      {/* Bar 4 */}
      <div className={`${barWidth} bg-current rounded-sm animate-[skyline_1s_ease-in-out_0.3s_infinite] opacity-80 mx-[1px]`}></div>
      {/* Bar 5 */}
      <div className={`${barWidth} bg-current rounded-sm animate-[skyline_1s_ease-in-out_0.4s_infinite] opacity-60 mx-[1px]`}></div>
      
      {/* This style block ensures the animation exists regardless of which mode is used */}
      <style>{`
        @keyframes skyline {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );

  // --- FULL SCREEN OVERLAY ---
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          
          {/* BIG VERSION: Explicitly set height (h-16), width (w-4) and color (text-blue-600) */}
          <Skyline heightClass="h-16" barWidth="w-4" colorClass="text-blue-600" />
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">RentalPro</h3>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1 animate-pulse">Processing...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- INLINE VERSION (Buttons/Cards) ---
  // Uses the className passed in props (usually h-6) and small bars (w-1.5)
  return (
    <div className="flex justify-center items-center">
      <Skyline heightClass={className} barWidth="w-1.5" />
    </div>
  );
};

export default Loading;