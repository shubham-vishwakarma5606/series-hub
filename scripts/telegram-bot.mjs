#!/usr/bin/env node
// Telegram Bot automation for Series Hub
// Usage: TELEGRAM_BOT_TOKEN=<token> node scripts/telegram-bot.mjs
// The bot listens for .json file uploads or text messages and writes
// validated entries to public/uploads/telegram-library.json (which the
// site reads at boot if present). Media URLs must already be hosted.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { validateLibraryJSON } from '../src/utils/library.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || readFileSync('.env.local', 'utf8').match(/TELEGRAM_BOT_TOKEN=([\S]+)/)?.[1];
if (!TOKEN) {
  console.error('Set TELEGRAM_BOT_TOKEN in .env.local or environment');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;
const OFFSET_FILE = '.telegram-offset';

async function poll() {
  let offset = 0;
  try { offset = Number(readFileSync(OFFSET_FILE, 'utf8')) || 0; } catch {}
  while (true) {
    try {
      const res = await fetch(`${API}/getUpdates?timeout=30&offset=${offset + 1}`);
      const data = await res.json();
      if (data.result) {
        for (const u of data.result) {
          offset = u.update_id;
          await handleUpdate(u);
        }
        try { writeFileSync(OFFSET_FILE, String(offset)); } catch {}
      }
    } catch (e) {
      console.error('Poll error:', e.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

async function handleUpdate(u) {
  const msg = u.message || u.edited_message;
  if (!msg) return;
  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || '';

  // Try JSON file first
  let jsonText = text;
  if (msg.document && msg.document.mime_type === 'application/json') {
    const fileRes = await fetch(`${API}/getFile?file_id=${msg.document.file_id}`);
    const fileData = await fileRes.json();
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileData.result.file_path}`;
    const fileContent = await fetch(fileUrl);
    jsonText = await fileContent.text();
  }

  // If no JSON but text looks like a manifest, also try
  const trimmed = jsonText.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    await sendMsg(chatId, 'Send a JSON file or paste manifest. Example: {"id":"x","title":"Y","videoUrl":"https://..."}');
    return;
  }

  const r = validateLibraryJSON(trimmed);
  if (r.ok.length === 0) {
    await sendMsg(chatId, `No valid entries. Errors: ${r.errors.join(', ')}`);
    return;
  }

  const targetDir = 'public/uploads';
  if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });
  const outFile = join(targetDir, 'telegram-library.json');
  const existing = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : [];
  const existingIds = new Set(Array.isArray(existing) ? existing.map((e) => e.id) : []);
  const added = r.ok.filter((item) => !existingIds.has(item.id));
  const merged = [ ...existing, ...added ];
  writeFileSync(outFile, JSON.stringify(merged, null, 2));

  await sendMsg(chatId, `✅ Added ${added.length} title(s): ${added.map((a) => a.title || a.id).join(', ')}. File: ${outFile}`);
  console.log('Telegram upload saved:', added.length, 'items');
}

async function sendMsg(chatId, text) {
  try { await fetch(`${API}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`); } catch {}
}

poll();
