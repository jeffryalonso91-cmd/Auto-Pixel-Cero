import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://daaxusddbcvdstuqvqln.supabase.co', 'sb_publishable_4_WiWtlOhlUo7MWpn72kJg_G4O4RLKQ');
async function run() {
  const { data, error } = await supabase.from('store_config').update({ hero_image_url: '' }).eq('id', 'store');
  console.log(error);
}
run().catch(console.log);
