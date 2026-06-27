import React, { useState } from 'react';
import { HelpCircle, User, GraduationCap, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';

function ImportantQuestions() {
  // Track which questions are open. Supports keeping multiple open or toggling individually.
  const [openIds, setOpenIds] = useState([]);

  const toggleQuestion = (id) => {
    if (openIds.includes(id)) {
      setOpenIds(openIds.filter(item => item !== id));
    } else {
      setOpenIds([...openIds, id]);
    }
  };

  const parentQuestions = [
    {
      id: 'p1',
      question: "How do I know if a teacher is professional?",
      answer: "We verify our teachers by checking their valid documents, certificates, and identity proofs before approving their marketplace cards to keep everything authentic."
    },
    {
      id: 'p2',
      question: "What if we don't like the teacher after the trial?",
      answer: "Just change them! There is zero commitment. You can instantly stop, browse our map directory again, and connect with a completely new home tutor profile."
    }
  ];

  const teacherQuestions = [
    {
      id: 't1',
      question: "Should I pay to list myself or become a teacher here?",
      answer: "No, absolutely not. Free listing is available right now. You do not pay anything to create your directory card or connect with local students."
    },
    {
      id: 't2',
      question: "Who decides the tuition fees and teaching schedule?",
      answer: "You do! You have 100% control over your monthly pricing structures, class timings, and individual syllabus patterns directly with the parents."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased py-16 px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <HelpCircle size={14} className="text-rose-600" /> Trust & Doubts Center
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Common Questions & Doubts
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">
          Click any question below to see immediate, honest answers about how our neighborhood system works.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* SECTION: PARENTS & STUDENTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
            <User size={16} className="text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              For Parents & Students
            </h2>
          </div>

          <div className="space-y-3">
            {parentQuestions.map((item) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div key={item.id} className="bg-white border border-slate-200/70 rounded-xl overflow-hidden shadow-2xs transition-all">
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-bold text-xs md:text-sm text-slate-900 hover:bg-slate-50/80 cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30 animate-fadeIn text-xs md:text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: TEACHERS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
            <GraduationCap size={16} className="text-emerald-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              For Home Tutors
            </h2>
          </div>

          <div className="space-y-3">
            {teacherQuestions.map((item) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div key={item.id} className="bg-white border border-slate-200/70 rounded-xl overflow-hidden shadow-2xs transition-all">
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-bold text-xs md:text-sm text-slate-900 hover:bg-slate-50/80 cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30 animate-fadeIn text-xs md:text-sm text-slate-600 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

  
      <div className="max-w-3xl mx-auto mt-12 p-4 bg-blue-600 border border-slate-800 rounded-xl text-center shadow-xs">
        <p className="text-xs text-slate-300 font-medium leading-relaxed flex items-center justify-center gap-1.5 flex-wrap">
          <ShieldCheck size={14} className="text-blue-400 shrink-0" /> 
          Safety Rule: <span className="text-white font-black underline decoration-rose-500 decoration-2">Do not pay full upfront amounts</span> before completing a 1–3 class student trial window.
        </p>
      </div>
    </div>
  );
}

export default ImportantQuestions;