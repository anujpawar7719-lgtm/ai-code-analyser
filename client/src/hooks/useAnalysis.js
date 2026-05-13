import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useAnalysis = () => {
  return useMutation({
    mutationFn: async ({ url, branch }) => {
      const aiConfig = JSON.parse(localStorage.getItem('repolens_ai_config') || '{}');
      const { data } = await axios.post('/api/analyze', { url, branch, aiConfig });
      return data;
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
    }
  });
};
