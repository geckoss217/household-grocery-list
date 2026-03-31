import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iugfiriwfiyljqfxrkuy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PMn_pWRBLB_61dlssQnsVQ_e8x1F2Td';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize tables if they don't exist
export const initializeTables = async () => {
  try {
    // Check if lists table exists by trying to query it
    await supabase.from('lists').select('count()', { count: 'exact' }).limit(1);
  } catch (error) {
    console.log('Tables may not exist yet, creating them...');
    
    // Create lists table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS lists (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    }).catch(() => {
      // Table might already exist, continue
    });

    // Create items table
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          quantity TEXT DEFAULT '1',
          checked BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    }).catch(() => {
      // Table might already exist, continue
    });
  }
};
