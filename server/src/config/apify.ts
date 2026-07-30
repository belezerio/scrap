import { ApifyClient } from 'apify-client';
import { config } from './env';

export const getApifyClient = () => {
  if (!config.APIFY_API_TOKEN) {
    console.warn('⚠️ APIFY_API_TOKEN is missing in environment variables.');
  }
  return new ApifyClient({
    token: config.APIFY_API_TOKEN || 'dummy_token',
  });
};
