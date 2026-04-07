import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, Pause, History, Dices } from 'lucide-react';
import { useEnvironment } from '../hooks/useEnvironment';
import { HistoryModal } from './HistoryModal';
import clsx from 'clsx';

export const Controls: React.FC = () => {
  const { runNextStep, resetEnvironment, toggleAutoRun, isAutoRunning, envState, seed, setSeed } = useEnvironment();
  const isRunning = envState.status === 'running';
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isAutoRunning && !isRunning) {
      interval = window.setInterval(() => {
        runNextStep();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAutoRunning, isRunning, runNextStep]);

  return (
    <>
      <div className="flex items-center justify-between p-4 glass-panel m-4 border-b-0 shadow-[0_4px_30px_rgba(0,0,0,0.3)] relative z-20">
        <div className="flex items-center gap-4">

          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              AI Research Interface
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-primary-300 font-mono tracking-widest opacity-80 uppercase">
                {envState.taskName || 'Research Environment'}
              </p>
              <span className="w-1 h-1 rounded-full bg-primary-500 opacity-40"></span>
              <select
                disabled={isRunning || isAutoRunning}
                value={envState.taskId}
                onChange={(e) => resetEnvironment(e.target.value)}
                className="ml-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 rounded-lg px-3 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider focus:outline-none cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:scale-[1.02] active:scale-95"
              >
                <option value="task_easy_image_classification" className="bg-background text-white">Easy: Vision</option>
                <option value="task_medium_nlp_sentiment" className="bg-background text-white">Medium: NLP</option>
                <option value="task_hard_tabular_prediction" className="bg-background text-white">Hard: Tabular</option>
              </select>
            </div>
          </div>

          {/* Seed Control */}
          <div className="flex items-center gap-2 ml-4 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <Dices size={14} className="text-primary-400 opacity-70" />
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider select-none">Seed</label>
            <input
              type="number"
              min={0}
              max={9999}
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              disabled={isRunning || isAutoRunning}
              className="w-16 bg-transparent text-sm text-white font-mono text-center border-b border-white/20 focus:border-primary-400 focus:outline-none transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {envState.status === 'done' && (
            <span className="hidden md:block text-xs font-mono font-bold text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] px-3 py-1.5 bg-success/10 border border-success/30 rounded-lg animate-pulse">
              Session Complete. Click "Reset Session" to restart.
            </span>
          )}

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl transition-all duration-300 shadow-sm"
          >
            <History size={16} className="transition-transform group-hover:-rotate-12 opacity-80" />
            <span className="hidden md:block">History Log</span>
          </button>

          <button
            onClick={() => resetEnvironment()}
            disabled={isRunning}
            className="group relative flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:animate-slide"></div>
            <RotateCcw size={16} className={clsx("transition-transform duration-500 opacity-80", envState.status === 'done' ? "animate-spin-slow text-success" : "group-hover:-rotate-180")} />
            <span>Reset Session</span>
          </button>

          <button
            onClick={runNextStep}
            disabled={isRunning || isAutoRunning || envState.status === 'done'}
            className="group relative flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold text-white bg-primary-600/80 hover:bg-primary-500 border border-primary-500/50 rounded-xl shadow-glow transition-all duration-300 disabled:opacity-50 disabled:grayscale overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-white/20 to-primary-400/0 translate-x-[-100%] group-hover:animate-slide"></div>
            <Play size={16} className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] fill-white transition-transform group-hover:scale-110" />
            <span>Execute Decision</span>
          </button>

          <button
            onClick={toggleAutoRun}
            disabled={envState.status === 'done'}
            className={clsx(
              "group relative flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold border rounded-xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:grayscale",
              isAutoRunning
                ? "bg-warning/10 border-warning/50 text-warning shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:bg-warning/20"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <div className={clsx("absolute inset-0 bg-gradient-to-r translate-x-[-100%] group-hover:animate-slide", isAutoRunning ? "from-warning/0 via-warning/20 to-warning/0" : "from-white/0 via-white/5 to-white/0")}></div>
            {isAutoRunning ? <Pause size={16} className="drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] fill-current" /> : <Play size={16} className="fill-current drop-shadow opacity-70" />}
            <span>{isAutoRunning ? 'Halt Agent' : 'Autopilot'}</span>
          </button>
        </div>
      </div>
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </>
  );
};