
import React, { useState, useEffect, useRef } from 'react';

interface AppGuideProps {
  onComplete: () => void;
}

const AppGuide: React.FC<AppGuideProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      targetId: "tour-dashboard",
      title: "Command Center",
      desc: "Monitor bio-sync readiness and performance metrics in real-time.",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: "bg-indigo-600"
    },
    {
      targetId: "tour-chat",
      title: "Bio AI Intelligence",
      desc: "Ask MedOS for metabolic insights or instant clinical audit breakdowns.",
      icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
      color: "bg-blue-600"
    },
    {
      targetId: "tour-records",
      title: "Lab Scan Auditor",
      desc: "Snap hospital records to audit clinical errors and billing discrepancies.",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "bg-emerald-600"
    }
  ];

  const updateTarget = () => {
    const el = document.getElementById(steps[step].targetId);
    if (el) setTargetRect(el.getBoundingClientRect());
  };

  useEffect(() => {
    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, [step]);

  const getTooltipStyle = (): React.CSSProperties => {
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      return {
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        position: 'fixed',
        width: 'calc(100% - 40px)',
        maxWidth: 360,
        zIndex: 500
      };
    }
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' };
    return {
      top: targetRect.top + targetRect.height / 2,
      left: targetRect.right + 24,
      transform: 'translateY(-50%)',
      position: 'absolute'
    };
  };

  return (
    <div className="fixed inset-0 z-[400] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
      
      {targetRect && (
        <div 
          className="absolute border-4 border-indigo-500 rounded-2xl pointer-events-none animate-pulse shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all duration-500"
          style={{ top: targetRect.top - 8, left: targetRect.left - 8, width: targetRect.width + 16, height: targetRect.height + 16 }}
        />
      )}

      <div 
        ref={tooltipRef}
        className="bg-white rounded-[40px] p-8 shadow-2xl pointer-events-auto transition-all duration-500"
        style={getTooltipStyle()}
      >
        <div className={`w-12 h-12 ${steps[step].color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={steps[step].icon} /></svg>
        </div>
        
        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">{steps[step].title}</h3>
        <p className="text-xs md:text-sm text-slate-500 font-bold leading-relaxed mb-8">{steps[step].desc}</p>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}
            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
          >
            {step === steps.length - 1 ? "Launch!" : "Continue"}
          </button>
          <button onClick={onComplete} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Skip Tour</button>
        </div>
      </div>
    </div>
  );
};

export default AppGuide;
