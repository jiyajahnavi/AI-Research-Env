import { useCallback } from 'react';
import { useEnvironmentStore } from '../store/useEnvironmentStore';
import { api } from '../services/api';
import axios from 'axios';

// Cache the discovered model so we don't spam the ListModels API every step
let cachedGeminiModel = '';

export const useEnvironment = () => {
  const store = useEnvironmentStore();

  const resetEnvironment = useCallback(async () => {
    try {
      store.setEnvState({ status: 'running' });
      // Randomize the default backend environment if api accepts seed parameters, otherwise it's safe
      const responseData = await api.reset();

      const obs = responseData;
      const payload = obs.data || {};

      store.reset();
      store.setEnvState({
        status: 'idle',
        available_methods: payload.available_methods || ['cnn'],
        available_datasets: payload.available_datasets || ['digits_full'],
        baselineAccuracy: payload.baseline_accuracy || 0.62,
        currentBestAccuracy: payload.baseline_accuracy || 0.62,
      });
    } catch (error) {
      console.error(error);
      store.setEnvState({ status: 'idle' });
    }
  }, [store]);

  const runNextStep = useCallback(async () => {
    const { envState, steps, isAutoRunning, toggleAutoRun, setEnvState, addStep } = useEnvironmentStore.getState();

    if (envState.status === 'running' || envState.status === 'done') {
      if (isAutoRunning && envState.status === 'done') {
        toggleAutoRun();
      }
      return;
    }

    try {
      setEnvState({ status: 'running' });

      const stepCount = envState.stepCount;
      const history = steps;

      let actionType = 'read_paper';
      let content = 'all';

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      const successfulExperiments = history.filter(s => s.actionType === 'run_experiment' && s.reward > 0).length;
      const ranExperiments = history.filter(s => s.actionType === 'run_experiment').length;

      let usedGemini = false;
      let geminiErrorMessage = '';

      if (!apiKey) {
        console.warn("Missing VITE_GEMINI_API_KEY! Make sure to refresh your browser.");
      }

      if (apiKey) {
        try {
          const sysPrompt = `You are an AI Research Scientist Agent navigating an OpenEnv virtual environment.
Your goal is to maximize the final score by reading papers, proposing a hypothesis, running experiments on datasets using methods, and analyzing results.

Available Methods: ${JSON.stringify(envState.available_methods || ['cnn', 'mlp', 'rf'])}
Available Datasets: ${JSON.stringify(envState.available_datasets || ['digits_full', 'digits_small'])}

History of actions taken so far (${stepCount} steps):
${history.map(s => `Step ${s.stepNumber} [${s.actionType}] Payload='${s.content}' | Reward: ${s.reward} | Result: ${s.result ? JSON.stringify(s.result) : 'N/A'}`).join('\n')}

Based on the exact history, determine the mathematically logical next maneuver. Output ONLY valid JSON format containing exactly "actionType" (string) and "content" (string).
Rules:
- Valid actionTypes: "read_paper", "propose_hypothesis", "design_experiment", "run_experiment", "analyze_results", "final_answer".
- If step count is 0, ALWAYS 'read_paper' with content 'all'.
- You must 'design_experiment' (with content like "cnn:digits_full" pairing one method and one dataset) before you run it. Don't run duplicate experiments.
- To run the designed experiment, use actionType = "run_experiment" and content = "exp_${ranExperiments + 1}".
- Iterate methodologies dynamically based on previous rewards to search for the highest accuracy!
- End with "analyze_results" and then "final_answer" to conclude the episode.`;

          // DYNAMIC MODEL DISCOVERY
          if (!cachedGeminiModel) {
            try {
              const modelsRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
              const modelsList = modelsRes.data.models.map((m: any) => m.name);

              // Prioritize lightweight flash models natively to respect free-tier constraints and availability
              const flashModel = modelsList.find((m: string) => m.includes('flash') && (m.includes('-lite') || m.includes('-preview')));

              if (flashModel) {
                cachedGeminiModel = flashModel.replace('models/', '');
              } else {
                cachedGeminiModel = modelsList[0].replace('models/', '');
              }
            } catch (discoveryError) {
              console.warn("Dynamic API list models failed, defaulting:", discoveryError);
              cachedGeminiModel = 'gemini-1.5-flash';
            }
          }

          const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${cachedGeminiModel}:generateContent?key=${apiKey}`, {
            contents: [{ parts: [{ text: sysPrompt }] }],
            generationConfig: { temperature: 0.4 }
          });

          const rawText = response.data.candidates[0].content.parts[0].text;
          let cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const decision = JSON.parse(cleanJsonStr);

          if (decision.actionType) {
            actionType = decision.actionType;
            content = decision.content || '';
            usedGemini = true;
          }
        } catch (geminiError: any) {
          geminiErrorMessage = geminiError.response?.data?.error?.message || geminiError.message || "Unknown error";
          console.error(`Gemini integration failed (Model used: ${cachedGeminiModel}):`, geminiError);
        }
      }

      if (!usedGemini) {
        if (stepCount === 0) {
          actionType = 'read_paper';
          content = 'all';
        } else if (stepCount === 1) {
          actionType = 'propose_hypothesis';
          content = 'Hypothesis: The methods will yield optimal accuracy if properly evaluated across multiple experiments.';
        } else if (successfulExperiments < 3 && stepCount < 10) {
          const lastAction = history[history.length - 1];
          const isDesigning = lastAction?.actionType !== 'design_experiment';

          if (isDesigning) {
            actionType = 'design_experiment';
            const validMethods = envState.available_methods || ['cnn'];
            const validDatasets = envState.available_datasets || ['digits_full'];

            // Randomize the fallback agent so that it performs dynamically!
            const method = validMethods[Math.floor(Math.random() * validMethods.length)];
            const dataset = validDatasets[Math.floor(Math.random() * validDatasets.length)];
            content = `${method}:${dataset}`;
          } else {
            actionType = 'run_experiment';
            const previousExpId = lastAction.experiment?.expId || 'exp_' + (ranExperiments + 1);
            content = previousExpId;
          }
        } else if (history[history.length - 1]?.actionType === 'run_experiment' || history[history.length - 1]?.actionType === 'design_experiment') {
          actionType = 'analyze_results';
          content = 'all';
        } else {
          actionType = 'final_answer';
          content = `Final Decision: Based on the experiments, the selected method achieves high accuracy.`;
        }
      }

      const responseData = await api.step(actionType, content);

      const obs = responseData;

      if (!usedGemini && geminiErrorMessage) {
        obs.message = `${obs.message}`;
      }

      const payload = obs.data || {};

      const isFinal = actionType === 'final_answer';
      const isHypothesis = actionType === 'propose_hypothesis';
      const isExperiment = actionType === 'run_experiment';
      const isDesign = actionType === 'design_experiment';

      let newBestAcc = envState.currentBestAccuracy;
      let expResult = undefined;

      if (isExperiment && payload.accuracy !== undefined) {
        expResult = {
          accuracy: payload.accuracy,
          improvement: payload.accuracy - envState.currentBestAccuracy
        };
        if (payload.accuracy > envState.currentBestAccuracy) {
          newBestAcc = payload.accuracy;
        }
      }

      const newStep = {
        id: crypto.randomUUID(),
        stepNumber: obs.step_number || (envState.stepCount + 1),
        actionType,
        content,
        reasoning: obs.message,
        hypothesis: isHypothesis ? content : undefined,
        experiment: (isDesign || isExperiment) && payload ? {
          expId: payload.experiment_id || payload.exp_id,
          method: payload.method_id,
          dataset: payload.dataset_id
        } : undefined,
        result: expResult,
        reward: obs.reward || 0,
      };

      addStep(newStep);

      setEnvState({
        stepCount: envState.stepCount + 1,
        lastReward: obs.reward || 0,
        currentScore: obs.score || 0,
        currentBestAccuracy: newBestAcc,
        status: (isFinal || obs.done) ? 'done' : 'idle',
      });

      if (isFinal || obs.done) {
        const newRecord = {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          runNumber: useEnvironmentStore.getState().runHistory.length + 1,
          finalScore: obs.score || envState.currentScore || 0,
          bestAccuracy: newBestAcc,
          totalSteps: envState.stepCount + 1,
          finalDecision: isFinal ? content : 'Horizon Limit Reached.'
        };
        useEnvironmentStore.getState().addHistory(newRecord);
      }

      if ((isFinal || obs.done) && isAutoRunning) {
        toggleAutoRun();
      }

    } catch (error) {
      console.error("Action execution routing failed:", error);
      useEnvironmentStore.getState().setEnvState({ status: 'idle' });
    }
  }, []);

  return {
    ...store,
    resetEnvironment,
    runNextStep
  };
};
