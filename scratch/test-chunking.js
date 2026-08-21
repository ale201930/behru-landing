import * as tus from 'tus-js-client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnzctxcrrfoaioqpfiho.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing tus-js-client import:', typeof tus.Upload);
