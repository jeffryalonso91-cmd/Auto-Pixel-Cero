import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://daaxusddbcvdstuqvqln.supabase.co';
const supabaseKey = 'sb_publishable_4_WiWtlOhlUo7MWpn72kJg_G4O4RLKQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: config } = await supabase.from('store_config').select('*').eq('id', 'store').single();
  console.log(config);
}
run().catch(console.error);
