import { create } from 'zustand';
import type { EnvironmentState, AgentStep } from '../types';

interface EnvironmentStore {
  envState: EnvironmentState;
  steps: AgentStep[];
  isAutoRunning: boolean;
  runHistory: import('../types').RunHistoryRecord[];
  setEnvState: (state: Partial<EnvironmentState>) => void;
  addStep: (step: AgentStep) => void;
  addHistory: (record: import('../types').RunHistoryRecord) => void;
  toggleAutoRun: () => void;
  reset: () => void;
}

const initialState: EnvironmentState = {
  stepCount: 0,
  currentScore: 0,
  status: 'idle',
  baselineAccuracy: 0.85,
  currentBestAccuracy: 0.85,
  lastReward: 0,
};

export const useEnvironmentStore = create<EnvironmentStore>((set) => ({
  envState: initialState,
  steps: [],
  isAutoRunning: false,
  runHistory: [],
  setEnvState: (state) => set((prev) => ({ envState: { ...prev.envState, ...state } })),
  addStep: (step) => set((prev) => ({ steps: [...prev.steps, step] })),
  addHistory: (record) => set((prev) => ({ runHistory: [...prev.runHistory, record] })),
  toggleAutoRun: () => set((prev) => ({ isAutoRunning: !prev.isAutoRunning })),
  reset: () => set((prev) => ({ envState: initialState, steps: [], isAutoRunning: false, runHistory: prev.runHistory })),
}));
