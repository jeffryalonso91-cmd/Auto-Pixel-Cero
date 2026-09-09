import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://daaxusddbcvdstuqvqln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhYXh1c2RkYmN2ZHN0dXF2cWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NzQ5ODgsImV4cCI6MjEwMjE1MDk4OH0.3GldbG690sXfA7S7TWPz9N8qOTjur_cECyY35DIIIqk';

export const supabase = createClient(supabaseUrl, supabaseKey);
