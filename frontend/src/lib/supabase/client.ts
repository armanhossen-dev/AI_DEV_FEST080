import { createClient } from "@supabase/supabase-js";
import { auth } from "../firebase/firebase";
import { getIdToken } from "firebase/auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://odexyyeipgspqvdepvoi.supabase.co";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_pSbK4D35fp2K5UCtunJN2Q_nKjfzvhB";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && !supabaseUrl.includes("your-project-ref") && supabasePublishableKey
);

/**
 * Supabase client configured with third-party Firebase Authentication integration.
 * The access token resolver automatically fetches the current Firebase user ID token.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "x-application-name": "upay-sentinel",
    },
    fetch: async (url, options = {}) => {
      // Third-party Auth token injection
      if (auth.currentUser) {
        try {
          const token = await getIdToken(auth.currentUser);
          if (token) {
            const headers = new Headers(options.headers);
            headers.set("Authorization", `Bearer ${token}`);
            options.headers = headers;
          }
        } catch (err) {
          console.warn("Failed to attach Firebase token to Supabase fetch:", err);
        }
      }
      return fetch(url, options);
    },
  },
});
