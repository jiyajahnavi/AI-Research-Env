import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnvironmentStore } from '../store/useEnvironmentStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { X, History, Trophy, Target, Hash, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { runHistory } = useEnvironmentStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-5xl max-h-[85vh] bg-[#0A0F1C] border border-primary-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Run History Log</h2>
                  <p className="text-xs text-slate-400">Compare agent performance metrics across all completed baseline and LLM sessions.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {runHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                  <TrendingUp size={48} className="text-slate-600 mb-4" />
                  <h3 className="text-slate-300 font-medium text-lg">No Results Yet</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm">Complete your first full Autopilot execution to generate a permanent run snapshot.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {/* Performance Chart */}
                  <div className="glass-panel p-5 border border-white/5 bg-slate-900/40 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                       <TrendingUp size={16} className="text-primary-400" /> Progression Analytics
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={runHistory} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="runNumber" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} tickFormatter={(val) => `Run ${val}`} />
                          <YAxis yAxisId="left" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 12 }} domain={[0, 1]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0B1120', borderColor: '#3B82F630', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: '#E2E8F0', fontWeight: '500' }}
                            labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                            formatter={(value: any, name: string) => [
                                name === 'bestAccuracy' ? `${(value * 100).toFixed(1)}%` : value.toFixed(3), 
                                name === 'finalScore' ? 'Final Score' : 'Best Accuracy'
                            ]}
                            labelFormatter={(label) => `Run #${label}`}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }} />
                          <Line yAxisId="left" type="monotone" dataKey="finalScore" name="finalScore" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#0B1120' }} activeDot={{ r: 6, fill: '#A78BFA' }} animationDuration={1000} />
                          <Line yAxisId="right" type="stepAfter" dataKey="bestAccuracy" name="bestAccuracy" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#10B981', strokeWidth: 2, stroke: '#0B1120' }} activeDot={{ r: 5 }} animationDuration={1000} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Run Logs Table */}
                  <div className="space-y-3">
                     <h3 className="text-sm font-semibold text-slate-300 ml-1">Run Snapshots</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {runHistory.map((run) => (
                           <motion.div 
                              key={run.id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-primary-500/30 rounded-xl transition-all duration-300 relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              
                              <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs border border-white/5 shadow-sm group-hover:bg-primary-900/50 group-hover:text-primary-300 transition-colors">
                                       #{run.runNumber}
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono">{run.timestamp}</span>
                                 </div>
                                 <div className={clsx(
                                     "px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide border",
                                     run.finalScore > 0 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                                 )}>
                                     SCORE: {run.finalScore.toFixed(3)}
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div className="bg-slate-900/50 rounded-lg p-2.5 border border-white/5">
                                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                                          <Target size={12} /> max accuracy
                                      </div>
                                      <div className="text-lg font-mono text-white">{(run.bestAccuracy * 100).toFixed(1)}%</div>
                                  </div>
                                  <div className="bg-slate-900/50 rounded-lg p-2.5 border border-white/5">
                                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                                          <Hash size={12} /> total steps
                                      </div>
                                      <div className="text-lg font-mono text-white">{run.totalSteps}</div>
                                  </div>
                              </div>
                              
                              <div className="pt-3 border-t border-white/5">
                                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Final Output</div>
                                 <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-primary-500/30 pl-3 py-0.5">
                                     "{run.finalDecision}"
                                 </p>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
