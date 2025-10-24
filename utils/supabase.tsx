import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yzoyrioiagjzkzmaoblo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b3lyaW9pYWdqemt6bWFvYmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODA0MTIsImV4cCI6MjA3NjU1NjQxMn0.sFlPko84bgpc4BVrdrrWOphajspmESGYnzkKwaOihz4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
