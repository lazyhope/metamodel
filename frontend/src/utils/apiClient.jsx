import axios from 'axios';
import { API_ENDPOINT } from './constants';

const apiClient = axios.create({
  baseURL: API_ENDPOINT,
});

export const defineSchema = async ({ messages, model, temperature, max_tokens, max_attempts, apiKey }) => {
  try {
    const response = await apiClient.post('/define', {
      messages,
      model,
      temperature,
      max_tokens,
      max_attempts,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const parseData = async ({ messages, schema, model, temperature, max_tokens, max_attempts, apiKey }) => {
  try {
    const response = await apiClient.post('/parse', {
      messages,
      schema,
      model,
      temperature,
      max_tokens,
      max_attempts,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};