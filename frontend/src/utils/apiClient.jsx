import axios from 'axios';
import { API_ENDPOINT } from './constants';

const apiClient = axios.create({
  baseURL: API_ENDPOINT,
});

const processModelSettings = ({ model, apiKey }) => {
  if (model === 'Preset Model') {
    return {
      model: import.meta.env.VITE_PRESET_MODEL_NAME,
      apiKey: import.meta.env.VITE_PRESET_TOKEN
    };
  }
  return { model, apiKey };
};

export const defineSchema = async ({ messages, model, temperature, max_tokens, max_attempts, apiKey }) => {
  try {
    const { model: processedModel, apiKey: processedApiKey } = processModelSettings({ model, apiKey });
    const response = await apiClient.post('/define', {
      messages,
      model: processedModel,
      temperature,
      max_tokens,
      max_attempts,
    }, {
      headers: {
        'Authorization': `Bearer ${processedApiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const parseData = async ({ messages, schema, model, temperature, max_tokens, max_attempts, apiKey }) => {
  try {
    const { model: processedModel, apiKey: processedApiKey } = processModelSettings({ model, apiKey });
    const response = await apiClient.post('/parse', {
      messages,
      schema,
      model: processedModel,
      temperature,
      max_tokens,
      max_attempts,
    }, {
      headers: {
        'Authorization': `Bearer ${processedApiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const checkHealth = async () => {
  try {
    await apiClient.get('/health');
    return true;
  } catch (error) {
    return false;
  }
};