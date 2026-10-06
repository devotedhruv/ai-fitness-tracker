/**
 * Supabase Client Initialization for React Native / Expo
 * ========================================================
 * Reads environment variables from EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
 * Supports both @supabase/supabase-js and zero-dependency fetch fallback.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@supabase/supabase-js');
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
} catch (e) {
  // Fallback lightweight REST client if @supabase/supabase-js is not yet installed
  supabaseInstance = {
    rpc: async (fnName: string, params: Record<string, any> = {}) => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
        return { data: null, error: new Error('Supabase credentials not configured') };
      }
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          return { data: null, error: err };
        }
        const data = await res.json();
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    from: (table: string) => {
      let queryUrl = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
      let method = 'GET';
      let requestBody: any = null;

      const builder: any = {
        select: (cols: string = '*') => {
          queryUrl = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(cols)}`;
          return builder;
        },
        eq: (col: string, val: any) => {
          queryUrl += `&${col}=eq.${encodeURIComponent(String(val))}`;
          return builder;
        },
        in: (col: string, vals: any[]) => {
          queryUrl += `&${col}=in.(${vals.map((v) => `"${v}"`).join(',')})`;
          return builder;
        },
        order: (col: string, opts: { ascending?: boolean } = {}) => {
          queryUrl += `&order=${col}.${opts.ascending === false ? 'desc' : 'asc'}`;
          return builder;
        },
        single: async () => {
          const res = await fetch(queryUrl, {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Accept': 'application/vnd.pgrst.object+json',
            },
          });
          const data = res.ok ? await res.json() : null;
          return { data, error: res.ok ? null : await res.json() };
        },
        maybeSingle: async () => {
          return builder.single();
        },
        insert: (payload: any) => {
          method = 'POST';
          requestBody = payload;
          return {
            select: () => builder,
            then: (resolve: any, reject: any) => builder.execute().then(resolve, reject),
          };
        },
        execute: async () => {
          const res = await fetch(queryUrl, {
            method,
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: requestBody ? JSON.stringify(requestBody) : undefined,
          });
          const data = res.ok ? await res.json() : null;
          return { data, error: res.ok ? null : await res.json() };
        },
      };
      return builder;
    },
  };
}

export const supabase = supabaseInstance;
