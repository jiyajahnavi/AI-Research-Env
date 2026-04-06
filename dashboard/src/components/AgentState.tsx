import React from 'react';
import { useEnvironmentStore } from '../store/useEnvironmentStore';
import { Brain, Target, Beaker, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500 bg-red-900/20 border border-red-500/30 rounded-xl glass-panel text-sm font-mono">Error rendering Core State Engine. Reboot required.</div>;
    }
    return this.props.children;
  }
}

const AgentStateContent: React.FC = () => {
  const steps = useEnvironmentStore((state) => state.steps);
  const status = useEnvironmentStore((state) => state.envState.status);
  
  const currentStep = steps.length > 0 ? steps[steps.length - 1] : null;

  if (!currentStep) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center glass-panel p-8 text-center h-full relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -inset-[50%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_60%)] -z-10 pointer-events-none mix-blend-screen" />
        <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-center text-primary-500 mb-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative">
           <div className="absolute inset-0 rounded-[2rem] border-2 border-primary-500/20 animate-pulse pointer-events-none"></div>
          <Brain size={48} className="drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] opacity-90" />
        </div>
        <h2 className="text-3xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">AGENT HIBERNATION</h2>
        <p className="text-primary-300/60 mt-3 max-w-sm text-xs font-mono uppercase tracking-[0.2em]">Awaiting input signals to commence cognitive processing loop.</p>
      </div>
    );
  }

  const lastHypothesis = [...steps].reverse().find(s => s.hypothesis)?.hypothesis;
  const lastExperiment = [...steps].reverse().find(s => s.experiment)?.experiment;
  const lastResult = [...steps].reverse().find(s => s.result)?.result;

  return (
    <div className="flex-1 flex flex-col h-full glass-panel relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
      
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
        <div>
          <span className="text-[11px] font-mono font-bold text-primary-300 uppercase tracking-[0.15em] bg-primary-500/10 border border-primary-500/30 px-3 py-1.5 rounded-md shadow-[0_0_10px_rgba(59,130,246,0.2)] block mb-3 max-w-max">
            Execution Step {String(currentStep.stepNumber).padStart(2,'0')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white capitalize flex items-center gap-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] tracking-tight">
            {currentStep.actionType.replace(/_/g, ' ')}
            {status === 'running' && (
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]"></span>
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`reasoning-${currentStep.id}`}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-gradient-to-br from-primary-900/40 to-background border border-primary-500/30 rounded-2xl p-6 md:p-8 shadow-glow overflow-hidden group hover:border-primary-500/50 transition-colors"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-primary-500/20 transition-colors"></div>
            <div className="flex gap-3 mb-4 relative z-10">
              <Brain className="text-primary-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" size={22} />
              <h3 className="text-xs font-mono font-bold text-primary-300 uppercase tracking-widest drop-shadow">Cognitive Reasoning Core</h3>
            </div>
            <p className="text-slate-200 pl-[34px] leading-relaxed text-[15px] font-medium relative z-10 drop-shadow-sm">
              {currentStep.reasoning}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-soft hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none group-hover:from-purple-500/10 transition-colors"></div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Target size={18} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <h4 className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-[0.15em] drop-shadow">Active Hypothesis</h4>
            </div>
            <p className="text-[14px] text-slate-300 italic font-medium leading-relaxed relative z-10 break-words">
              {lastHypothesis ? `"${lastHypothesis}"` : <span className="opacity-50 font-normal">Awaiting internal hypothesis formation...</span>}
            </p>
          </div>

          <div className="col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-soft hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none group-hover:from-orange-500/10 transition-colors"></div>
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <Beaker size={18} className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              <h4 className="text-[10px] font-mono font-bold text-orange-300 uppercase tracking-[0.15em] drop-shadow">Target Experiment</h4>
            </div>
            {lastExperiment ? (
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center bg-black/40 border border-white/5 px-4 py-3 rounded-lg overflow-hidden relative">
                   <div className="absolute left-0 top-0 w-1 h-full bg-orange-500/50"></div>
                  <span className="text-slate-500 text-[11px] font-bold font-mono uppercase tracking-wider">Method</span>
                  <span className="font-mono text-white text-[13px] bg-white/10 border border-white/10 px-2 py-0.5 rounded shadow-inner">{lastExperiment.method}</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 border border-white/5 px-4 py-3 rounded-lg overflow-hidden relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-orange-500/50"></div>
                  <span className="text-slate-500 text-[11px] font-bold font-mono uppercase tracking-wider">Dataset</span>
                  <span className="font-mono text-white text-[13px] bg-white/10 border border-white/10 px-2 py-0.5 rounded shadow-inner">{lastExperiment.dataset}</span>
                </div>
              </div>
            ) : (
              <p className="text-[14px] text-slate-500 italic opacity-80 relative z-10">No experimental payload loaded.</p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-6 bg-gradient-to-br from-success/10 to-background border text-center border-success/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group hover:border-success/50 transition-colors"
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-success/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-success/30 transition-colors" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-success/10 blur-[50px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
                <Zap size={22} className="text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <h4 className="text-xs font-mono font-bold text-success uppercase tracking-[0.15em] drop-shadow">Live Telemetry Diagnostic</h4>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4 relative z-10">
                <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  {(lastResult.accuracy * 100).toFixed(1)}<span className="text-4xl text-success">%</span>
                </div>
                {lastResult.improvement !== 0 && (
                  <div className={clsx(
                    "text-sm font-bold font-mono px-4 py-2 rounded-xl shadow-inner border",
                    lastResult.improvement > 0 ? "text-success bg-success/20 border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-warning bg-warning/20 border-warning/30"
                  )}>
                    {lastResult.improvement > 0 ? '+' : ''}{(lastResult.improvement * 100).toFixed(2)}% Delta
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const AgentState: React.FC = () => (
  <ErrorBoundary>
    <AgentStateContent />
  </ErrorBoundary>
);
