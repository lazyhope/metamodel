import axios from 'axios';
import { API_ENDPOINT } from './constants';

const apiClient = axios.create({
  baseURL: API_ENDPOINT,
});

const handleRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status === 500 &&
      error.response?.data?.detail?.includes('Event loop is closed')) {
      try {
        return await requestFn();
      } catch (retryError) {
        throw retryError.response ? retryError.response.data : retryError.message;
      }
    }
    throw error.response ? error.response.data : error.message;
  }
};

export const defineSchema = async ({ messages, model, temperature, max_tokens, max_attempts, apiKey }) => {
  return handleRequest(async () => {
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
  });
};

export const parseData = async ({ messages, schema, model, temperature, max_tokens, max_attempts, apiKey }) => {
  return handleRequest(async () => {
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
  });
};