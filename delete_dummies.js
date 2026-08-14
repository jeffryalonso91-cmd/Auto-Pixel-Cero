import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://daaxusddbcvdstuqvqln.supabase.co';
const supabaseKey = 'sb_publishable_4_WiWtlOhlUo7MWpn72kJg_G4O4RLKQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const dummyIds = ["1", "2", "3", "4", "5", "6"];
  const { error } = await supabase.from('products').delete().in('id', dummyIds);
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Successfully deleted dummy products.");
  }
}
run().catch(console.error);
