import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL;
console.log("API URL:", BASE_URL);

export const api = {
  reset: async () => {
    try {
      const response = await axios.post(`${BASE_URL}/reset`, {});
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
