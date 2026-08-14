import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://daaxusddbcvdstuqvqln.supabase.co';
const supabaseKey = 'sb_publishable_4_WiWtlOhlUo7MWpn72kJg_G4O4RLKQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
