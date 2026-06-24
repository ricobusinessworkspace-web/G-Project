import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajeknrzlltatuopvkycn.supabase.co';
const supabaseAnonKey = 'sb_publishable_Gpi4HY06nTHDDA4BRyjmsQ_V1pWxt1I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("Checking Supabase connection...");
  
  const { data, error } = await supabase.from('user_stats').select('*').limit(1);
  
  if (error) {
    console.error("Error reading user_stats:", error);
  } else {
    console.log("user_stats schema looks okay, data:", data);
  }
}

check();
