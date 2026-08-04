#!/usr/bin/env node
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('Setting up Series Hub auth...');

if (!existsSync('.env.local')) {
  copyFileSync('.env.example', '.env.local');
  console.log('Created .env.local from .env.example.');
  console.log('Edit .env.local and add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign-in.');
} else {
  console.log('.env.local already exists.');
}

console.log('Run: npm run dev (after adding keys)');
console.log('Then open Auth Settings in Supabase dashboard to enable providers (Google, GitHub, etc.)');
console.log('Run SQL: supabase/schema.sql');
