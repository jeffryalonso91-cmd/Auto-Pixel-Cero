import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://daaxusddbcvdstuqvqln.supabase.co', 'sb_publishable_4_WiWtlOhlUo7MWpn72kJg_G4O4RLKQ');
async function run() {
  const { data, error } = await supabase.from('store_config').select('*').limit(1);
  if (data && data.length > 0) console.log(Object.keys(data[0]));
}
run().catch(console.log);
