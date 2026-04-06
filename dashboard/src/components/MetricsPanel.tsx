import React, { useMemo } from 'react';
import { useEnvironmentStore } from '../store/useEnvironmentStore';
import { Trophy, Activity, Hash, Layers } from 'lucide-react';
import clsx from 'clsx';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

export const MetricsPanel: React.FC = () => {
  const envState = useEnvironmentStore((state) => state.envState);
  const steps = useEnvironmentStore((state) => state.steps);

  const chartData = useMemo(() => steps.map(s => ({
    step: s.stepNumber,
    score: s.reward
  })), [steps]);

  const accProgress = Math.min(100, Math.max(0, ((envState.currentBestAccuracy - envState.baselineAccuracy) / 0.15) * 100));

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between z-10">
        <h2 className="text-xs font-bold text-primary-300 uppercase tracking-widest drop-shadow">Metrics & Telemetry</h2>
        <div className={clsx(
          "px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase tracking-[0.1em] shadow-sm transition-colors",
          envState.status === 'running' ? "bg-primary-500/20 text-primary-300 border border-primary-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse" :
          envState.status === 'idle' ? "bg-white/10 text-slate-400 border border-white/10" :
          "bg-success/20 text-success border border-success/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        )}>
          {envState.status}
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        
        {/* TOTAL SCORE */}
        <div className="relative bg-gradient-to-br from-primary-900/80 to-[#1e1a3b] rounded-2xl p-6 text-white border border-primary-500/30 overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.3)] group hover:border-primary-500/60 transition-colors">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/30 blur-[40px] rounded-full pointer-events-none group-hover:bg-accent/40 transition-colors"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Trophy size={18} className="text-primary-300 drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary-200">Cumulative Score Vector</span>
          </div>
          <div className="text-5xl font-black tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-primary-200 leading-none py-1">
            {envState.currentScore.toFixed(3)}
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 shadow-inner hover:bg-white/[0.05] transition-colors relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/5 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity rounded-xl"></div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <Hash size={14} className="text-primary-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.1em]">Event Loop</span>
            </div>
            <div className="text-2xl font-black tracking-tight text-white font-mono">{envState.stepCount}</div>
          </div>
          
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 shadow-inner hover:bg-white/[0.05] transition-colors relative group">
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <Activity size={14} className="text-accent drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.1em]">Reward Delta</span>
            </div>
            <div className={clsx(
              "text-2xl font-black tracking-tight font-mono drop-shadow-sm", 
              envState.lastReward > 0 ? "text-success shadow-success" : 
              envState.lastReward < 0 ? "text-warning shadow-warning" : "text-white"
            )}>
              {envState.lastReward > 0 ? '+' : ''}{envState.lastReward.toFixed(3)}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-5 border border-white/5 space-y-3 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest relative z-10">
            <span>Accuracy Trajectory</span>
            <span className="text-primary-400">{(envState.baselineAccuracy * 100).toFixed(0)}% FLOOR</span>
          </div>
          <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner p-[1px] relative z-10">
            <div 
              className="h-full bg-gradient-to-r from-success/80 to-[#34d399] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full relative shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              style={{ width: `${accProgress}%`, minWidth: '8%' }}
            >
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full">
                  <div className="w-[300%] h-full bg-white/40 animate-slide mix-blend-overlay" 
                       style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 50%, transparent)'}}/>
               </div>
            </div>
          </div>
        </div>

        {/* REWARD BREAKDOWN */}
        {envState.rewardBreakdown && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4 relative overflow-hidden group hover:border-white/10 transition-colors">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-[4rem] pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
            <div className="flex items-center gap-2 mb-2 text-slate-300 relative z-10">
              <Layers size={14} className="text-primary-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Signal Component Matrix</span>
            </div>
            <div className="space-y-3 text-xs font-mono relative z-10">
              <div className="flex justify-between items-center text-slate-400 bg-black/40 border border-white/5 px-3 py-2 rounded-lg">
                <span>Core Hypothesis</span>
                <span className="font-bold text-accent drop-shadow-[0_0_5px_rgba(139,92,246,0.4)]">+{envState.rewardBreakdown.hypothesis_quality?.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 bg-black/40 border border-white/5 px-3 py-2 rounded-lg">
                <span>Target Lift</span>
                <span className="font-bold text-success drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">+{envState.rewardBreakdown.experiment_improvement?.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 bg-black/40 border border-white/5 px-3 py-2 rounded-lg">
                <span>Entropy / Noise</span>
                <span className="font-bold text-warning">{envState.rewardBreakdown.penalties?.toFixed(2) || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* CHART - RECHARTS */}
        {steps.length > 1 && (
          <div className="h-36 mt-6 w-full bg-black/20 rounded-xl border border-white/5 p-2 px-1 relative overflow-hidden hover:border-white/10 transition-colors">
            <div className="absolute top-2 left-4 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest z-10">Reward Trend</div>
            <ResponsiveContainer width="100%" height="100%" className="-ml-3 mt-4">
              <LineChart data={chartData}>
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(9, 10, 15, 0.95)', 
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)'
                  }} 
                  itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                  cursor={{ stroke: 'rgba(59, 130, 246, 0.3)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  formatter={(value: any) => [typeof value === 'number' ? value.toFixed(3) : value, 'Reward']}
                  labelFormatter={(step) => `Step ${step}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="url(#glowGradient)" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#60A5FA', stroke: '#090A0F', strokeWidth: 2, className: 'drop-shadow-[0_0_8px_rgba(96,165,250,1)]' }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <defs>
                  <linearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
