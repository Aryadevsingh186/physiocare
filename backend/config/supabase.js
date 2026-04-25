// backend/config/supabase.js
import { createClient } from "@supabase/supabase-js";

// Use your Supabase Project URL and Service Role Key
// Use your Supabase Project URL and Service Role Key
const supabaseUrl = "https://klywftwrrjzrrmapmgkk.supabase.co";
const supabaseKey = "sb_publishable_6oa3qtpVfpo8Wz9oP0sZzA_DI4wbd6L"; // Your API key // Your API key

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
