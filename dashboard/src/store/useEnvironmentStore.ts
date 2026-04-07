import { create } from 'zustand';
import type { EnvironmentState, AgentStep } from '../types';

interface EnvironmentStore {
  envState: EnvironmentState;
  steps: AgentStep[];
  isAutoRunning: boolean;
  seed: number;
  runHistory: import('../types').RunHistoryRecord[];
  setEnvState: (state: Partial<EnvironmentState>) => void;
  addStep: (step: AgentStep) => void;
  addHistory: (record: import('../types').RunHistoryRecord) => void;
  toggleAutoRun: () => void;
  setSeed: (seed: number) => void;
  reset: () => void;
}

const initialState: EnvironmentState = {
  stepCount: 0,
  currentScore: 0,
  status: 'idle',
  baselineAccuracy: 0.85,
  currentBestAccuracy: 0.85,
  lastReward: 0,
  taskId: 'task_easy_image_classification',
  taskName: 'Easy: Image Classification',
};

export const useEnvironmentStore = create<EnvironmentStore>((set) => ({
  envState: initialState,
  steps: [],
  isAutoRunning: false,
  seed: 42,
  runHistory: [],
  setEnvState: (state) => set((prev) => ({ envState: { ...prev.envState, ...state } })),
  addStep: (step) => set((prev) => ({ steps: [...prev.steps, step] })),
  addHistory: (record) => set((prev) => ({ runHistory: [...prev.runHistory, record] })),
  toggleAutoRun: () => set((prev) => ({ isAutoRunning: !prev.isAutoRunning })),
  setSeed: (seed) => set({ seed }),
<<<<<<< HEAD
  reset: () => set((prev) => ({
    envState: {
      ...initialState,
      taskId: prev.envState.taskId,
      taskName: prev.envState.taskName
    },
    steps: [],
    isAutoRunning: false,
    runHistory: prev.runHistory
=======
  reset: () => set((prev) => ({ 
    envState: { 
      ...initialState, 
      taskId: prev.envState.taskId, 
      taskName: prev.envState.taskName 
    }, 
    steps: [], 
    isAutoRunning: false, 
    runHistory: prev.runHistory 
>>>>>>> 202fb868420d934493aba3ce711a88e68db99729
  })),
}));