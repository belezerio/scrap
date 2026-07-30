import { getApifyClient } from '../config/apify';
import { RunActorInput } from '../schemas/apify.schema';
import { AppError } from '../utils/AppError';

export class ApifyService {
  static async runActor(input: RunActorInput): Promise<{ runId: string; defaultDatasetId: string; status: string }> {
    try {
      const client = getApifyClient();
      const run = await client.actor(input.actorId).call(input.input || {});
      
      return {
        runId: run.id,
        defaultDatasetId: run.defaultDatasetId,
        status: run.status,
      };
    } catch (error: any) {
      console.error('Apify Service Error:', error);
      throw AppError.internal(error?.message || 'Failed to trigger Apify actor run');
    }
  }

  static async getDatasetItems(datasetId: string, limit = 100, offset = 0): Promise<{ items: unknown[]; total: number }> {
    try {
      const client = getApifyClient();
      const dataset = client.dataset(datasetId);
      const list = await dataset.listItems({ limit, offset });

      return {
        items: list.items,
        total: list.total,
      };
    } catch (error: any) {
      console.error('Apify Dataset Error:', error);
      throw AppError.internal(error?.message || 'Failed to fetch Apify dataset items');
    }
  }
}
