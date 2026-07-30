import { z } from 'zod';

export const runActorSchema = z.object({
  body: z.object({
    actorId: z.string().min(1, 'Actor ID is required'),
    input: z.record(z.unknown()).optional(),
  }),
});

export const getDatasetItemsSchema = z.object({
  params: z.object({
    datasetId: z.string().min(1, 'Dataset ID is required'),
  }),
  query: z.object({
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 100)),
    offset: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 0)),
  }),
});

export type RunActorInput = z.infer<typeof runActorSchema>['body'];
