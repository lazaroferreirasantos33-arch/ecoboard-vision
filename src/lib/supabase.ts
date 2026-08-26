import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL não encontrada.',
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não encontrada.',
    );
  }

  return createClient(
    supabaseUrl,
    supabasePublishableKey,
  );
}