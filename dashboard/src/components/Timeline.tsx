import React, { useEffect, useRef } from 'react';
import { useEnvironmentStore } from '../store/useEnvironmentStore';
import { BookOpen, Lightbulb, FlaskConical, PlayCircle, BarChart } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'read_paper': return <BookOpen size={14} />;
    case 'propose_hypothesis': return <Lightbulb size={14} />;
    case 'design_experiment': return <FlaskConical size={14} />;
    case 'run_experiment': return <PlayCircle size={14} />;
    case 'analyze_results': return <BarChart size={14} />;
    case 'final_answer': return <span className="text-[10px] font-bold">🏁</span>;
    default: return <BookOpen size={14} />;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case 'read_paper': return 'bg-primary-900/40 text-primary-400 border-primary-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    case 'propose_hypothesis': return 'bg-purple-900/40 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
    case 'design_experiment': return 'bg-orange-900/40 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
    case 'run_experiment': return 'bg-pink-900/40 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.3)]';
    case 'analyze_results': return 'bg-success/20 text-success border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
    case 'final_answer': return 'bg-sky-900/40 text-sky-400 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.3)]';
    default: return 'bg-slate-800/40 text-slate-400 border-slate-600/30';
  }
};

export const Timeline: React.FC = () => {
  const steps = useEnvironmentStore((state) => state.steps);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 flex items-center justify-between">
        <h2 className="text-xs font-bold text-primary-300 uppercase tracking-widest drop-shadow">Neural Timeline</h2>
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 scroll-smooth" ref={scrollRef}>
        {steps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500 italic opacity-60">
            Awaiting synaptic activity...
          </div>
        ) : (
          <div className="relative pl-5 py-2 space-y-8 border-l-2 border-white/5 border-dashed">
            <AnimatePresence initial={false}>
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
                return (
                  <motion.div 
                    key={step.id} 
                    initial={{ opacity: 0, x: -20, rotate: -2, scale: 0.9 }}
                    animate={{ opacity: isLast ? 1 : 0.6, x: 0, rotate: 0, scale: 1 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 20 }}
                    className={clsx("relative", isLast && "drop-shadow-glow")}
                  >
                    {isLast && idx !== 0 && (
                      <div className="absolute -left-[23px] -top-[45px] h-[45px] w-0.5 bg-gradient-to-b from-transparent via-primary-500/80 to-primary-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
                    )}
                    
                    <div className={clsx(
                      "absolute -left-[36px] flex items-center justify-center w-8 h-8 rounded-full border bg-background",
                      getActionColor(step.actionType),
                      isLast && `ring-2 ring-primary-500 ring-offset-2 ring-offset-background`
                    )}>
                      {getActionIcon(step.actionType)}
                    </div>
                    
                    <div className="pl-3 relative top-1 group cursor-default">
                      {isLast && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/10 to-transparent blur-lg rounded-xl -z-10 opacity-60"></div>
                      )}
                      <span className="text-[10px] font-mono font-bold text-primary-500 mix-blend-screen opacity-80 uppercase tracking-wider block mb-0.5">Step {String(step.stepNumber).padStart(2,'0')}</span>
                      <h3 className="text-sm font-bold text-white tracking-wide capitalize group-hover:text-primary-300 transition-colors">
                        {step.actionType.replace(/_/g, ' ')}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
