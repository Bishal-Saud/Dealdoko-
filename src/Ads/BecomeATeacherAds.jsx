import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const translations = {
  en: {
    dragText: "Drag widget to reposition",
    timerLabel: "Ads closed in:",
    heading: "TolPath brings an exciting opportunity!",
    subheading: "Find local home tuitions easily. College students can secure a brilliant part-time side income with flexible hours, nearby students, and using their own skills.",
    footerText: "Register on TolPath now — learn, teach, and earn locally. 🚀",
    cta: "Apply to Teach"
  },
  ne: {
    dragText: "स्थान परिवर्तन गर्न यहाँ समातेर तान्नुहोस्",
    timerLabel: "यो Ad बन्द हुन बाँकी समय:",
    heading: "TolPath ले ल्याएको छ एकदमै exciting opportunity!",
    subheading: "अब तपाईंले आफ्नो घर नजिकैको home tuition सजिलै पाउन सक्नुहुन्छ। College students हरूको लागि यो एकदमै राम्रो part-time side income को मौका हो— flexible time मा आफ्नो skill प्रयोग गरेर कमाउनुहोस्।",
    footerText: "Aba padhna sanga-sanga sikhaune ra earn garne duita kaam ekai sath गर्नुलहोस्। TolPath मा register गरेर locally कमाउनुहोस्। 🚀",
    cta: "अहिले नै Register गर्नुहोस्"
  }
};

// 💡 ADDED: Passed is_verified_seller as a component prop
function BecomeATeacherAds({ is_verified_seller = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); 
  const constraintsRef = useRef(null);
  const [language, setLanguage] = useState('en'); 

  useEffect(() => {
    // 💡 BLOCKER: Do not attach event listeners if user is already verified
    if (is_verified_seller) return;

    const handleMouseLeave = (e) => {
      if (e.clientY < 20 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown, is_verified_seller]); // 💡 Added dependency track

  useEffect(() => {
    // 💡 BLOCKER: Do not run count down if user is verified
    if (is_verified_seller) return;

    let interval;
    if (isVisible && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsVisible(false);
    }

    return () => clearInterval(interval);
  }, [isVisible, timeLeft, is_verified_seller]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 💡 HARD CUTOFF: Early return null if verified or not marked visible
  if (is_verified_seller || !isVisible) return null;

  const t = translations[language];

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50 p-6 flex items-center justify-center">
      
      {/* Draggable Panel */}
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        whileDrag={{ cursor: 'grabbing', scale: 0.99 }}
        className="pointer-events-auto w-full max-w-sm rounded-xl bg-white p-5 text-slate-900 shadow-xl border border-slate-200/80 cursor-grab select-none"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {t.dragText}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
              className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
            >
              {language === 'en' ? 'नेपाली / Mix' : 'English'}
            </button>

            <button 
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-50"
              aria-label="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-3.5 text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t.timerLabel} <span className="font-mono font-bold tracking-tight ml-0.5">{formatTime(timeLeft)}</span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-950 tracking-tight leading-snug">
              {t.heading}
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              {t.subheading}
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs font-medium text-slate-700 leading-normal">
              {t.footerText}
            </p>
          </div>

          <button 
            onClick={() => {
              window.location.href = '/role'; 
              setIsVisible(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-xs transition-colors duration-150 shadow-sm"
          >
            {t.cta}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default BecomeATeacherAds;