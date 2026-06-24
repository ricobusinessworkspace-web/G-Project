import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajeknrzlltatuopvkycn.supabase.co';
const supabaseAnonKey = 'sb_publishable_Gpi4HY06nTHDDA4BRyjmsQ_V1pWxt1I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('action_entries').insert({
    user_id: '3a134b90-f077-4e6f-ba7f-f2f9d6c50f29',
    rule_id: '00000000-0000-0000-0000-000000000000',
    timestamp: Date.now(),
    points_applied: 5,
    debt_applied: 0,
    is_cancelled: false
  }).select();
  console.log("Insert result:", { data, error });
}

check();
