import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://nalcjrtndukfaevkqdyv.supabase.co';
const supabaseAnonKey = 'sb_publishable_p1vYnKewtwHVbBARjFuVZA__hkNrGSr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);