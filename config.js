const supabaseUrl = 'https://dtrlgwbgatcwewoczzzp.supabase.co';
const supabaseKey = "sb_publishable_X_CII77z2S_dqM9VnyLZEg_cPGuHgJI";

const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);
console.log(createClient);
console.log(client);

export default client;