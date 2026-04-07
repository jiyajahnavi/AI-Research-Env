import axios from 'axios';


const isProd = import.meta.env.PROD;
const BASE_URL = isProd ? window.location.origin : (import.meta.env.VITE_API_URL || 'http://localhost:7860');
console.log("API URL Resolving to:", BASE_URL);

export const api = {
  reset: async (options?: { taskId?: string; seed?: number }) => {
    try {
      const response = await axios.post(`${BASE_URL}/reset`, {
        task_id: options?.taskId,
        seed: options?.seed,
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting environment:', error);
      throw error;
    }
  },

  step: async (actionType: string, content: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/step`, {
        action_type: actionType,
        content: content
      });
      return response.data;
    } catch (error) {
      console.error('Error in step:', error);
      throw error;
    }
  }
};