/**
 * Supabase client stub
 * Supabase has been replaced by Prisma. This module exists for backward compatibility.
 */

export function createClient() {
  console.warn("[supabase/client] Supabase is deprecated. Use Prisma instead.");
  return {
    from: (..._args: any[]) => ({
      select: (..._a: any[]) => Promise.resolve({ data: [], error: null }),
      insert: (..._a: any[]) => Promise.resolve({ data: null, error: null }),
      update: (..._a: any[]) => Promise.resolve({ data: null, error: null }),
      delete: (..._a: any[]) => Promise.resolve({ data: null, error: null }),
      eq: (..._a: any[]) => Promise.resolve({ data: [], error: null }),
      order: (..._a: any[]) => Promise.resolve({ data: [], error: null }),
      on: (..._a: any[]) => ({ subscribe: (..._b: any[]) => ({}) }),
    }),
    channel: (..._args: any[]) => ({
      on: (..._a: any[]) => ({ subscribe: (..._b: any[]) => ({}) }),
    }),
    removeChannel: (..._args: any[]) => {},
  };
}
