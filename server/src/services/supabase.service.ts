import { supabaseClient, supabaseAdmin } from '../config/supabase';
import { AppError } from '../utils/AppError';

export class SupabaseService {
  static async selectFromTable<T>(table: string, query?: Record<string, unknown>): Promise<T[]> {
    let builder = supabaseClient.from(table).select('*');
    if (query) {
      Object.entries(query).forEach(([key, val]) => {
        builder = builder.eq(key, val);
      });
    }

    const { data, error } = await builder;
    if (error) {
      throw AppError.internal(`Supabase Query Error: ${error.message}`);
    }

    return (data as T[]) || [];
  }

  static async insertIntoTable<T>(table: string, payload: Partial<T>): Promise<T> {
    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      throw AppError.internal(`Supabase Insert Error: ${error.message}`);
    }

    return data as T;
  }
}
